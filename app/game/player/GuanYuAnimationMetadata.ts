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
