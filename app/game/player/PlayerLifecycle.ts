export type PlayerLifeState = "alive" | "dead";

export type DamageResult = Readonly<{
  applied: boolean;
  damage: number;
  hp: number;
  becameDead: boolean;
}>;

/** Owns player HP and the terminal life state without Phaser dependencies. */
export class PlayerLifecycle {
  readonly maxHp: number;
  hp: number;
  state: PlayerLifeState = "alive";

  constructor(maxHp: number) {
    this.maxHp = maxHp;
    this.hp = maxHp;
  }

  applyDamage(amount: number): DamageResult {
    if (this.state === "dead") return { applied: false, damage: 0, hp: this.hp, becameDead: false };
    const damage = Math.max(0, Math.floor(amount));
    this.hp = Math.max(0, this.hp - damage);
    const becameDead = this.hp === 0;
    if (becameDead) this.state = "dead";
    return { applied: damage > 0, damage, hp: this.hp, becameDead };
  }

  reset() {
    this.hp = this.maxHp;
    this.state = "alive";
  }
}
