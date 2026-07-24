import type { GameplayEvent, GameplayEventHub } from "../events/GameplayEvents";
import { mapGameplayEventToBgm, type BgmCommand, type BgmTrackId } from "./BgmCatalog.ts";
import { mapGameplayEventToSfx, type SfxCommand, type SfxCueId } from "./SfxCatalog.ts";

export type AudioChannel = "sfx" | "bgm";
export type AudioPauseReason = "manual" | "visibility";
export type AudioManagerStatus = "stopped" | "running" | "destroyed";
export type AudioContextStatus = "unavailable" | "running" | "suspended" | "interrupted" | "closed";

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
  currentBgm: BgmTrackId | null;
  pendingBgm: BgmTrackId | null;
  bgmStartCount: number;
  bgmTransitionCount: number;
  bgmStopCount: number;
  contextState: AudioContextStatus;
  recoveryPending: boolean;
  recoveryCount: number;
  staleCueDropCount: number;
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

export interface AudioContextBackend {
  readonly state: string;
  resume(): Promise<void>;
  addEventListener(event: "statechange", listener: () => void): void;
  removeEventListener(event: "statechange", listener: () => void): void;
}

export interface AudioTrackBackend {
  play(): boolean;
  stop(): boolean;
  destroy(): void;
  setVolume(volume: number): unknown;
}

export type AudioTrackFactory = (
  key: string,
  config: { loop: boolean; volume: number },
) => AudioTrackBackend;

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
  private readonly createTrack?: AudioTrackFactory;
  private readonly context?: AudioContextBackend;
  private desiredBgm?: Extract<BgmCommand, { action: "play" }>;
  private activeBgm?: AudioTrackBackend;
  private activeBgmId: BgmTrackId | null = null;
  private bgmStartCount = 0;
  private bgmTransitionCount = 0;
  private bgmStopCount = 0;
  private recoveryPending = false;
  private recoveryCount = 0;
  private staleCueDropCount = 0;

  private readonly onBlur = () => {
    this.dropPendingCues();
    this.setPauseReason("visibility", true);
  };
  private readonly onFocus = () => {
    this.setPauseReason("visibility", false);
    if (!this.outputPaused) this.requestContextRecovery();
  };
  private readonly onUnlocked = () => {
    this.syncOutputReadiness();
  };
  private readonly onContextStateChange = () => this.syncOutputReadiness();
  private readonly onGameplayEvent = (event: GameplayEvent) => {
    this.eventCount += 1;
    this.lastEventType = event.type;
    const bgm = mapGameplayEventToBgm(event);
    if (bgm) this.handleBgmCommand(bgm);
    const cue = mapGameplayEventToSfx(event);
    if (!cue) return;
    if (this.lastCueAt.get(cue.cue) === event.at) {
      this.suppressedCount += 1;
      return;
    }
    this.lastCueAt.set(cue.cue, event.at);
    if (!this.isOutputReady()) {
      if (this.canQueueUnavailableCue(event)) this.pendingCues.set(cue.cue, cue);
      else this.suppressedCount += 1;
      return;
    }
    this.playCue(cue);
  };

  constructor(
    sound: AudioSoundBackend,
    lifecycle: AudioLifecycleSource,
    gameplayEvents: GameplayEventHub,
    createTrack?: AudioTrackFactory,
    context?: AudioContextBackend,
  ) {
    this.sound = sound;
    this.lifecycle = lifecycle;
    this.gameplayEvents = gameplayEvents;
    this.createTrack = createTrack;
    this.context = context;
    this.unlocked = this.calculateOutputReadiness();
  }

  start(): boolean {
    if (this.status === "destroyed" || this.status === "running") return false;
    this.status = "running";
    this.unsubscribeGameplay = this.gameplayEvents.subscribe(this.onGameplayEvent);
    this.lifecycle.on("blur", this.onBlur);
    this.lifecycle.on("focus", this.onFocus);
    this.sound.on?.("unlocked", this.onUnlocked);
    this.context?.addEventListener("statechange", this.onContextStateChange);
    this.syncOutputReadiness();
    return true;
  }

  requestUnlock(): boolean {
    if (this.status === "destroyed") return false;
    if (this.sound.locked === true) this.sound.unlock?.();
    this.requestContextRecovery();
    this.syncOutputReadiness();
    return this.unlocked;
  }

  setManualPaused(paused: boolean): void {
    this.setPauseReason("manual", paused);
  }

  setChannelVolume(channel: AudioChannel, volume: number): void {
    if (this.status === "destroyed") return;
    this.channels[channel].volume = Math.min(1, Math.max(0, volume));
    if (channel === "bgm") this.updateBgmVolume();
  }

  setChannelMuted(channel: AudioChannel, muted: boolean): void {
    if (this.status === "destroyed") return;
    this.channels[channel].muted = muted;
    if (channel === "bgm") this.updateBgmVolume();
  }

  reset(): void {
    if (this.status === "destroyed") return;
    this.channels = defaultChannels();
    this.pauseReasons.clear();
    this.desiredBgm = undefined;
    this.stopActiveBgm();
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
    this.bgmStartCount = 0;
    this.bgmTransitionCount = 0;
    this.bgmStopCount = 0;
    this.recoveryCount = 0;
    this.staleCueDropCount = 0;
  }

  stop(): boolean {
    if (this.status !== "running") return false;
    this.detach();
    this.desiredBgm = undefined;
    this.stopActiveBgm();
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
      currentBgm: this.activeBgmId,
      pendingBgm: this.desiredBgm && this.activeBgmId !== this.desiredBgm.track
        ? this.desiredBgm.track
        : null,
      bgmStartCount: this.bgmStartCount,
      bgmTransitionCount: this.bgmTransitionCount,
      bgmStopCount: this.bgmStopCount,
      contextState: this.contextState(),
      recoveryPending: this.recoveryPending,
      recoveryCount: this.recoveryCount,
      staleCueDropCount: this.staleCueDropCount,
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
    else {
      this.sound.resumeAll();
      this.requestContextRecovery();
      if (this.isOutputReady()) this.startDesiredBgm();
    }
  }

  private handleBgmCommand(command: BgmCommand): void {
    if (command.action === "stop") {
      this.desiredBgm = undefined;
      this.stopActiveBgm();
      return;
    }
    if (command.track === "stage"
      && (this.desiredBgm?.track === "boss" || this.activeBgmId === "boss")) return;
    this.desiredBgm = command;
    this.startDesiredBgm();
  }

  private startDesiredBgm(): boolean {
    const command = this.desiredBgm;
    if (!command || this.activeBgmId === command.track) return false;
    if (this.status !== "running" || !this.isOutputReady() || this.outputPaused || !this.createTrack) return false;

    const replacingTrack = this.activeBgm !== undefined;
    if (replacingTrack) this.stopActiveBgm();
    const track = this.createTrack(command.key, {
      loop: true,
      volume: this.bgmVolume(command.volume),
    });
    if (!track.play()) {
      track.destroy();
      this.suppressedCount += 1;
      return false;
    }
    this.activeBgm = track;
    this.activeBgmId = command.track;
    this.bgmStartCount += 1;
    if (replacingTrack) this.bgmTransitionCount += 1;
    return true;
  }

  private stopActiveBgm(): boolean {
    const track = this.activeBgm;
    if (!track) return false;
    track.stop();
    track.destroy();
    this.activeBgm = undefined;
    this.activeBgmId = null;
    this.bgmStopCount += 1;
    return true;
  }

  private updateBgmVolume(): void {
    if (!this.activeBgm || !this.desiredBgm) return;
    this.activeBgm.setVolume(this.bgmVolume(this.desiredBgm.volume));
  }

  private bgmVolume(baseVolume: number): number {
    const channel = this.channels.bgm;
    return channel.muted ? 0 : baseVolume * channel.volume;
  }

  private playCue(command: SfxCommand): boolean {
    const channel = this.channels.sfx;
    const pauseAllowed = command.cue === "ui-pause"
      && this.pauseReasons.has("manual")
      && !this.pauseReasons.has("visibility");
    if (this.status !== "running" || !this.isOutputReady() || (this.outputPaused && !pauseAllowed)
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

  private canQueueUnavailableCue(event: GameplayEvent): boolean {
    return event.type === "title-started"
      || (event.type === "ui-action" && (event.action === "retry" || event.action === "replay"));
  }

  private dropPendingCues(): void {
    this.staleCueDropCount += this.pendingCues.size;
    this.pendingCues.clear();
  }

  private contextState(): AudioContextStatus {
    if (!this.context) return "unavailable";
    const state = this.context.state;
    if (state === "running" || state === "suspended" || state === "interrupted" || state === "closed") return state;
    return "suspended";
  }

  private calculateOutputReadiness(): boolean {
    const contextReady = !this.context || this.context.state === "running";
    return this.sound.locked !== true && contextReady;
  }

  private isOutputReady(): boolean {
    return this.unlocked && this.calculateOutputReadiness();
  }

  private syncOutputReadiness(): void {
    if (this.status === "destroyed") return;
    if (this.context?.state === "running") this.recoveryPending = false;
    const wasUnlocked = this.unlocked;
    this.unlocked = this.calculateOutputReadiness();
    if (!this.unlocked || this.outputPaused) return;
    if (!wasUnlocked) this.recoveryCount += 1;
    this.startDesiredBgm();
    this.flushPendingCues();
  }

  private requestContextRecovery(): boolean {
    const context = this.context;
    if (!context || context.state === "running" || context.state === "closed" || this.recoveryPending) return false;
    if (this.pauseReasons.has("manual")) return false;
    this.recoveryPending = true;
    try {
      void context.resume()
        .then(() => this.syncOutputReadiness())
        .catch(() => undefined)
        .finally(() => {
          this.recoveryPending = false;
          this.syncOutputReadiness();
        });
    } catch {
      this.recoveryPending = false;
      return false;
    }
    return true;
  }

  private detach(): void {
    this.unsubscribeGameplay?.();
    this.unsubscribeGameplay = undefined;
    this.lifecycle.off("blur", this.onBlur);
    this.lifecycle.off("focus", this.onFocus);
    this.sound.off?.("unlocked", this.onUnlocked);
    this.context?.removeEventListener("statechange", this.onContextStateChange);
    this.pendingCues.clear();
    this.desiredBgm = undefined;
  }
}
