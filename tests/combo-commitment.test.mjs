import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolveAttack } from "../app/game/combat/CombatResolver.ts";
import { attackDurationMs, PLAYER_ATTACKS } from "../app/game/player/PlayerAttackController.ts";

const baselineImpact = { damage: 1, knockbackDistance: 26, hitStopMs: (1000 / 60) * 4 };

test("Attack 1 and 2 retain the baseline timing and impact", () => {
  assert.deepEqual(PLAYER_ATTACKS[1].impact, baselineImpact);
  assert.deepEqual(PLAYER_ATTACKS[2].impact, baselineImpact);
  assert.equal(attackDurationMs(PLAYER_ATTACKS[1]), 375);
  assert.equal(attackDurationMs(PLAYER_ATTACKS[2]), 375);
});

test("Attack 3 has a committed recovery and independent impact", () => {
  const attack = PLAYER_ATTACKS[3];
  const frameMs = 1000 / attack.frameRate;
  const recoveryMs = attack.recoveryFrames.reduce(
    (total, index) => total + frameMs + attack.extraFrameDurationsMs[index - 1],
    0,
  );

  assert.deepEqual(attack.impact, {
    damage: 2,
    knockbackDistance: 60,
    hitStopMs: (1000 / 60) * 6,
  });
  assert.equal(attackDurationMs(attack), 500);
  assert.equal(recoveryMs, 250);
});

test("Combo commitment keeps the existing hit-confirm, one-step, hit-once, and reset contracts", async () => {
  const scene = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.match(scene, /if \(this\.comboStep < 3 && this\.comboWindowOpen && this\.currentInput\.attackPressed\)/);
  assert.match(scene, /if \(this\.comboStep < 3 && this\.hitConfirmed && this\.comboBuffered\) this\.startAttack\(this\.comboStep \+ 1\)/);
  assert.match(scene, /this\.resetComboState\(\);/);
  assert.match(scene, /this\.playerHitTargetIds = new Set\(\);/);

  const first = resolveAttack({
    attackId: 3,
    damage: PLAYER_ATTACKS[3].impact.damage,
    targets: [{ id: 7, hp: 3, active: true }],
    hitTargetIds: new Set(),
  });
  const repeated = resolveAttack({
    attackId: 3,
    damage: PLAYER_ATTACKS[3].impact.damage,
    targets: [{ id: 7, hp: 1, active: true }],
    hitTargetIds: first.hitTargetIds,
  });
  assert.deepEqual(first.hits, [{ targetId: 7, damage: 2, remainingHp: 1 }]);
  assert.deepEqual(repeated.hits, []);
});
