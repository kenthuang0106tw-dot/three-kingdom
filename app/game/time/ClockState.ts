export type ClockPauseReason = "visibility" | "hitStop";

/** Pure pause-reason state used by the Phaser lifecycle adapter and tests. */
export class ClockState {
  private readonly reasons = new Set<ClockPauseReason>();

  setPaused(reason: ClockPauseReason, paused: boolean) {
    if (paused) this.reasons.add(reason);
    else this.reasons.delete(reason);
  }

  isPaused() { return this.reasons.size > 0; }
  has(reason: ClockPauseReason) { return this.reasons.has(reason); }
}
