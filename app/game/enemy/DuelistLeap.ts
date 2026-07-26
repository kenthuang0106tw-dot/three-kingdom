export type DuelistLeapPhase = "takeoff" | "airborne" | "descent" | "landing";

export const DUELIST_LEAP_TIMING = Object.freeze({
  takeoffMs: 180,
  airborneMs: 240,
  descentMs: 220,
  landingMs: 420,
  cooldownMs: 2800,
  maximumElevation: 96,
});

export type DuelistLeapPlan = Readonly<{
  startX: number;
  startY: number;
  destinationX: number;
  destinationY: number;
}>;

export type DuelistLeapSample = Readonly<{
  phase: DuelistLeapPhase;
  x: number;
  y: number;
  elevation: number;
  complete: boolean;
}>;

export function createDuelistLeapPlan(
  startX: number,
  startY: number,
  playerX: number,
  playerY: number,
  clampX: (value: number) => number,
  clampY: (value: number) => number,
): DuelistLeapPlan {
  const side = startX <= playerX ? 1 : -1;
  return Object.freeze({
    startX,
    startY,
    destinationX: clampX(playerX + side * 78),
    destinationY: clampY(playerY),
  });
}

export function sampleDuelistLeap(plan: DuelistLeapPlan, elapsedMs: number): DuelistLeapSample {
  const flightMs = DUELIST_LEAP_TIMING.takeoffMs + DUELIST_LEAP_TIMING.airborneMs + DUELIST_LEAP_TIMING.descentMs;
  const totalMs = flightMs + DUELIST_LEAP_TIMING.landingMs;
  const elapsed = Math.max(0, Math.min(elapsedMs, totalMs));
  const progress = Math.min(elapsed / flightMs, 1);
  const phase: DuelistLeapPhase =
    elapsed < DUELIST_LEAP_TIMING.takeoffMs ? "takeoff" :
      elapsed < DUELIST_LEAP_TIMING.takeoffMs + DUELIST_LEAP_TIMING.airborneMs ? "airborne" :
        elapsed < flightMs ? "descent" : "landing";
  return Object.freeze({
    phase,
    x: plan.startX + (plan.destinationX - plan.startX) * progress,
    y: plan.startY + (plan.destinationY - plan.startY) * progress,
    elevation: Math.sin(Math.PI * progress) * DUELIST_LEAP_TIMING.maximumElevation,
    complete: elapsed >= totalMs,
  });
}

export function duelistLeapAnimationKey(phase: DuelistLeapPhase) {
  return `enemy-duelist-leap-${phase}`;
}
