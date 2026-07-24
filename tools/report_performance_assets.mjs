import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const MANIFEST_URL_PATTERN = /assetUrl\("([^"]+)"\)/g;
const MANIFEST_ENTRY_PATTERN = /\{ kind:/g;

async function directoryFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await directoryFiles(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

export async function collectPerformanceAssetReport(root = process.cwd()) {
  const manifestPath = resolve(root, "app/game/assets/AssetManifest.ts");
  const source = await readFile(manifestPath, "utf8");
  const urls = [...source.matchAll(MANIFEST_URL_PATTERN)].map(match => match[1]);
  const uniqueUrls = [...new Set(urls)].sort();
  const byExtension = new Map();
  let encodedBytes = 0;
  let decodedRgbaBytes = 0;

  for (const url of uniqueUrls) {
    const path = resolve(root, "public", url.replace(/^\/+/, ""));
    const file = await stat(path);
    const extension = extname(path).toLowerCase();
    encodedBytes += file.size;
    const extensionStats = byExtension.get(extension) ?? { files: 0, bytes: 0 };
    extensionStats.files += 1;
    extensionStats.bytes += file.size;
    byExtension.set(extension, extensionStats);

    if (extension === ".png") {
      const header = await readFile(path);
      decodedRgbaBytes += header.readUInt32BE(16) * header.readUInt32BE(20) * 4;
    }
  }

  const buildDirectory = resolve(root, "dist-github");
  let githubPagesBytes = null;
  let githubPagesJavaScriptBytes = null;
  try {
    const files = await directoryFiles(buildDirectory);
    const sizes = await Promise.all(files.map(async path => ({ path, bytes: (await stat(path)).size })));
    githubPagesBytes = sizes.reduce((sum, file) => sum + file.bytes, 0);
    githubPagesJavaScriptBytes = sizes
      .filter(file => extname(file.path).toLowerCase() === ".js")
      .reduce((sum, file) => sum + file.bytes, 0);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  return Object.freeze({
    logicalEntries: [...source.matchAll(MANIFEST_ENTRY_PATTERN)].length,
    requestFiles: uniqueUrls.length,
    encodedBytes,
    decodedRgbaBytes,
    githubPagesBytes,
    githubPagesJavaScriptBytes,
    byExtension: Object.freeze(Object.fromEntries(
      [...byExtension.entries()].map(([extension, value]) => [extension, Object.freeze(value)]),
    )),
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(await collectPerformanceAssetReport(), null, 2));
}
