export type ShieldGuardState = "approach" | "guard" | "attack" | "recovery" | "hurt" | "dead";

export const SHIELD_GUARD_TIMING = {
  guardLockMs: 800,
  recoveryMinMs: 800,
  recoveryMaxMs: 1200,
  frontHalfAngleDegrees: 55,
} as const;

/** Returns true only when an attacker is inside the locked forward guard cone. */
export function isAttackBlockedByGuard(
  guardFacing: 1 | -1,
  defenderX: number,
  defenderY: number,
  attackerX: number,
  attackerY: number,
): boolean {
  const x = attackerX - defenderX;
  const y = attackerY - defenderY;
  const length = Math.hypot(x, y);
  if (length === 0) return true;
  const forwardDot = (x * guardFacing) / length;
  return forwardDot >= Math.cos(SHIELD_GUARD_TIMING.frontHalfAngleDegrees * Math.PI / 180);
}
