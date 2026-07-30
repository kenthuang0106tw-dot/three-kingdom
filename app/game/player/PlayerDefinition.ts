export type AttackStep = 1 | 2 | 3;

export type PlayerAttackMetadata = Readonly<{
  step: AttackStep;
  animationKey: string;
  frames: readonly string[];
  frameRate: number;
  extraFrameDurationsMs: readonly number[];
  startupFrames: readonly number[];
  activeFrames: readonly number[];
  recoveryFrames: readonly number[];
  impact: Readonly<{
    damage: number;
    knockbackDistance: number;
    hitStopMs: number;
  }>;
}>;

export type PlayerAnimationDefinition = Readonly<{
  key: string;
  frames: readonly string[];
  frameRate: number;
  repeat: number;
  durationMs?: number;
}>;

export type PlayerDefinition = Readonly<{
  id: string;
  textureKey: string;
  presentation: Readonly<{
    idleFrame: string;
    displayScale: number;
    originX: number;
    originY: number;
    shadowOffsetY: number;
    shadowAlpha: number;
  }>;
  atlas: Readonly<{
    cellWidth: number;
    cellHeight: number;
    columns: number;
    feetX: number;
    feetY: number;
  }>;
  body: Readonly<{
    width: number;
    height: number;
  }>;
  movement: Readonly<{
    speed: number;
  }>;
  lifecycle: Readonly<{
    maxHp: number;
    hurtDurationMs: number;
  }>;
  attackHitbox: Readonly<{
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  }>;
  animations: Readonly<{
    idle: PlayerAnimationDefinition;
    walk: PlayerAnimationDefinition;
    hurt: PlayerAnimationDefinition;
    dead: PlayerAnimationDefinition;
  }>;
  attacks: Readonly<Record<AttackStep, PlayerAttackMetadata>>;
}>;
