import { GUANYU_PLAYER_DEFINITION } from "./GuanYuAnimationMetadata.ts";
import type { PlayerDefinition } from "./PlayerDefinition.ts";
import { ZHANGFEI_PLAYER_DEFINITION } from "./ZhangFeiAnimationMetadata.ts";

export type PlayerId = "guanyu" | "zhangfei";

export const PLAYER_DEFINITIONS: Readonly<Record<PlayerId, PlayerDefinition>> = Object.freeze({
  guanyu: GUANYU_PLAYER_DEFINITION,
  zhangfei: ZHANGFEI_PLAYER_DEFINITION,
});

export function isPlayerId(value: unknown): value is PlayerId {
  return value === "guanyu" || value === "zhangfei";
}

export function getPlayerDefinition(id: PlayerId): PlayerDefinition {
  return PLAYER_DEFINITIONS[id];
}
