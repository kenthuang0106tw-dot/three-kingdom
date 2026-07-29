import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  CROSSBOW_ENEMY_CONFIG,
  CROSSBOW_EXTRA_ANIMATIONS,
  SOLDIER_ENEMY_CONFIG,
} from "../app/game/enemy/EnemyConfig.ts";
import { CROSSBOW_ATTACK_SLOT_RANGE, CROSSBOW_TIMING, isCrossbowReadyToFire, isCrossbowTracking, isTargetOnCrossbowLine, nextAimLineY } from "../app/game/enemy/CrossbowLine.ts";
import { BAMBOO_COMBAT_ROOM } from "../app/game/stage/StageConfig.ts";

test("Crossbow timing tracks before Lock and preserves the locked shot line", () => {
  assert.equal(CROSSBOW_TIMING.aimMs, 900);
  assert.equal(CROSSBOW_TIMING.trackingMs, 550);
  assert.equal(CROSSBOW_TIMING.lockedMs, 350);
  assert.equal(CROSSBOW_TIMING.reloadMs, 3000);
  assert.equal(CROSSBOW_ATTACK_SLOT_RANGE, 640);
  assert.equal(isCrossbowTracking(549), true);
  assert.equal(isCrossbowTracking(550), false);
  assert.equal(nextAimLineY(560, 640, 100), 568);
  assert.equal(nextAimLineY(568, 640, 550), 568);
  assert.equal(isCrossbowReadyToFire(899), false);
  assert.equal(isCrossbowReadyToFire(900), true);
  assert.equal(isTargetOnCrossbowLine(560, 560), true);
  assert.equal(isTargetOnCrossbowLine(560, 561), false);
});

test("Crossbow keeps TP-2 tuning with dedicated ER.6 presentation", () => {
  assert.equal(CROSSBOW_ENEMY_CONFIG.id, "crossbow");
  assert.equal(CROSSBOW_ENEMY_CONFIG.assetKey, "enemy-crossbow");
  assert.equal(CROSSBOW_ENEMY_CONFIG.maxHp, 12);
  assert.equal(CROSSBOW_ENEMY_CONFIG.movement.walkSpeed, 56);
  assert.equal(CROSSBOW_ENEMY_CONFIG.movement.detectionDistance, SOLDIER_ENEMY_CONFIG.movement.detectionDistance);
  assert.deepEqual(CROSSBOW_ENEMY_CONFIG.combat, SOLDIER_ENEMY_CONFIG.combat);
  assert.deepEqual(CROSSBOW_ENEMY_CONFIG.timing, SOLDIER_ENEMY_CONFIG.timing);
});

test("ER.6 Crossbow owns 20 genuine feet-aligned production poses", async () => {
  const [atlas, metadata, runtime, debug, onion, silhouette, identityGate] = await Promise.all([
    readFile(new URL("../public/art/enemy/crossbow.atlas.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../public/art/enemy/crossbow.metadata.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../public/art/enemy/crossbow.png", import.meta.url)),
    readFile(new URL("../public/art/enemy/crossbow-debug.png", import.meta.url)),
    readFile(new URL("../public/art/enemy/crossbow-onion.png", import.meta.url)),
    readFile(new URL("../public/art/enemy/crossbow-silhouette-25.png", import.meta.url)),
    readFile(new URL("../docs/visual-baselines/enemy-cast-v2/crossbow-er6-idle-gate.png", import.meta.url)),
  ]);
  assert.equal(runtime.readUInt32BE(16), 288 * 5);
  assert.equal(runtime.readUInt32BE(20), 288 * 4);
  assert.equal(Object.keys(atlas.frames).length, 20);
  assert.equal(metadata.frames.length, 20);
  assert.equal(new Set(metadata.frames.map(frame => frame.pixelHash)).size, 20);
  assert.deepEqual(metadata.feetAnchor, { x: 144, y: 265 });
  assert.equal(metadata.displayScale, 1.025);
  assert.equal(metadata.sourceFacing, 1);
  assert.ok(metadata.logicalIdleHeight >= 200 && metadata.logicalIdleHeight <= 220);
  assert.deepEqual(metadata.animations.aim, CROSSBOW_EXTRA_ANIMATIONS.aim);
  assert.deepEqual(metadata.animations.locked, CROSSBOW_EXTRA_ANIMATIONS.locked);
  assert.deepEqual(metadata.animations.reload, CROSSBOW_EXTRA_ANIMATIONS.reload);
  assert.ok(metadata.frames.every(frame =>
    frame.accepted &&
    frame.feetAnchor.x === 144 &&
    frame.feetAnchor.y === 265 &&
    frame.displayScale === 1.025 &&
    frame.runtimeAlphaBounds.y + frame.runtimeAlphaBounds.height === 265 &&
    frame.runtimeAlphaBounds.x >= 8 &&
    frame.runtimeAlphaBounds.x + frame.runtimeAlphaBounds.width <= 280
  ));
  assert.equal(metadata.provenance.processingTool, "tools/build_crossbow_art.py");
  assert.ok([debug, onion, silhouette, identityGate].every(file => file.length > 1000));
});

test("Crossbow owns one Attack Slot, locks before fire, then reloads", async () => {
  const source = await readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8");
  assert.match(source, /if \(enemy\.hasAttackSlot\) \{\s*this\.setFacing\(enemy, this\.playerBodyZone\.x >= enemy\.bodyZone\.x \? 1 : -1\);\s*this\.setState\(enemy, "aim"\)/);
  assert.match(source, /if \(isCrossbowTracking\(elapsed\)\) enemy\.aimLineY = nextAimLineY/);
  assert.match(source, /if \(elapsed >= CROSSBOW_TIMING\.trackingMs\) this\.setState\(enemy, "locked"\)/);
  assert.match(source, /enemy\.lockedLineY = this\.playerBodyZone\.y/);
  assert.match(source, /enemy\.sprite\.play\(crossbowAnimationKey\("aim"\), true\)/);
  assert.match(source, /enemy\.sprite\.play\(crossbowAnimationKey\("locked"\), true\)/);
  assert.match(source, /enemy\.sprite\.play\(crossbowAnimationKey\("reload"\), true\)/);
  assert.match(source, /new CrossbowProjectile\(this\.scene, enemy\.id, enemy\.bodyZone\.x \+ enemy\.facing \* 42, enemy\.lockedLineY, enemy\.facing\)/);
  assert.match(source, /this\.releaseAttackSlot\(enemy\);\s*this\.setState\(enemy, "reload"\)/);
  assert.match(source, /CROSSBOW_TIMING\.reloadMs/);
  assert.match(source, /enemy\.isCrossbow \? CROSSBOW_ATTACK_SLOT_RANGE : 220/);
});

test("Crossbow projectile hits only the Player on its locked line and cleans up", async () => {
  const source = await readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8");
  const projectile = await readFile(new URL("../app/game/enemy/CrossbowProjectile.ts", import.meta.url), "utf8");
  assert.match(source, /isTargetOnCrossbowLine\(projectile\.y, this\.playerBodyZone\.y\)/);
  assert.doesNotMatch(source, /isFriendlyTargetOnCrossbowLine/);
  assert.doesNotMatch(source, /onEnemyHitByProjectile/);
  assert.match(projectile, /this\.body\.setVelocityY\(0\)/);
  assert.match(projectile, /this\.zone\.y = this\.y/);
  assert.doesNotMatch(projectile, /updateFromGameObject/);
  assert.match(source, /this\.callbacks\.onPlayerHit\(shooter\);/);
  assert.match(source, /this\.destroyProjectile\(shooter\);/);
  assert.match(source, /enemy\.aimLine\?\.clear\(\);\s*this\.destroyProjectile\(enemy\);/);
});

test("Crossbow formal integration keeps development test entrances isolated", async () => {
  const source = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.ok(BAMBOO_COMBAT_ROOM.spawnPoints.some(point => point.enemyType === "crossbow"));
  assert.match(source, /query\.get\("crossbowTest"\)/);
  assert.match(source, /spawnCrossbowPrototype\(mode: "A" \| "B"\)/);
  assert.match(source, /enemyType: "crossbow" as const/);
  assert.match(source, /!this\.shieldGuardTestMode && !this\.crossbowTestMode && !this\.shieldCrossbowTestMode/);
  assert.match(source, /query\.get\("shieldCrossbowTest"\) === "1"/);
  assert.match(source, /spawnShieldCrossbowPrototype\(\)/);
  assert.match(source, /enemyType: "shield-guard" as const/);
});
