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

export type MovementVector = { x: number; y: number };

export function createActionSnapshot(
  buttons: DirectionButtons,
  attackPressed = false,
  movement?: MovementVector,
): ActionSnapshot {
  const rawX = movement?.x ?? Number(buttons.right) - Number(buttons.left);
  const rawY = movement?.y ?? Number(buttons.down) - Number(buttons.up);
  const length = Math.hypot(rawX, rawY);
  const scale = length > 1 ? 1 / length : 1;
  return {
    ...buttons,
    moveX: rawX * scale,
    moveY: rawY * scale,
    attackPressed,
  };
}
