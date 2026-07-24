import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { RUNTIME_ASSET_MANIFEST } from "../app/game/assets/AssetManifest.ts";
import { mapGameplayEventToSfx } from "../app/game/audio/SfxCatalog.ts";

const expectedIds = [
  "player-attack",
  "hit-confirmed",
  "player-hurt",
  "enemy-death",
  "ui-start",
  "ui-pause",
  "ui-resume",
  "ui-failure",
  "ui-result",
  "ui-confirm",
];

test("Combat and UI events map to immutable SFX commands", () => {
  const events = [
    { type: "player-attack-started", step: 1, at: 1 },
    { type: "enemy-hit", enemyId: 1, damage: 1, at: 2 },
    { type: "player-hit", enemyId: 1, at: 3 },
    { type: "enemy-defeated", enemyId: 1, at: 4 },
    { type: "title-started", source: "keyboard", at: 5 },
    { type: "ui-action", action: "pause", at: 6 },
    { type: "ui-action", action: "resume", at: 7 },
    { type: "player-state-changed", previous: "hurt", next: "dead", at: 8 },
    { type: "stage-completed", stageId: "bamboo", at: 9 },
    { type: "ui-action", action: "retry", at: 10 },
  ];
  assert.deepEqual(events.map(event => mapGameplayEventToSfx(event)?.cue), expectedIds);
  assert.ok(events.map(mapGameplayEventToSfx).every(command => Object.isFrozen(command)));
  assert.equal(mapGameplayEventToSfx({ type: "lifecycle-changed", paused: true, at: 11 }), undefined);
});

test("Runtime manifest owns every Combat/UI WAV file", () => {
  const audio = RUNTIME_ASSET_MANIFEST.filter(asset => asset.kind === "audio");
  assert.deepEqual(audio.map(asset => asset.key), expectedIds.map(id => `sfx-${id}`));
  assert.ok(audio.every(asset => asset.urls.length === 1 && asset.urls[0].endsWith(".wav")));
});

test("Generated SFX metadata, WAV headers, durations, and hashes are reproducible", async () => {
  const metadata = JSON.parse(await readFile(
    new URL("../public/audio/sfx/combat-ui-sfx.metadata.json", import.meta.url),
    "utf8",
  ));
  assert.equal(metadata.license, "Original project-owned procedural audio; no third-party samples or recordings.");
  assert.equal(metadata.source, "tools/build_combat_ui_sfx.mjs");
  assert.deepEqual(metadata.assets.map(asset => asset.id), expectedIds);

  for (const asset of metadata.assets) {
    const wav = await readFile(new URL(`../public/audio/sfx/${asset.filename}`, import.meta.url));
    assert.equal(wav.subarray(0, 4).toString(), "RIFF");
    assert.equal(wav.subarray(8, 12).toString(), "WAVE");
    assert.equal(wav.readUInt16LE(20), 1);
    assert.equal(wav.readUInt16LE(22), 1);
    assert.equal(wav.readUInt32LE(24), 22_050);
    assert.equal(wav.readUInt16LE(34), 16);
    assert.equal(createHash("sha256").update(wav).digest("hex"), asset.sha256);
    const durationMs = (wav.readUInt32LE(40) / 2 / 22_050) * 1000;
    assert.ok(Math.abs(durationMs - asset.durationMs) < 1);
    let peak = 0;
    for (let offset = 44; offset < wav.length; offset += 2) {
      peak = Math.max(peak, Math.abs(wav.readInt16LE(offset)));
    }
    assert.ok(peak > 4_000, `${asset.id} must contain an audible non-silent waveform`);
  }
});

test("MainScene publishes only semantic audio events and carries retry/replay across restart", async () => {
  const [scene, manager] = await Promise.all([
    readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/game/audio/AudioManager.ts", import.meta.url), "utf8"),
  ]);
  assert.match(scene, /type: "title-started"/);
  assert.match(scene, /type: "enemy-defeated"/);
  assert.match(scene, /type: "ui-action"/);
  assert.match(scene, /pendingRestartAudioAction/);
  assert.doesNotMatch(scene, /this\.sound\.play/);
  assert.match(manager, /mapGameplayEventToSfx/);
  assert.match(manager, /this\.sound\.play/);
});
