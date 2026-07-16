import type { BossAttackDefinition } from "./BossAttackMetadata";
import type { BossFacing } from "./BossLocomotion";
import type { BossState } from "./BossLifecycle";

export type BossAttackPoint = Readonly<{ x: number; y: number }>;

export function isBossAttackActiveFrame(attack: BossAttackDefinition, sourceFrameIndex: number): boolean {
  return attack.activeFrames.includes(sourceFrameIndex);
}

export function getBossAttackHitboxCenter(
  bossFeet: BossAttackPoint,
  facing: BossFacing,
  attack: BossAttackDefinition,
): BossAttackPoint {
  return {
    x: bossFeet.x + facing * attack.hitbox.forwardOffset,
    y: bossFeet.y + attack.hitbox.verticalOffset,
  };
}

export function canConsumeBossAttackHit(input: Readonly<{
  state: BossState;
  attack: BossAttackDefinition | undefined;
  sourceFrameIndex: number;
  alreadyHitPlayer: boolean;
  bossFeetY: number;
  playerFeetY: number;
  alignmentToleranceY: number;
}>): boolean {
  return input.state === "attack"
    && input.attack !== undefined
    && isBossAttackActiveFrame(input.attack, input.sourceFrameIndex)
    && !input.alreadyHitPlayer
    && Math.abs(input.playerFeetY - input.bossFeetY) <= input.alignmentToleranceY;
}
