export type PlayerState = "idle" | "walk" | "attack1" | "attack2" | "attack3" | "hurt";

export type PlayerTransition = Readonly<{ previous: PlayerState; next: PlayerState }>;

const ALLOWED_TRANSITIONS: Readonly<Record<PlayerState, ReadonlySet<PlayerState>>> = {
  idle: new Set(["walk", "attack1", "hurt"]),
  walk: new Set(["idle", "attack1", "hurt"]),
  attack1: new Set(["idle", "attack2", "hurt"]),
  attack2: new Set(["idle", "attack3", "hurt"]),
  attack3: new Set(["idle", "hurt"]),
  hurt: new Set(["idle"]),
};

/** Pure player transition boundary; rendering, input, and combat stay outside. */
export class PlayerStateMachine {
  private current: PlayerState = "idle";

  get state(): PlayerState { return this.current; }

  canTransition(next: PlayerState): boolean {
    return next === this.current || ALLOWED_TRANSITIONS[this.current].has(next);
  }

  transition(next: PlayerState): PlayerTransition | undefined {
    if (next === this.current) return undefined;
    if (!ALLOWED_TRANSITIONS[this.current].has(next)) {
      throw new Error(`Invalid player transition: ${this.current} -> ${next}`);
    }
    const previous = this.current;
    this.current = next;
    return { previous, next };
  }

  reset(): void { this.current = "idle"; }
}
