import type { GameplayEvent } from "../events/GameplayEvents";

export type BgmTrackId = "stage" | "boss";

export type BgmCommand = Readonly<
  | { action: "play"; track: BgmTrackId; key: `bgm-${BgmTrackId}`; volume: number }
  | { action: "stop" }
>;

const play = (track: BgmTrackId, volume: number): BgmCommand => Object.freeze({
  action: "play",
  track,
  key: `bgm-${track}`,
  volume,
});

const STOP: BgmCommand = Object.freeze({ action: "stop" });

export function mapGameplayEventToBgm(event: GameplayEvent): BgmCommand | undefined {
  switch (event.type) {
    case "title-started":
      return play("stage", 0.3);
    case "boss-activated":
      return play("boss", 0.3);
    case "player-state-changed":
      return event.next === "dead" ? STOP : undefined;
    case "stage-completed":
      return STOP;
    default:
      return undefined;
  }
}
