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
import { StageCompletionGate } from "../app/game/events/StageCompletion.ts";
import { SeededRandom, TestClock } from "../app/game/time/GameplayTime.ts";
import { createAssetFailureReporter, RUNTIME_ASSET_MANIFEST } from "../app/game/assets/AssetManifest.ts";
import { PlayerStateMachine } from "../app/game/player/PlayerStateMachine.ts";
import { PlayerLifecycle } from "../app/game/player/PlayerLifecycle.ts";
import { resolveAttack } from "../app/game/combat/CombatResolver.ts";
import { BAMBOO_BOSS_ARENA, BAMBOO_COMBAT_ROOM, clampStagePoint, clampStageX, clampStageY, isStagePointWithin, validateStageConfig } from "../app/game/stage/StageConfig.ts";
import { calculateCameraScroll } from "../app/game/camera/CameraFollow.ts";
import { createCameraLockState, hasCameraLock, isCameraLocked, lockCamera, unlockCamera } from "../app/game/camera/CameraLock.ts";
import { beginEncounter, createEncounterFlow, isEncounterCleared, recordEnemyRemoved } from "../app/game/stage/EncounterFlow.ts";
import { canRequestStageExit, createStageExitState, makeExitAvailable, requestStageExit, resetStageExit } from "../app/game/stage/StageExit.ts";
import { DUELIST_ENEMY_CONFIG, MAULER_ENEMY_CONFIG, SOLDIER_ENEMY_CONFIG, enemySpriteShouldFlip, validateEnemyConfig } from "../app/game/enemy/EnemyConfig.ts";
import { BossLifecycle } from "../app/game/boss/BossLifecycle.ts";
import { BOSS_ATTACKS } from "../app/game/boss/BossAttackMetadata.ts";
import { BossDecisionPolicy } from "../app/game/boss/BossDecisionPolicy.ts";
import { selectFairAttackCandidate } from "../app/game/enemy/AttackSlotPolicy.ts";
import { GameFlowStateMachine } from "../app/game/flow/GameFlowStateMachine.ts";
import { TitleStartController } from "../app/game/flow/TitleStartController.ts";

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
    "forest", "guanyu-idle", "guanyu-walk", "guanyu-attack", "enemy-soldier", "enemy-mauler", "enemy-duelist", "boss-warlord-attacks", "boss-warlord-lifecycle",
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

test("Game flow state machine enforces modes, terminal states, and new-run reset", () => {
  const flow = new GameFlowStateMachine();
  assert.equal(flow.state, "title");
  assert.deepEqual(flow.transition("playing"), { previous: "title", next: "playing" });
  assert.deepEqual(flow.transition("paused"), { previous: "playing", next: "paused" });
  assert.deepEqual(flow.transition("playing"), { previous: "paused", next: "playing" });
  assert.deepEqual(flow.transition("failed"), { previous: "playing", next: "failed" });
  assert.throws(() => flow.transition("title"), /Invalid game-flow transition: failed -> title/);

  flow.resetForNewRun();
  assert.equal(flow.state, "title");
  assert.deepEqual(flow.transition("playing"), { previous: "title", next: "playing" });
  assert.deepEqual(flow.transition("cleared"), { previous: "playing", next: "cleared" });
  assert.throws(() => flow.transition("playing"), /Invalid game-flow transition: cleared -> playing/);
  assert.equal(flow.transition("cleared"), undefined);

  flow.resetForNewRun();
  assert.deepEqual(flow.transition("playing"), { previous: "title", next: "playing" });
  assert.deepEqual(flow.transition("paused"), { previous: "playing", next: "paused" });
  assert.deepEqual(flow.transition("failed"), { previous: "paused", next: "failed" });
});

test("Title start accepts keyboard or pointer once and re-arms only after reset", () => {
  const flow = new GameFlowStateMachine();
  const start = new TitleStartController(flow);

  assert.equal(start.requestStart(), true);
  assert.equal(flow.state, "playing");
  assert.equal(start.requestStart(), false);

  flow.resetForNewRun();
  assert.equal(start.requestStart(), true);
  assert.equal(flow.state, "playing");
  assert.equal(start.requestStart(), false);
});

test("MainScene owns one Phaser Title overlay without React or Scene restart", async () => {
  const [scene, reactHost] = await Promise.all([
    readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/PhaserGame.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(scene, /new GameFlowStateMachine\(\)/);
  assert.match(scene, /new TitleStartController\(this\.gameFlow\)/);
  assert.match(scene, /keyboard\.once\("keydown", this\.handleTitleKeyboardStart, this\)/);
  assert.match(scene, /once\("pointerdown", this\.handleTitlePointerStart, this\)/);
  assert.match(scene, /if \(this\.gameFlow\.state === "title"\) return/);
  assert.match(scene, /this\.inputController\.readSnapshot\(\)/);
  assert.doesNotMatch(reactHost, /GameFlowStateMachine|TitleStartController|useState/);
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

test("Stage completion publishes once after explicit completion and re-arms on reset", () => {
  const gate = new StageCompletionGate();
  const hub = new GameplayEventHub();
  const events = [];
  hub.subscribe(event => events.push(event));

  assert.equal(events.length, 0);
  const first = gate.complete("bamboo-combat-room", 120);
  assert.notEqual(first, null);
  hub.publish(first);
  assert.equal(gate.complete("bamboo-combat-room", 121), null);
  assert.deepEqual(events, [{ type: "stage-completed", stageId: "bamboo-combat-room", at: 120 }]);
  assert.equal(Object.isFrozen(events[0]), true);

  gate.reset();
  const second = gate.complete("bamboo-combat-room", 240);
  assert.notEqual(second, null);
  hub.publish(second);
  assert.equal(events.length, 2);
  assert.equal(events[1].at, 240);
});

test("MainScene publishes stage completion only for defeated Boss cleanup", async () => {
  const [scene, actor, completion] = await Promise.all([
    readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/boss/BossActor.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/events/StageCompletion.ts", import.meta.url), "utf8"),
  ]);
  assert.match(scene, /this\.stageCompletion\.reset\(\)/);
  assert.match(scene, /this\.releaseBossArena\(development\);\s+if \(reason === "defeated"\) this\.publishStageComplete\(development\)/);
  assert.match(completion, /type: "stage-completed"/);
  assert.match(scene, /dataset\.stageCompleteCount/);
  assert.match(scene, /dataset\.stageCompleteAfterArenaRelease/);
  assert.match(actor, /onCleaned\?: \(reason: BossCleanupReason\) => void/);
  assert.match(actor, /const reason: BossCleanupReason = this\.state === "dead" \? "defeated" : "destroyed"/);
});

test("M5 full-stage acceptance preserves ordering, exactly-once completion, and restart ownership", () => {
  const hub = new GameplayEventHub();
  const completion = new StageCompletionGate();
  const published = [];
  hub.subscribe(event => published.push(event));

  let encounter = beginEncounter(createEncounterFlow(), BAMBOO_COMBAT_ROOM.spawnPoints.length);
  let camera = lockCamera(lockCamera(createCameraLockState(), "encounter"), "boss");
  const boss = new BossLifecycle(8);
  boss.activate();

  for (const enemyId of [1, 2, 3]) encounter = recordEnemyRemoved(encounter, enemyId);
  assert.equal(isEncounterCleared(encounter), true);
  camera = unlockCamera(camera, "encounter");
  assert.equal(hasCameraLock(camera, "boss"), true);
  assert.equal(published.length, 0);

  assert.equal(boss.applyDamage(4).phaseChanged, true);
  boss.transition("idle");
  assert.equal(boss.applyDamage(4).becameDead, true);
  assert.equal(boss.cleanup(), true);
  camera = unlockCamera(camera, "boss");
  assert.equal(isCameraLocked(camera), false);

  const event = completion.complete(BAMBOO_COMBAT_ROOM.id, 900);
  assert.notEqual(event, null);
  hub.publish(event);
  assert.equal(completion.complete(BAMBOO_COMBAT_ROOM.id, 901), null);
  assert.deepEqual(published, [{ type: "stage-completed", stageId: BAMBOO_COMBAT_ROOM.id, at: 900 }]);
  assert.equal(Object.isFrozen(published[0]), true);

  completion.reset();
  boss.reset();
  encounter = createEncounterFlow();
  camera = createCameraLockState();
  assert.equal(encounter.status, "ready");
  assert.equal(boss.state, "inactive");
  assert.equal(isCameraLocked(camera), false);
  assert.notEqual(completion.complete(BAMBOO_COMBAT_ROOM.id, 1000), null);
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
  assert.equal(BAMBOO_COMBAT_ROOM.worldBounds.width, 3840);
  assert.equal(BAMBOO_COMBAT_ROOM.worldBounds.height, 720);
  assert.deepEqual(BAMBOO_COMBAT_ROOM.walkBounds, { x: 70, y: 390, width: 3700, height: 245 });
  assert.deepEqual(BAMBOO_COMBAT_ROOM.backgroundSections.map(section => section.bounds.x), [0, 1280, 2560]);
  assert.ok(BAMBOO_COMBAT_ROOM.backgroundSections.every(section => section.bounds.width === 1280 && section.bounds.height === 720));
  assert.equal(BAMBOO_COMBAT_ROOM.spawnPoints.length, 3);
  assert.ok(BAMBOO_COMBAT_ROOM.spawnPoints.every(point => point.x > 1280));
  assert.equal(validateStageConfig(BAMBOO_COMBAT_ROOM), BAMBOO_COMBAT_ROOM);
  assert.throws(() => validateStageConfig({
    ...BAMBOO_COMBAT_ROOM,
    spawnPoints: [...BAMBOO_COMBAT_ROOM.spawnPoints, { id: "enemy-front", x: 900, y: 560 }],
  }), /Duplicate spawn point id/);
  assert.throws(() => validateStageConfig({
    ...BAMBOO_COMBAT_ROOM,
    backgroundSections: BAMBOO_COMBAT_ROOM.backgroundSections.slice(1),
  }), /Background sections must cover world bounds without gaps/);
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
  assert.deepEqual(calculateCameraScroll(BAMBOO_COMBAT_ROOM.playerSpawn, BAMBOO_COMBAT_ROOM.worldBounds, viewport), { x: 0, y: 0 });
  assert.deepEqual(calculateCameraScroll({ x: 1920, y: 560 }, BAMBOO_COMBAT_ROOM.worldBounds, viewport), { x: 1280, y: 0 });
  assert.deepEqual(calculateCameraScroll({ x: 3770, y: 560 }, BAMBOO_COMBAT_ROOM.worldBounds, viewport), { x: 2560, y: 0 });
  assert.doesNotMatch(source, /from ["']phaser["']/);
});

test("Camera lock contract preserves independent encounter and Boss ownership", async () => {
  const source = await readFile(new URL("../app/game/camera/CameraLock.ts", import.meta.url), "utf8");
  const initial = createCameraLockState();
  const encounterLocked = lockCamera(initial, "encounter");
  const bothLocked = lockCamera(encounterLocked, "boss");
  assert.equal(isCameraLocked(initial), false);
  assert.equal(isCameraLocked(bothLocked), true);
  assert.equal(hasCameraLock(bothLocked, "encounter"), true);
  assert.equal(hasCameraLock(bothLocked, "boss"), true);
  const bossOnly = unlockCamera(bothLocked, "encounter");
  assert.equal(isCameraLocked(bossOnly), true);
  assert.equal(hasCameraLock(bossOnly, "boss"), true);
  assert.deepEqual(unlockCamera(bossOnly, "boss"), initial);
  assert.match(source, /CameraLockReason/);
  assert.doesNotMatch(source, /from ["']phaser["']/);
});

test("Boss arena occupies the final viewport and releases its lock", async () => {
  const scene = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.deepEqual(BAMBOO_BOSS_ARENA.bounds, { x: 2630, y: 390, width: 1140, height: 245 });
  assert.deepEqual(BAMBOO_BOSS_ARENA.cameraScroll, { x: 2560, y: 0 });
  assert.equal(isStagePointWithin(BAMBOO_BOSS_ARENA.spawn, BAMBOO_BOSS_ARENA.bounds), true);
  assert.equal(isStagePointWithin(BAMBOO_COMBAT_ROOM.playerSpawn, BAMBOO_BOSS_ARENA.bounds), false);
  assert.deepEqual(clampStagePoint({ x: -100, y: 900 }, BAMBOO_BOSS_ARENA.bounds), { x: 2630, y: 635 });
  assert.match(scene, /lockCamera\(this\.cameraLockState, "boss"\)/);
  assert.match(scene, /unlockCamera\(this\.cameraLockState, "boss"\)/);
  assert.match(scene, /hasCameraLock\(this\.cameraLockState, "boss"\)/);
  assert.match(scene, /BAMBOO_BOSS_ARENA\.bounds/);
  assert.match(scene, /dataset\.bossArenaLocked/);
  assert.match(scene, /dataset\.bossArenaReleaseCount/);
});

test("Recovery traversal starts unlocked while preserving explicit diagnostic lock ownership", async () => {
  const source = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.match(source, /if \(this\.bossSmokeMode\) \{\s+this\.cameraLockState = lockCamera\(this\.cameraLockState, "encounter"\)/);
  assert.match(source, /unlockCamera\(this\.cameraLockState, "encounter"\)/);
  assert.match(source, /if \(!isCameraLocked\(this\.cameraLockState\)\)/);
  assert.match(source, /dataset\.cameraScrollX/);
  assert.match(source, /dataset\.playerWorldX/);
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
  assert.deepEqual(createCameraLockState(), { reasons: [] });
  assert.deepEqual(resetStageExit(), { status: "locked", exitId: null });
});

test("Soldier EnemyConfig validates stable tuning and preserves current values", async () => {
  const source = await readFile(new URL("../app/game/enemy/EnemyConfig.ts", import.meta.url), "utf8");
  assert.equal(SOLDIER_ENEMY_CONFIG.id, "soldier");
  assert.equal(SOLDIER_ENEMY_CONFIG.assetKey, "enemy-soldier");
  assert.equal(SOLDIER_ENEMY_CONFIG.maxHp, 4);
  assert.equal(SOLDIER_ENEMY_CONFIG.movement.walkSpeed, 70);
  assert.equal(SOLDIER_ENEMY_CONFIG.movement.detectionDistance, 500);
  assert.deepEqual(SOLDIER_ENEMY_CONFIG.combat, { attackXRange: 110, attackYRange: 45, minSpacing: 72 });
  assert.deepEqual(SOLDIER_ENEMY_CONFIG.timing, {
    hurtMs: 300, directorDelayMin: 500, directorDelayMax: 750, recoveryMin: 850, recoveryMax: 1100,
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

test("Mixed encounter tuning stays readable, dodgeable, and within the duration budget", async () => {
  const manager = await readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8");
  const configs = [SOLDIER_ENEMY_CONFIG, MAULER_ENEMY_CONFIG, DUELIST_ENEMY_CONFIG];
  const referenceSuccessfulHitIntervalMs = 3000;
  const estimatedDurationMs = configs.reduce((total, config) => total + config.maxHp, 0) * referenceSuccessfulHitIntervalMs;

  assert.equal(estimatedDurationMs, 36000);
  assert.ok(estimatedDurationMs >= 30000 && estimatedDurationMs <= 90000);
  assert.ok(configs.every(config => config.combat.attackYRange <= 48));
  assert.ok(configs.every(config => config.combat.minSpacing >= 68));
  assert.ok(configs.every(config => config.timing.directorDelayMin >= 400));
  assert.ok(configs.every(config => config.timing.recoveryMin >= 700));
  assert.match(manager, /if \(this\.currentAttacker \|\| this\.clock\.now\(\) < this\.directorReadyAt\) return/);
});

test("Enemy source facing, active frames, and attack-slot reachability match the visible combat", async () => {
  const manager = await readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8");
  const expectedSourceFacing = new Map([
    [SOLDIER_ENEMY_CONFIG, -1],
    [MAULER_ENEMY_CONFIG, 1],
    [DUELIST_ENEMY_CONFIG, 1],
  ]);

  for (const [config, sourceFacing] of expectedSourceFacing) {
    assert.equal(config.sourceFacing, sourceFacing);
    assert.equal(enemySpriteShouldFlip(config, sourceFacing), false);
    assert.equal(enemySpriteShouldFlip(config, sourceFacing * -1), true);
    assert.equal(config.animations.attack[config.attackActiveFrame - 1], "attack-1");
  }

  assert.throws(
    () => validateEnemyConfig({ ...SOLDIER_ENEMY_CONFIG, sourceFacing: 0 }),
    /source facing/,
  );
  assert.match(manager, /const ATTACK_APPROACH_TIMEOUT_MS = 1500/);
  assert.match(manager, /enemy\.attackApproachEndsAt = this\.clock\.now\(\) \+ ATTACK_APPROACH_TIMEOUT_MS/);
  assert.match(manager, /this\.clock\.now\(\) >= enemy\.attackApproachEndsAt[\s\S]*this\.releaseAttackSlot\(enemy\)/);
});

test("Attack-slot selection cannot starve an eligible archetype", () => {
  const candidates = [
    { id: 1, attackSlotGrantCount: 2 },
    { id: 2, attackSlotGrantCount: 0 },
    { id: 3, attackSlotGrantCount: 1 },
  ];

  assert.equal(selectFairAttackCandidate(candidates, 3)?.id, 2);
  assert.equal(selectFairAttackCandidate(candidates.map(candidate => ({ ...candidate, attackSlotGrantCount: 0 })), 1)?.id, 2);
  assert.equal(selectFairAttackCandidate([], 1), null);
});

test("Every mixed archetype shares attack-slot release, death cleanup, and survivor flow", async () => {
  const manager = await readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8");
  const spawns = BAMBOO_COMBAT_ROOM.spawnPoints;
  const permutations = [
    [0, 1, 2], [0, 2, 1], [1, 0, 2],
    [1, 2, 0], [2, 0, 1], [2, 1, 0],
  ];

  assert.deepEqual(new Set(spawns.map(spawn => spawn.enemyType)), new Set(["soldier", "mauler", "duelist"]));
  for (const order of permutations) {
    let flow = beginEncounter(createEncounterFlow(), spawns.length);
    const firstId = order[0] + 1;
    flow = recordEnemyRemoved(flow, firstId);
    assert.equal(isEncounterCleared(flow), false);
    assert.deepEqual(
      spawns.filter((_, index) => !flow.removedEnemyIds.includes(index + 1)).map(spawn => spawn.enemyType).sort(),
      order.slice(1).map(index => spawns[index].enemyType).sort(),
    );
    flow = recordEnemyRemoved(flow, order[1] + 1);
    assert.equal(isEncounterCleared(flow), false);
    flow = recordEnemyRemoved(flow, order[2] + 1);
    assert.equal(isEncounterCleared(flow), true);
  }

  const damagePath = manager.slice(manager.indexOf("  damage(enemy:"), manager.indexOf("  private setState"));
  assert.match(damagePath, /this\.releaseAttackSlot\(enemy\)/);
  assert.match(damagePath, /enemy\.hp === 0/);
  assert.doesNotMatch(damagePath, /enemy\.config\.id/);

  const removalPath = manager.slice(manager.indexOf("  private remove(enemy:"), manager.indexOf("  private cleanupEnemy"));
  assert.match(removalPath, /this\.releaseAttackSlot\(enemy\)/);
  assert.match(removalPath, /this\.cleanupEnemy\(enemy\)/);
  assert.match(removalPath, /this\.enemies\.splice\(index, 1\)/);
  assert.match(removalPath, /recordEnemyRemoved\(this\.encounterFlow, enemy\.id\)/);
  assert.doesNotMatch(removalPath, /enemy\.config\.id/);
});

test("Boss lifecycle owns deterministic state, damage, cleanup, and reset without EnemyManager", async () => {
  const [bossSource, enemyManager] = await Promise.all([
    readFile(new URL("../app/game/boss/BossLifecycle.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8"),
  ]);
  const boss = new BossLifecycle(12);

  assert.equal(boss.state, "inactive");
  assert.equal(boss.hp, 12);
  assert.throws(() => boss.transition("attack"), /Invalid Boss transition/);
  assert.deepEqual(boss.applyDamage(3), { applied: false, damage: 0, hp: 12, becameDead: false, phaseChanged: false });

  boss.activate();
  assert.equal(boss.state, "idle");
  boss.transition("attack");
  assert.deepEqual(boss.applyDamage(3), { applied: true, damage: 3, hp: 9, becameDead: false, phaseChanged: false });
  assert.equal(boss.state, "hurt");
  assert.deepEqual(boss.applyDamage(1), { applied: false, damage: 0, hp: 9, becameDead: false, phaseChanged: false });
  boss.transition("idle");
  assert.deepEqual(boss.applyDamage(20), { applied: true, damage: 20, hp: 0, becameDead: true, phaseChanged: false });
  assert.equal(boss.state, "dead");
  assert.deepEqual(boss.applyDamage(1), { applied: false, damage: 0, hp: 0, becameDead: false, phaseChanged: false });
  assert.equal(boss.cleanup(), true);
  assert.equal(boss.state, "cleaned");
  assert.equal(boss.cleanup(), false);

  boss.reset();
  assert.equal(boss.state, "inactive");
  assert.equal(boss.hp, 12);
  boss.activate();
  assert.equal(boss.state, "idle");
  assert.equal(boss.phase, 1);
  assert.throws(() => new BossLifecycle(0), /positive integer/);

  assert.doesNotMatch(bossSource, /from ["']phaser["']|Phaser\./);
  assert.doesNotMatch(enemyManager, /BossLifecycle|game\/boss|boss\//i);
});

test("Boss lifecycle changes phase once and resets phase ownership", () => {
  const boss = new BossLifecycle(8);
  boss.activate();

  assert.deepEqual(boss.applyDamage(1), {
    applied: true, damage: 1, hp: 7, becameDead: false, phaseChanged: false,
  });
  boss.transition("idle");
  assert.deepEqual(boss.applyDamage(3), {
    applied: true, damage: 3, hp: 4, becameDead: false, phaseChanged: true,
  });
  assert.equal(boss.phase, 2);
  boss.transition("idle");
  assert.deepEqual(boss.applyDamage(1), {
    applied: true, damage: 1, hp: 3, becameDead: false, phaseChanged: false,
  });
  boss.transition("idle");
  assert.equal(boss.applyDamage(3).becameDead, true);
  assert.equal(boss.cleanup(), true);
  assert.equal(boss.cleanup(), false);

  boss.reset();
  assert.equal(boss.state, "inactive");
  assert.equal(boss.hp, 8);
  assert.equal(boss.phase, 1);
});

test("Boss attack art and metadata define three real telegraphed attacks", async () => {
  const [atlasText, metadataText, manifest, sheet, debug, buildTool] = await Promise.all([
    readFile(new URL("../public/art/boss/warlord-attacks.atlas.json", import.meta.url), "utf8"),
    readFile(new URL("../public/art/boss/warlord-attacks.metadata.json", import.meta.url), "utf8"),
    readFile(new URL("../app/game/assets/AssetManifest.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/art/boss/warlord-attacks.png", import.meta.url)),
    readFile(new URL("../public/art/boss/warlord-attacks-debug.png", import.meta.url)),
    readFile(new URL("../tools/build_boss_art.py", import.meta.url), "utf8"),
  ]);
  const atlas = JSON.parse(atlasText);
  const metadata = JSON.parse(metadataText);
  const expectedFrames = BOSS_ATTACKS.flatMap(attack => attack.frames);

  assert.deepEqual(BOSS_ATTACKS.map(attack => attack.key), ["attack1", "attack2", "attack3"]);
  for (const attack of BOSS_ATTACKS) {
    assert.equal(attack.frames.length, 3);
    assert.deepEqual(attack.startupFrames, [0]);
    assert.deepEqual(attack.activeFrames, [1]);
    assert.deepEqual(attack.recoveryFrames, [2]);
    assert.deepEqual(attack.telegraphFrames, [0]);
    assert.equal(new Set(attack.frames).size, 3);
  }
  assert.deepEqual(Object.keys(atlas.frames), expectedFrames);
  assert.equal(atlas.meta.size.w, 1344);
  assert.equal(atlas.meta.size.h, 1344);
  assert.ok(Object.values(atlas.frames).every(frame => frame.frame.w === 448 && frame.frame.h === 448));
  assert.ok(Object.values(atlas.frames).every(frame => frame.pivot.x === 0.5 && frame.pivot.y === 420 / 448));
  assert.equal(metadata.frames.length, 9);
  assert.ok(metadata.frames.every(frame => frame.feetAnchor.x === 224 && frame.feetAnchor.y === 420));
  assert.ok(metadata.frames.every(frame => frame.sourceScale === metadata.sourceScale && frame.displayScale === 0.9));
  assert.deepEqual(metadata.frames.map(frame => frame.phase), ["startup", "active", "recovery", "startup", "active", "recovery", "startup", "active", "recovery"]);
  assert.equal(metadata.frames[4].sourceRect.width, 851);
  assert.match(manifest, /boss-warlord-attacks/);
  assert.match(buildTool, /ATTACKS = \[/);
  assert.ok(sheet.length > 1000);
  assert.ok(debug.length > 1000);
});

test("Boss actor owns feet-aligned hurt, phase, death, and Scene cleanup", async () => {
  const [atlasText, metadataText, actorSource, sceneSource, enemyManager] = await Promise.all([
    readFile(new URL("../public/art/boss/warlord-lifecycle.atlas.json", import.meta.url), "utf8"),
    readFile(new URL("../public/art/boss/warlord-lifecycle.metadata.json", import.meta.url), "utf8"),
    readFile(new URL("../app/game/boss/BossActor.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8"),
  ]);
  const atlas = JSON.parse(atlasText);
  const metadata = JSON.parse(metadataText);
  const frameNames = [
    "idle-0", "idle-1", "hurt-0", "hurt-1", "phase-0", "phase-1", "phase-2",
    "dead-0", "dead-1", "dead-2", "dead-3",
  ];

  assert.deepEqual(Object.keys(atlas.frames), frameNames);
  assert.deepEqual(metadata.frames.map(frame => frame.name), frameNames);
  assert.ok(metadata.frames.every(frame => frame.feetAnchor.x === 224 && frame.feetAnchor.y === 420));
  assert.ok(metadata.frames.every(frame => frame.sourceScale === metadata.sourceScale && frame.displayScale === 0.9));
  assert.match(actorSource, /new BossLifecycle\(BOSS_ACTOR_CONFIG\.maxHp\)/);
  assert.match(actorSource, /new BossDecisionPolicy\(clock, random, BOSS_ATTACKS\)/);
  assert.match(actorSource, /ANIMATION_COMPLETE, this\.handleAnimationComplete/);
  assert.match(actorSource, /\.off\(Phaser\.Animations\.Events\.ANIMATION_COMPLETE/);
  assert.match(actorSource, /deathFadeMs: 500/);
  assert.match(actorSource, /this\.body\.enable = false/);
  assert.equal((sceneSource.match(/new BossActor\(/g) ?? []).length, 1);
  assert.match(sceneSource, /this\.bossActor\.destroy\(\)/);
  assert.match(sceneSource, /dataset\.bossActorCount = "1"/);
  assert.match(sceneSource, /dataset\.bossActorCount = "0"/);
  assert.match(sceneSource, /query\.get\("bossSmoke"\)/);
  assert.match(sceneSource, /this\.time\.delayedCall\(700/);
  assert.match(sceneSource, /bossSmokeTimer\?\.remove\(false\)/);
  assert.match(sceneSource, /dataset\.bossSmokeLog/);
  assert.doesNotMatch(sceneSource, /setTimeout|setInterval/);
  assert.doesNotMatch(enemyManager, /BossActor|BossLifecycle|game\/boss|boss\//i);
});

test("Boss decision policy is deterministic and enforces attack recovery", () => {
  const firstClock = new TestClock();
  const secondClock = new TestClock();
  const first = new BossDecisionPolicy(firstClock, new SeededRandom(0x5b055), BOSS_ATTACKS);
  const second = new BossDecisionPolicy(secondClock, new SeededRandom(0x5b055), BOSS_ATTACKS);
  const firstSequence = [];
  const secondSequence = [];

  for (let index = 0; index < 8; index += 1) {
    const firstAttack = first.selectAttack("idle");
    const secondAttack = second.selectAttack("idle");
    assert.notEqual(firstAttack, null);
    assert.equal(secondAttack, firstAttack);
    firstSequence.push(firstAttack);
    secondSequence.push(secondAttack);
    assert.equal(first.selectAttack("idle"), null);
    assert.equal(first.completeAttack("idle"), false);
    assert.equal(first.completeAttack("attack"), true);
    assert.equal(second.completeAttack("attack"), true);
    assert.equal(first.selectAttack("idle"), null);
    firstClock.advance(1300);
    secondClock.advance(1300);
  }

  assert.deepEqual(firstSequence, secondSequence);
  assert.ok(firstSequence.every(key => BOSS_ATTACKS.some(attack => attack.key === key)));
});

test("Boss decision policy rejects illegal states and reset clears lockout", () => {
  const clock = new TestClock(100);
  const policy = new BossDecisionPolicy(clock, new SeededRandom(9), BOSS_ATTACKS);

  for (const state of ["inactive", "attack", "hurt", "dead", "cleaned"]) {
    assert.equal(policy.selectAttack(state), null);
  }
  assert.equal(policy.completeAttack("attack"), false);
  assert.notEqual(policy.selectAttack("idle"), null);
  assert.equal(policy.completeAttack("attack"), true);
  clock.advance(899);
  assert.equal(policy.selectAttack("idle"), null);
  policy.reset();
  assert.notEqual(policy.selectAttack("idle"), null);
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
