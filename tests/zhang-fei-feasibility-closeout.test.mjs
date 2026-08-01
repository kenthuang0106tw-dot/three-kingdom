import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const readText = path => readFile(new URL(path, root), "utf8");

test("Task 10.5F defers Zhang Fei, closes M10, and selects planning-only M11.1", async () => {
  const [decision, roadmap, sprint, checklist, debt, nextTask, definition, mainScene, manifest] = await Promise.all([
    readText("docs/planning/m10-5f-zhang-fei-feasibility-closeout.md"),
    readText("GAME_ROADMAP.md"),
    readText("SPRINT.md"),
    readText("CHECKLIST.md"),
    readText("TECH_DEBT.md"),
    readText("NEXT_TASK.md"),
    readText("app/game/player/PlayerDefinition.ts"),
    readText("app/game/MainScene.ts"),
    readText("app/game/assets/AssetManifest.ts"),
  ]);

  assert.match(decision, /Across 90 paired runs/);
  assert.match(decision, /Defer Zhang Fei to a later milestone — Selected/);
  assert.match(decision, /Revise the production \/ identity contract — Not selected/);
  assert.match(decision, /Close M10 permanently without a second playable — Not selected/);
  assert.match(decision, /Tasks 10\.6 and 10\.7 are removed from the active sequence/);
  assert.match(decision, /explicit product-owner decision/);
  assert.match(roadmap, /10\.5F \| Zhang Fei second-player feasibility closeout — Completed 2026-08-01/);
  assert.match(roadmap, /10\.6 \| Phaser character select and formal integration — Deferred from active sequence/);
  assert.match(sprint, /M10 is closed as evidence-complete but product-goal-incomplete/);
  assert.match(checklist, /Planning-only M11 \/ Task 11\.1 — Post-M10 Product Direction Selection/);
  assert.match(debt, /TD-M10\.5F Resolved/);
  assert.match(nextTask, /M10 \/ Task 10\.6R — Zhang Fei Trial Play Review/);
  assert.match(nextTask, /product owner explicitly asked to play the preserved prototype/);

  assert.match(definition, /attackHitbox: Readonly/);
  assert.doesNotMatch(definition, /hitbox: PlayerAttackHitbox/);
  assert.equal((mainScene.match(/this\.add\.zone\(\s*START_X,\s*START_FOOT_Y \+ attackHitbox\.offsetY/g) ?? []).length, 1);
  assert.doesNotMatch(manifest, /zhang[-_]?fei|zhangfei/i);
});
