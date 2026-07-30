import type { PlayerDefinition } from "./PlayerDefinition.ts";

export const GUANYU_TEXTURE_KEY = "guanyu-v2";
export const GUANYU_DISPLAY_SCALE = 0.64;
export const GUANYU_ORIGIN_X = 0.5;
export const GUANYU_ORIGIN_Y = 420 / 448;

export const GUANYU_ANIMATION_FRAMES = {
  idle: Array.from({ length: 6 }, (_, index) => `idle-${index}`),
  walk: Array.from({ length: 8 }, (_, index) => `walk-${index}`),
  attack1: Array.from({ length: 5 }, (_, index) => `attack1-${index}`),
  attack2: Array.from({ length: 6 }, (_, index) => `attack2-${index}`),
  attack3: Array.from({ length: 8 }, (_, index) => `attack3-${index}`),
  hurt: Array.from({ length: 4 }, (_, index) => `hurt-${index}`),
  dead: Array.from({ length: 6 }, (_, index) => `dead-${index}`),
} as const;

export const GUANYU_ATTACK_PHASES = {
  attack1: ["startup", "startup", "active", "active", "recovery"],
  attack2: ["startup", "startup", "active", "active", "recovery", "recovery"],
  attack3: ["startup", "startup", "startup", "active", "active", "active", "recovery", "recovery"],
} as const;

const BASELINE_IMPACT = Object.freeze({
  damage: 1,
  knockbackDistance: 26,
  hitStopMs: (1000 / 60) * 4,
});

const COMMITMENT_IMPACT = Object.freeze({
  damage: 2,
  knockbackDistance: 60,
  hitStopMs: (1000 / 60) * 6,
});

export const GUANYU_PLAYER_DEFINITION = Object.freeze({
  id: "guanyu",
  textureKey: GUANYU_TEXTURE_KEY,
  presentation: {
    idleFrame: "idle-0",
    displayScale: GUANYU_DISPLAY_SCALE,
    originX: GUANYU_ORIGIN_X,
    originY: GUANYU_ORIGIN_Y,
    shadowOffsetY: 4,
    shadowAlpha: 0.54,
  },
  atlas: {
    cellWidth: 640,
    cellHeight: 448,
    columns: 8,
    feetX: 320,
    feetY: 420,
  },
  body: {
    width: 86,
    height: 54,
  },
  movement: {
    speed: 235,
  },
  lifecycle: {
    maxHp: 10,
    hurtDurationMs: 300,
  },
  attackHitbox: {
    width: 142,
    height: 86,
    offsetX: 104,
    offsetY: -48,
  },
  animations: {
    idle: { key: "guanyu-idle", frames: GUANYU_ANIMATION_FRAMES.idle, frameRate: 4, repeat: -1 },
    walk: { key: "guanyu-walk", frames: GUANYU_ANIMATION_FRAMES.walk, frameRate: 8, repeat: -1 },
    hurt: {
      key: "guanyu-hurt",
      frames: GUANYU_ANIMATION_FRAMES.hurt,
      frameRate: 8,
      repeat: 0,
      durationMs: 300,
    },
    dead: { key: "guanyu-dead", frames: GUANYU_ANIMATION_FRAMES.dead, frameRate: 8, repeat: 0 },
  },
  attacks: {
    1: {
      step: 1,
      animationKey: "guanyu-attack1",
      frames: GUANYU_ANIMATION_FRAMES.attack1,
      frameRate: 16,
      extraFrameDurationsMs: [0, 0, 0, 0, 62.5],
      startupFrames: [1, 2],
      activeFrames: [3, 4],
      recoveryFrames: [5],
      impact: BASELINE_IMPACT,
    },
    2: {
      step: 2,
      animationKey: "guanyu-attack2",
      frames: GUANYU_ANIMATION_FRAMES.attack2,
      frameRate: 16,
      extraFrameDurationsMs: [0, 0, 0, 0, 0, 0],
      startupFrames: [1, 2],
      activeFrames: [3, 4],
      recoveryFrames: [5, 6],
      impact: BASELINE_IMPACT,
    },
    3: {
      step: 3,
      animationKey: "guanyu-attack3",
      frames: GUANYU_ANIMATION_FRAMES.attack3,
      frameRate: 24,
      extraFrameDurationsMs: [0, 0, 0, 0, 0, 0, 0, (1000 / 24) + 275],
      startupFrames: [1, 2, 3],
      activeFrames: [4, 5, 6],
      recoveryFrames: [7, 8],
      impact: COMMITMENT_IMPACT,
    },
  },
} satisfies PlayerDefinition);
