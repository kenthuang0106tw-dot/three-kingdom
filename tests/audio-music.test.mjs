import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { RUNTIME_ASSET_MANIFEST } from "../app/game/assets/AssetManifest.ts";
import { mapGameplayEventToBgm } from "../app/game/audio/BgmCatalog.ts";

test("Stage and Boss events map to immutable BGM commands", () => {
  const stage = mapGameplayEventToBgm({ type: "title-started", source: "pointer", at: 1 });
  const boss = mapGameplayEventToBgm({ type: "boss-activated", bossId: "warlord", at: 2 });
  const failed = mapGameplayEventToBgm({ type: "player-state-changed", previous: "hurt", next: "dead", at: 3 });
  const cleared = mapGameplayEventToBgm({ type: "stage-completed", stageId: "bamboo", at: 4 });

  assert.deepEqual(stage, { action: "play", track: "stage", key: "bgm-stage", volume: 0.3 });
  assert.deepEqual(boss, { action: "play", track: "boss", key: "bgm-boss", volume: 0.34 });
  assert.deepEqual(failed, { action: "stop" });
  assert.deepEqual(cleared, { action: "stop" });
  assert.ok([stage, boss, failed, cleared].every(command => Object.isFrozen(command)));
  assert.equal(mapGameplayEventToBgm({ type: "ui-action", action: "pause", at: 5 }), undefined);
});

test("Runtime manifest owns exactly the Stage and Boss music files", () => {
  const music = RUNTIME_ASSET_MANIFEST.filter(asset => asset.kind === "audio" && asset.key.startsWith("bgm-"));
  assert.deepEqual(music, [
    { kind: "audio", key: "bgm-stage", urls: ["/audio/music/stage-bamboo.wav"] },
    { kind: "audio", key: "bgm-boss", urls: ["/audio/music/boss-warlord.wav"] },
  ]);
});

test("Generated music metadata, WAV data, loop points, and hashes are reproducible", async () => {
  const metadata = JSON.parse(await readFile(
    new URL("../public/audio/music/stage-boss-music.metadata.json", import.meta.url),
    "utf8",
  ));
  assert.equal(metadata.license, "Original project-owned procedural composition and synthesis; no third-party samples or recordings.");
  assert.equal(metadata.source, "tools/build_stage_boss_music.mjs");
  assert.deepEqual(metadata.assets.map(asset => asset.id), ["stage", "boss"]);

  for (const asset of metadata.assets) {
    const wav = await readFile(new URL(`../public/audio/music/${asset.filename}`, import.meta.url));
    assert.equal(wav.subarray(0, 4).toString(), "RIFF");
    assert.equal(wav.subarray(8, 12).toString(), "WAVE");
    assert.equal(wav.readUInt16LE(20), 1);
    assert.equal(wav.readUInt16LE(22), 1);
    assert.equal(wav.readUInt32LE(24), 22_050);
    assert.equal(wav.readUInt16LE(34), 16);
    assert.equal(createHash("sha256").update(wav).digest("hex"), asset.sha256);
    const durationMs = (wav.readUInt32LE(40) / 2 / 22_050) * 1000;
    assert.ok(Math.abs(durationMs - asset.durationMs) < 1);
    assert.equal(asset.loopStartMs, 0);
    assert.equal(asset.loopEndMs, asset.durationMs);
    assert.ok(asset.durationMs >= 13_000 && asset.durationMs <= 18_000);
    assert.ok(Math.abs(wav.readInt16LE(44)) < 100);
    assert.ok(Math.abs(wav.readInt16LE(wav.length - 2)) < 1_500);
  }
});
