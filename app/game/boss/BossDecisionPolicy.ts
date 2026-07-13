import type { BossAttackDefinition } from "./BossAttackMetadata";
import type { BossState } from "./BossLifecycle";
import type { GameplayClock, RandomSource } from "../time/GameplayTime";

export const BOSS_DECISION_TIMING = Object.freeze({
  recoveryMinMs: 900,
  recoveryMaxMs: 1300,
});

type BossAttackKey = BossAttackDefinition["key"];

/** Phaser-free attack selection and post-attack recovery policy for the first Boss. */
export class BossDecisionPolicy {
  private readonly clock: GameplayClock;
  private readonly random: RandomSource;
  private readonly attacks: readonly BossAttackDefinition[];
  private selectedAttack: BossAttackKey | null = null;
  private recoveryEndsAt = 0;

  constructor(clock: GameplayClock, random: RandomSource, attacks: readonly BossAttackDefinition[]) {
    this.clock = clock;
    this.random = random;
    this.attacks = attacks;
  }

  selectAttack(state: BossState): BossAttackKey | null {
    if (state !== "idle" || this.selectedAttack !== null || this.clock.now() < this.recoveryEndsAt) {
      return null;
    }
    if (this.attacks.length === 0) return null;
    const attack = this.attacks[this.random.between(0, this.attacks.length - 1)];
    if (!attack) return null;
    this.selectedAttack = attack.key;
    return attack.key;
  }

  completeAttack(state: BossState): boolean {
    if (state !== "attack" || this.selectedAttack === null) return false;
    this.selectedAttack = null;
    this.recoveryEndsAt = this.clock.now() + this.random.between(
      BOSS_DECISION_TIMING.recoveryMinMs,
      BOSS_DECISION_TIMING.recoveryMaxMs,
    );
    return true;
  }

  reset(): void {
    this.selectedAttack = null;
    this.recoveryEndsAt = this.clock.now();
  }
}
