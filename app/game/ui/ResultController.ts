import * as Phaser from "phaser";
import { ResultReplayGate, type ResultReplaySource } from "../flow/ResultReplayGate";

export type { ResultReplaySource } from "../flow/ResultReplayGate";

const RESULT_DEPTH = 25_000;

/** Owns the one Phaser keyboard/touch result-replay request path and presentation. */
export class ResultController {
  private readonly scene: Phaser.Scene;
  private readonly gate = new ResultReplayGate();
  private readonly overlay: Phaser.GameObjects.Container;
  private readonly shade: Phaser.GameObjects.Rectangle;

  private readonly onResultKey = (event: KeyboardEvent) => {
    if (!event.repeat) this.gate.request("keyboard");
  };
  private readonly onResultPointer = () => { this.gate.request("pointer"); };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const keyboard = scene.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable");
    keyboard.on("keydown", this.onResultKey);

    this.shade = scene.add.rectangle(640, 360, 1280, 720, 0x07120d, 0.82)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: false });
    const title = scene.add.text(640, 302, "VICTORY", {
      fontFamily: "Georgia, serif", fontSize: "58px", color: "#f6d56b",
      stroke: "#5b170d", strokeThickness: 7,
    }).setOrigin(0.5).setScrollFactor(0);
    const subtitle = scene.add.text(640, 375, "STAGE CLEARED", {
      fontFamily: "Consolas, monospace", fontSize: "28px", color: "#ffffff",
    }).setOrigin(0.5).setScrollFactor(0);
    const prompt = scene.add.text(640, 430, "PRESS ANY KEY / TAP TO REPLAY", {
      fontFamily: "Consolas, monospace", fontSize: "22px", color: "#ffffff",
    }).setOrigin(0.5).setScrollFactor(0);
    this.overlay = scene.add.container(0, 0, [this.shade, title, subtitle, prompt])
      .setScrollFactor(0)
      .setDepth(RESULT_DEPTH)
      .setVisible(false);
    this.shade.on("pointerdown", this.onResultPointer);
  }

  show(): void {
    this.gate.open();
    this.overlay.setVisible(true);
  }

  hide(): void {
    this.gate.close();
    this.overlay.setVisible(false);
  }

  consumeReplayRequest(): ResultReplaySource | undefined {
    return this.gate.consume();
  }

  get isVisible(): boolean {
    return this.overlay.visible;
  }

  destroy(): void {
    this.gate.close();
    this.shade.off("pointerdown", this.onResultPointer);
    this.scene.input.keyboard?.off("keydown", this.onResultKey);
    this.overlay.destroy(true);
  }
}
