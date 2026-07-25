export const CROSSBOW_TIMING = {
  aimMs: 900,
  trackingMs: 550,
  lockedMs: 350,
  reloadMs: 3000,
  projectileSpeed: 520,
  projectileRange: 960,
} as const;

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
