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
import { GameplayEventHub } from "../app/game/events/GameplayEvents.ts";
import { SeededRandom, TestClock } from "../app/game/time/GameplayTime.ts";

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

test("Mobile landscape keeps the Phaser canvas in a safe-area fitted contract", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const scene = await readFile(new URL("../app/game/PhaserGame.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(layout, /width: "device-width"/);
  assert.match(layout, /viewportFit: "cover"/);
  assert.match(scene, /mode: Phaser\.Scale\.FIT/);
  assert.match(scene, /autoCenter: Phaser\.Scale\.CENTER_BOTH/);
  assert.match(css, /100dvh/);
  assert.match(css, /safe-area-inset-top/);
  assert.match(css, /orientation:landscape/);
  assert.match(css, /aspect-ratio:16\/9/);
  assert.match(css, /touch-action:none/);
});

test("MainScene exposes a development-only reset smoke path with shutdown cleanup", async () => {
  const source = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.match(source, /query\.get\("resetSmoke"\)/);
  assert.match(source, /resetSmokeIteration < 10/);
  assert.match(source, /this\.scene\.restart\(\)/);
  assert.match(source, /events\.once\(Phaser\.Scenes\.Events\.SHUTDOWN/);
  assert.match(source, /touchInputController\.destroy\(\)/);
  assert.match(source, /lifecycleClock\.destroy\(\)/);
  assert.match(source, /enemyManager\.destroy\(\)/);
  assert.match(source, /this\.anims\.exists\("guanyu-walk"\)/);
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

test("Gameplay event hub publishes frozen snapshots without actor references", () => {
  const hub = new GameplayEventHub();
  const events = [];
  const unsubscribe = hub.subscribe(event => events.push(event));
  hub.publishSnapshot({
    player: { state: "idle", hp: 10, x: 1, y: 2 },
    enemies: [{ id: 1, state: "idle", hp: 3, x: 4, y: 5 }],
    lifecycle: { paused: false, visibilityPaused: false },
  });
  hub.publish({ type: "enemy-hit", enemyId: 1, damage: 1, at: 12 });
  const snapshot = hub.getSnapshot();
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.enemies[0]), true);
  assert.equal(Object.isFrozen(events[0]), true);
  assert.equal(snapshot.enemies[0].sprite, undefined);
  unsubscribe();
  hub.publish({ type: "lifecycle-changed", paused: true, at: 13 });
  assert.equal(events.length, 1);
});

test("MainScene publishes readonly gameplay observations", async () => {
  const source = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.match(source, /GameplayEventHub/);
  assert.match(source, /getGameplayEvents\(\)/);
  assert.match(source, /publishGameplaySnapshot\(\)/);
  assert.match(source, /player-state-changed/);
  assert.match(source, /enemy-hit/);
  assert.doesNotMatch(source, /publishSnapshot\([^\n]*enemyManager/);
});

test("Seeded random and test clock are reproducible", () => {
  const first = new SeededRandom(12345);
  const second = new SeededRandom(12345);
  assert.deepEqual(
    Array.from({ length: 8 }, () => first.between(400, 800)),
    Array.from({ length: 8 }, () => second.between(400, 800)),
  );
  const clock = new TestClock(100);
  assert.equal(clock.now(), 100);
  clock.advance(250);
  assert.equal(clock.now(), 350);
});

test("EnemyManager uses injectable gameplay time and randomness", async () => {
  const source = await readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8");
  const scene = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.match(source, /GameplayClock/);
  assert.match(source, /this\.clock\.now\(\)/);
  assert.match(source, /this\.random\.between/);
  assert.doesNotMatch(source, /Phaser\.Math\.Between/);
  assert.match(scene, /new SeededRandom\(0x3a6f2d1\)/);
});
