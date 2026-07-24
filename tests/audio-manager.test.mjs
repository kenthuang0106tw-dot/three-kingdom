import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { AudioManager } from "../app/game/audio/AudioManager.ts";
import { GameplayEventHub } from "../app/game/events/GameplayEvents.ts";

class TestSoundBackend {
  locked = true;
  pauseCount = 0;
  resumeCount = 0;
  stopCount = 0;
  unlockCount = 0;
  plays = [];
  unlockedListeners = new Set();

  pauseAll() { this.pauseCount += 1; }
  resumeAll() { this.resumeCount += 1; }
  stopAll() { this.stopCount += 1; }
  play(key, config) {
    this.plays.push({ key, config });
    return true;
  }
  unlock() {
    this.unlockCount += 1;
    this.locked = false;
    for (const listener of this.unlockedListeners) listener();
  }
  on(_event, listener) { this.unlockedListeners.add(listener); }
  off(_event, listener) { this.unlockedListeners.delete(listener); }
}

class TestLifecycleSource {
  listeners = {
    blur: new Set(),
    focus: new Set(),
  };

  on(event, listener) { this.listeners[event].add(listener); }
  off(event, listener) { this.listeners[event].delete(listener); }
  emit(event) {
    for (const listener of this.listeners[event]) listener();
  }
}

const makeManager = () => {
  const sound = new TestSoundBackend();
  const lifecycle = new TestLifecycleSource();
  const events = new GameplayEventHub();
  const manager = new AudioManager(sound, lifecycle, events);
  return { manager, sound, lifecycle, events };
};

test("Audio manager owns separate clamped SFX and BGM channel state", () => {
  const { manager } = makeManager();
  manager.setChannelVolume("sfx", 1.4);
  manager.setChannelVolume("bgm", -0.2);
  manager.setChannelMuted("bgm", true);

  const snapshot = manager.getSnapshot();
  assert.deepEqual(snapshot.channels, {
    sfx: { volume: 1, muted: false },
    bgm: { volume: 0, muted: true },
  });
  assert.ok(Object.isFrozen(snapshot));
  assert.ok(Object.isFrozen(snapshot.channels));
});

test("Audio manager start, pause reasons, stop, restart, and destroy are idempotent", () => {
  const { manager, sound, lifecycle, events } = makeManager();
  assert.equal(manager.start(), true);
  assert.equal(manager.start(), false);
  assert.equal(lifecycle.listeners.blur.size, 1);
  assert.equal(lifecycle.listeners.focus.size, 1);

  events.publish({ type: "player-attack-started", step: 1, at: 1 });
  assert.equal(manager.getSnapshot().eventCount, 1);
  assert.equal(manager.getSnapshot().lastEventType, "player-attack-started");

  manager.setManualPaused(true);
  manager.setManualPaused(true);
  lifecycle.emit("blur");
  assert.equal(sound.pauseCount, 1);
  manager.setManualPaused(false);
  assert.equal(sound.resumeCount, 0);
  lifecycle.emit("focus");
  assert.equal(sound.resumeCount, 1);

  assert.equal(manager.stop(), true);
  assert.equal(manager.stop(), false);
  assert.equal(lifecycle.listeners.blur.size, 0);
  assert.equal(manager.getSnapshot().subscriptionCount, 0);
  events.publish({ type: "stage-completed", stageId: "stage", at: 2 });
  assert.equal(manager.getSnapshot().eventCount, 1);

  assert.equal(manager.start(), true);
  events.publish({ type: "player-hit", enemyId: 1, at: 3 });
  assert.equal(manager.getSnapshot().eventCount, 2);
  assert.equal(manager.destroy(), true);
  assert.equal(manager.destroy(), false);
  assert.equal(manager.getSnapshot().status, "destroyed");
  assert.equal(manager.getSnapshot().subscriptionCount, 0);
});

test("Audio manager unlock and reset do not pretend locked output is playable", () => {
  const { manager, sound } = makeManager();
  manager.start();
  assert.equal(manager.getSnapshot().unlocked, false);
  assert.equal(manager.requestUnlock(), true);
  assert.equal(sound.unlockCount, 1);
  assert.equal(manager.getSnapshot().unlocked, true);

  manager.setChannelVolume("sfx", 0.25);
  manager.setChannelMuted("bgm", true);
  manager.setManualPaused(true);
  manager.reset();
  assert.equal(sound.stopCount, 1);
  assert.equal(sound.resumeCount, 1);
  assert.equal(manager.getSnapshot().paused, false);
  assert.deepEqual(manager.getSnapshot().channels, {
    sfx: { volume: 1, muted: false },
    bgm: { volume: 1, muted: false },
  });
});

test("Audio manager maps events once, coalesces same-frame hits, and respects SFX state", () => {
  const { manager, sound, events } = makeManager();
  sound.locked = false;
  manager.start();
  manager.requestUnlock();

  events.publish({ type: "enemy-hit", enemyId: 1, damage: 1, at: 20 });
  events.publish({ type: "enemy-hit", enemyId: 2, damage: 1, at: 20 });
  assert.equal(sound.plays.length, 1);
  assert.equal(sound.plays[0].key, "sfx-hit-confirmed");
  assert.equal(manager.getSnapshot().suppressedCount, 1);

  manager.setChannelVolume("sfx", 0.5);
  events.publish({ type: "player-attack-started", step: 2, at: 21 });
  assert.deepEqual(sound.plays[1], {
    key: "sfx-player-attack",
    config: { volume: 0.24, detune: 80 },
  });

  manager.setChannelMuted("sfx", true);
  events.publish({ type: "player-hit", enemyId: 3, at: 22 });
  assert.equal(sound.plays.length, 2);
  assert.equal(manager.getSnapshot().suppressedCount, 2);
});

test("Audio manager queues locked cues and allows only the pause cue during manual pause", () => {
  const { manager, sound, events } = makeManager();
  manager.start();
  events.publish({ type: "title-started", source: "pointer", at: 1 });
  assert.equal(sound.plays.length, 0);
  assert.equal(manager.getSnapshot().pendingCueCount, 1);

  manager.requestUnlock();
  assert.equal(sound.plays[0].key, "sfx-ui-start");
  assert.equal(manager.getSnapshot().pendingCueCount, 0);

  manager.setManualPaused(true);
  events.publish({ type: "ui-action", action: "pause", at: 2 });
  events.publish({ type: "player-attack-started", step: 1, at: 2 });
  assert.equal(sound.plays.at(-1).key, "sfx-ui-pause");
  assert.equal(manager.getSnapshot().suppressedCount, 1);
});

test("MainScene owns one Audio manager and removes the old direct hit-sound seam", async () => {
  const source = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.match(source, /private audioManager!: AudioManager/);
  assert.match(source, /this\.audioManager = new AudioManager\(/);
  assert.match(source, /this\.audioManager\.start\(\)/);
  assert.match(source, /this\.audioManager\.requestUnlock\(\)/);
  assert.match(source, /this\.audioManager\.setManualPaused\(true\)/);
  assert.match(source, /this\.audioManager\.setManualPaused\(false\)/);
  assert.match(source, /this\.audioManager\.destroy\(\)/);
  assert.doesNotMatch(source, /playHitSound/);
});
