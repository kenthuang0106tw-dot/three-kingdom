export interface PhaserGameHandle {
  destroy(removeCanvas: boolean): void;
}

export interface PhaserGameRegistry {
  __dynastyPhaserGame?: PhaserGameHandle;
}

export function clearRegisteredPhaserGame(registry: PhaserGameRegistry): void {
  registry.__dynastyPhaserGame?.destroy(true);
  registry.__dynastyPhaserGame = undefined;
}

export function registerPhaserGame(registry: PhaserGameRegistry, game: PhaserGameHandle): void {
  if (registry.__dynastyPhaserGame && registry.__dynastyPhaserGame !== game) {
    clearRegisteredPhaserGame(registry);
  }
  registry.__dynastyPhaserGame = game;
}

export function releasePhaserGame(registry: PhaserGameRegistry, game: PhaserGameHandle): void {
  game.destroy(true);
  if (registry.__dynastyPhaserGame === game) registry.__dynastyPhaserGame = undefined;
}
