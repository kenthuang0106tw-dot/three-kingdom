import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { CROSSBOW_ENEMY_CONFIG } from "../app/game/enemy/EnemyConfig.ts";
import { CROSSBOW_ATTACK_SLOT_RANGE, CROSSBOW_HIT_Y_TOLERANCE, CROSSBOW_TIMING, isCrossbowReadyToFire, isCrossbowTracking, isTargetOnCrossbowLine, nextAimLineY } from "../app/game/enemy/CrossbowLine.ts";

test("Crossbow timing tracks before Lock and preserves the locked shot line", () => {
  assert.equal(CROSSBOW_TIMING.aimMs, 900);
  assert.equal(CROSSBOW_TIMING.trackingMs, 550);
  assert.equal(CROSSBOW_TIMING.lockedMs, 350);
  assert.equal(CROSSBOW_TIMING.reloadMs, 3000);
  assert.equal(CROSSBOW_ATTACK_SLOT_RANGE, 640);
  assert.equal(CROSSBOW_HIT_Y_TOLERANCE, 6);
  assert.equal(isCrossbowTracking(549), true);
  assert.equal(isCrossbowTracking(550), false);
  assert.equal(nextAimLineY(560, 640, 100), 568);
  assert.equal(nextAimLineY(568, 640, 550), 568);
  assert.equal(isCrossbowReadyToFire(899), false);
  assert.equal(isCrossbowReadyToFire(900), true);
  assert.equal(isTargetOnCrossbowLine(560, 566), true);
  assert.equal(isTargetOnCrossbowLine(560, 567), false);
});

test("Crossbow is an explicit development-only Soldier-art config", () => {
  assert.equal(CROSSBOW_ENEMY_CONFIG.id, "crossbow");
  assert.equal(CROSSBOW_ENEMY_CONFIG.assetKey, "enemy-soldier");
  assert.equal(CROSSBOW_ENEMY_CONFIG.maxHp, 12);
});

test("Crossbow owns one Attack Slot, locks before fire, then reloads", async () => {
  const source = await readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8");
  assert.match(source, /if \(enemy\.hasAttackSlot\) \{\s*this\.setFacing\(enemy, this\.playerBodyZone\.x >= enemy\.bodyZone\.x \? 1 : -1\);\s*this\.setState\(enemy, "aim"\)/);
  assert.match(source, /if \(isCrossbowTracking\(elapsed\)\) enemy\.aimLineY = nextAimLineY/);
  assert.match(source, /if \(elapsed >= CROSSBOW_TIMING\.trackingMs\) this\.setState\(enemy, "locked"\)/);
  assert.match(source, /enemy\.lockedLineY = enemy\.aimLineY/);
  assert.match(source, /new CrossbowProjectile\(this\.scene, enemy\.id, enemy\.bodyZone\.x \+ enemy\.facing \* 42, enemy\.lockedLineY, enemy\.facing\)/);
  assert.match(source, /this\.releaseAttackSlot\(enemy\);\s*this\.setState\(enemy, "reload"\)/);
  assert.match(source, /CROSSBOW_TIMING\.reloadMs/);
  assert.match(source, /enemy\.isCrossbow \? CROSSBOW_ATTACK_SLOT_RANGE : 220/);
});

test("Crossbow projectile applies to exactly one first overlap and cleans up", async () => {
  const source = await readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8");
  const projectile = await readFile(new URL("../app/game/enemy/CrossbowProjectile.ts", import.meta.url), "utf8");
  assert.match(source, /sort\(\(a, b\) => a\.distance - b\.distance\)/);
  assert.match(source, /isTargetOnCrossbowLine\(projectile\.y, candidate\.zone\.y\)/);
  assert.match(projectile, /this\.body\.setVelocityY\(0\)/);
  assert.match(projectile, /this\.zone\.y = this\.y/);
  assert.match(source, /if \(hit\.target === "player"\) this\.callbacks\.onPlayerHit\(shooter\);/);
  assert.match(source, /else this\.callbacks\.onEnemyHitByProjectile\(hit\.target, shooter\);/);
  assert.match(source, /this\.destroyProjectile\(shooter\);/);
  assert.match(source, /enemy\.aimLine\?\.clear\(\);\s*this\.destroyProjectile\(enemy\);/);
});

test("Crossbow test entrances stay out of the formal Stage", async () => {
  const source = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.match(source, /query\.get\("crossbowTest"\)/);
  assert.match(source, /spawnCrossbowPrototype\(mode: "A" \| "B"\)/);
  assert.match(source, /enemyType: "crossbow" as const/);
  assert.match(source, /!this\.shieldGuardTestMode && !this\.crossbowTestMode/);
});
