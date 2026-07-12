import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  clearRegisteredPhaserGame,
  registerPhaserGame,
  releasePhaserGame,
} from "../app/game/phaserLifecycle.ts";
import { createActionSnapshot } from "../app/game/input/ActionSnapshot.ts";
import { ClockState } from "../app/game/time/ClockState.ts";

test("React shell mounts only the Phaser lifecycle component", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /import PhaserGame from "\.\/game\/PhaserGame"/);
  assert.match(page, /<PhaserGame \/>/);
  assert.doesNotMatch(page, /<canvas|requestAnimationFrame|setInterval/);
});

test("Phaser registry survives 20 mount and destroy cycles without duplicates", () => {
  const registry = {};
  const games = [];
  for (let index = 0; index < 20; index += 1) {
    const game = { destroyCalls: 0, destroy() { this.destroyCalls += 1; } };
    clearRegisteredPhaserGame(registry);
    registerPhaserGame(registry, game);
    assert.equal(registry.__dynastyPhaserGame, game);
    releasePhaserGame(registry, game);
    assert.equal(registry.__dynastyPhaserGame, undefined);
    games.push(game);
  }
  assert.deepEqual(games.map(game => game.destroyCalls), Array(20).fill(1));
});

test("Enemy and combat source retain the current three-enemy contracts", async () => {
  const [manager, scene] = await Promise.all([
    readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8"),
  ]);
  const spawnBlock = manager.match(/const spawns = \[([\s\S]*?)\n    \];/)?.[1] ?? "";
  assert.equal([...spawnBlock.matchAll(/\{ x: \d+, y: \d+ \}/g)].length, 3);
  assert.match(manager, /get currentAttackerId\(\)/);
  assert.match(manager, /markPlayerAttackHit/);
  assert.match(scene, /this\.physics\.overlap\(this\.attackZone, enemy\.bodyZone\)/);
  assert.match(scene, /this\.enemyManager\.markPlayerAttackHit\(enemy, this\.playerAttackId\)/);
});

test("Action snapshot releases movement and normalizes diagonal input", () => {
  const stopped = createActionSnapshot({ up: false, down: false, left: false, right: false });
  assert.deepEqual({ moveX: stopped.moveX, moveY: stopped.moveY }, { moveX: 0, moveY: 0 });

  const diagonal = createActionSnapshot({ up: true, down: false, left: false, right: true });
  assert.ok(Math.abs(Math.hypot(diagonal.moveX, diagonal.moveY) - 1) < 1e-9);
  assert.equal(diagonal.attackPressed, false);

  const attack = createActionSnapshot({ up: false, down: false, left: false, right: false }, true);
  assert.equal(attack.attackPressed, true);
});

test("MainScene reads keyboard edge-trigger through the snapshot boundary", async () => {
  const source = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.match(source, /readSnapshot\(\)/);
  assert.match(source, /Phaser\.Input\.Keyboard\.JustDown\(this\.attack\)/);
  assert.doesNotMatch(source, /window\.addEventListener|document\.addEventListener/);
  assert.doesNotMatch(source, /attackJustPressed\(\)/);
});

test("Touch input shares the action snapshot and releases pointer state", async () => {
  const source = await readFile(new URL("../app/game/input/TouchInputController.ts", import.meta.url), "utf8");
  const scene = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.match(source, /pointercancel/);
  assert.match(source, /pointerupoutside/);
  assert.match(source, /pointerout/);
  assert.match(source, /createActionSnapshot/);
  assert.match(scene, /new TouchInputController\(this\)/);
  assert.match(scene, /readSnapshot\(this\.inputController\.readSnapshot\(\)\)/);
});

test("Clock pause reasons remain independent and resume only when all reasons clear", () => {
  const clock = new ClockState();
  assert.equal(clock.isPaused(), false);
  clock.setPaused("visibility", true);
  clock.setPaused("hitStop", true);
  assert.equal(clock.isPaused(), true);
  clock.setPaused("hitStop", false);
  assert.equal(clock.isPaused(), true);
  clock.setPaused("visibility", false);
  assert.equal(clock.isPaused(), false);
});

test("Lifecycle clock owns Phaser blur/focus and hit-stop timing", async () => {
  const source = await readFile(new URL("../app/game/time/LifecycleClock.ts", import.meta.url), "utf8");
  const scene = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.match(source, /game\.events\.on\("blur"/);
  assert.match(source, /game\.events\.on\("focus"/);
  assert.match(source, /delayedCall/);
  assert.match(source, /scene\.scene\.pause\(\)/);
  assert.match(source, /scene\.scene\.resume\(\)/);
  assert.match(scene, /new LifecycleClock\(this\)/);
  assert.match(scene, /lifecycleClock\.beginHitStop/);
  assert.doesNotMatch(source, /setTimeout|setInterval/);
});
