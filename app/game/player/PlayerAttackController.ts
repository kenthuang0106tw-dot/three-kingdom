import { GUANYU_ANIMATION_FRAMES } from "./GuanYuAnimationMetadata.ts";

export type AttackStep = 1 | 2 | 3;

export type AttackMetadata = Readonly<{
  step: AttackStep;
  animationKey: string;
  frames: readonly string[];
  frameRate: number;
  extraFrameDurationsMs: readonly number[];
  startupFrames: readonly number[];
  activeFrames: readonly number[];
  recoveryFrames: readonly number[];
}>;

export const PLAYER_ATTACKS: Readonly<Record<AttackStep, AttackMetadata>> = {
  1: {
    step: 1, animationKey: "guanyu-attack1", frames: GUANYU_ANIMATION_FRAMES.attack1,
    frameRate: 16, extraFrameDurationsMs: [0, 0, 0, 0, 62.5],
    startupFrames: [1, 2], activeFrames: [3, 4], recoveryFrames: [5],
  },
  2: {
    step: 2, animationKey: "guanyu-attack2", frames: GUANYU_ANIMATION_FRAMES.attack2,
    frameRate: 16, extraFrameDurationsMs: [0, 0, 0, 0, 0, 0],
    startupFrames: [1, 2], activeFrames: [3, 4], recoveryFrames: [5, 6],
  },
  3: {
    step: 3, animationKey: "guanyu-attack3", frames: GUANYU_ANIMATION_FRAMES.attack3,
    frameRate: 24, extraFrameDurationsMs: [0, 0, 0, 0, 0, 0, 0, 1000 / 24],
    startupFrames: [1, 2, 3], activeFrames: [4, 5, 6], recoveryFrames: [7, 8],
  },
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
