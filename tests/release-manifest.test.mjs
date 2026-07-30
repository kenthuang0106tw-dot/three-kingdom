import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createReleaseManifest } from "../tools/create-release-manifest.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const sourceCommit = "72bb680932f8ce95057e06f8e207f4ad4665e7bb";

test("RC manifest identifies one immutable source and both reproducible outputs", async () => {
  const first = await createReleaseManifest({
    version: "0.1.0-rc.2",
    sourceCommit,
    sourceTag: "v0.1.0-rc.2",
    root,
  });
  const second = await createReleaseManifest({
    version: "0.1.0-rc.2",
    sourceCommit,
    sourceTag: "v0.1.0-rc.2",
    root,
  });

  assert.deepEqual(second, first);
  assert.equal(first.source.commit, sourceCommit);
  assert.equal(first.source.productionInputsMatch, true);
  assert.equal(first.reproducibility.requiredMatchingBuilds, 2);
  assert.equal(first.reproducibility.comparison, "reproducibleTreeSha256");
  assert.equal(first.reproducibility.normalization.length, 2);
  assert.equal(first.runtimeInventory.length, 52);
  assert.ok(first.runtimeInventory.every(file => /^[a-f0-9]{64}$/.test(file.sha256)));
  assert.ok(first.outputs.vinext.fileCount > 52);
  assert.ok(first.outputs.githubPages.fileCount > 52);
  assert.match(first.outputs.vinext.treeSha256, /^[a-f0-9]{64}$/);
  assert.match(first.outputs.vinext.reproducibleTreeSha256, /^[a-f0-9]{64}$/);
  assert.match(first.outputs.githubPages.treeSha256, /^[a-f0-9]{64}$/);
  assert.equal(
    first.outputs.githubPages.reproducibleTreeSha256,
    first.outputs.githubPages.treeSha256,
  );
});
