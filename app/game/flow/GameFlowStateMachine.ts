export type GameFlowState = "title" | "playing" | "paused" | "failed" | "cleared";

export type GameFlowTransition = Readonly<{
  previous: GameFlowState;
  next: GameFlowState;
}>;

const ALLOWED_TRANSITIONS: Readonly<Record<GameFlowState, ReadonlySet<GameFlowState>>> = {
  title: new Set(["playing"]),
  playing: new Set(["paused", "failed", "cleared"]),
  paused: new Set(["playing", "failed"]),
  failed: new Set(),
  cleared: new Set(),
};

/** Owns product-flow modes only; Scene lifecycle and presentation stay outside. */
export class GameFlowStateMachine {
  private current: GameFlowState = "title";

  get state(): GameFlowState {
    return this.current;
  }

  canTransition(next: GameFlowState): boolean {
    return next === this.current || ALLOWED_TRANSITIONS[this.current].has(next);
  }

  transition(next: GameFlowState): GameFlowTransition | undefined {
    if (next === this.current) return undefined;
    if (!ALLOWED_TRANSITIONS[this.current].has(next)) {
      throw new Error(`Invalid game-flow transition: ${this.current} -> ${next}`);
    }

    const previous = this.current;
    this.current = next;
    return { previous, next };
  }

  resetForNewRun(): void {
    this.current = "title";
  }
}
