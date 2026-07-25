import assert from "node:assert/strict";
import test from "node:test";
import { createAttackCommitment, isWithinAttackLine } from "../app/game/enemy/AttackCommitment.ts";
import { MAULER_ENEMY_CONFIG } from "../app/game/enemy/EnemyConfig.ts";

test("Mauler attack commitment locks the startup facing and Y attack line", () => {
  const commitment = createAttackCommitment(-1, 560);
  assert.deepEqual(commitment, { facing: -1, lineY: 560 });
  assert.equal(isWithinAttackLine(commitment, 607, MAULER_ENEMY_CONFIG.combat.attackYRange), true);
  assert.equal(isWithinAttackLine(commitment, 609, MAULER_ENEMY_CONFIG.combat.attackYRange), false);
});

test("Mauler has readable startup and recovery without changing damage or HP", () => {
  assert.equal(MAULER_ENEMY_CONFIG.animationRates.attack, 5);
  assert.equal(MAULER_ENEMY_CONFIG.attackActiveFrame, 2);
  assert.equal(MAULER_ENEMY_CONFIG.maxHp, 5);
});
