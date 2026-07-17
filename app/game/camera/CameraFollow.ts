export type CameraRect = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type CameraScroll = {
  readonly x: number;
  readonly y: number;
};

export type CameraHandoffState = Readonly<CameraScroll & {
  active: boolean;
}>;

const CAMERA_HANDOFF_SPEED = 960;
const CAMERA_HANDOFF_MAX_STEP = 32;

export function calculateCameraScroll(
  target: { readonly x: number; readonly y: number },
  world: CameraRect,
  viewport: { readonly width: number; readonly height: number },
): CameraScroll {
  const maxX = Math.max(world.x, world.x + world.width - viewport.width);
  const maxY = Math.max(world.y, world.y + world.height - viewport.height);
  const desiredX = target.x - viewport.width / 2;
  const desiredY = target.y - viewport.height / 2;
  return {
    x: Math.min(Math.max(desiredX, world.x), maxX),
    y: Math.min(Math.max(desiredY, world.y), maxY),
  };
}

export function beginCameraHandoff(scroll: CameraScroll): CameraHandoffState {
  return { active: true, x: scroll.x, y: scroll.y };
}

export function advanceCameraHandoff(
  state: CameraHandoffState,
  target: CameraScroll,
  deltaMs: number,
): CameraHandoffState {
  if (!state.active) return { active: false, x: target.x, y: target.y };
  const deltaX = target.x - state.x;
  const deltaY = target.y - state.y;
  const distance = Math.hypot(deltaX, deltaY);
  const maxStep = Math.min(Math.max(deltaMs, 0) * CAMERA_HANDOFF_SPEED / 1000, CAMERA_HANDOFF_MAX_STEP);
  if (distance === 0 || distance <= maxStep) return { active: false, x: target.x, y: target.y };
  if (maxStep === 0) return state;
  const ratio = maxStep / distance;
  return {
    active: true,
    x: state.x + deltaX * ratio,
    y: state.y + deltaY * ratio,
  };
}
