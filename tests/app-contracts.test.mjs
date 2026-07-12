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
import { createAssetFailureReporter, RUNTIME_ASSET_MANIFEST } from "../app/game/assets/AssetManifest.ts";
import { PlayerStateMachine } from "../app/game/player/PlayerStateMachine.ts";
import { PlayerLifecycle } from "../app/game/player/PlayerLifecycle.ts";
import { resolveAttack } from "../app/game/combat/CombatResolver.ts";
import { BAMBOO_COMBAT_ROOM, validateStageConfig } from "../app/game/stage/StageConfig.ts";

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
  assert.equal(BAMBOO_COMBAT_ROOM.spawnPoints.length, 3);
  assert.match(manager, /get currentAttackerId\(\)/);
  assert.match(scene, /this\.physics\.overlap\(this\.attackZone, enemy\.bodyZone\)/);
  assert.match(scene, /resolveAttack\(\{/);
});

test("CombatResolver resolves each target once without Phaser or effect coupling", () => {
  const first = resolveAttack({
    attackId: 7,
    damage: 1,
    targets: [
      { id: 1, hp: 3, active: true },
      { id: 2, hp: 1, active: true },
      { id: 3, hp: 3, active: false },
    ],
    hitTargetIds: new Set([2]),
  });
  assert.equal(first.attackId, 7);
  assert.deepEqual(first.hits, [{ targetId: 1, damage: 1, remainingHp: 2 }]);

  const second = resolveAttack({
    attackId: 7,
    damage: 1,
    targets: [{ id: 1, hp: 2, active: true }],
    hitTargetIds: first.hitTargetIds,
  });
  assert.deepEqual(second.hits, []);
  assert.deepEqual([...second.hitTargetIds].sort(), [1, 2]);
});

test("EffectDirector preserves the established hit timing parameters", async () => {
  const source = await readFile(new URL("../app/game/combat/EffectDirector.ts", import.meta.url), "utf8");
  assert.match(source, /beginHitStop\(\)/);
  assert.match(source, /createHitSpark\(x: number, y: number\)/);
  assert.match(source, /knockback\(target/);
  assert.match(source, /hitStopMs: \(1000 \/ 60\) \* 4/);
  assert.match(source, /hitFlashMs: 90/);
  assert.match(source, /knockbackDistance: 26/);
  assert.match(source, /knockbackMs: 120/);
  assert.match(source, /cameraShakeMs: 50/);
  assert.match(source, /cameraShakeIntensity: 0\.003/);
  assert.match(source, /hitSparkFrameRate: 24/);
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

test("Runtime asset manifest preserves keys and reports missing required assets", async () => {
  const source = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.match(source, /queueRuntimeAssets\(this\.load\)/);
  assert.match(source, /load\.on\("loaderror"/);
  assert.match(source, /load\.off\("loaderror"/);
  assert.deepEqual(RUNTIME_ASSET_MANIFEST.map(asset => asset.key), [
    "forest", "guanyu-idle", "guanyu-walk", "guanyu-attack", "enemy-soldier",
  ]);
  const messages = [];
  createAssetFailureReporter(RUNTIME_ASSET_MANIFEST, message => messages.push(message))("guanyu-walk");
  assert.deepEqual(messages, ["Required runtime asset failed to load: guanyu-walk"]);
});

test("Player state machine enforces explicit transitions and reset", () => {
  const machine = new PlayerStateMachine();
  assert.equal(machine.state, "idle");
  assert.equal(machine.canTransition("walk"), true);
  assert.deepEqual(machine.transition("walk"), { previous: "idle", next: "walk" });
  assert.deepEqual(machine.transition("attack1"), { previous: "walk", next: "attack1" });
  assert.deepEqual(machine.transition("attack2"), { previous: "attack1", next: "attack2" });
  assert.throws(() => machine.transition("walk"), /Invalid player transition: attack2 -> walk/);
  machine.transition("hurt");
  assert.deepEqual(machine.transition("idle"), { previous: "hurt", next: "idle" });
  machine.reset();
  assert.equal(machine.state, "idle");
});

test("PlayerLifecycle floors HP, enters dead once, and resets deterministically", () => {
  const lifecycle = new PlayerLifecycle(3);
  assert.deepEqual(lifecycle.applyDamage(1), { applied: true, damage: 1, hp: 2, becameDead: false });
  assert.deepEqual(lifecycle.applyDamage(5), { applied: true, damage: 5, hp: 0, becameDead: true });
  assert.deepEqual(lifecycle.applyDamage(1), { applied: false, damage: 0, hp: 0, becameDead: false });
  lifecycle.reset();
  assert.equal(lifecycle.hp, 3);
  assert.equal(lifecycle.state, "alive");
});

test("PlayerActor owns sprite, feet anchor, and Arcade body responsibilities", async () => {
  const source = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  const actor = await readFile(new URL("../app/game/player/PlayerActor.ts", import.meta.url), "utf8");
  assert.match(source, /new PlayerActor\(this, START_X, START_FOOT_Y\)/);
  assert.match(source, /this\.playerActor\.syncVisuals\(\)/);
  assert.match(source, /this\.playerActor\.destroy\(\)/);
  assert.match(actor, /readonly bodyZone/);
  assert.match(actor, /readonly sprite/);
  assert.match(actor, /readonly body:/);
  assert.match(actor, /setOrigin\(0\.5, 1\)/);
  assert.match(actor, /setDepth\(y\)/);
});

test("PlayerAttackController defines independent three-stage timing metadata", async () => {
  const source = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  const controller = await readFile(new URL("../app/game/player/PlayerAttackController.ts", import.meta.url), "utf8");
  assert.match(source, /new PlayerAttackController\(\)/);
  assert.match(source, /this\.attackController\.begin/);
  assert.match(source, /this\.attackController\.isActiveFrame/);
  assert.match(source, /this\.attackController\.finish\(\)/);
  assert.match(controller, /guanyu-attack1/);
  assert.match(controller, /guanyu-attack2/);
  assert.match(controller, /guanyu-attack3/);
  assert.match(controller, /startupFrames/);
  assert.match(controller, /activeFrames/);
  assert.match(controller, /recoveryFrames/);
  assert.match(controller, /frameRate: 8/);
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
  assert.match(scene, /effectDirector\.beginHitStop/);
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

test("EnemyManager cleanup cancels state timers and releases combat ownership", async () => {
  const source = await readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8");
  assert.match(source, /stateTimers = new Map/);
  assert.match(source, /clearStateTimer\(enemy\)/);
  assert.match(source, /enemy\.body\.enable = false/);
  assert.match(source, /this\.disableAttackHitbox\(enemy\)/);
  assert.match(source, /enemy\.sprite\.off\(Phaser\.Animations\.Events\.ANIMATION_UPDATE/);
  assert.match(source, /this\.currentAttacker = null/);
  assert.match(source, /enemy\.state === "dead" \|\| enemy\.state === "hurt"/);
});

test("Combat room acceptance covers formation, attack director, alignment, and survivors", async () => {
  const [manager, scene] = await Promise.all([
    readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8"),
  ]);
  const spawnCoordinates = BAMBOO_COMBAT_ROOM.spawnPoints.map(({ x, y }) => [x, y]);
  assert.equal(spawnCoordinates.length, 3);
  assert.equal(new Set(spawnCoordinates.map(([, y]) => y)).size, 3);
  assert.match(manager, /ENEMY_ATTACK_X_RANGE = 110/);
  assert.match(manager, /ENEMY_ATTACK_Y_RANGE = 45/);
  assert.match(manager, /ENEMY_MIN_SPACING = 72/);
  assert.match(manager, /if \(this\.currentAttacker \|\| this\.clock\.now\(\) < this\.directorReadyAt\) return/);
  assert.match(manager, /this\.currentAttacker = enemy/);
  assert.match(manager, /Math\.abs\(dy\) < ENEMY_ATTACK_Y_RANGE/);
  assert.match(manager, /getLivingEnemies\(\)/);
  assert.match(manager, /onAllDefeated\(\)/);
  assert.match(scene, /this\.enemyManager\.spawnAll\(BAMBOO_COMBAT_ROOM\.spawnPoints\)/);
  assert.match(scene, /resolveAttack\(\{/);
  assert.match(scene, /this\.playerHitTargetIds/);
});

test("StageConfig remains Phaser-free and validates the bamboo combat room", async () => {
  const source = await readFile(new URL("../app/game/stage/StageConfig.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /from ["']phaser["']/);
  assert.equal(BAMBOO_COMBAT_ROOM.worldBounds.width, 1280);
  assert.equal(BAMBOO_COMBAT_ROOM.worldBounds.height, 720);
  assert.deepEqual(BAMBOO_COMBAT_ROOM.walkBounds, { x: 70, y: 390, width: 1140, height: 245 });
  assert.equal(BAMBOO_COMBAT_ROOM.spawnPoints.length, 3);
  assert.equal(validateStageConfig(BAMBOO_COMBAT_ROOM), BAMBOO_COMBAT_ROOM);
  assert.throws(() => validateStageConfig({
    ...BAMBOO_COMBAT_ROOM,
    spawnPoints: [...BAMBOO_COMBAT_ROOM.spawnPoints, { id: "enemy-front", x: 900, y: 560 }],
  }), /Duplicate spawn point id/);
});
