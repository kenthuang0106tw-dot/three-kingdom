import { createHash } from "node:crypto";
import { readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const MANIFEST_URL_PATTERN = /assetUrl\("([^"]+)"\)/g;
const ALLOWED_OUTPUTS = new Set(["dist/client", "dist-github"]);

export const SHELL_PUBLIC_ASSETS = Object.freeze([
  "art/guanyu/guanyu-master.png",
  "art/zhangfei/zhangfei-master.png",
  "art/zhaoyun/zhaoyun-master.png",
]);

export const LAZY_RUNTIME_PUBLIC_ASSETS = Object.freeze([
  "art/zhangfei-v2/zhangfei-v2.png",
  "art/zhangfei-v2/zhangfei-v2.atlas.json",
]);

async function directoryFiles(directory, root = directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await directoryFiles(path, root));
    else if (entry.isFile()) files.push(relative(root, path).replaceAll("\\", "/"));
  }
  return files;
}

async function removeEmptyDirectories(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) await removeEmptyDirectories(join(directory, entry.name));
  }
  if ((await readdir(directory)).length === 0) await rm(directory, { recursive: true });
}

export async function collectProductionPublicAssetPaths(root = process.cwd()) {
  const source = await readFile(resolve(root, "app/game/assets/AssetManifest.ts"), "utf8");
  const manifestPaths = [...source.matchAll(MANIFEST_URL_PATTERN)]
    .map(match => match[1].replace(/^\/+/, ""));
  return Object.freeze([
    ...new Set([...manifestPaths, ...SHELL_PUBLIC_ASSETS, ...LAZY_RUNTIME_PUBLIC_ASSETS]),
  ].sort());
}

export async function classifyProductionPublicAssets(root = process.cwd()) {
  const publicDirectory = resolve(root, "public");
  const [publicFiles, productionFiles] = await Promise.all([
    directoryFiles(publicDirectory),
    collectProductionPublicAssetPaths(root),
  ]);
  const productionSet = new Set(productionFiles);
  return Object.freeze({
    preserved: Object.freeze(publicFiles.filter(path => productionSet.has(path)).sort()),
    excluded: Object.freeze(publicFiles.filter(path => !productionSet.has(path)).sort()),
  });
}

export function normalizeProductionAsset(path, bytes) {
  if (!/\.(?:json|xml)$/.test(path)) return bytes;
  return Buffer.from(bytes.toString("utf8").replaceAll("\r\n", "\n"));
}

export async function hashFiles(directory, paths, { normalize = false } = {}) {
  return Object.freeze(Object.fromEntries(await Promise.all(paths.map(async path => {
    const source = await readFile(resolve(directory, path));
    const bytes = normalize ? normalizeProductionAsset(path, source) : source;
    return [path, createHash("sha256").update(bytes).digest("hex")];
  }))));
}

export async function packageProductionAssets(output, root = process.cwd()) {
  const rootDirectory = resolve(root);
  const outputDirectory = resolve(rootDirectory, output);
  const relativeOutput = relative(rootDirectory, outputDirectory).replaceAll("\\", "/");
  if (!ALLOWED_OUTPUTS.has(relativeOutput) || outputDirectory === resolve(rootDirectory, "public")) {
    throw new Error(`Refusing to package unsupported output directory: ${relativeOutput}`);
  }
  await stat(outputDirectory);

  const inventory = await classifyProductionPublicAssets(rootDirectory);
  const publicDirectory = resolve(rootDirectory, "public");
  const beforeHashes = await hashFiles(publicDirectory, inventory.preserved, { normalize: true });
  let removedBytes = 0;
  for (const path of inventory.excluded) {
    const target = resolve(outputDirectory, path);
    if (!target.startsWith(`${outputDirectory}${sep}`)) throw new Error(`Unsafe output path: ${path}`);
    try {
      removedBytes += (await stat(target)).size;
      await rm(target);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }

  for (const rootName of ["art", "audio", "scene"]) {
    const directory = resolve(outputDirectory, rootName);
    try {
      await removeEmptyDirectories(directory);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }

  for (const path of inventory.preserved) {
    if (!/\.(?:json|xml)$/.test(path)) continue;
    const source = await readFile(resolve(publicDirectory, path));
    await writeFile(resolve(outputDirectory, path), normalizeProductionAsset(path, source));
  }

  const afterHashes = await hashFiles(outputDirectory, inventory.preserved);
  for (const path of inventory.preserved) {
    if (afterHashes[path] !== beforeHashes[path]) {
      throw new Error(`Packaged runtime asset changed: ${path}`);
    }
  }

  return Object.freeze({
    output: relativeOutput,
    preservedFiles: inventory.preserved.length,
    excludedFiles: inventory.excluded.length,
    removedBytes,
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const output = process.argv[2];
  if (!output) throw new Error("Usage: node tools/package-production-assets.mjs <dist/client|dist-github>");
  console.log(JSON.stringify(await packageProductionAssets(output), null, 2));
}
