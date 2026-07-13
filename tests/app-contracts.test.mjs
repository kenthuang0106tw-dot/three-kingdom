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
import { BAMBOO_COMBAT_ROOM, clampStagePoint, clampStageX, clampStageY, validateStageConfig } from "../app/game/stage/StageConfig.ts";
import { calculateCameraScroll } from "../app/game/camera/CameraFollow.ts";
import { createCameraLockState, isCameraLocked, lockCamera, unlockCamera } from "../app/game/camera/CameraLock.ts";
import { beginEncounter, createEncounterFlow, isEncounterCleared, recordEnemyRemoved } from "../app/game/stage/EncounterFlow.ts";
import { canRequestStageExit, createStageExitState, makeExitAvailable, requestStageExit, resetStageExit } from "../app/game/stage/StageExit.ts";
import { DUELIST_ENEMY_CONFIG, MAULER_ENEMY_CONFIG, SOLDIER_ENEMY_CONFIG, validateEnemyConfig } from "../app/game/enemy/EnemyConfig.ts";

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
    "forest", "guanyu-idle", "guanyu-walk", "guanyu-attack", "enemy-soldier", "enemy-mauler", "enemy-duelist",
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
  assert.match(manager, /ENEMY_CONFIGS/);
  assert.equal(SOLDIER_ENEMY_CONFIG.combat.attackXRange, 110);
  assert.equal(SOLDIER_ENEMY_CONFIG.combat.attackYRange, 45);
  assert.equal(SOLDIER_ENEMY_CONFIG.combat.minSpacing, 72);
  assert.match(manager, /if \(this\.currentAttacker \|\| this\.clock\.now\(\) < this\.directorReadyAt\) return/);
  assert.match(manager, /this\.currentAttacker = enemy/);
  assert.match(manager, /Math\.abs\(dy\) < enemy\.config\.combat\.attackYRange/);
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

test("Stage bounds clamp movement and knockback deterministically", async () => {
  const source = await readFile(new URL("../app/game/stage/StageConfig.ts", import.meta.url), "utf8");
  const bounds = BAMBOO_COMBAT_ROOM.walkBounds;
  assert.equal(clampStageX(-10, bounds), bounds.x);
  assert.equal(clampStageX(9999, bounds), bounds.x + bounds.width);
  assert.equal(clampStageY(-10, bounds), bounds.y);
  assert.equal(clampStageY(9999, bounds), bounds.y + bounds.height);
  assert.deepEqual(clampStagePoint({ x: -10, y: 9999 }, bounds), {
    x: bounds.x,
    y: bounds.y + bounds.height,
  });
  assert.match(source, /clampStagePoint/);
});

test("Camera follow clamps scroll to world bounds without Phaser coupling", async () => {
  const source = await readFile(new URL("../app/game/camera/CameraFollow.ts", import.meta.url), "utf8");
  const world = { x: 0, y: 0, width: 2000, height: 1200 };
  const viewport = { width: 1280, height: 720 };
  assert.deepEqual(calculateCameraScroll({ x: 100, y: 100 }, world, viewport), { x: 0, y: 0 });
  assert.deepEqual(calculateCameraScroll({ x: 1000, y: 700 }, world, viewport), { x: 360, y: 340 });
  assert.deepEqual(calculateCameraScroll({ x: 1999, y: 1199 }, world, viewport), { x: 720, y: 480 });
  assert.doesNotMatch(source, /from ["']phaser["']/);
});

test("Camera lock contract transitions by explicit encounter reason", async () => {
  const source = await readFile(new URL("../app/game/camera/CameraLock.ts", import.meta.url), "utf8");
  const initial = createCameraLockState();
  const locked = lockCamera(initial, "encounter");
  assert.equal(isCameraLocked(initial), false);
  assert.equal(isCameraLocked(locked), true);
  assert.deepEqual(unlockCamera(locked, "encounter"), initial);
  assert.equal(unlockCamera(locked, "encounter").reason, null);
  assert.match(source, /CameraLockReason/);
  assert.doesNotMatch(source, /from ["']phaser["']/);
});

test("MainScene owns encounter camera lock lifecycle without enemy internals", async () => {
  const source = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.match(source, /lockCamera\(this\.cameraLockState, "encounter"\)/);
  assert.match(source, /unlockCamera\(this\.cameraLockState, "encounter"\)/);
  assert.match(source, /if \(isCameraLocked\(this\.cameraLockState\)\) return/);
});

test("Encounter flow tracks spawn count, all-clear, duplicate removal, and reset", async () => {
  const source = await readFile(new URL("../app/game/stage/EncounterFlow.ts", import.meta.url), "utf8");
  const ready = createEncounterFlow();
  const active = beginEncounter(ready, 3);
  const afterFirst = recordEnemyRemoved(active, 1);
  const afterDuplicate = recordEnemyRemoved(afterFirst, 1);
  const cleared = recordEnemyRemoved(recordEnemyRemoved(afterDuplicate, 2), 3);
  assert.equal(ready.status, "ready");
  assert.equal(afterFirst.status, "active");
  assert.deepEqual(afterDuplicate.removedEnemyIds, [1]);
  assert.equal(isEncounterCleared(cleared), true);
  assert.deepEqual(createEncounterFlow(), { status: "ready", spawnedCount: 0, removedEnemyIds: [] });
  assert.match(source, /spawnedCount/);
  assert.match(source, /removedEnemyIds/);
});

test("EnemyManager owns spawn and all-clear contract while MainScene owns presentation", async () => {
  const [manager, scene] = await Promise.all([
    readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8"),
  ]);
  assert.match(manager, /beginEncounter\(this\.encounterFlow, spawns\.length\)/);
  assert.match(manager, /recordEnemyRemoved\(this\.encounterFlow, enemy\.id\)/);
  assert.match(manager, /isEncounterCleared\(this\.encounterFlow\)/);
  assert.match(scene, /onAllDefeated: \(\) => this\.showAllEnemiesDefeated\(\)/);
});

test("Stage exit is locked until all-clear and resets deterministically", async () => {
  const source = await readFile(new URL("../app/game/stage/StageExit.ts", import.meta.url), "utf8");
  const exits = [{ id: "room-exit", bounds: { x: 0, y: 0, width: 10, height: 10 }, targetStageId: null }];
  const locked = createStageExitState(exits);
  assert.equal(canRequestStageExit(locked), false);
  assert.deepEqual(requestStageExit(locked), locked);
  const available = makeExitAvailable(locked, exits, "room-exit");
  assert.equal(canRequestStageExit(available), true);
  assert.deepEqual(requestStageExit(available), { status: "requested", exitId: "room-exit" });
  assert.deepEqual(resetStageExit(), { status: "locked", exitId: null });
  assert.match(source, /requested/);
});

test("MainScene only makes the configured exit available after all-clear", async () => {
  const [scene, stage] = await Promise.all([
    readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/stage/StageConfig.ts", import.meta.url), "utf8"),
  ]);
  assert.match(stage, /id: "room-exit"/);
  assert.match(scene, /makeExitAvailable\(this\.stageExitState, BAMBOO_COMBAT_ROOM\.exits, "room-exit"\)/);
  assert.match(scene, /private restartStage\(\)/);
  assert.match(scene, /this\.restartStage\(\)/);
});

test("Single-room traversal acceptance composes spawn, clear, camera, exit, and reset", () => {
  const exits = [{ id: "room-exit", bounds: { x: 1140, y: 390, width: 70, height: 245 }, targetStageId: null }];
  let encounter = beginEncounter(createEncounterFlow(), 3);
  let camera = lockCamera(createCameraLockState(), "encounter");
  let exit = createStageExitState(exits);

  encounter = recordEnemyRemoved(encounter, 1);
  assert.equal(isEncounterCleared(encounter), false);
  encounter = recordEnemyRemoved(encounter, 2);
  assert.equal(isEncounterCleared(encounter), false);
  encounter = recordEnemyRemoved(encounter, 3);
  assert.equal(isEncounterCleared(encounter), true);

  camera = unlockCamera(camera, "encounter");
  exit = makeExitAvailable(exit, exits, "room-exit");
  assert.equal(isCameraLocked(camera), false);
  assert.equal(canRequestStageExit(exit), true);
  assert.deepEqual(requestStageExit(exit), { status: "requested", exitId: "room-exit" });

  assert.deepEqual(createEncounterFlow(), { status: "ready", spawnedCount: 0, removedEnemyIds: [] });
  assert.deepEqual(createCameraLockState(), { reason: null });
  assert.deepEqual(resetStageExit(), { status: "locked", exitId: null });
});

test("Soldier EnemyConfig validates stable tuning and preserves current values", async () => {
  const source = await readFile(new URL("../app/game/enemy/EnemyConfig.ts", import.meta.url), "utf8");
  assert.equal(SOLDIER_ENEMY_CONFIG.id, "soldier");
  assert.equal(SOLDIER_ENEMY_CONFIG.assetKey, "enemy-soldier");
  assert.equal(SOLDIER_ENEMY_CONFIG.maxHp, 3);
  assert.equal(SOLDIER_ENEMY_CONFIG.movement.walkSpeed, 70);
  assert.equal(SOLDIER_ENEMY_CONFIG.movement.detectionDistance, 500);
  assert.deepEqual(SOLDIER_ENEMY_CONFIG.combat, { attackXRange: 110, attackYRange: 45, minSpacing: 72 });
  assert.deepEqual(SOLDIER_ENEMY_CONFIG.timing, {
    hurtMs: 300, directorDelayMin: 400, directorDelayMax: 800, recoveryMin: 800, recoveryMax: 1200,
  });
  assert.equal(validateEnemyConfig(SOLDIER_ENEMY_CONFIG), SOLDIER_ENEMY_CONFIG);
  assert.throws(() => validateEnemyConfig({ ...SOLDIER_ENEMY_CONFIG, maxHp: 0 }), /Invalid enemy config/);
  assert.doesNotMatch(source, /from ["']phaser["']/);
  assert.equal(MAULER_ENEMY_CONFIG.id, "mauler");
  assert.equal(MAULER_ENEMY_CONFIG.assetKey, "enemy-mauler");
  assert.ok(MAULER_ENEMY_CONFIG.combat.attackXRange > SOLDIER_ENEMY_CONFIG.combat.attackXRange);
  assert.ok(MAULER_ENEMY_CONFIG.timing.recoveryMin > SOLDIER_ENEMY_CONFIG.timing.recoveryMin);
});

test("EnemyManager consumes the soldier config instead of owning tuning literals", async () => {
  const source = await readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8");
  assert.match(source, /config\.maxHp/);
  assert.match(source, /enemy\.config\.movement\.walkSpeed/);
  assert.match(source, /enemy\.config\.combat\.attackXRange/);
  assert.match(source, /enemy\.config\.timing\.recoveryMin/);
  assert.doesNotMatch(source, /const WALK_SPEED = 70/);
});

test("Mixed encounter composition assigns three archetypes with one attack director", async () => {
  const [stage, manager, scene] = await Promise.all([
    readFile(new URL("../app/game/stage/StageConfig.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8"),
  ]);
  assert.deepEqual(BAMBOO_COMBAT_ROOM.spawnPoints.map(point => point.enemyType), ["soldier", "mauler", "duelist"]);
  assert.match(manager, /ENEMY_CONFIGS\[spawn\.enemyType \?\? "soldier"\]/);
  assert.match(manager, /if \(this\.currentAttacker \|\| this\.clock\.now\(\) < this\.directorReadyAt\) return/);
  assert.match(manager, /Math\.max\(enemy\.config\.combat\.minSpacing, other\.config\.combat\.minSpacing\)/);
  assert.match(scene, /for \(const config of \[SOLDIER_ENEMY_CONFIG, MAULER_ENEMY_CONFIG, DUELIST_ENEMY_CONFIG\]\)/);
  assert.match(stage, /enemyType: "mauler"/);
  assert.match(stage, /enemyType: "duelist"/);
});

test("Mauler asset routes and atlas metadata are present", async () => {
  const [manifest, atlas, metadata] = await Promise.all([
    readFile(new URL("../app/game/assets/AssetManifest.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/art/enemy/mauler.atlas.json", import.meta.url), "utf8"),
    readFile(new URL("../public/art/enemy/mauler-debug.png", import.meta.url)),
  ]);
  assert.match(manifest, /enemy-mauler/);
  const parsed = JSON.parse(atlas);
  assert.deepEqual(Object.keys(parsed.frames), [
    "idle-0", "idle-1", "walk-0", "walk-1", "walk-2", "walk-3",
    "attack-0", "attack-1", "attack-2", "hurt-0", "hurt-1", "dead-0", "dead-1", "dead-2", "dead-3",
  ]);
  assert.equal(parsed.frames["attack-1"].frame.w, 313);
  assert.ok(metadata.length > 1000);
});

test("Duelist config and asset routes define a third distinct melee archetype", async () => {
  const [manifest, atlas] = await Promise.all([
    readFile(new URL("../app/game/assets/AssetManifest.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/art/enemy/duelist.atlas.json", import.meta.url), "utf8"),
  ]);
  assert.equal(DUELIST_ENEMY_CONFIG.id, "duelist");
  assert.equal(DUELIST_ENEMY_CONFIG.assetKey, "enemy-duelist");
  assert.ok(DUELIST_ENEMY_CONFIG.movement.walkSpeed > SOLDIER_ENEMY_CONFIG.movement.walkSpeed);
  assert.ok(DUELIST_ENEMY_CONFIG.timing.recoveryMin < MAULER_ENEMY_CONFIG.timing.recoveryMin);
  assert.match(manifest, /enemy-duelist/);
  assert.equal(Object.keys(JSON.parse(atlas).frames).length, 15);
});
