import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  BAMBOO_COMBAT_ROOM,
  isStagePointWithin,
  validateStageConfig,
} from "../app/game/stage/StageConfig.ts";
import {
  clearActiveEncounter,
  createEncounterSequence,
  isEncounterSequenceCleared,
  triggerNextEncounter,
} from "../app/game/stage/EncounterFlow.ts";

const expectedRoles = ["crossbow", "duelist", "mauler", "shield-guard", "soldier"];

test("formal Stage contains all five accepted enemy roles exactly once", () => {
  assert.equal(validateStageConfig(BAMBOO_COMBAT_ROOM), BAMBOO_COMBAT_ROOM);
  assert.deepEqual(
    BAMBOO_COMBAT_ROOM.spawnPoints.map(point => point.enemyType).sort(),
    expectedRoles,
  );
  assert.deepEqual(
    BAMBOO_COMBAT_ROOM.encounters.map(encounter => encounter.spawnPointIds.length),
    [2, 3],
  );
});

test("formal encounter spawns stay in bounds and begin with readable spacing", () => {
  const points = new Map(BAMBOO_COMBAT_ROOM.spawnPoints.map(point => [point.id, point]));
  for (const encounter of BAMBOO_COMBAT_ROOM.encounters) {
    const spawns = encounter.spawnPointIds.map(id => points.get(id));
    assert.ok(spawns.every(Boolean));
    for (const spawn of spawns) {
      assert.equal(isStagePointWithin(spawn, BAMBOO_COMBAT_ROOM.walkBounds), true);
    }
    for (let left = 0; left < spawns.length; left += 1) {
      for (let right = left + 1; right < spawns.length; right += 1) {
        assert.ok(Math.hypot(
          spawns[left].x - spawns[right].x,
          spawns[left].y - spawns[right].y,
        ) >= 72);
      }
    }
  }
});

test("five-enemy encounters clear in order and reset without blocking Boss eligibility", () => {
  const encounters = BAMBOO_COMBAT_ROOM.encounters;
  const ready = createEncounterSequence();
  const first = triggerNextEncounter(ready, encounters, { x: 899, y: 560 }, { x: 901, y: 560 });
  assert.equal(first?.encounter.spawnPointIds.length, 2);
  const afterFirst = clearActiveEncounter(first.state, first.encounter.id);
  const second = triggerNextEncounter(afterFirst, encounters, { x: 1999, y: 560 }, { x: 2001, y: 560 });
  assert.equal(second?.encounter.spawnPointIds.length, 3);
  const complete = clearActiveEncounter(second.state, second.encounter.id);
  assert.equal(isEncounterSequenceCleared(complete, encounters.length), true);
  assert.deepEqual(createEncounterSequence(), ready);
});

test("formal integration reuses one EnemyManager and one Attack Slot", async () => {
  const [scene, manager] = await Promise.all([
    readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/EnemyManager.ts", import.meta.url), "utf8"),
  ]);
  assert.match(scene, /this\.enemyManager\.spawnAll\(spawns\)/);
  assert.match(scene, /dataset\.encounterEnemyTypes = enemies\.map\(enemy => enemy\.config\.id\)\.join\(","\)/);
  assert.equal((scene.match(/new EnemyManager\(/g) ?? []).length, 1);
  assert.match(manager, /private currentAttacker: EnemyCombatant \| null = null/);
  assert.match(manager, /if \(this\.currentAttacker \|\| this\.clock\.now\(\) < this\.directorReadyAt\) return/);
  assert.match(manager, /this\.releaseAttackSlot\(enemy\)/);
});
