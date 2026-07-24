import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { mapGameplayEventToBgm } from "../app/game/audio/BgmCatalog.ts";
import { mapGameplayEventToSfx } from "../app/game/audio/SfxCatalog.ts";

const successRun = [
  { type: "title-started", source: "pointer", at: 1 },
  { type: "player-attack-started", step: 1, at: 2 },
  { type: "enemy-hit", enemyId: 1, damage: 1, at: 3 },
  { type: "enemy-defeated", enemyId: 1, at: 3 },
  { type: "ui-action", action: "pause", at: 4 },
  { type: "ui-action", action: "resume", at: 5 },
  { type: "boss-activated", bossId: "warlord", at: 6 },
  { type: "player-hit", enemyId: 99, at: 7 },
  { type: "stage-completed", stageId: "bamboo", at: 8 },
  { type: "ui-action", action: "replay", at: 9 },
];

const failureRun = [
  { type: "title-started", source: "pointer", at: 1 },
  { type: "player-hit", enemyId: 1, at: 2 },
  { type: "player-state-changed", previous: "hurt", next: "dead", at: 3 },
  { type: "ui-action", action: "retry", at: 4 },
];

test("Full success and failure flows cover the accepted cue matrix", () => {
  assert.deepEqual(
    successRun.flatMap(event => mapGameplayEventToSfx(event)?.cue ?? []),
    [
      "ui-start",
      "player-attack",
      "hit-confirmed",
      "enemy-death",
      "ui-pause",
      "ui-resume",
      "player-hurt",
      "ui-result",
      "ui-confirm",
    ],
  );
  assert.deepEqual(
    failureRun.flatMap(event => mapGameplayEventToSfx(event)?.cue ?? []),
    ["ui-start", "player-hurt", "ui-failure", "ui-confirm"],
  );
  assert.deepEqual(
    successRun.flatMap(event => {
      const command = mapGameplayEventToBgm(event);
      return command ? [command.action === "play" ? `${command.action}:${command.track}` : command.action] : [];
    }),
    ["play:stage", "play:boss", "stop"],
  );
  assert.deepEqual(
    failureRun.flatMap(event => {
      const command = mapGameplayEventToBgm(event);
      return command ? [command.action === "play" ? `${command.action}:${command.track}` : command.action] : [];
    }),
    ["play:stage", "stop"],
  );
});

const wavPeak = async relativePath => {
  const wav = await readFile(new URL(relativePath, import.meta.url));
  let peak = 0;
  for (let offset = 44; offset < wav.length; offset += 2) {
    peak = Math.max(peak, Math.abs(wav.readInt16LE(offset)) / 32_767);
  }
  return peak;
};

test("Worst accepted final-hit mix retains deterministic peak headroom", async () => {
  const hit = mapGameplayEventToSfx({ type: "enemy-hit", enemyId: 1, damage: 1, at: 1 });
  const death = mapGameplayEventToSfx({ type: "enemy-defeated", enemyId: 1, at: 1 });
  const stage = mapGameplayEventToBgm({ type: "title-started", source: "pointer", at: 1 });
  const boss = mapGameplayEventToBgm({ type: "boss-activated", bossId: "warlord", at: 1 });
  assert.equal(hit?.volume, 0.6);
  assert.equal(death?.volume, 0.5);
  assert.equal(stage?.action, "play");
  assert.equal(boss?.action, "play");

  const [hitPeak, deathPeak, stagePeak, bossPeak] = await Promise.all([
    wavPeak("../public/audio/sfx/hit-confirmed.wav"),
    wavPeak("../public/audio/sfx/enemy-death.wav"),
    wavPeak("../public/audio/music/stage-bamboo.wav"),
    wavPeak("../public/audio/music/boss-warlord.wav"),
  ]);
  const stageFinalHit = hitPeak * hit.volume + deathPeak * death.volume
    + stagePeak * stage.volume;
  const bossFinalHit = hitPeak * hit.volume + deathPeak * death.volume
    + bossPeak * boss.volume;

  assert.ok(stageFinalHit < 1, `Stage final-hit peak ${stageFinalHit} must retain headroom`);
  assert.ok(bossFinalHit < 1, `Boss final-hit peak ${bossFinalHit} must retain headroom`);
});
