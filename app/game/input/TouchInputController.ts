import * as Phaser from "phaser";
import { createActionSnapshot, type ActionSnapshot, type DirectionButtons } from "./ActionSnapshot";
import { addUiText, UI_COLORS } from "../ui/UiArt";

const JOYSTICK_X = 128;
const JOYSTICK_Y = 612;
const JOYSTICK_RADIUS = 98;
const JOYSTICK_DEAD_ZONE = 18;
const JOYSTICK_SCALE = 1.25;
const ATTACK_BUTTON_SCALE = 1.35;

/** Converts a 360-degree analog joystick and attack button into the shared input snapshot. */
export class TouchInputController {
  private readonly controls: Phaser.GameObjects.GameObject[] = [];
  private joystickPointerId: number | null = null;
  private joystickX = 0;
  private joystickY = 0;
  private joystickKnob!: Phaser.GameObjects.Image;
  private attackButton!: Phaser.GameObjects.Image;
  private readonly attackPointerIds = new Set<number>();
  private attackPressed = false;

  private readonly onPointerMove = (pointer: Phaser.Input.Pointer) => {
    if (pointer.id === this.joystickPointerId) this.updateJoystick(pointer.x, pointer.y);
  };
  private readonly onPointerUp = (pointer: Phaser.Input.Pointer) => this.release(pointer.id);

  constructor(private readonly scene: Phaser.Scene) {
    this.createJoystick();
    this.createAttackButton();
    scene.input.on("pointermove", this.onPointerMove);
    scene.input.on("pointerup", this.onPointerUp);
    scene.input.on("pointerupoutside", this.onPointerUp);
    scene.input.on("pointercancel", this.onPointerUp);
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
    this.releaseAll();
    for (const control of this.controls) control.destroy();
    this.controls.length = 0;
  }

  private createJoystick() {
    const base = this.scene.add.image(JOYSTICK_X, JOYSTICK_Y, "ui-joystick-base")
      .setScale(JOYSTICK_SCALE)
      .setScrollFactor(0)
      .setDepth(9500)
      .setInteractive({ useHandCursor: false });
    this.joystickKnob = this.scene.add.image(JOYSTICK_X, JOYSTICK_Y, "ui-joystick-knob")
      .setScale(JOYSTICK_SCALE)
      .setScrollFactor(0)
      .setDepth(9501);
    this.controls.push(base, this.joystickKnob);

    base.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.joystickPointerId !== null) return;
      this.joystickPointerId = pointer.id;
      this.updateJoystick(pointer.x, pointer.y);
    });
  }

  private createAttackButton() {
    this.attackButton = this.scene.add.image(1134, 610, "ui-attack-frame")
      .setScale(ATTACK_BUTTON_SCALE)
      .setScrollFactor(0)
      .setDepth(9500)
      .setInteractive({ useHandCursor: false });
    const label = addUiText(this.scene, 1134, 588, "J", 36, UI_COLORS.antiqueGold)
      .setOrigin(0.5, 0).setAlpha(0.95).setScrollFactor(0).setDepth(9501);
    this.controls.push(this.attackButton, label);

    this.attackButton.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.attackPointerIds.add(pointer.id);
      this.attackPressed = true;
      this.attackButton.setTint(0xe0b86b);
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
    if (this.attackPointerIds.size === 0) this.attackButton.clearTint();
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
    this.attackButton.clearTint();
  }
}
