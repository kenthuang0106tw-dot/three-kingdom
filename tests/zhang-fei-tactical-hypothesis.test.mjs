import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { ZHANGFEI_PLAYER_DEFINITION } from "../app/game/player/ZhangFeiAnimationMetadata.ts";

const root = new URL("../", import.meta.url);
const readText = path => readFile(new URL(path, root), "utf8");

test("Task 10.5R defines one measurable formation-breaker hypothesis", async () => {
  const contract = await readText("docs/planning/m10-5r-zhang-fei-tactical-hypothesis.md");

  assert.match(contract, /formation breaker/);
  assert.match(contract, /Zhangba serpent spear \(丈八蛇矛\)/);
  assert.match(contract, /Attack 2 displacement is the role-bearing change/);
  assert.match(contract, /525ms \/ 1 \/ 56px \/ 5f/);
  assert.match(contract, /800ms \/ 225-150-425/);
  assert.match(contract, /at most one.*definition-only adjustment/s);
  assert.match(contract, /groupedAttack2Confirms/);
  assert.match(contract, /repositionAfterAttack2/);
  assert.match(contract, /isolatedAttack3Starts/);
  assert.match(contract, /unsafeAttack3Starts/);
  assert.match(contract, /at least \*\*1\.5×\*\*/);
  assert.match(contract, /at least \*\*\+0\.20\*\*/);
  assert.match(contract, /no more than 20% slower/);
  assert.match(contract, /Only an accepted 10\.5P result may unblock 10\.6/);
});

test("rejected Task 10.5P records complete evidence and keeps formal integration blocked", async () => {
  const [nextTask, roadmap, report, manifest, definition] = await Promise.all([
    readText("NEXT_TASK.md"),
    readText("GAME_ROADMAP.md"),
    readText("docs/combat/m10-5p-zhang-fei-formation-breaker.md"),
    readText("app/game/assets/AssetManifest.ts"),
    readText("app/game/player/PlayerDefinition.ts"),
  ]);

  assert.match(nextTask, /M10 \/ Task 10\.5D — Zhang Fei Second-Player Direction Decision/);
  assert.match(nextTask, /Do not implement Task 10\.6/);
  assert.match(roadmap, /10\.5R \| Zhang Fei tactical hypothesis revision — Completed 2026-08-01/);
  assert.match(roadmap, /10\.5P \| Zhang Fei formation-breaker combat prototype — Rejected 2026-08-01/);
  assert.match(roadmap, /10\.6 \| Phaser character select and formal integration — Blocked/);
  assert.match(report, /All 30 runs completed/);
  assert.match(report, /1\.10×,\s+failing the required 1\.5×/);
  assert.match(report, /\+0\.06, failing the required \+0\.20/);
  assert.match(report, /\*\*Decision: Reject\.\*\*/);
  assert.doesNotMatch(manifest, /zhang[-_]?fei|zhangfei/i);
  assert.doesNotMatch(definition, /zhang[-_]?fei|zhangfei/i);
  const attack2 = ZHANGFEI_PLAYER_DEFINITION.attacks[2];
  const attack3 = ZHANGFEI_PLAYER_DEFINITION.attacks[3];
  const recoveryMs = attack3.recoveryFrames.reduce(
    (total, frame) => total + (1000 / attack3.frameRate) + attack3.extraFrameDurationsMs[frame - 1],
    0,
  );
  assert.equal(attack2.impact.knockbackDistance, 56);
  assert.equal(attack3.impact.damage, 2);
  assert.ok(Math.abs(recoveryMs - 425) < 0.001);
});
