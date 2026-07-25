export type EnemyConfig = {
  readonly id: string;
  readonly assetKey: string;
  readonly animations: {
    readonly idle: readonly string[];
    readonly walk: readonly string[];
    readonly attack: readonly string[];
    readonly hurt: readonly string[];
    readonly dead: readonly string[];
  };
  readonly animationRates: { readonly idle: number; readonly walk: number; readonly attack: number; readonly hurt: number; readonly dead: number };
  readonly sourceFacing: 1 | -1;
  /** Phaser AnimationFrame.index is one-based. */
  readonly attackActiveFrame: number;
  readonly maxHp: number;
  readonly displayScale: number;
  readonly frameSize: number;
  readonly feetY: number;
  readonly movement: {
    readonly walkSpeed: number;
    readonly detectionDistance: number;
    readonly verticalScale: number;
  };
  readonly combat: {
    readonly attackXRange: number;
    readonly attackYRange: number;
    readonly minSpacing: number;
  };
  readonly timing: {
    readonly hurtMs: number;
    readonly directorDelayMin: number;
    readonly directorDelayMax: number;
    readonly recoveryMin: number;
    readonly recoveryMax: number;
  };
};

export function validateEnemyConfig(config: EnemyConfig): EnemyConfig {
  if (!config.id || !config.assetKey) throw new Error("Enemy config id and asset key are required");
  if (Object.values(config.animations).some(frames => frames.length === 0) ||
    Object.values(config.animationRates).some(rate => !Number.isFinite(rate) || rate <= 0)) {
    throw new Error(`Invalid enemy animation config: ${config.id}`);
  }
  const positive = [config.maxHp, config.displayScale, config.frameSize, config.feetY,
    config.movement.walkSpeed, config.movement.detectionDistance, config.movement.verticalScale,
    config.combat.attackXRange, config.combat.attackYRange, config.combat.minSpacing,
    config.timing.hurtMs, config.timing.directorDelayMin, config.timing.directorDelayMax,
    config.timing.recoveryMin, config.timing.recoveryMax];
  if (!positive.every(value => Number.isFinite(value) && value > 0)) throw new Error(`Invalid enemy config: ${config.id}`);
  if (config.timing.directorDelayMin > config.timing.directorDelayMax || config.timing.recoveryMin > config.timing.recoveryMax) {
    throw new Error(`Enemy timing ranges must be ordered: ${config.id}`);
  }
  if (config.feetY > config.frameSize) throw new Error(`Enemy feet anchor is outside frame: ${config.id}`);
  if (config.sourceFacing !== -1 && config.sourceFacing !== 1) throw new Error(`Invalid enemy source facing: ${config.id}`);
  if (!Number.isInteger(config.attackActiveFrame) || config.attackActiveFrame < 1 || config.attackActiveFrame > config.animations.attack.length) {
    throw new Error(`Invalid enemy attack active frame: ${config.id}`);
  }
  return config;
}

export type EnemyAnimationState = "idle" | "walk" | "attack" | "hurt" | "dead";

export function enemyAnimationKey(config: EnemyConfig, state: EnemyAnimationState): string {
  return config.id === "soldier" ? `enemy-${state}` : `enemy-${config.id}-${state}`;
}

export function enemySpriteShouldFlip(config: EnemyConfig, facing: 1 | -1): boolean {
  return facing !== config.sourceFacing;
}

export const SOLDIER_ENEMY_CONFIG: EnemyConfig = validateEnemyConfig({
  id: "soldier",
  assetKey: "enemy-soldier",
  animations: {
    idle: ["idle-0", "idle-1"], walk: ["walk-0", "walk-1", "walk-2", "walk-3"],
    attack: ["attack-0", "attack-1", "attack-2"], hurt: ["hurt-0", "hurt-1"], dead: ["dead-0", "dead-1", "dead-2", "dead-3"],
  },
  animationRates: { idle: 4, walk: 8, attack: 8, hurt: 8, dead: 8 },
  sourceFacing: -1,
  attackActiveFrame: 2,
  maxHp: 4,
  displayScale: 1.34,
  frameSize: 384,
  feetY: 354,
  movement: { walkSpeed: 70, detectionDistance: 500, verticalScale: 0.7 },
  combat: { attackXRange: 110, attackYRange: 45, minSpacing: 72 },
  timing: { hurtMs: 300, directorDelayMin: 500, directorDelayMax: 750, recoveryMin: 850, recoveryMax: 1100 },
});

export const MAULER_ENEMY_CONFIG: EnemyConfig = validateEnemyConfig({
  id: "mauler",
  assetKey: "enemy-mauler",
  animations: {
    idle: ["idle-0", "idle-1"], walk: ["walk-0", "walk-1", "walk-2", "walk-3"],
    attack: ["attack-0", "attack-1", "attack-2"], hurt: ["hurt-0", "hurt-1"], dead: ["dead-0", "dead-1", "dead-2", "dead-3"],
  },
  animationRates: { idle: 4, walk: 8, attack: 8, hurt: 8, dead: 8 },
  sourceFacing: -1,
  attackActiveFrame: 2,
  maxHp: 5,
  displayScale: 1.1,
  frameSize: 384,
  feetY: 354,
  movement: { walkSpeed: 62, detectionDistance: 500, verticalScale: 0.7 },
  combat: { attackXRange: 150, attackYRange: 48, minSpacing: 82 },
  timing: { hurtMs: 300, directorDelayMin: 650, directorDelayMax: 900, recoveryMin: 1150, recoveryMax: 1450 },
});

export const DUELIST_ENEMY_CONFIG: EnemyConfig = validateEnemyConfig({
  id: "duelist",
  assetKey: "enemy-duelist",
  animations: {
    idle: ["idle-0", "idle-1"], walk: ["walk-0", "walk-1", "walk-2", "walk-3"],
    attack: ["attack-0", "attack-1", "attack-2"], hurt: ["hurt-0", "hurt-1"], dead: ["dead-0", "dead-1", "dead-2", "dead-3"],
  },
  animationRates: { idle: 6, walk: 10, attack: 10, hurt: 8, dead: 8 },
  sourceFacing: 1,
  attackActiveFrame: 2,
  maxHp: 3,
  displayScale: 0.94,
  frameSize: 384,
  feetY: 354,
  movement: { walkSpeed: 96, detectionDistance: 560, verticalScale: 0.8 },
  combat: { attackXRange: 92, attackYRange: 40, minSpacing: 68 },
  timing: { hurtMs: 300, directorDelayMin: 400, directorDelayMax: 600, recoveryMin: 700, recoveryMax: 900 },
});
