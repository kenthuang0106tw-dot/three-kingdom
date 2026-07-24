import type { GameplayEvent, GameplayEventHub } from "../events/GameplayEvents";
import { mapGameplayEventToSfx, type SfxCommand, type SfxCueId } from "./SfxCatalog.ts";

export type AudioChannel = "sfx" | "bgm";
export type AudioPauseReason = "manual" | "visibility";
export type AudioManagerStatus = "stopped" | "running" | "destroyed";

export type AudioChannelSnapshot = Readonly<{
  volume: number;
  muted: boolean;
}>;

export type AudioManagerSnapshot = Readonly<{
  status: AudioManagerStatus;
  unlocked: boolean;
  paused: boolean;
  subscriptionCount: number;
  eventCount: number;
  lastEventType: GameplayEvent["type"] | null;
  playCount: number;
  suppressedCount: number;
  lastCue: SfxCueId | null;
  pendingCueCount: number;
  channels: Readonly<Record<AudioChannel, AudioChannelSnapshot>>;
}>;

export interface AudioSoundBackend {
  locked?: boolean;
  pauseAll(): void;
  resumeAll(): void;
  stopAll(): void;
  play(key: string, config?: { volume?: number; detune?: number }): boolean;
  unlock?(): void;
  on?(event: "unlocked", listener: () => void): unknown;
  off?(event: "unlocked", listener: () => void): unknown;
}

export interface AudioLifecycleSource {
  on(event: "blur" | "focus", listener: () => void): unknown;
  off(event: "blur" | "focus", listener: () => void): unknown;
}

const defaultChannels = (): Record<AudioChannel, { volume: number; muted: boolean }> => ({
  sfx: { volume: 1, muted: false },
  bgm: { volume: 1, muted: false },
});

/** Scene-owned Audio state, event mapping, playback, and lifecycle boundary. */
export class AudioManager {
  private readonly sound: AudioSoundBackend;
  private readonly lifecycle: AudioLifecycleSource;
  private readonly gameplayEvents: GameplayEventHub;
  private status: AudioManagerStatus = "stopped";
  private channels = defaultChannels();
  private readonly pauseReasons = new Set<AudioPauseReason>();
  private unsubscribeGameplay?: () => boolean;
  private outputPaused = false;
  private unlocked: boolean;
  private eventCount = 0;
  private lastEventType: GameplayEvent["type"] | null = null;
  private playCount = 0;
  private suppressedCount = 0;
  private lastCue: SfxCueId | null = null;
  private readonly lastCueAt = new Map<SfxCueId, number>();
  private readonly pendingCues = new Map<SfxCueId, SfxCommand>();

  private readonly onBlur = () => this.setPauseReason("visibility", true);
  private readonly onFocus = () => this.setPauseReason("visibility", false);
  private readonly onUnlocked = () => {
    this.unlocked = true;
    this.flushPendingCues();
  };
  private readonly onGameplayEvent = (event: GameplayEvent) => {
    this.eventCount += 1;
    this.lastEventType = event.type;
    const cue = mapGameplayEventToSfx(event);
    if (!cue) return;
    if (this.lastCueAt.get(cue.cue) === event.at) {
      this.suppressedCount += 1;
      return;
    }
    this.lastCueAt.set(cue.cue, event.at);
    if (!this.unlocked) {
      this.pendingCues.set(cue.cue, cue);
      return;
    }
    this.playCue(cue);
  };

  constructor(
    sound: AudioSoundBackend,
    lifecycle: AudioLifecycleSource,
    gameplayEvents: GameplayEventHub,
  ) {
    this.sound = sound;
    this.lifecycle = lifecycle;
    this.gameplayEvents = gameplayEvents;
    this.unlocked = sound.locked !== true;
  }

  start(): boolean {
    if (this.status === "destroyed" || this.status === "running") return false;
    this.status = "running";
    this.unsubscribeGameplay = this.gameplayEvents.subscribe(this.onGameplayEvent);
    this.lifecycle.on("blur", this.onBlur);
    this.lifecycle.on("focus", this.onFocus);
    this.sound.on?.("unlocked", this.onUnlocked);
    return true;
  }

  requestUnlock(): boolean {
    if (this.status === "destroyed") return false;
    if (this.unlocked || this.sound.locked !== true) {
      const wasUnlocked = this.unlocked;
      this.unlocked = true;
      if (!wasUnlocked) this.flushPendingCues();
      return true;
    }
    this.sound.unlock?.();
    this.unlocked = this.sound.locked !== true;
    if (this.unlocked) this.flushPendingCues();
    return this.unlocked;
  }

  setManualPaused(paused: boolean): void {
    this.setPauseReason("manual", paused);
  }

  setChannelVolume(channel: AudioChannel, volume: number): void {
    if (this.status === "destroyed") return;
    this.channels[channel].volume = Math.min(1, Math.max(0, volume));
  }

  setChannelMuted(channel: AudioChannel, muted: boolean): void {
    if (this.status === "destroyed") return;
    this.channels[channel].muted = muted;
  }

  reset(): void {
    if (this.status === "destroyed") return;
    this.channels = defaultChannels();
    this.pauseReasons.clear();
    this.sound.stopAll();
    if (this.outputPaused && this.status === "running") this.sound.resumeAll();
    this.outputPaused = false;
    this.eventCount = 0;
    this.lastEventType = null;
    this.playCount = 0;
    this.suppressedCount = 0;
    this.lastCue = null;
    this.lastCueAt.clear();
    this.pendingCues.clear();
  }

  stop(): boolean {
    if (this.status !== "running") return false;
    this.detach();
    this.sound.stopAll();
    this.pauseReasons.clear();
    this.outputPaused = false;
    this.status = "stopped";
    return true;
  }

  destroy(): boolean {
    if (this.status === "destroyed") return false;
    if (this.status === "running") this.stop();
    else this.sound.stopAll();
    this.status = "destroyed";
    return true;
  }

  getSnapshot(): AudioManagerSnapshot {
    return Object.freeze({
      status: this.status,
      unlocked: this.unlocked,
      paused: this.outputPaused,
      subscriptionCount: this.unsubscribeGameplay ? 1 : 0,
      eventCount: this.eventCount,
      lastEventType: this.lastEventType,
      playCount: this.playCount,
      suppressedCount: this.suppressedCount,
      lastCue: this.lastCue,
      pendingCueCount: this.pendingCues.size,
      channels: Object.freeze({
        sfx: Object.freeze({ ...this.channels.sfx }),
        bgm: Object.freeze({ ...this.channels.bgm }),
      }),
    });
  }

  private setPauseReason(reason: AudioPauseReason, paused: boolean): void {
    if (this.status !== "running") return;
    if (paused) this.pauseReasons.add(reason);
    else this.pauseReasons.delete(reason);
    const shouldPause = this.pauseReasons.size > 0;
    if (shouldPause === this.outputPaused) return;
    this.outputPaused = shouldPause;
    if (shouldPause) this.sound.pauseAll();
    else this.sound.resumeAll();
  }

  private playCue(command: SfxCommand): boolean {
    const channel = this.channels.sfx;
    const pauseAllowed = command.cue === "ui-pause"
      && this.pauseReasons.has("manual")
      && !this.pauseReasons.has("visibility");
    if (this.status !== "running" || !this.unlocked || (this.outputPaused && !pauseAllowed)
      || channel.muted || channel.volume === 0) {
      this.suppressedCount += 1;
      return false;
    }
    const played = this.sound.play(command.key, {
      volume: command.volume * channel.volume,
      ...(command.detune === undefined ? {} : { detune: command.detune }),
    });
    if (!played) {
      this.suppressedCount += 1;
      return false;
    }
    this.playCount += 1;
    this.lastCue = command.cue;
    return true;
  }

  private flushPendingCues(): void {
    const pending = [...this.pendingCues.values()];
    this.pendingCues.clear();
    for (const cue of pending) this.playCue(cue);
  }

  private detach(): void {
    this.unsubscribeGameplay?.();
    this.unsubscribeGameplay = undefined;
    this.lifecycle.off("blur", this.onBlur);
    this.lifecycle.off("focus", this.onFocus);
    this.sound.off?.("unlocked", this.onUnlocked);
    this.pendingCues.clear();
  }
}
