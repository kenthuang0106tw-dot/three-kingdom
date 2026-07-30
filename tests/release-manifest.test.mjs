import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourceCommit = "72bb680932f8ce95057e06f8e207f4ad4665e7bb";

test("published release manifest remains an immutable record after development resumes", async () => {
  const manifest = JSON.parse(await readFile(
    new URL("../release/0.1.0.manifest.json", import.meta.url),
    "utf8",
  ));

  assert.equal(manifest.version, "0.1.0");
  assert.equal(manifest.source.commit, sourceCommit);
  assert.equal(manifest.source.tag, "v0.1.0");
  assert.equal(manifest.source.productionInputsMatch, true);
  assert.equal(manifest.reproducibility.requiredMatchingBuilds, 2);
  assert.equal(manifest.reproducibility.comparison, "reproducibleTreeSha256");
  assert.equal(manifest.reproducibility.normalization.length, 2);
  assert.equal(manifest.runtimeInventory.length, 52);
  assert.ok(manifest.runtimeInventory.every(file => /^[a-f0-9]{64}$/.test(file.sha256)));
  assert.ok(manifest.outputs.vinext.fileCount > 52);
  assert.ok(manifest.outputs.githubPages.fileCount > 52);
  assert.match(manifest.outputs.vinext.treeSha256, /^[a-f0-9]{64}$/);
  assert.match(manifest.outputs.vinext.reproducibleTreeSha256, /^[a-f0-9]{64}$/);
  assert.match(manifest.outputs.githubPages.treeSha256, /^[a-f0-9]{64}$/);
  assert.equal(
    manifest.outputs.githubPages.reproducibleTreeSha256,
    manifest.outputs.githubPages.treeSha256,
  );
});
