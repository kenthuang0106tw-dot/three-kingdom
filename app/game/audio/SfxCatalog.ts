import type { GameplayEvent } from "../events/GameplayEvents";

export type SfxCueId =
  | "player-attack"
  | "hit-confirmed"
  | "player-hurt"
  | "enemy-death"
  | "ui-start"
  | "ui-pause"
  | "ui-resume"
  | "ui-failure"
  | "ui-result"
  | "ui-confirm";

export type SfxCommand = Readonly<{
  cue: SfxCueId;
  key: `sfx-${SfxCueId}`;
  volume: number;
  detune?: number;
}>;

const command = (cue: SfxCueId, volume: number, detune?: number): SfxCommand => Object.freeze({
  cue,
  key: `sfx-${cue}`,
  volume,
  ...(detune === undefined ? {} : { detune }),
});

export function mapGameplayEventToSfx(event: GameplayEvent): SfxCommand | undefined {
  switch (event.type) {
    case "player-attack-started":
      return command("player-attack", 0.48, (event.step - 1) * 80);
    case "enemy-hit":
      return command("hit-confirmed", 0.6);
    case "enemy-blocked":
      return command("hit-confirmed", 0.42, 360);
    case "player-hit":
      return command("player-hurt", 0.62);
    case "enemy-defeated":
      return command("enemy-death", 0.5);
    case "title-started":
      return command("ui-start", 0.52);
    case "ui-action":
      if (event.action === "pause") return command("ui-pause", 0.46);
      if (event.action === "resume") return command("ui-resume", 0.46);
      return command("ui-confirm", 0.48);
    case "player-state-changed":
      return event.next === "dead" ? command("ui-failure", 0.62) : undefined;
    case "stage-completed":
      return command("ui-result", 0.6);
    default:
      return undefined;
  }
}
