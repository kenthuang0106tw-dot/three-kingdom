import * as Phaser from "phaser";
import { createActionSnapshot, type ActionSnapshot, type DirectionButtons } from "./ActionSnapshot";

type TouchAction = keyof DirectionButtons | "attack";

const BUTTON_LAYOUT: ReadonlyArray<{
  action: TouchAction;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}> = [
  { action: "up", x: 112, y: 570, width: 64, height: 54, label: "▲" },
  { action: "down", x: 112, y: 650, width: 64, height: 54, label: "▼" },
  { action: "left", x: 42, y: 610, width: 64, height: 54, label: "◀" },
  { action: "right", x: 182, y: 610, width: 64, height: 54, label: "▶" },
  { action: "attack", x: 1134, y: 610, width: 112, height: 86, label: "J" },
];

/** Converts Phaser pointer button presses into the shared gameplay action snapshot. */
export class TouchInputController {
  private readonly activePointers = new Map<number, TouchAction>();
  private readonly buttons: Phaser.GameObjects.GameObject[] = [];
  private attackPressed = false;
  private readonly onPointerCancel = (pointer: Phaser.Input.Pointer) => this.release(pointer.id);
  private readonly onGameOut = () => this.releaseAll();

  constructor(private readonly scene: Phaser.Scene) {
    for (const config of BUTTON_LAYOUT) this.createButton(config);
    scene.input.on("pointercancel", this.onPointerCancel);
    scene.input.on("gameout", this.onGameOut);
  }

  readSnapshot(keyboard: DirectionButtons & { attackPressed: boolean }): ActionSnapshot {
    const touch = this.getTouchButtons();
    const attackPressed = keyboard.attackPressed || this.consumeAttackPress();
    return createActionSnapshot({
      up: keyboard.up || touch.up,
      down: keyboard.down || touch.down,
      left: keyboard.left || touch.left,
      right: keyboard.right || touch.right,
    }, attackPressed);
  }

  destroy() {
    this.scene.input.off("pointercancel", this.onPointerCancel);
    this.scene.input.off("gameout", this.onGameOut);
    this.releaseAll();
    for (const button of this.buttons) button.destroy();
    this.buttons.length = 0;
  }

  private createButton(config: (typeof BUTTON_LAYOUT)[number]) {
    const background = this.scene.add.rectangle(config.x, config.y, config.width, config.height, 0x07120d, 0.52)
      .setStrokeStyle(2, 0xcfe9d4, 0.65)
      .setScrollFactor(0)
      .setDepth(9500)
      .setInteractive({ useHandCursor: false });
    const label = this.scene.add.text(config.x, config.y, config.label, {
      fontFamily: "Arial, sans-serif",
      fontSize: config.action === "attack" ? "32px" : "25px",
      color: "#ffffff",
    }).setOrigin(0.5).setAlpha(0.9).setScrollFactor(0).setDepth(9501);
    this.buttons.push(background, label);

    background.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.activePointers.set(pointer.id, config.action);
      if (config.action === "attack") this.attackPressed = true;
      background.setFillStyle(0x7ca887, 0.72);
    });
    const release = (pointer: Phaser.Input.Pointer) => {
      if (this.activePointers.get(pointer.id) !== config.action) return;
      this.release(pointer.id);
      background.setFillStyle(0x07120d, 0.52);
    };
    background.on("pointerup", release);
    background.on("pointerupoutside", release);
    background.on("pointerout", release);
  }

  private getTouchButtons(): DirectionButtons {
    const buttons: DirectionButtons = { up: false, down: false, left: false, right: false };
    for (const action of this.activePointers.values()) {
      if (action in buttons) buttons[action as keyof DirectionButtons] = true;
    }
    return buttons;
  }

  private consumeAttackPress() {
    const pressed = this.attackPressed;
    this.attackPressed = false;
    return pressed;
  }

  private release(pointerId: number) {
    this.activePointers.delete(pointerId);
  }

  private releaseAll() {
    this.activePointers.clear();
  }
}
