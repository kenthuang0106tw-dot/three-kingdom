export type BossState = "inactive" | "idle" | "attack" | "hurt" | "dead" | "cleaned";

export type BossDamageResult = Readonly<{
  applied: boolean;
  damage: number;
  hp: number;
  becameDead: boolean;
}>;

const ALLOWED_TRANSITIONS: Readonly<Record<BossState, ReadonlySet<BossState>>> = {
  inactive: new Set(["idle"]),
  idle: new Set(["attack", "hurt", "dead", "cleaned"]),
  attack: new Set(["idle", "hurt", "dead", "cleaned"]),
  hurt: new Set(["idle", "dead", "cleaned"]),
  dead: new Set(["cleaned"]),
  cleaned: new Set(),
};

/** Phaser-free owner of the first Boss HP, state, cleanup, and reset contract. */
export class BossLifecycle {
  readonly maxHp: number;
  hp: number;
  private current: BossState = "inactive";

  constructor(maxHp: number) {
    if (!Number.isInteger(maxHp) || maxHp <= 0) throw new Error("Boss max HP must be a positive integer");
    this.maxHp = maxHp;
    this.hp = maxHp;
  }

  get state(): BossState { return this.current; }

  activate(): void { this.transition("idle"); }

  transition(next: BossState): void {
    if (next === this.current) return;
    if (!ALLOWED_TRANSITIONS[this.current].has(next)) {
      throw new Error(`Invalid Boss transition: ${this.current} -> ${next}`);
    }
    this.current = next;
  }

  applyDamage(amount: number): BossDamageResult {
    if (this.current === "inactive" || this.current === "dead" || this.current === "cleaned") {
      return { applied: false, damage: 0, hp: this.hp, becameDead: false };
    }
    const damage = Math.max(0, Math.floor(amount));
    if (damage === 0) return { applied: false, damage: 0, hp: this.hp, becameDead: false };
    this.hp = Math.max(0, this.hp - damage);
    const becameDead = this.hp === 0;
    this.transition(becameDead ? "dead" : "hurt");
    return { applied: true, damage, hp: this.hp, becameDead };
  }

  cleanup(): boolean {
    if (this.current === "inactive" || this.current === "cleaned") return false;
    this.transition("cleaned");
    return true;
  }

  reset(): void {
    this.hp = this.maxHp;
    this.current = "inactive";
  }
}
