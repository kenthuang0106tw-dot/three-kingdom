export type PlayerState = "idle" | "walk" | "attack1" | "attack2" | "attack3" | "hurt" | "dead";

export type PlayerTransition = Readonly<{ previous: PlayerState; next: PlayerState }>;

const ALLOWED_TRANSITIONS: Readonly<Record<PlayerState, ReadonlySet<PlayerState>>> = {
  idle: new Set(["walk", "attack1", "hurt", "dead"]),
  walk: new Set(["idle", "attack1", "hurt", "dead"]),
  attack1: new Set(["idle", "attack2", "hurt", "dead"]),
  attack2: new Set(["idle", "attack3", "hurt", "dead"]),
  attack3: new Set(["idle", "hurt", "dead"]),
  hurt: new Set(["idle", "dead"]),
  dead: new Set(),
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
