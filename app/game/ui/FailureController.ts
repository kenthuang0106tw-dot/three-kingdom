import * as Phaser from "phaser";
import { FailureRestartGate, type FailureRestartSource } from "../flow/FailureRestartGate";

export type { FailureRestartSource } from "../flow/FailureRestartGate";

const FAILURE_DEPTH = 24_000;

/** Owns the one Phaser keyboard/touch failure-restart request path and presentation. */
export class FailureController {
  private readonly scene: Phaser.Scene;
  private readonly gate = new FailureRestartGate();
  private readonly overlay: Phaser.GameObjects.Container;
  private readonly shade: Phaser.GameObjects.Rectangle;

  private readonly onFailureKey = (event: KeyboardEvent) => {
    if (!event.repeat) this.gate.request("keyboard");
  };
  private readonly onFailurePointer = () => { this.gate.request("pointer"); };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const keyboard = scene.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable");
    keyboard.on("keydown", this.onFailureKey);

    this.shade = scene.add.rectangle(640, 360, 1280, 720, 0x120707, 0.82)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: false });
    const title = scene.add.text(640, 328, "DEFEATED", {
      fontFamily: "Georgia, serif", fontSize: "58px", color: "#f0d5c2",
      stroke: "#5b170d", strokeThickness: 7,
    }).setOrigin(0.5).setScrollFactor(0);
    const prompt = scene.add.text(640, 408, "PRESS ANY KEY / TAP TO RETRY", {
      fontFamily: "Consolas, monospace", fontSize: "24px", color: "#ffffff",
    }).setOrigin(0.5).setScrollFactor(0);
    this.overlay = scene.add.container(0, 0, [this.shade, title, prompt])
      .setScrollFactor(0)
      .setDepth(FAILURE_DEPTH)
      .setVisible(false);
    this.shade.on("pointerdown", this.onFailurePointer);
  }

  show(): void {
    this.gate.open();
    this.overlay.setVisible(true);
  }

  hide(): void {
    this.gate.close();
    this.overlay.setVisible(false);
  }

  consumeRestartRequest(): FailureRestartSource | undefined {
    return this.gate.consume();
  }

  get isVisible(): boolean {
    return this.overlay.visible;
  }

  destroy(): void {
    this.gate.close();
    this.shade.off("pointerdown", this.onFailurePointer);
    this.scene.input.keyboard?.off("keydown", this.onFailureKey);
    this.overlay.destroy(true);
  }
}
