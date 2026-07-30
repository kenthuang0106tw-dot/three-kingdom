import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import {
  collectProductionPublicAssetPaths,
  hashFiles,
} from "./package-production-assets.mjs";

const execFileAsync = promisify(execFile);
const PRODUCTION_INPUTS = Object.freeze([
  "app",
  "build",
  "github-pages",
  ".openai/hosting.json",
  "next.config.ts",
  "public",
  "tsconfig.json",
  "tsconfig.worker.json",
  "worker",
  "package.json",
  "pnpm-lock.yaml",
  "tools/package-production-assets.mjs",
  "vite.config.ts",
  "vite.github.config.ts",
]);

async function directoryFiles(directory, root = directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await directoryFiles(path, root));
    else if (entry.isFile()) files.push(relative(root, path).replaceAll("\\", "/"));
  }
  return files.sort();
}

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeVinextOutput(path, contents) {
  if (path === "server/index.js") {
    return Buffer.from(contents.toString("utf8")
      .replaceAll(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/g,
        "00000000-0000-4000-8000-000000000000"));
  }
  if (path === "server/vinext-server.json" || path === "server/ssr/vinext-server.json") {
    return Buffer.from(contents.toString("utf8")
      .replace(/"prerenderSecret":"[0-9a-f]{64}"/,
        `"prerenderSecret":"${"0".repeat(64)}"`));
  }
  return contents;
}

async function summarizeTree(directory, normalize = (_, contents) => contents) {
  const files = await directoryFiles(directory);
  const records = await Promise.all(files.map(async path => {
    const file = resolve(directory, path);
    const contents = await readFile(file);
    return Object.freeze({
      path,
      bytes: contents.byteLength,
      sha256: digest(contents),
      reproducibleSha256: digest(normalize(path, contents)),
    });
  }));
  const artifactDigest = createHash("sha256");
  const reproducibleDigest = createHash("sha256");
  for (const record of records) {
    artifactDigest.update(`${record.path}\0${record.bytes}\0${record.sha256}\n`);
    reproducibleDigest.update(
      `${record.path}\0${record.bytes}\0${record.reproducibleSha256}\n`,
    );
  }
  return Object.freeze({
    fileCount: records.length,
    totalBytes: records.reduce((total, record) => total + record.bytes, 0),
    treeSha256: artifactDigest.digest("hex"),
    reproducibleTreeSha256: reproducibleDigest.digest("hex"),
  });
}

async function resolveCommit(root, sourceCommit) {
  const { stdout } = await execFileAsync("git", ["rev-parse", `${sourceCommit}^{commit}`], { cwd: root });
  return stdout.trim();
}

async function productionInputsMatch(root, sourceCommit) {
  try {
    await execFileAsync("git", ["diff", "--quiet", sourceCommit, "--", ...PRODUCTION_INPUTS], { cwd: root });
    return true;
  } catch (error) {
    if (error?.code === 1) return false;
    throw error;
  }
}

export async function createReleaseManifest({
  version,
  sourceCommit,
  sourceTag,
  root = process.cwd(),
}) {
  const rootDirectory = resolve(root);
  const resolvedCommit = await resolveCommit(rootDirectory, sourceCommit);
  if (resolvedCommit !== sourceCommit) {
    throw new Error(`Source commit must be the full immutable SHA: ${resolvedCommit}`);
  }
  if (!(await productionInputsMatch(rootDirectory, sourceCommit))) {
    throw new Error(`Production inputs differ from source commit ${sourceCommit}`);
  }

  const packageJson = JSON.parse(await readFile(resolve(rootDirectory, "package.json"), "utf8"));
  const runtimePaths = await collectProductionPublicAssetPaths(rootDirectory);
  const sourceHashes = await hashFiles(resolve(rootDirectory, "public"), runtimePaths);
  const [vinextHashes, githubHashes] = await Promise.all([
    hashFiles(resolve(rootDirectory, "dist/client"), runtimePaths),
    hashFiles(resolve(rootDirectory, "dist-github"), runtimePaths),
  ]);
  if (JSON.stringify(vinextHashes) !== JSON.stringify(sourceHashes)
    || JSON.stringify(githubHashes) !== JSON.stringify(sourceHashes)) {
    throw new Error("Release outputs do not preserve the production runtime inventory");
  }

  const runtimeInventory = await Promise.all(runtimePaths.map(async path => Object.freeze({
    path,
    bytes: (await stat(resolve(rootDirectory, "public", path))).size,
    sha256: sourceHashes[path],
  })));

  return Object.freeze({
    schemaVersion: 1,
    version,
    source: Object.freeze({
      commit: sourceCommit,
      tag: sourceTag,
      productionInputsMatch: true,
    }),
    environment: Object.freeze({
      node: process.version,
      packageManager: packageJson.packageManager,
    }),
    buildCommands: Object.freeze([
      "pnpm install --frozen-lockfile --ignore-scripts",
      "pnpm build",
      "pnpm build:github-pages",
    ]),
    reproducibility: Object.freeze({
      requiredMatchingBuilds: 2,
      comparison: "reproducibleTreeSha256",
      normalization: Object.freeze([
        "vinext generated build UUIDs in dist/server/index.js",
        "vinext generated prerenderSecret in dist/server/**/vinext-server.json",
      ]),
    }),
    outputs: Object.freeze({
      vinext: await summarizeTree(resolve(rootDirectory, "dist"), normalizeVinextOutput),
      githubPages: await summarizeTree(resolve(rootDirectory, "dist-github")),
    }),
    runtimeInventory: Object.freeze(runtimeInventory),
  });
}

async function writeManifest(root, output, manifest) {
  const rootDirectory = resolve(root);
  const target = resolve(rootDirectory, output);
  const releaseDirectory = resolve(rootDirectory, "release");
  if (!target.startsWith(`${releaseDirectory}${sep}`) || !target.endsWith(".json")) {
    throw new Error("Release manifest output must be a JSON file under release/");
  }
  await mkdir(releaseDirectory, { recursive: true });
  await writeFile(target, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function verifyManifest(root, input) {
  const expected = JSON.parse(await readFile(resolve(root, input), "utf8"));
  const actual = await createReleaseManifest({
    version: expected.version,
    sourceCommit: expected.source.commit,
    sourceTag: expected.source.tag,
    root,
  });
  const comparable = manifest => ({
    ...manifest,
    outputs: Object.fromEntries(Object.entries(manifest.outputs).map(([name, output]) => [
      name,
      {
        fileCount: output.fileCount,
        totalBytes: output.totalBytes,
        reproducibleTreeSha256: output.reproducibleTreeSha256,
      },
    ])),
  });
  if (JSON.stringify(comparable(actual)) !== JSON.stringify(comparable(expected))) {
    throw new Error(`Release outputs do not match ${input}`);
  }
  return actual;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , command, ...args] = process.argv;
  if (command === "--verify") {
    const [input] = args;
    if (!input) throw new Error("Usage: node tools/create-release-manifest.mjs --verify <manifest>");
    const manifest = await verifyManifest(process.cwd(), input);
    console.log(JSON.stringify({
      verified: true,
      version: manifest.version,
      sourceCommit: manifest.source.commit,
      outputs: manifest.outputs,
    }, null, 2));
  } else {
    const [sourceCommit, sourceTag, output] = args;
    if (!command || !sourceCommit || !sourceTag || !output) {
      throw new Error("Usage: node tools/create-release-manifest.mjs <version> <source-commit> <source-tag> <output>");
    }
    const manifest = await createReleaseManifest({
      version: command,
      sourceCommit,
      sourceTag,
    });
    await writeManifest(process.cwd(), output, manifest);
    console.log(JSON.stringify({
      written: output,
      version: manifest.version,
      sourceCommit: manifest.source.commit,
      outputs: manifest.outputs,
    }, null, 2));
  }
}
