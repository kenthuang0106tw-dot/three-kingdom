import * as Phaser from "phaser";
import type { GameFlowState } from "../flow/GameFlowStateMachine";
import { addButtonFrame, addModalFrame, addUiText, UI_COLORS } from "./UiArt";

const PAUSE_DEPTH = 23_000;

/** Owns the one Phaser keyboard/touch pause request path and its presentation. */
export class PauseController {
  private readonly button: Phaser.GameObjects.Container;
  private readonly overlay: Phaser.GameObjects.Container;
  private readonly buttonPanel: Phaser.GameObjects.Rectangle;
  private readonly overlayShade: Phaser.GameObjects.Rectangle;
  private touchToggleRequested = false;
  private keyboardToggleRequested = false;

  private readonly onPauseKey = (event: KeyboardEvent) => {
    if (!event.repeat) this.keyboardToggleRequested = true;
  };
  private readonly onPausePointer = () => { this.touchToggleRequested = true; };
  private readonly onResumePointer = () => { this.touchToggleRequested = true; };

  constructor(private readonly scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable");
    keyboard.on("keydown-P", this.onPauseKey);

    this.buttonPanel = scene.add.rectangle(1224, 44, 72, 48, 0x000000, 0)
      .setInteractive({ useHandCursor: false });
    const buttonFrame = addButtonFrame(scene, 1224, 44, 72, 48);
    const buttonLabel = addUiText(scene, 1224, 35, "II", 18, UI_COLORS.antiqueGold).setOrigin(0.5, 0);
    this.button = scene.add.container(0, 0, [this.buttonPanel, buttonFrame, buttonLabel])
      .setScrollFactor(0)
      .setDepth(PAUSE_DEPTH);
    this.buttonPanel.on("pointerdown", this.onPausePointer);

    this.overlayShade = scene.add.rectangle(640, 360, 1280, 720, 0x07120d, 0.78)
      .setInteractive({ useHandCursor: false });
    const modal = addModalFrame(scene, 640, 360);
    const title = addUiText(scene, 640, 292, "PAUSED", 54, UI_COLORS.antiqueGold).setOrigin(0.5);
    const prompt = addUiText(scene, 640, 393, "PRESS P / TAP TO RESUME", 23).setOrigin(0.5);
    this.overlay = scene.add.container(0, 0, [this.overlayShade, modal, title, prompt])
      .setScrollFactor(0)
      .setDepth(PAUSE_DEPTH + 1);
    this.overlayShade.on("pointerdown", this.onResumePointer);
    this.setFlowState("title");
  }

  consumeToggleRequest(): boolean {
    const requested = this.keyboardToggleRequested || this.touchToggleRequested;
    this.keyboardToggleRequested = false;
    this.touchToggleRequested = false;
    return requested;
  }

  setFlowState(state: GameFlowState): void {
    this.button.setVisible(state === "playing");
    this.overlay.setVisible(state === "paused");
  }

  destroy(): void {
    this.buttonPanel.off("pointerdown", this.onPausePointer);
    this.overlayShade.off("pointerdown", this.onResumePointer);
    this.scene.input.keyboard?.off("keydown-P", this.onPauseKey);
    this.button.destroy(true);
    this.overlay.destroy(true);
  }
}
