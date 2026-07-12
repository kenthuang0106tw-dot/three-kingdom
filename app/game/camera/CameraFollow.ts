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
