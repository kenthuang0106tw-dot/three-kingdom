import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { GUANYU_PLAYER_DEFINITION } from "../app/game/player/GuanYuAnimationMetadata.ts";
import { ZHANGFEI_PLAYER_DEFINITION } from "../app/game/player/ZhangFeiAnimationMetadata.ts";

const root = new URL("../", import.meta.url);
const readText = path => readFile(new URL(path, root), "utf8");

test("Task 10.5HP retains rejected evidence and restores the actor-level runtime", async () => {
  const [contract, report, architecture, roadmap, nextTask, definition, mainScene, manifest] = await Promise.all([
    readText("docs/planning/m10-5h-zhang-fei-attack-hitbox-contract.md"),
    readText("docs/combat/m10-5hp-zhang-fei-lane-coverage.md"),
    readText("ARCHITECTURE.md"),
    readText("GAME_ROADMAP.md"),
    readText("NEXT_TASK.md"),
    readText("app/game/player/PlayerDefinition.ts"),
    readText("app/game/MainScene.ts"),
    readText("app/game/assets/AssetManifest.ts"),
  ]);

  assert.match(contract, /each `PlayerAttackMetadata` owns one immutable, fixed hitbox profile/);
  assert.match(contract, /remove the legacy\s+`PlayerDefinition\.attackHitbox`/);
  assert.match(contract, /Do not support both paths, optional fallback/);
  assert.match(contract, /exactly one Zone/);
  assert.match(contract, /Guan Yu Attack 1–3 \| 142 \| 86 \| 104 \| -48/);
  assert.match(contract, /Zhang Fei Attack 2 \| 176 \| \*\*128\*\* \| 132 \| -48/);
  assert.match(contract, /120–136px height/);
  assert.match(contract, /must begin and finish at 128px; it has\s+no tuning pass/);
  assert.match(contract, /target foot deltas `\+60` and `-100`/);
  assert.match(contract, /total duration \*\*525ms\*\*: 175ms startup, 125ms active, 225ms recovery/);
  assert.match(contract, /at least\s+\*\*1\.5×\*\*/);
  assert.match(contract, /at least \*\*\+0\.20\*\*/);
  assert.match(contract, /30 total/);
  assert.match(contract, /Reject without further numeric rescue/);
  assert.match(architecture, /each attack metadata entry may own exactly one immutable rectangular hitbox/);
  assert.match(report, /Status: \*\*Rejected; runtime gameplay migration rolled back\*\*/);
  assert.match(report, /1\.06×, failing the required 1\.5×/);
  assert.match(report, /\+0\.015, failing the required \+0\.20/);
  assert.match(architecture, /failed both fixed gameplay-distinction gates/);
  assert.match(roadmap, /10\.5HP \| Zhang Fei Attack 2 lane-coverage prototype — Rejected 2026-08-01/);
  assert.match(nextTask, /M11 \/ Task 11\.1 — Post-M10 Product Direction Selection/);

  assert.match(definition, /attackHitbox: Readonly/);
  assert.doesNotMatch(definition, /hitbox: PlayerAttackHitbox/);
  assert.equal((mainScene.match(/this\.add\.zone\(\s*START_X,\s*START_FOOT_Y \+ attackHitbox\.offsetY/g) ?? []).length, 1);
  assert.deepEqual(GUANYU_PLAYER_DEFINITION.attackHitbox, { width: 142, height: 86, offsetX: 104, offsetY: -48 });
  assert.deepEqual(ZHANGFEI_PLAYER_DEFINITION.attackHitbox, { width: 176, height: 88, offsetX: 132, offsetY: -48 });
  assert.doesNotMatch(manifest, /zhang[-_]?fei|zhangfei/i);
});
