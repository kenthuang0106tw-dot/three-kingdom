import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const actorMetadata = [
  "../public/art/guanyu/guanyu-v2.metadata.json",
  "../public/art/enemy/soldier.metadata.json",
  "../public/art/enemy/duelist.metadata.json",
  "../public/art/enemy/mauler.metadata.json",
  "../public/art/enemy/shield-guard.metadata.json",
  "../public/art/enemy/crossbow.metadata.json",
];

test("release actor frames stay inside their cells and preserve the feet line", async () => {
  for (const path of actorMetadata) {
    const metadata = JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
    const { width, height } = metadata.cell;
    const feetY = metadata.feetAnchor.y;

    assert.ok(metadata.frames.length > 0, `${path} has frames`);
    for (const frame of metadata.frames) {
      const bounds = frame.runtimeAlphaBounds;
      assert.ok(bounds.x >= 0 && bounds.y >= 0, `${path} ${frame.name} starts inside its cell`);
      assert.ok(bounds.x + bounds.width <= width, `${path} ${frame.name} does not clip horizontally`);
      assert.ok(bounds.y + bounds.height <= height, `${path} ${frame.name} does not clip vertically`);
      assert.equal(bounds.y + bounds.height, feetY, `${path} ${frame.name} keeps the shared feet line`);
      assert.deepEqual(frame.feetAnchor, metadata.feetAnchor, `${path} ${frame.name} keeps the shared anchor`);
      assert.equal(frame.displayScale, metadata.displayScale, `${path} ${frame.name} keeps one display scale`);
    }
  }
});

test("release Boss frames stay inside the lifecycle cell and preserve the feet line", async () => {
  const metadata = JSON.parse(await readFile(
    new URL("../public/art/boss/warlord-lifecycle.metadata.json", import.meta.url),
    "utf8",
  ));

  for (const frame of metadata.frames) {
    assert.ok(frame.displayOffsetX >= 0 && frame.displayOffsetY >= 0);
    assert.ok(frame.displayOffsetX + frame.visibleWidth <= metadata.cellSize);
    assert.ok(frame.displayOffsetY + frame.visibleHeight <= metadata.cellSize);
    assert.equal(frame.displayOffsetY + frame.visibleHeight, metadata.feetAnchor.y);
    assert.deepEqual(frame.feetAnchor, metadata.feetAnchor);
    assert.equal(frame.displayScale, metadata.displayScale);
  }
});

test("three release Stage sections and their split layers remain contiguous", async () => {
  const metadata = JSON.parse(await readFile(
    new URL("../public/scene/bamboo-stage/bamboo-stage.metadata.json", import.meta.url),
    "utf8",
  ));
  const { sectionWidth, sectionHeight, worldWidth, groundY } = metadata.runtime;

  assert.equal(metadata.sections.length, 3);
  assert.equal(worldWidth, sectionWidth * metadata.sections.length);
  metadata.sections.forEach((section, index) => {
    assert.deepEqual(section.worldBounds, {
      x: index * sectionWidth,
      y: 0,
      width: sectionWidth,
      height: sectionHeight,
    });
    const background = section.layers.find(layer => layer.kind === "background");
    const ground = section.layers.find(layer => layer.kind === "ground");
    assert.deepEqual(background.alphaBounds, [0, 0, sectionWidth, groundY]);
    assert.deepEqual(ground.alphaBounds, [0, groundY, sectionWidth, sectionHeight]);
    assert.ok(section.layers.every(layer =>
      layer.width === sectionWidth
      && layer.height === sectionHeight
      && layer.alphaBounds[0] >= 0
      && layer.alphaBounds[2] <= sectionWidth
      && layer.alphaBounds[1] >= 0
      && layer.alphaBounds[3] <= sectionHeight
    ));
  });
});

test("production keeps visual debug disabled and the responsive FIT contract intact", async () => {
  const [game, css] = await Promise.all([
    readFile(new URL("../app/game/PhaserGame.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(game, /antialias: false/);
  assert.match(game, /pixelArt: true/);
  assert.match(game, /roundPixels: true/);
  assert.match(game, /debug: process\.env\.NODE_ENV !== "production"/);
  assert.match(game, /mode: Phaser\.Scale\.FIT/);
  assert.match(game, /autoCenter: Phaser\.Scale\.CENTER_BOTH/);
  assert.match(css, /overflow:hidden/);
  assert.match(css, /touch-action:none/);
  assert.match(css, /safe-area-inset-top/);
  assert.match(css, /@media \(pointer:coarse\)/);
});
