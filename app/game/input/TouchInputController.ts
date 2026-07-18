import * as Phaser from "phaser";
import { createActionSnapshot, type ActionSnapshot, type DirectionButtons } from "./ActionSnapshot";

const JOYSTICK_X = 128;
const JOYSTICK_Y = 612;
const JOYSTICK_RADIUS = 78;
const JOYSTICK_DEAD_ZONE = 18;

/** Converts a 360-degree analog joystick and attack button into the shared input snapshot. */
export class TouchInputController {
  private readonly controls: Phaser.GameObjects.GameObject[] = [];
  private joystickPointerId: number | null = null;
  private joystickX = 0;
  private joystickY = 0;
  private joystickKnob!: Phaser.GameObjects.Arc;
  private attackButton!: Phaser.GameObjects.Rectangle;
  private readonly attackPointerIds = new Set<number>();
  private attackPressed = false;

  private readonly onPointerMove = (pointer: Phaser.Input.Pointer) => {
    if (pointer.id === this.joystickPointerId) this.updateJoystick(pointer.x, pointer.y);
  };
  private readonly onPointerUp = (pointer: Phaser.Input.Pointer) => this.release(pointer.id);
  private readonly onGameOut = () => this.releaseAll();

  constructor(private readonly scene: Phaser.Scene) {
    this.createJoystick();
    this.createAttackButton();
    scene.input.on("pointermove", this.onPointerMove);
    scene.input.on("pointerup", this.onPointerUp);
    scene.input.on("pointerupoutside", this.onPointerUp);
    scene.input.on("pointercancel", this.onPointerUp);
    scene.input.on("gameout", this.onGameOut);
  }

  readSnapshot(keyboard: DirectionButtons & { attackPressed: boolean }): ActionSnapshot {
    const keyboardX = Number(keyboard.right) - Number(keyboard.left);
    const keyboardY = Number(keyboard.down) - Number(keyboard.up);
    const buttons = {
      up: keyboard.up || this.joystickY < 0,
      down: keyboard.down || this.joystickY > 0,
      left: keyboard.left || this.joystickX < 0,
      right: keyboard.right || this.joystickX > 0,
    };
    return createActionSnapshot(
      buttons,
      keyboard.attackPressed || this.consumeAttackPress(),
      { x: keyboardX + this.joystickX, y: keyboardY + this.joystickY },
    );
  }

  clearTransientInput() {
    this.releaseAll();
  }

  destroy() {
    this.scene.input.off("pointermove", this.onPointerMove);
    this.scene.input.off("pointerup", this.onPointerUp);
    this.scene.input.off("pointerupoutside", this.onPointerUp);
    this.scene.input.off("pointercancel", this.onPointerUp);
    this.scene.input.off("gameout", this.onGameOut);
    this.releaseAll();
    for (const control of this.controls) control.destroy();
    this.controls.length = 0;
  }

  private createJoystick() {
    const base = this.scene.add.circle(JOYSTICK_X, JOYSTICK_Y, JOYSTICK_RADIUS, 0x07120d, 0.48)
      .setStrokeStyle(3, 0xcfe9d4, 0.62)
      .setScrollFactor(0)
      .setDepth(9500)
      .setInteractive({ useHandCursor: false });
    const guide = this.scene.add.circle(JOYSTICK_X, JOYSTICK_Y, JOYSTICK_RADIUS * 0.56, 0xffffff, 0)
      .setStrokeStyle(2, 0xcfe9d4, 0.2)
      .setScrollFactor(0)
      .setDepth(9500);
    this.joystickKnob = this.scene.add.circle(JOYSTICK_X, JOYSTICK_Y, 34, 0xb9d8c0, 0.72)
      .setStrokeStyle(3, 0xffffff, 0.75)
      .setScrollFactor(0)
      .setDepth(9501);
    this.controls.push(base, guide, this.joystickKnob);

    base.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.joystickPointerId !== null) return;
      this.joystickPointerId = pointer.id;
      this.updateJoystick(pointer.x, pointer.y);
    });
  }

  private createAttackButton() {
    this.attackButton = this.scene.add.rectangle(1134, 610, 112, 86, 0x07120d, 0.52)
      .setStrokeStyle(2, 0xcfe9d4, 0.65)
      .setScrollFactor(0)
      .setDepth(9500)
      .setInteractive({ useHandCursor: false });
    const label = this.scene.add.text(1134, 610, "J", {
      fontFamily: "Arial, sans-serif",
      fontSize: "32px",
      color: "#ffffff",
    }).setOrigin(0.5).setAlpha(0.9).setScrollFactor(0).setDepth(9501);
    this.controls.push(this.attackButton, label);

    this.attackButton.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.attackPointerIds.add(pointer.id);
      this.attackPressed = true;
      this.attackButton.setFillStyle(0x7ca887, 0.72);
    });
  }

  private updateJoystick(pointerX: number, pointerY: number) {
    const dx = pointerX - JOYSTICK_X;
    const dy = pointerY - JOYSTICK_Y;
    const distance = Math.hypot(dx, dy);
    const clampScale = distance > JOYSTICK_RADIUS ? JOYSTICK_RADIUS / distance : 1;
    const clampedX = dx * clampScale;
    const clampedY = dy * clampScale;
    this.joystickKnob.setPosition(JOYSTICK_X + clampedX, JOYSTICK_Y + clampedY);

    if (distance <= JOYSTICK_DEAD_ZONE) {
      this.joystickX = 0;
      this.joystickY = 0;
      return;
    }
    const strength = Math.min(1, (distance - JOYSTICK_DEAD_ZONE) / (JOYSTICK_RADIUS - JOYSTICK_DEAD_ZONE));
    this.joystickX = (dx / distance) * strength;
    this.joystickY = (dy / distance) * strength;
  }

  private consumeAttackPress() {
    const pressed = this.attackPressed;
    this.attackPressed = false;
    return pressed;
  }

  private release(pointerId: number) {
    if (pointerId === this.joystickPointerId) this.resetJoystick();
    this.attackPointerIds.delete(pointerId);
    if (this.attackPointerIds.size === 0) this.attackButton.setFillStyle(0x07120d, 0.52);
  }

  private resetJoystick() {
    this.joystickPointerId = null;
    this.joystickX = 0;
    this.joystickY = 0;
    this.joystickKnob.setPosition(JOYSTICK_X, JOYSTICK_Y);
  }

  private releaseAll() {
    this.resetJoystick();
    this.attackPointerIds.clear();
    this.attackPressed = false;
    this.attackButton.setFillStyle(0x07120d, 0.52);
  }
}
