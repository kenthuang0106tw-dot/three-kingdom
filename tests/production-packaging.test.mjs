import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  SHELL_PUBLIC_ASSETS,
  classifyProductionPublicAssets,
  collectProductionPublicAssetPaths,
  hashFiles,
} from "../tools/package-production-assets.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));

test("production inventory includes every manifest request and shell asset", async () => {
  const [paths, appShell, githubShell] = await Promise.all([
    collectProductionPublicAssetPaths(root),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../github-pages/main.tsx", import.meta.url), "utf8"),
  ]);

  assert.equal(paths.length, 54);
  for (const path of SHELL_PUBLIC_ASSETS) {
    assert.ok(paths.includes(path));
    assert.match(appShell, new RegExp(path.replaceAll("/", "\\/")));
    assert.match(githubShell, new RegExp(path.replaceAll("/", "\\/")));
  }
});

test("production packaging excludes source and QA files without changing runtime bytes", async () => {
  const inventory = await classifyProductionPublicAssets(root);
  assert.equal(inventory.preserved.length, 54);
  assert.ok(inventory.excluded.length > 46);
  assert.ok(inventory.excluded.includes("art/guanyu/guanyu-v2-debug.png"));
  assert.ok(inventory.excluded.includes("scene/bamboo-stage/bamboo-stage-overview.png"));
  assert.ok(inventory.excluded.includes("scene/source/bamboo-forest-entry-source.png"));
  assert.ok(!inventory.preserved.some(path => /(?:source|debug|onion|silhouette|overview)/i.test(path)));

  const sourceHashes = await hashFiles(fileURLToPath(new URL("../public", import.meta.url)), inventory.preserved);
  assert.equal(Object.keys(sourceHashes).length, 54);
  assert.ok(Object.values(sourceHashes).every(hash => /^[a-f0-9]{64}$/.test(hash)));
});

test("both production outputs preserve the exact inventory and omit QA routes", async () => {
  const inventory = await classifyProductionPublicAssets(root);
  const sourceHashes = await hashFiles(
    fileURLToPath(new URL("../public", import.meta.url)),
    inventory.preserved,
    { normalize: true },
  );

  for (const output of ["dist/client", "dist-github"]) {
    const outputDirectory = fileURLToPath(new URL(`../${output}/`, import.meta.url));
    assert.deepEqual(await hashFiles(outputDirectory, inventory.preserved), sourceHashes, output);
    const atlas = await readFile(new URL(`../${output}/art/guanyu/guanyu-v2.atlas.json`, import.meta.url), "utf8");
    assert.ok(!atlas.includes("\r\n"), `${output} must package text runtime assets with LF`);
    for (const path of [
      "art/guanyu/guanyu-v2-debug.png",
      "scene/bamboo-stage/bamboo-stage-overview.png",
      "scene/source/bamboo-forest-entry-source.png",
    ]) {
      await assert.rejects(stat(fileURLToPath(new URL(`../${output}/${path}`, import.meta.url))), { code: "ENOENT" });
    }
  }
});
