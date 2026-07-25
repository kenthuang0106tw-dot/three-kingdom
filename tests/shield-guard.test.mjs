import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { SHIELD_GUARD_ENEMY_CONFIG } from "../app/game/enemy/EnemyConfig.ts";
import { SHIELD_GUARD_PARAMS, SHIELD_GUARD_TIMING, isAttackBlockedByGuard } from "../app/game/enemy/ShieldGuard.ts";

test("Shield Guard blocks only its locked forward cone", () => {
  assert.equal(isAttackBlockedByGuard(1, 500, 560, 600, 560), true);
  assert.equal(isAttackBlockedByGuard(1, 500, 560, 400, 560), false);
  assert.equal(isAttackBlockedByGuard(1, 500, 560, 500, 700), false);
  assert.equal(isAttackBlockedByGuard(-1, 500, 560, 400, 560), true);
  assert.equal(isAttackBlockedByGuard(-1, 500, 560, 600, 560), false);
});

test("Shield Guard uses the normal Soldier health and an explicit guard/recovery timing contract", () => {
  assert.equal(SHIELD_GUARD_ENEMY_CONFIG.maxHp, 12);
  assert.equal(SHIELD_GUARD_ENEMY_CONFIG.assetKey, "enemy-soldier");
  assert.equal(SHIELD_GUARD_ENEMY_CONFIG.combat.attackYRange, 28);
  assert.equal(SHIELD_GUARD_TIMING.guardLockMs, 800);
  assert.deepEqual(SHIELD_GUARD_PARAMS, { guardEnterDistance: 230, guardEnterYRange: 100 });
  assert.deepEqual(
    [SHIELD_GUARD_TIMING.recoveryMinMs, SHIELD_GUARD_TIMING.recoveryMaxMs],
    [800, 1200],
  );
});

test("Shield Guard keeps guard direction locked, disables guard while attacking, and releases the attack slot", async () => {
  const source = await readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8");
  assert.match(source, /enemy\.guardUntil = this\.clock\.now\(\) \+ SHIELD_GUARD_TIMING\.guardLockMs/);
  assert.match(source, /enemy\.hasAttackSlot && this\.clock\.now\(\) >= enemy\.guardUntil && this\.isInAttackRange\(enemy\)/);
  assert.match(source, /else if \(enemy\.hasAttackSlot && this\.clock\.now\(\) >= enemy\.guardUntil\) this\.setState\(enemy, "idle"\)/);
  assert.match(source, /this\.clock\.now\(\) >= enemy\.guardUntil && !this\.isPlayerInsideGuardCone\(enemy\)/);
  assert.match(source, /guard: new Set\(\["idle", "attack", "hurt", "dead"\]\)/);
  assert.match(source, /if \(enemy\.isShieldGuard\) this\.setState\(enemy, "recovery"\)/);
  assert.match(source, /this\.releaseAttackSlot\(enemy\);/);
  assert.match(source, /createAttackCommitment\(enemy\.facing, this\.playerBodyZone\.y\)/);
  assert.match(source, /Math\.abs\(this\.playerBodyZone\.y - enemy\.bodyZone\.y\) < enemy\.config\.combat\.attackYRange/);
});

test("Shield Guard block excludes damage and combo confirmation once per attack target", async () => {
  const source = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.match(source, /this\.enemyManager\.isGuardBlocking/);
  assert.match(source, /this\.playerBlockedTargetIds = new Set/);
  assert.match(source, /filter\(enemy => !this\.playerBlockedTargetIds\.has\(enemy\.id\)\)/);
  assert.match(source, /this\.gameplayEvents\.publish\(\{ type: "enemy-blocked"/);
  assert.match(source, /if \(hitLanded\) \{\s*this\.hitConfirmed = true/);
});

test("Shield Guard development tests are isolated from formal stage encounters", async () => {
  const source = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.match(source, /query\.get\("shieldGuardTest"\)/);
  assert.match(source, /this\.enemyManager\.spawnPrototype\(spawns\)/);
  assert.match(source, /if \(!this\.shieldGuardTestMode && !this\.bossSmokeMode/);
  assert.match(source, /enemyType: "shield-guard" as const/);
});
