import * as Phaser from "phaser";
import { AccessibilitySettings } from "../accessibility/AccessibilitySettings";
import type { GameFlowState } from "../flow/GameFlowStateMachine";
import { addButtonFrame, addModalFrame, addUiText, UI_COLORS } from "./UiArt";

const PAUSE_DEPTH = 23_000;

/** Owns the one Phaser keyboard/touch pause request path and its presentation. */
export class PauseController {
  private readonly button: Phaser.GameObjects.Container;
  private readonly overlay: Phaser.GameObjects.Container;
  private readonly buttonPanel: Phaser.GameObjects.Rectangle;
  private readonly overlayShade: Phaser.GameObjects.Rectangle;
  private readonly flashPanel: Phaser.GameObjects.Rectangle;
  private readonly shakePanel: Phaser.GameObjects.Rectangle;
  private readonly flashLabel: Phaser.GameObjects.BitmapText;
  private readonly shakeLabel: Phaser.GameObjects.BitmapText;
  private touchToggleRequested = false;
  private keyboardToggleRequested = false;

  private readonly onPauseKey = (event: KeyboardEvent) => {
    if (!event.repeat) this.keyboardToggleRequested = true;
  };
  private readonly onPausePointer = () => { this.touchToggleRequested = true; };
  private readonly onResumePointer = () => { this.touchToggleRequested = true; };
  private readonly onFlashKey = (event: KeyboardEvent) => {
    if (this.overlay.visible && !event.repeat) this.toggleFlash();
  };
  private readonly onShakeKey = (event: KeyboardEvent) => {
    if (this.overlay.visible && !event.repeat) this.toggleShake();
  };
  private readonly onFlashPointer = () => this.toggleFlash();
  private readonly onShakePointer = () => this.toggleShake();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly settings: AccessibilitySettings,
    private readonly onSettingsChanged: () => void,
  ) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable");
    keyboard.on("keydown-P", this.onPauseKey);
    keyboard.on("keydown-F", this.onFlashKey);
    keyboard.on("keydown-K", this.onShakeKey);

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
    const modal = addModalFrame(scene, 640, 360, 720, 390);
    const title = addUiText(scene, 640, 232, "PAUSED", 54, UI_COLORS.antiqueGold).setOrigin(0.5);
    this.flashPanel = scene.add.rectangle(640, 330, 500, 54, 0x000000, 0)
      .setInteractive({ useHandCursor: false });
    this.shakePanel = scene.add.rectangle(640, 400, 500, 54, 0x000000, 0)
      .setInteractive({ useHandCursor: false });
    const flashFrame = addButtonFrame(scene, 640, 330, 500, 54);
    const shakeFrame = addButtonFrame(scene, 640, 400, 500, 54);
    this.flashLabel = addUiText(scene, 640, 330, "", 21).setOrigin(0.5);
    this.shakeLabel = addUiText(scene, 640, 400, "", 21).setOrigin(0.5);
    const prompt = addUiText(scene, 640, 478, "P / TAP BACKGROUND TO RESUME", 21).setOrigin(0.5);
    this.overlay = scene.add.container(0, 0, [
      this.overlayShade,
      modal,
      title,
      this.flashPanel,
      flashFrame,
      this.flashLabel,
      this.shakePanel,
      shakeFrame,
      this.shakeLabel,
      prompt,
    ])
      .setScrollFactor(0)
      .setDepth(PAUSE_DEPTH + 1);
    this.overlayShade.on("pointerdown", this.onResumePointer);
    this.flashPanel.on("pointerdown", this.onFlashPointer);
    this.shakePanel.on("pointerdown", this.onShakePointer);
    this.refreshLabels();
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
    this.flashPanel.off("pointerdown", this.onFlashPointer);
    this.shakePanel.off("pointerdown", this.onShakePointer);
    this.scene.input.keyboard?.off("keydown-P", this.onPauseKey);
    this.scene.input.keyboard?.off("keydown-F", this.onFlashKey);
    this.scene.input.keyboard?.off("keydown-K", this.onShakeKey);
    this.button.destroy(true);
    this.overlay.destroy(true);
  }

  private toggleFlash(): void {
    this.settings.toggleReducedFlash();
    this.refreshLabels();
    this.onSettingsChanged();
  }

  private toggleShake(): void {
    this.settings.toggleReducedShake();
    this.refreshLabels();
    this.onSettingsChanged();
  }

  private refreshLabels(): void {
    const settings = this.settings.getSnapshot();
    this.flashLabel.setText(`FLASH [F]: ${settings.reducedFlash ? "REDUCED" : "FULL"}`);
    this.shakeLabel.setText(`SHAKE [K]: ${settings.reducedShake ? "REDUCED" : "FULL"}`);
  }
}
