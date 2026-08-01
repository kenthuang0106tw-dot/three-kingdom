import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { GUANYU_PLAYER_DEFINITION } from "../app/game/player/GuanYuAnimationMetadata.ts";
import { attackDurationMs, PlayerAttackController } from "../app/game/player/PlayerAttackController.ts";

test("Guan Yu definition freezes the accepted presentation and gameplay contract", () => {
  const definition = GUANYU_PLAYER_DEFINITION;

  assert.equal(Object.isFrozen(definition), true);
  assert.deepEqual({
    id: definition.id,
    textureKey: definition.textureKey,
    presentation: definition.presentation,
    atlas: definition.atlas,
    body: definition.body,
    movement: definition.movement,
    lifecycle: definition.lifecycle,
    attackHitbox: definition.attackHitbox,
  }, {
    id: "guanyu",
    textureKey: "guanyu-v2",
    presentation: {
      idleFrame: "idle-0",
      displayScale: 0.64,
      originX: 0.5,
      originY: 420 / 448,
      shadowOffsetY: 4,
      shadowAlpha: 0.54,
    },
    atlas: {
      cellWidth: 640,
      cellHeight: 448,
      columns: 8,
      feetX: 320,
      feetY: 420,
    },
    body: { width: 86, height: 54 },
    movement: { speed: 235 },
    lifecycle: { maxHp: 10, hurtDurationMs: 300 },
    attackHitbox: { width: 142, height: 86, offsetX: 104, offsetY: -48 },
  });

  assert.deepEqual(definition.animations, {
    idle: {
      key: "guanyu-idle",
      frames: ["idle-0", "idle-1", "idle-2", "idle-3", "idle-4", "idle-5"],
      frameRate: 4,
      repeat: -1,
    },
    walk: {
      key: "guanyu-walk",
      frames: ["walk-0", "walk-1", "walk-2", "walk-3", "walk-4", "walk-5", "walk-6", "walk-7"],
      frameRate: 8,
      repeat: -1,
    },
    hurt: {
      key: "guanyu-hurt",
      frames: ["hurt-0", "hurt-1", "hurt-2", "hurt-3"],
      frameRate: 8,
      repeat: 0,
      durationMs: 300,
    },
    dead: {
      key: "guanyu-dead",
      frames: ["dead-0", "dead-1", "dead-2", "dead-3", "dead-4", "dead-5"],
      frameRate: 8,
      repeat: 0,
    },
  });
});

test("Guan Yu attack definition preserves frame order, timing, impact, and phases", () => {
  const attacks = GUANYU_PLAYER_DEFINITION.attacks;
  assert.deepEqual(Object.values(attacks).map(attack => ({
    step: attack.step,
    animationKey: attack.animationKey,
    frames: attack.frames,
    frameRate: attack.frameRate,
    extraFrameDurationsMs: attack.extraFrameDurationsMs,
    startupFrames: attack.startupFrames,
    activeFrames: attack.activeFrames,
    recoveryFrames: attack.recoveryFrames,
    impact: attack.impact,
    durationMs: attackDurationMs(attack),
  })), [
    {
      step: 1,
      animationKey: "guanyu-attack1",
      frames: ["attack1-0", "attack1-1", "attack1-2", "attack1-3", "attack1-4"],
      frameRate: 16,
      extraFrameDurationsMs: [0, 0, 0, 0, 62.5],
      startupFrames: [1, 2],
      activeFrames: [3, 4],
      recoveryFrames: [5],
      impact: { damage: 1, knockbackDistance: 26, hitStopMs: (1000 / 60) * 4 },
      durationMs: 375,
    },
    {
      step: 2,
      animationKey: "guanyu-attack2",
      frames: ["attack2-0", "attack2-1", "attack2-2", "attack2-3", "attack2-4", "attack2-5"],
      frameRate: 16,
      extraFrameDurationsMs: [0, 0, 0, 0, 0, 0],
      startupFrames: [1, 2],
      activeFrames: [3, 4],
      recoveryFrames: [5, 6],
      impact: { damage: 1, knockbackDistance: 26, hitStopMs: (1000 / 60) * 4 },
      durationMs: 375,
    },
    {
      step: 3,
      animationKey: "guanyu-attack3",
      frames: [
        "attack3-0", "attack3-1", "attack3-2", "attack3-3",
        "attack3-4", "attack3-5", "attack3-6", "attack3-7",
      ],
      frameRate: 24,
      extraFrameDurationsMs: [0, 0, 0, 0, 0, 0, 0, (1000 / 24) + 275],
      startupFrames: [1, 2, 3],
      activeFrames: [4, 5, 6],
      recoveryFrames: [7, 8],
      impact: { damage: 2, knockbackDistance: 60, hitStopMs: (1000 / 60) * 6 },
      durationMs: 650,
    },
  ]);
});

test("Player composition consumes one selected definition without changing actor or controller ownership", async () => {
  const [scene, actor, controller] = await Promise.all([
    readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/player/PlayerActor.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/player/PlayerAttackController.ts", import.meta.url), "utf8"),
  ]);

  assert.match(scene, /private playerDefinition: PlayerDefinition = GUANYU_PLAYER_DEFINITION/);
  assert.match(scene, /new PlayerActor\(this, START_X, START_FOOT_Y, this\.playerDefinition\)/);
  assert.match(scene, /new PlayerAttackController\(this\.playerDefinition\.attacks\)/);
  assert.match(actor, /private readonly definition: PlayerDefinition/);
  assert.match(controller, /private readonly attacks: Readonly<Record<AttackStep, PlayerAttackMetadata>>/);
  assert.doesNotMatch(`${actor}\n${controller}`, /zhangfei|zhang-fei|ZhangFei/i);
  assert.match(scene, /if \(isPlayerId\(prototypePlayer\)\) this\.configurePlayer\(prototypePlayer\)/);
  assert.match(scene, /getPlayerDefinition\(id\)/);

  const attackController = new PlayerAttackController(GUANYU_PLAYER_DEFINITION.attacks);
  assert.equal(attackController.begin(2), GUANYU_PLAYER_DEFINITION.attacks[2]);
  assert.equal(attackController.isActiveFrame("guanyu-attack2", 3), true);
  assert.equal(attackController.isActiveFrame("guanyu-attack2", 1), false);
  attackController.finish();
  assert.equal(attackController.activeAttack, undefined);
});
