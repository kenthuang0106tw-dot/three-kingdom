import type { BossState } from "./BossLifecycle";

export type BossFacing = -1 | 1;
export type BossPoint = Readonly<{ x: number; y: number }>;
export type BossBounds = Readonly<{ x: number; y: number; width: number; height: number }>;

export const BOSS_LOCOMOTION_CONFIG = Object.freeze({
  walkSpeedX: 86,
  walkSpeedY: 68,
  attackMinX: 112,
  attackMaxX: 170,
  alignmentToleranceY: 30,
});

export type BossLocomotionDecision = Readonly<{
  velocityX: number;
  velocityY: number;
  facing: BossFacing;
  isMoving: boolean;
  attackEligible: boolean;
}>;

/** Phaser-free movement decision for the first Boss. Y alignment has priority. */
export function decideBossLocomotion(
  state: BossState,
  position: BossPoint,
  target: BossPoint,
  previousFacing: BossFacing,
): BossLocomotionDecision {
  if (state !== "idle") return stationary(previousFacing);

  const deltaX = target.x - position.x;
  const deltaY = target.y - position.y;
  const facing: BossFacing = deltaX > 0 ? 1 : deltaX < 0 ? -1 : previousFacing;

  if (Math.abs(deltaY) > BOSS_LOCOMOTION_CONFIG.alignmentToleranceY) {
    return moving(0, Math.sign(deltaY) * BOSS_LOCOMOTION_CONFIG.walkSpeedY, facing);
  }

  const distanceX = Math.abs(deltaX);
  if (distanceX > BOSS_LOCOMOTION_CONFIG.attackMaxX) {
    return moving(Math.sign(deltaX) * BOSS_LOCOMOTION_CONFIG.walkSpeedX, 0, facing);
  }
  if (distanceX < BOSS_LOCOMOTION_CONFIG.attackMinX) {
    const separationDirection: BossFacing = deltaX === 0 ? (facing === 1 ? -1 : 1) : deltaX < 0 ? 1 : -1;
    return moving(separationDirection * BOSS_LOCOMOTION_CONFIG.walkSpeedX, 0, separationDirection);
  }

  return { ...stationary(facing), attackEligible: true };
}

export function clampBossFeet(
  position: BossPoint,
  bounds: BossBounds,
  bodyWidth: number,
  bodyHeight: number,
): BossPoint {
  const minX = bounds.x + bodyWidth / 2;
  const maxX = bounds.x + bounds.width - bodyWidth / 2;
  const minY = bounds.y + bodyHeight;
  const maxY = bounds.y + bounds.height;
  return {
    x: Math.min(maxX, Math.max(minX, position.x)),
    y: Math.min(maxY, Math.max(minY, position.y)),
  };
}

function stationary(facing: BossFacing): BossLocomotionDecision {
  return { velocityX: 0, velocityY: 0, facing, isMoving: false, attackEligible: false };
}

function moving(velocityX: number, velocityY: number, facing: BossFacing): BossLocomotionDecision {
  return { velocityX, velocityY, facing, isMoving: true, attackEligible: false };
}
