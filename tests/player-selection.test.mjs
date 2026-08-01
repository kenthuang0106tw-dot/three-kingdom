import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getPlayerDefinition, isPlayerId, PLAYER_DEFINITIONS } from "../app/game/player/PlayerSelection.ts";
import { LAZY_RUNTIME_PUBLIC_ASSETS } from "../tools/package-production-assets.mjs";

test("production Player selection exposes exactly Guan Yu and trial Zhang Fei", async () => {
  const [scene, reactHost, nextTask] = await Promise.all([
    readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/PhaserGame.tsx", import.meta.url), "utf8"),
    readFile(new URL("../NEXT_TASK.md", import.meta.url), "utf8"),
  ]);

  assert.deepEqual(Object.keys(PLAYER_DEFINITIONS), ["guanyu", "zhangfei"]);
  assert.equal(getPlayerDefinition("guanyu").id, "guanyu");
  assert.equal(getPlayerDefinition("zhangfei").id, "zhangfei");
  assert.equal(isPlayerId("guanyu"), true);
  assert.equal(isPlayerId("zhangfei"), true);
  assert.equal(isPlayerId("zhaoyun"), false);
  assert.deepEqual(LAZY_RUNTIME_PUBLIC_ASSETS, [
    "art/zhangfei-v2/zhangfei-v2.png",
    "art/zhangfei-v2/zhangfei-v2.atlas.json",
  ]);
  assert.match(scene, /SELECT FIGHTER/);
  assert.match(scene, /ZHANG FEI - TRIAL BALANCE/);
  assert.match(scene, /this\.scene\.restart\(\{ playerId: this\.titleSelectedPlayerId, autoStartSource: source \}/);
  assert.match(scene, /if \(data\.playerId\) this\.configurePlayer\(data\.playerId\)/);
  assert.match(scene, /if \(this\.playerDefinition\.id === "zhangfei"/);
  assert.match(scene, /keyboard\.on\("keydown", this\.handleTitleKeyboardStart, this\)/);
  assert.match(scene, /keyboard\.off\("keydown", this\.handleTitleKeyboardStart, this\)/);
  assert.doesNotMatch(reactHost, /PlayerSelection|selectedPlayer|useState/);
  assert.match(nextTask, /M10 \/ Task 10\.6R — Zhang Fei Trial Play Review/);
  assert.match(nextTask, /Do not implement another feature/);
});
