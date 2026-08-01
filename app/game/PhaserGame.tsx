"use client";

import { useEffect, useRef } from "react";
import { clearRegisteredPhaserGame, registerPhaserGame, releasePhaserGame } from "./phaserLifecycle";

declare global {
  interface Window {
    __dynastyPhaserGame?: import("phaser").Game;
  }
}

const PERFORMANCE_VIEWPORTS = {
  landscape: { width: "832px", height: "390px" },
  portrait: { width: "390px", height: "182.8125px" },
} as const;

export default function PhaserGame() {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<import("phaser").Game | null>(null);

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    const shell = process.env.NODE_ENV !== "production"
      ? host?.closest<HTMLElement>(".arcade-shell")
      : null;
    const requestedViewport = new URLSearchParams(window.location.search).get("performanceViewport");
    const performanceViewport = requestedViewport === "landscape" || requestedViewport === "portrait"
      ? PERFORMANCE_VIEWPORTS[requestedViewport]
      : undefined;
    const previousShellStyle = shell ? shell.getAttribute("style") : null;
    if (shell && performanceViewport) {
      shell.style.width = performanceViewport.width;
      shell.style.height = performanceViewport.height;
      shell.style.maxWidth = "none";
      shell.style.maxHeight = "none";
    }

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
          activePointers: 2,
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
              Phaser.Input.Keyboard.KeyCodes.ENTER,
              Phaser.Input.Keyboard.KeyCodes.SPACE,
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
      if (shell && performanceViewport) {
        if (previousShellStyle === null) shell.removeAttribute("style");
        else shell.setAttribute("style", previousShellStyle);
      }
    };
  }, []);

  return <div ref={hostRef} className="phaser-host" tabIndex={0} onPointerDown={(event) => event.currentTarget.focus()} />;
}
