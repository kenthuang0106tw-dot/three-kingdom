import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const readText = path => readFile(new URL(path, root), "utf8");
const readJson = path => readText(path).then(JSON.parse);

test("Zhang Fei atlas contains the contracted 47 unique, feet-aligned frames", async () => {
  const [atlas, metadata] = await Promise.all([
    readJson("public/art/zhangfei-v2/zhangfei-v2.atlas.json"),
    readJson("public/art/zhangfei-v2/zhangfei-v2.metadata.json"),
  ]);

  assert.equal(metadata.frameCount, 47);
  assert.deepEqual(metadata.cell, { width: 672, height: 448, columns: 6, rows: 8 });
  assert.deepEqual(metadata.feetAnchor, { x: 336, y: 420 });
  assert.deepEqual(metadata.origin, { x: 0.5, y: 0.9375 });
  assert.equal(metadata.displayScale, 0.64);
  assert.equal(Object.keys(atlas.frames).length, 47);
  assert.equal(new Set(metadata.frames.map(frame => frame.pixelHash)).size, 47);
  assert.ok(metadata.frames.every(frame => frame.facing === "right"));
  assert.ok(metadata.frames.every(frame => frame.globalScale === metadata.globalScale));
  assert.ok(metadata.frames.every(frame => frame.alphaBounds.x >= 8 && frame.alphaBounds.y >= 8));
  assert.ok(metadata.frames.every(frame => frame.alphaBounds.x + frame.alphaBounds.width <= 664));
  assert.ok(metadata.frames.every(frame => frame.alphaBounds.y + frame.alphaBounds.height === 420));
});

test("Zhang Fei animation budgets and attack phases match the approved contract", async () => {
  const metadata = await readJson("public/art/zhangfei-v2/zhangfei-v2.metadata.json");
  const expected = {
    idle: [6, { loop: 6 }],
    walk: [8, { loop: 8 }],
    attack1: [6, { startup: 2, active: 2, recovery: 2 }],
    attack2: [7, { startup: 3, active: 2, recovery: 2 }],
    attack3: [10, { startup: 4, active: 3, recovery: 3 }],
    hurt: [4, { hurt: 4 }],
    dead: [6, { death: 6 }],
  };
  for (const [animation, [count, phases]] of Object.entries(expected)) {
    const frames = metadata.frames.filter(frame => frame.animation === animation);
    assert.equal(frames.length, count, animation);
    assert.deepEqual(
      Object.fromEntries([...new Set(frames.map(frame => frame.phase))].map(phase => [
        phase, frames.filter(frame => frame.phase === phase).length,
      ])),
      phases,
      animation,
    );
  }
  assert.match(JSON.stringify(metadata.provenance), /丈八蛇矛/);
});

test("Zhang Fei remains a development preview and does not enter production runtime", async () => {
  const [scene, manifest, playerDefinition, packageTool] = await Promise.all([
    readText("app/game/MainScene.ts"),
    readText("app/game/assets/AssetManifest.ts"),
    readText("app/game/player/PlayerDefinition.ts"),
    readText("tools/package-production-assets.mjs"),
  ]);

  assert.match(scene, /process\.env\.NODE_ENV !== "production"/);
  assert.match(scene, /query\.get\("previewZhangFei"\) === "1"/);
  assert.match(scene, /A\/D state \| Left\/Right frame \| Space play\/pause/);
  assert.match(scene, /Up\/Down FPS \| L once\/loop \| O onion-skin/);
  assert.doesNotMatch(manifest, /zhang[-_]?fei|zhangfei/i);
  assert.doesNotMatch(playerDefinition, /zhang[-_]?fei|zhangfei/i);
  assert.doesNotMatch(packageTool, /art\/zhangfei-v2/);
});

test("Zhang Fei visual QA outputs are present and non-empty", async () => {
  for (const path of [
    "public/art/zhangfei-v2/zhangfei-v2-debug.png",
    "public/art/zhangfei-v2/zhangfei-v2-onion.png",
    "public/art/zhangfei-v2/zhangfei-v2-lineup.png",
    "public/art/zhangfei-v2/zhangfei-v2-silhouette-25.png",
    "public/art/zhangfei-v2/zhangfei-v2-identity.png",
    "public/art/zhangfei-v2/zhangfei-v2-palette.json",
  ]) {
    assert.ok((await readFile(new URL(path, root))).length > 100, path);
  }
});
