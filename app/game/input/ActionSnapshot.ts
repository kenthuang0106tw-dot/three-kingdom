export type DirectionButtons = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export type ActionSnapshot = DirectionButtons & {
  moveX: number;
  moveY: number;
  attackPressed: boolean;
};

export function createActionSnapshot(buttons: DirectionButtons, attackPressed = false): ActionSnapshot {
  const rawX = Number(buttons.right) - Number(buttons.left);
  const rawY = Number(buttons.down) - Number(buttons.up);
  const length = Math.hypot(rawX, rawY);
  const scale = length > 0 ? 1 / length : 0;
  return {
    ...buttons,
    moveX: rawX * scale,
    moveY: rawY * scale,
    attackPressed,
  };
}
