import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  SHIELD_GUARD_ENEMY_CONFIG,
  SHIELD_GUARD_EXTRA_ANIMATIONS,
  SOLDIER_ENEMY_CONFIG,
} from "../app/game/enemy/EnemyConfig.ts";
import { SHIELD_GUARD_PARAMS, SHIELD_GUARD_TIMING, isAttackBlockedByGuard } from "../app/game/enemy/ShieldGuard.ts";
import { BAMBOO_COMBAT_ROOM } from "../app/game/stage/StageConfig.ts";

test("Shield Guard blocks only its locked forward cone", () => {
  assert.equal(isAttackBlockedByGuard(1, 500, 560, 600, 560), true);
  assert.equal(isAttackBlockedByGuard(1, 500, 560, 400, 560), false);
  assert.equal(isAttackBlockedByGuard(1, 500, 560, 500, 700), false);
  assert.equal(isAttackBlockedByGuard(-1, 500, 560, 400, 560), true);
  assert.equal(isAttackBlockedByGuard(-1, 500, 560, 600, 560), false);
});

test("Shield Guard uses the normal Soldier health and an explicit guard/recovery timing contract", () => {
  assert.equal(SHIELD_GUARD_ENEMY_CONFIG.maxHp, 12);
  assert.equal(SHIELD_GUARD_ENEMY_CONFIG.assetKey, "enemy-shield-guard");
  assert.deepEqual(SHIELD_GUARD_ENEMY_CONFIG.movement, SOLDIER_ENEMY_CONFIG.movement);
  assert.deepEqual(SHIELD_GUARD_ENEMY_CONFIG.timing, SOLDIER_ENEMY_CONFIG.timing);
  assert.equal(SHIELD_GUARD_ENEMY_CONFIG.combat.attackXRange, SOLDIER_ENEMY_CONFIG.combat.attackXRange);
  assert.equal(SHIELD_GUARD_ENEMY_CONFIG.combat.minSpacing, SOLDIER_ENEMY_CONFIG.combat.minSpacing);
  assert.equal(SHIELD_GUARD_ENEMY_CONFIG.combat.attackYRange, 28);
  assert.equal(SHIELD_GUARD_TIMING.guardLockMs, 800);
  assert.deepEqual(SHIELD_GUARD_PARAMS, { guardEnterDistance: 230, guardEnterYRange: 100 });
  assert.deepEqual(
    [SHIELD_GUARD_TIMING.recoveryMinMs, SHIELD_GUARD_TIMING.recoveryMaxMs],
    [800, 1200],
  );
});

test("ER.5 Shield Guard owns 21 genuine feet-aligned production poses", async () => {
  const [atlas, metadata, runtime, debug, onion, silhouette, identityGate] = await Promise.all([
    readFile(new URL("../public/art/enemy/shield-guard.atlas.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../public/art/enemy/shield-guard.metadata.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../public/art/enemy/shield-guard.png", import.meta.url)),
    readFile(new URL("../public/art/enemy/shield-guard-debug.png", import.meta.url)),
    readFile(new URL("../public/art/enemy/shield-guard-onion.png", import.meta.url)),
    readFile(new URL("../public/art/enemy/shield-guard-silhouette-25.png", import.meta.url)),
    readFile(new URL("../docs/visual-baselines/enemy-cast-v2/shield-guard-er5-idle-gate.png", import.meta.url)),
  ]);
  assert.equal(runtime.readUInt32BE(16), 288 * 5);
  assert.equal(runtime.readUInt32BE(20), 288 * 5);
  assert.equal(Object.keys(atlas.frames).length, 21);
  assert.equal(metadata.frames.length, 21);
  assert.equal(new Set(metadata.frames.map(frame => frame.pixelHash)).size, 21);
  assert.deepEqual(metadata.feetAnchor, { x: 144, y: 265 });
  assert.equal(metadata.displayScale, 1.025);
  assert.equal(metadata.sourceFacing, -1);
  assert.equal(metadata.logicalIdleHeight, 215.25);
  assert.deepEqual(metadata.animations.guard, ["guard-0", "guard-1"]);
  assert.deepEqual(metadata.animations.block, ["block-0", "block-1"]);
  assert.deepEqual(metadata.animations.recovery, ["recovery-0", "recovery-1"]);
  assert.deepEqual(metadata.animations.guard, SHIELD_GUARD_EXTRA_ANIMATIONS.guard);
  assert.ok(metadata.frames.every(frame =>
    frame.accepted &&
    frame.feetAnchor.x === 144 &&
    frame.feetAnchor.y === 265 &&
    frame.displayScale === 1.025 &&
    frame.runtimeAlphaBounds.y + frame.runtimeAlphaBounds.height === 265 &&
    frame.runtimeAlphaBounds.x >= 12 &&
    frame.runtimeAlphaBounds.x + frame.runtimeAlphaBounds.width <= 276
  ));
  assert.equal(metadata.provenance.processingTool, "tools/build_shield_guard_art.py");
  assert.ok([debug, onion, silhouette, identityGate].every(file => file.length > 1000));
});

test("Shield Guard keeps guard direction locked, disables guard while attacking, and releases the attack slot", async () => {
  const source = await readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8");
  assert.match(source, /enemy\.guardUntil = this\.clock\.now\(\) \+ SHIELD_GUARD_TIMING\.guardLockMs/);
  assert.match(source, /enemy\.hasAttackSlot && this\.clock\.now\(\) >= enemy\.guardUntil && \(this\.isInAttackRange\(enemy\) \|\| enemy\.guardCounterReady\)/);
  assert.match(source, /else if \(enemy\.hasAttackSlot && this\.clock\.now\(\) >= enemy\.guardUntil\) this\.setState\(enemy, "idle"\)/);
  assert.match(source, /this\.clock\.now\(\) >= enemy\.guardUntil && !this\.isPlayerInsideGuardCone\(enemy\)/);
  assert.match(source, /this\.releaseAttackSlot\(enemy\);\s*this\.setState\(enemy, "recovery"\)/);
  assert.match(source, /enemy\.guardReacquireFacing = this\.playerBodyZone\.x >= enemy\.bodyZone\.x \? 1 : -1/);
  assert.match(source, /const facing = enemy\.guardReacquireFacing;\s*enemy\.guardReacquireFacing = undefined;\s*if \(facing\) this\.setFacing\(enemy, facing\)/);
  assert.match(source, /reinforceGuardAfterBlock\(enemy: EnemyCombatant\)/);
  assert.match(source, /enemy\.guardCounterReady = true/);
  assert.match(source, /enemy\.guardCounterReady = false/);
  assert.match(source, /enemy\.guardUntil = this\.clock\.now\(\) \+ SHIELD_GUARD_TIMING\.guardLockMs/);
  assert.match(source, /guard: new Set\(\["idle", "attack", "recovery", "hurt", "dead"\]\)/);
  assert.match(source, /enemy\.body\.setImmovable\(next !== "walk"\)/);
  assert.match(source, /if \(enemy\.isShieldGuard\) this\.setState\(enemy, "recovery"\)/);
  assert.match(source, /this\.releaseAttackSlot\(enemy\);/);
  assert.match(source, /createAttackCommitment\(enemy\.facing, this\.playerBodyZone\.y\)/);
  assert.match(source, /Math\.abs\(this\.playerBodyZone\.y - enemy\.bodyZone\.y\) < enemy\.config\.combat\.attackYRange/);
  assert.match(source, /enemy\.sprite\.play\(shieldGuardAnimationKey\("block"\), true\)/);
  assert.match(source, /enemy\.sprite\.play\(shieldGuardAnimationKey\("guard"\), true\)/);
  assert.match(source, /enemy\.sprite\.play\(shieldGuardAnimationKey\("recovery"\), true\)/);
});

test("Shield Guard block excludes damage and combo confirmation once per attack target", async () => {
  const source = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.match(source, /this\.enemyManager\.isGuardBlocking/);
  assert.match(source, /this\.playerBlockedTargetIds = new Set/);
  assert.match(source, /filter\(enemy => !this\.playerBlockedTargetIds\.has\(enemy\.id\)\)/);
  assert.match(source, /this\.gameplayEvents\.publish\(\{ type: "enemy-blocked"/);
  assert.match(source, /this\.enemyManager\.reinforceGuardAfterBlock\(enemy\)/);
  assert.match(source, /if \(hitLanded\) \{\s*this\.hitConfirmed = true/);
});

test("Shield Guard formal integration keeps development test entrances isolated", async () => {
  const source = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.ok(BAMBOO_COMBAT_ROOM.spawnPoints.some(point => point.enemyType === "shield-guard"));
  assert.match(source, /query\.get\("shieldGuardTest"\)/);
  assert.match(source, /this\.enemyManager\.spawnPrototype\(spawns\)/);
  assert.match(source, /if \(!this\.shieldGuardTestMode && !this\.crossbowTestMode && !this\.shieldCrossbowTestMode && !this\.duelistLeapTestMode && !this\.bossSmokeMode/);
  assert.match(source, /enemyType: "shield-guard" as const/);
});
