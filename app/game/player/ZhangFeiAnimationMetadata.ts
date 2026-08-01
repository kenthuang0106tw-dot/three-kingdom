import type { PlayerDefinition } from "./PlayerDefinition.ts";

export const ZHANGFEI_TEXTURE_KEY = "zhangfei-v2-prototype";

export const ZHANGFEI_ANIMATION_FRAMES = {
  idle: Array.from({ length: 6 }, (_, index) => `idle-${index}`),
  walk: Array.from({ length: 8 }, (_, index) => `walk-${index}`),
  attack1: Array.from({ length: 6 }, (_, index) => `attack1-${index}`),
  attack2: Array.from({ length: 7 }, (_, index) => `attack2-${index}`),
  attack3: Array.from({ length: 10 }, (_, index) => `attack3-${index}`),
  hurt: Array.from({ length: 4 }, (_, index) => `hurt-${index}`),
  dead: Array.from({ length: 6 }, (_, index) => `dead-${index}`),
} as const;

const FIVE_FRAME_HIT_STOP = (1000 / 60) * 5;
const EIGHT_FRAME_HIT_STOP = (1000 / 60) * 8;

export const ZHANGFEI_PLAYER_DEFINITION = Object.freeze({
  id: "zhangfei",
  textureKey: ZHANGFEI_TEXTURE_KEY,
  presentation: {
    idleFrame: "idle-0",
    displayScale: 0.64,
    originX: 0.5,
    originY: 420 / 448,
    shadowOffsetY: 4,
    shadowAlpha: 0.54,
  },
  atlas: {
    cellWidth: 672,
    cellHeight: 448,
    columns: 6,
    feetX: 336,
    feetY: 420,
  },
  body: {
    width: 96,
    height: 58,
  },
  movement: {
    speed: 200,
  },
  lifecycle: {
    maxHp: 10,
    hurtDurationMs: 300,
  },
  attackHitbox: {
    width: 176,
    height: 88,
    offsetX: 132,
    offsetY: -48,
  },
  animations: {
    idle: { key: "zhangfei-idle", frames: ZHANGFEI_ANIMATION_FRAMES.idle, frameRate: 4, repeat: -1 },
    walk: { key: "zhangfei-walk", frames: ZHANGFEI_ANIMATION_FRAMES.walk, frameRate: 8, repeat: -1 },
    hurt: {
      key: "zhangfei-hurt",
      frames: ZHANGFEI_ANIMATION_FRAMES.hurt,
      frameRate: 8,
      repeat: 0,
      durationMs: 300,
    },
    dead: { key: "zhangfei-dead", frames: ZHANGFEI_ANIMATION_FRAMES.dead, frameRate: 8, repeat: 0 },
  },
  attacks: {
    1: {
      step: 1,
      animationKey: "zhangfei-attack1",
      frames: ZHANGFEI_ANIMATION_FRAMES.attack1,
      frameRate: 20,
      extraFrameDurationsMs: [25, 25, 0, 0, 50, 50],
      startupFrames: [1, 2],
      activeFrames: [3, 4],
      recoveryFrames: [5, 6],
      impact: { damage: 1, knockbackDistance: 34, hitStopMs: FIVE_FRAME_HIT_STOP },
    },
    2: {
      step: 2,
      animationKey: "zhangfei-attack2",
      frames: ZHANGFEI_ANIMATION_FRAMES.attack2,
      frameRate: 40,
      extraFrameDurationsMs: [100 / 3, 100 / 3, 100 / 3, 37.5, 37.5, 87.5, 87.5],
      startupFrames: [1, 2, 3],
      activeFrames: [4, 5],
      recoveryFrames: [6, 7],
      impact: { damage: 1, knockbackDistance: 56, hitStopMs: FIVE_FRAME_HIT_STOP },
    },
    3: {
      step: 3,
      animationKey: "zhangfei-attack3",
      frames: ZHANGFEI_ANIMATION_FRAMES.attack3,
      frameRate: 20,
      extraFrameDurationsMs: [6.25, 6.25, 6.25, 6.25, 0, 0, 0, 275 / 3, 275 / 3, 275 / 3],
      startupFrames: [1, 2, 3, 4],
      activeFrames: [5, 6, 7],
      recoveryFrames: [8, 9, 10],
      impact: { damage: 2, knockbackDistance: 88, hitStopMs: EIGHT_FRAME_HIT_STOP },
    },
  },
} satisfies PlayerDefinition);
