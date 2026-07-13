export type PlayerSnapshot = Readonly<{
  state: string;
  hp: number;
  x: number;
  y: number;
}>;

export type EnemySnapshot = Readonly<{
  id: number;
  state: string;
  hp: number;
  x: number;
  y: number;
}>;

export type LifecycleSnapshot = Readonly<{
  paused: boolean;
  visibilityPaused: boolean;
}>;

export type GameplaySnapshot = Readonly<{
  player: PlayerSnapshot;
  enemies: ReadonlyArray<EnemySnapshot>;
  lifecycle: LifecycleSnapshot;
}>;

export type GameplayEvent = Readonly<
  | { type: "player-state-changed"; previous: string; next: string; at: number }
  | { type: "player-attack-started"; step: number; at: number }
  | { type: "player-hit"; enemyId: number; at: number }
  | { type: "enemy-hit"; enemyId: number; damage: number; at: number }
  | { type: "stage-completed"; stageId: string; at: number }
  | { type: "lifecycle-changed"; paused: boolean; at: number }
>;

export type GameplayEventListener = (event: GameplayEvent) => void;

/** Minimal readonly observation boundary; actor instances never cross it. */
export class GameplayEventHub {
  private snapshot?: GameplaySnapshot;
  private readonly listeners = new Set<GameplayEventListener>();

  publishSnapshot(snapshot: GameplaySnapshot) {
    const enemies = Object.freeze(snapshot.enemies.map(enemy => Object.freeze({ ...enemy })));
    this.snapshot = Object.freeze({
      player: Object.freeze({ ...snapshot.player }),
      enemies,
      lifecycle: Object.freeze({ ...snapshot.lifecycle }),
    });
  }

  publish(event: GameplayEvent) {
    const immutableEvent = Object.freeze({ ...event });
    for (const listener of this.listeners) listener(immutableEvent);
  }

  subscribe(listener: GameplayEventListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getSnapshot(): GameplaySnapshot | undefined { return this.snapshot; }
}
