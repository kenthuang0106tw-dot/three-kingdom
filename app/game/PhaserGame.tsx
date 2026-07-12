"use client";

import { useEffect, useRef } from "react";
import { clearRegisteredPhaserGame, registerPhaserGame, releasePhaserGame } from "./phaserLifecycle";

declare global {
  interface Window {
    __dynastyPhaserGame?: import("phaser").Game;
  }
}

export default function PhaserGame() {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<import("phaser").Game | null>(null);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      const [Phaser, { default: MainScene }] = await Promise.all([
        import("phaser"),
        import("./MainScene"),
      ]);
      if (cancelled || !hostRef.current || gameRef.current) return;

      const host = hostRef.current;
      // Fast Refresh and React development remounts must never leave a second
      // KeyboardManager listening to the same native keyboard events.
      clearRegisteredPhaserGame(window);

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: host,
        width: 1280,
        height: 720,
        transparent: false,
        backgroundColor: "#163d24",
        antialias: false,
        pixelArt: true,
        roundPixels: true,
        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: process.env.NODE_ENV !== "production",
          },
        },
        input: {
          keyboard: {
            target: host,
            capture: [
              Phaser.Input.Keyboard.KeyCodes.UP,
              Phaser.Input.Keyboard.KeyCodes.DOWN,
              Phaser.Input.Keyboard.KeyCodes.LEFT,
              Phaser.Input.Keyboard.KeyCodes.RIGHT,
              Phaser.Input.Keyboard.KeyCodes.W,
              Phaser.Input.Keyboard.KeyCodes.A,
              Phaser.Input.Keyboard.KeyCodes.S,
              Phaser.Input.Keyboard.KeyCodes.D,
              Phaser.Input.Keyboard.KeyCodes.J,
            ],
          },
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: 1280,
          height: 720,
        },
        scene: [MainScene],
      });
      gameRef.current = game;
      registerPhaserGame(window, game);
      host.focus();
    };

    void boot();
    return () => {
      cancelled = true;
      const game = gameRef.current;
      if (game) releasePhaserGame(window, game);
      gameRef.current = null;
    };
  }, []);

  return <div ref={hostRef} className="phaser-host" tabIndex={0} onPointerDown={(event) => event.currentTarget.focus()} />;
}
