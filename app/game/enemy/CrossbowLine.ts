export const CROSSBOW_TIMING = {
  aimMs: 900,
  trackingMs: 550,
  lockedMs: 350,
  reloadMs: 3000,
  projectileSpeed: 520,
  projectileRange: 960,
} as const;

/** Keep the shooter on-screen while giving the line-control role a real ranged threat. */
export const CROSSBOW_ATTACK_SLOT_RANGE = 640;
export const CROSSBOW_HIT_Y_TOLERANCE = 14;

/** A projectile can only hit a target that remains on its locked horizontal line. */
export function isTargetOnCrossbowLine(lineY: number, targetY: number) {
  return Math.abs(lineY - targetY) <= CROSSBOW_HIT_Y_TOLERANCE;
}

/** The first part of Aim can follow the player; once locked this value must not change. */
export function nextAimLineY(currentY: number, playerY: number, elapsedMs: number): number {
  if (elapsedMs >= CROSSBOW_TIMING.trackingMs) return currentY;
  return currentY + (playerY - currentY) * 0.1;
}

export function isCrossbowTracking(elapsedMs: number) {
  return elapsedMs < CROSSBOW_TIMING.trackingMs;
}

export function isCrossbowReadyToFire(elapsedMs: number) {
  return elapsedMs >= CROSSBOW_TIMING.aimMs;
}
