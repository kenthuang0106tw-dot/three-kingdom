import type { AttackStep, PlayerAttackMetadata } from "./PlayerDefinition.ts";

export function attackDurationMs(attack: PlayerAttackMetadata): number {
  return attack.frames.reduce((total, _frame, index) => total + (1000 / attack.frameRate) + attack.extraFrameDurationsMs[index], 0);
}

/** Owns attack frame timing decisions without owning hit resolution or input. */
export class PlayerAttackController {
  private readonly attacks: Readonly<Record<AttackStep, PlayerAttackMetadata>>;
  private current?: PlayerAttackMetadata;

  constructor(attacks: Readonly<Record<AttackStep, PlayerAttackMetadata>>) {
    this.attacks = attacks;
  }

  get activeAttack(): PlayerAttackMetadata | undefined { return this.current; }

  begin(step: AttackStep): PlayerAttackMetadata {
    this.current = this.attacks[step];
    return this.current;
  }

  isAttackAnimation(animationKey: string): boolean {
    return Object.values(this.attacks).some(attack => attack.animationKey === animationKey);
  }

  isActiveFrame(animationKey: string, frameIndex: number): boolean {
    const attack = Object.values(this.attacks).find(item => item.animationKey === animationKey);
    return attack?.activeFrames.includes(frameIndex) ?? false;
  }

  finish(): void { this.current = undefined; }
}
