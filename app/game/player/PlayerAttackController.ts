export type AttackStep = 1 | 2 | 3;

export type AttackMetadata = Readonly<{
  step: AttackStep;
  animationKey: string;
  frames: readonly string[];
  frameRate: 8;
  startupFrames: readonly number[];
  activeFrames: readonly number[];
  recoveryFrames: readonly number[];
}>;

export const PLAYER_ATTACKS: Readonly<Record<AttackStep, AttackMetadata>> = {
  1: { step: 1, animationKey: "guanyu-attack1", frames: ["attack-0", "attack-1", "attack-0"], frameRate: 8, startupFrames: [0], activeFrames: [2], recoveryFrames: [1] },
  2: { step: 2, animationKey: "guanyu-attack2", frames: ["attack-2", "attack-3", "attack-2"], frameRate: 8, startupFrames: [0], activeFrames: [2], recoveryFrames: [1] },
  3: { step: 3, animationKey: "guanyu-attack3", frames: ["attack-4", "attack-5", "attack-4"], frameRate: 8, startupFrames: [0], activeFrames: [2], recoveryFrames: [1] },
};

/** Owns attack frame timing decisions without owning hit resolution or input. */
export class PlayerAttackController {
  private current?: AttackMetadata;

  get activeAttack(): AttackMetadata | undefined { return this.current; }

  begin(step: AttackStep): AttackMetadata {
    this.current = PLAYER_ATTACKS[step];
    return this.current;
  }

  isAttackAnimation(animationKey: string): boolean {
    return Object.values(PLAYER_ATTACKS).some(attack => attack.animationKey === animationKey);
  }

  isActiveFrame(animationKey: string, frameIndex: number): boolean {
    const attack = Object.values(PLAYER_ATTACKS).find(item => item.animationKey === animationKey);
    return attack?.activeFrames.includes(frameIndex) ?? false;
  }

  finish(): void { this.current = undefined; }
}
