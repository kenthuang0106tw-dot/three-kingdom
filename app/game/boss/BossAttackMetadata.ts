export type BossAttackPhase = "startup" | "active" | "recovery";

/** The committed Boss source art faces screen-left. */
export const BOSS_SOURCE_FACING = -1 as const;

export type BossAttackDefinition = Readonly<{
  key: "attack1" | "attack2" | "attack3";
  animationKey: string;
  frameRate: number;
  frames: readonly string[];
  startupFrames: readonly number[];
  activeFrames: readonly number[];
  recoveryFrames: readonly number[];
  telegraphFrames: readonly number[];
  hitbox: Readonly<{ width: number; height: number; forwardOffset: number; verticalOffset: number }>;
}>;

export const BOSS_ATTACKS: readonly BossAttackDefinition[] = [
  {
    key: "attack1", animationKey: "boss-attack1", frameRate: 6,
    frames: ["attack1-startup", "attack1-active", "attack1-recovery"],
    startupFrames: [0], activeFrames: [1], recoveryFrames: [2], telegraphFrames: [0],
    hitbox: { width: 150, height: 78, forwardOffset: 105, verticalOffset: -42 },
  },
  {
    key: "attack2", animationKey: "boss-attack2", frameRate: 6,
    frames: ["attack2-startup", "attack2-active", "attack2-recovery"],
    startupFrames: [0], activeFrames: [1], recoveryFrames: [2], telegraphFrames: [0],
    hitbox: { width: 190, height: 78, forwardOffset: 120, verticalOffset: -42 },
  },
  {
    key: "attack3", animationKey: "boss-attack3", frameRate: 6,
    frames: ["attack3-startup", "attack3-active", "attack3-recovery"],
    startupFrames: [0], activeFrames: [1], recoveryFrames: [2], telegraphFrames: [0],
    hitbox: { width: 180, height: 78, forwardOffset: 115, verticalOffset: -42 },
  },
];
