import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const readText = path => readFile(new URL(path, root), "utf8");

test("Task 10.5D selects contract discovery without implementing attack geometry", async () => {
  const [decision, nextTask, roadmap, definition, manifest] = await Promise.all([
    readText("docs/planning/m10-5d-zhang-fei-direction-decision.md"),
    readText("NEXT_TASK.md"),
    readText("GAME_ROADMAP.md"),
    readText("app/game/player/PlayerDefinition.ts"),
    readText("app/game/assets/AssetManifest.ts"),
  ]);

  assert.match(decision, /revise the Player\/art contract with a genuinely different mechanic/);
  assert.match(decision, /attack-specific hitbox\s+profile/);
  assert.match(decision, /Attack 2 retains its current 525ms commitment/);
  assert.match(decision, /grants no armor, invulnerability, extra\s+damage, HP, Combo Window, or cancel benefit/);
  assert.match(decision, /Do not defer Zhang Fei and close M10 yet/);
  assert.match(decision, /Do not stop pending product-owner direction/);
  assert.match(decision, /not authorized for implementation/);
  assert.match(nextTask, /M10 \/ Task 10\.5F — Zhang Fei Second-Player Feasibility Closeout/);
  assert.match(nextTask, /three complete, bounded Zhang Fei gameplay hypotheses have now been rejected/i);
  assert.match(nextTask, /Do not implement character selection, another Zhang Fei prototype/);
  assert.match(roadmap, /10\.5D \| Zhang Fei second-player direction decision — Completed 2026-08-01/);
  assert.match(roadmap, /10\.5H \| Zhang Fei attack-specific hitbox contract/);
  assert.match(roadmap, /10\.6 \| Phaser character select and formal integration — Blocked/);

  assert.match(definition, /attackHitbox: Readonly/);
  assert.doesNotMatch(definition, /attackHitboxes|hitboxProfile|hitboxGeometry/);
  assert.doesNotMatch(manifest, /zhang[-_]?fei|zhangfei/i);
});
