import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const readText = path => readFile(new URL(path, root), "utf8");
const sha256 = async path =>
  createHash("sha256").update(await readFile(new URL(path, root))).digest("hex").toUpperCase();

test("Zhang Fei production contract freezes identity, frames, geometry, and prototype evidence", async () => {
  const contract = await readText("docs/planning/m10-zhang-fei-production-contract.md");

  assert.match(contract, /Japanese arcade-realistic Three Kingdoms heavy\s+warrior/);
  assert.match(contract, /thick dark beard/);
  assert.match(contract, /Zhangba serpent spear \(丈八蛇矛\)/);
  assert.match(contract, /no Guan Yu recolor/);
  assert.match(contract, /exactly 47 distinct approved poses/);
  assert.match(contract, /idle \| 6/);
  assert.match(contract, /walk \| 8/);
  assert.match(contract, /attack1 \| 6 \| 2 startup, 2 active, 2 recovery/);
  assert.match(contract, /attack2 \| 7 \| 3 startup, 2 active, 2 recovery/);
  assert.match(contract, /attack3 \| 10 \| 4 startup, 3 active, 3 recovery/);
  assert.match(contract, /hurt \| 4/);
  assert.match(contract, /dead \| 6/);
  assert.match(contract, /672×448 px/);
  assert.match(contract, /Shared feet anchor: \*\*\(336, 420\)\*\*/);
  assert.match(contract, /Shared origin: \*\*\(0\.5, 0\.9375\)\*\*/);
  assert.match(contract, /Single initial display scale: \*\*0\.64\*\*/);
  assert.match(contract, /red frame-rectangle sheet/);
  assert.match(contract, /2 FPS onion-skin/);
  assert.match(contract, /25% silhouette/);
  assert.match(contract, /Forest Entry: Soldier \+ Shield Guard/);
  assert.match(contract, /Forest Ambush: Mauler \+ Duelist \+ Crossbow/);
  assert.match(contract, /Boss arena/);
  assert.match(contract, /neither general has both lower median damage taken and lower median clear\s+time in all three contexts/);
  assert.match(contract, /subjective “feels heavier” is not evidence/);
});

test("legacy Zhang Fei inputs remain exact feasibility references", async () => {
  const expected = new Map([
    ["public/art/zhangfei/zhangfei-master.png", "6C713E121E2E777D0E049789AE6BD1B086C8B0E029FC3E5387A1A315C2F8FD58"],
    ["public/art/zhangfei/zhangfei-master-source.png", "46511BD3D5BC528A554C7908350867AAC7DCF6A393B08A7EECA1F81A73DB9D70"],
    ["public/art/zhangfei/zhangfei-walk.png", "9FD9B8E48DB5C8CB71050E7F74CDB1CF8E58F1A16E8E63FF45631A5F46671ABF"],
    ["public/art/zhangfei/zhangfei-walk-source.png", "9C529CFEBA59E965E2D6DC0D180DCACBAA9405ADF096E7ED6706A96DF4703258"],
    ["public/art/zhangfei/zhangfei-combo.png", "EE22EF7D5D75F976BDFB6E12B94B4F48CD8C939DFF4B4DC072362280C0AAB124"],
    ["public/art/zhangfei/zhangfei-combo-source.png", "229239B7944C3F4C3825C052583DFC7DB5DBC1EBFE09FDFECA4B384D8A651D5E"],
  ]);
  for (const [path, hash] of expected) assert.equal(await sha256(path), hash, path);
});

test("rejected Task 10.5 keeps production frozen and selects only planning Task 10.5R", async () => {
  const [nextTask, manifest, mainScene, playerDefinition, roadmap] = await Promise.all([
    readText("NEXT_TASK.md"),
    readText("app/game/assets/AssetManifest.ts"),
    readText("app/game/MainScene.ts"),
    readText("app/game/player/PlayerDefinition.ts"),
    readText("GAME_ROADMAP.md"),
  ]);

  assert.match(nextTask, /M10 \/ Task 10\.5R — Zhang Fei Tactical Hypothesis Revision/);
  assert.match(nextTask, /Do not implement the revised combat prototype, Task 10\.6/);
  assert.doesNotMatch(manifest, /zhang[-_]?fei|zhangfei/i);
  assert.match(mainScene, /previewZhangFei/);
  assert.match(mainScene, /process\.env\.NODE_ENV !== "production"/);
  assert.doesNotMatch(playerDefinition, /zhang[-_]?fei|zhangfei/i);
  assert.match(roadmap, /10\.4 \| Zhang Fei atlas and animation preview — Completed 2026-07-30/);
  assert.match(roadmap, /10\.5 \| Zhang Fei combat prototype — Rejected 2026-08-01/);
  assert.match(roadmap, /\*\*Next:\*\* M10 \/ Task 10\.5R — Zhang Fei Tactical Hypothesis Revision/);
});
