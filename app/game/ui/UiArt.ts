import * as Phaser from "phaser";

export const UI_FONT_KEY = "dragon-pixel";

export const UI_COLORS = Object.freeze({
  boneWhite: 0xd8d3bd,
  antiqueGold: 0xb98a39,
  signalRed: 0x8b2e27,
});

export function addUiText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size: number,
  tint: number = UI_COLORS.boneWhite,
) {
  return scene.add.bitmapText(x, y, UI_FONT_KEY, text, size).setTint(tint);
}

export function addHudFrame(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
  return scene.add.nineslice(x, y, "ui-hud-frame", undefined, width, height, 48, 48, 18, 18);
}

export function addModalFrame(scene: Phaser.Scene, x: number, y: number, width = 720, height = 300) {
  return scene.add.nineslice(x, y, "ui-modal-frame", undefined, width, height, 54, 54, 48, 48);
}

export function addButtonFrame(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
  return scene.add.nineslice(x, y, "ui-button-frame", undefined, width, height, 24, 24, 18, 18);
}
