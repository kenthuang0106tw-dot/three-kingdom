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

test("EnemyManager snapshots the player Y when attack startup begins", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8");
  assert.match(source, /createAttackCommitment\(enemy\.facing, this\.playerBodyZone\.y\)/);
});

test("Mauler has readable startup and recovery without changing damage or HP", () => {
  assert.equal(MAULER_ENEMY_CONFIG.animationRates.attack, 5);
  assert.equal(MAULER_ENEMY_CONFIG.attackActiveFrame, 2);
  assert.equal(MAULER_ENEMY_CONFIG.maxHp, 5);
});
