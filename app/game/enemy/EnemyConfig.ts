export type EnemyConfig = {
  readonly id: string;
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
  if (!config.id) throw new Error("Enemy config id is required");
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
  return config;
}

export const SOLDIER_ENEMY_CONFIG: EnemyConfig = validateEnemyConfig({
  id: "soldier",
  maxHp: 3,
  displayScale: 1.4,
  frameSize: 384,
  feetY: 354,
  movement: { walkSpeed: 70, detectionDistance: 500, verticalScale: 0.7 },
  combat: { attackXRange: 110, attackYRange: 45, minSpacing: 72 },
  timing: { hurtMs: 300, directorDelayMin: 400, directorDelayMax: 800, recoveryMin: 800, recoveryMax: 1200 },
});
