import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { GUANYU_PLAYER_DEFINITION } from "../app/game/player/GuanYuAnimationMetadata.ts";
import { attackDurationMs } from "../app/game/player/PlayerAttackController.ts";
import { ZHANGFEI_PLAYER_DEFINITION } from "../app/game/player/ZhangFeiAnimationMetadata.ts";

const phaseDuration = (attack, frames) => frames.reduce(
  (total, frameIndex) => total + (1000 / attack.frameRate) + attack.extraFrameDurationsMs[frameIndex - 1],
  0,
);

test("Zhang Fei prototype uses the accepted heavy serpent-spear contract", () => {
  assert.equal(ZHANGFEI_PLAYER_DEFINITION.id, "zhangfei");
  assert.deepEqual(ZHANGFEI_PLAYER_DEFINITION.movement, { speed: 200 });
  assert.deepEqual(ZHANGFEI_PLAYER_DEFINITION.body, { width: 96, height: 58 });
  assert.deepEqual(ZHANGFEI_PLAYER_DEFINITION.lifecycle, { maxHp: 10, hurtDurationMs: 300 });
  assert.deepEqual(
    ZHANGFEI_PLAYER_DEFINITION.attackHitbox,
    { width: 176, height: 88, offsetX: 132, offsetY: -48 },
  );
  const expected = [
    { duration: 450, startup: 150, active: 100, recovery: 200, impact: { damage: 1, knockbackDistance: 34, hitStopMs: (1000 / 60) * 5 } },
    { duration: 525, startup: 175, active: 125, recovery: 225, impact: { damage: 1, knockbackDistance: 42, hitStopMs: (1000 / 60) * 5 } },
    { duration: 800, startup: 225, active: 150, recovery: 425, impact: { damage: 3, knockbackDistance: 88, hitStopMs: (1000 / 60) * 8 } },
  ];
  Object.values(ZHANGFEI_PLAYER_DEFINITION.attacks).forEach((attack, index) => {
    assert.ok(Math.abs(attackDurationMs(attack) - expected[index].duration) < 0.001);
    assert.ok(Math.abs(phaseDuration(attack, attack.startupFrames) - expected[index].startup) < 0.001);
    assert.ok(Math.abs(phaseDuration(attack, attack.activeFrames) - expected[index].active) < 0.001);
    assert.ok(Math.abs(phaseDuration(attack, attack.recoveryFrames) - expected[index].recovery) < 0.001);
    assert.deepEqual(attack.impact, expected[index].impact);
  });
});

test("Zhang Fei maps all 47 approved poses without duplicate animation frames", () => {
  const definition = ZHANGFEI_PLAYER_DEFINITION;
  const frames = [
    ...definition.animations.idle.frames,
    ...definition.animations.walk.frames,
    ...definition.attacks[1].frames,
    ...definition.attacks[2].frames,
    ...definition.attacks[3].frames,
    ...definition.animations.hurt.frames,
    ...definition.animations.dead.frames,
  ];
  assert.equal(frames.length, 47);
  assert.equal(new Set(frames).size, 47);
  assert.deepEqual(
    Object.values(definition.attacks).map(attack => attack.activeFrames),
    [[3, 4], [4, 5], [5, 6, 7]],
  );
});

test("Guan Yu remains the exact frozen control definition", () => {
  assert.equal(GUANYU_PLAYER_DEFINITION.movement.speed, 235);
  assert.deepEqual(GUANYU_PLAYER_DEFINITION.body, { width: 86, height: 54 });
  assert.deepEqual(GUANYU_PLAYER_DEFINITION.attackHitbox, { width: 142, height: 86, offsetX: 104, offsetY: -48 });
  assert.deepEqual(Object.values(GUANYU_PLAYER_DEFINITION.attacks).map(attack => attackDurationMs(attack)), [375, 375, 650]);
  assert.deepEqual(Object.values(GUANYU_PLAYER_DEFINITION.attacks).map(attack => attack.impact.damage), [1, 1, 2]);
});

test("comparison entrance is development-only and leaves formal Title selection unchanged", async () => {
  const source = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.match(source, /process\.env\.NODE_ENV !== "production"/);
  assert.match(source, /query\.get\("playerPrototype"\) === "zhangfei"/);
  assert.match(source, /prototypeScenario === "entry" \|\| prototypeScenario === "ambush" \|\| prototypeScenario === "boss"/);
  assert.match(source, /if \(this\.playerPrototypeMode\) this\.startGame\("smoke"\)/);
  assert.doesNotMatch(source, /ZHANG FEI.*PRESS ANY KEY|SELECT ZHANG FEI/i);
});
