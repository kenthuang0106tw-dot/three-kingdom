export type CameraLockReason = "encounter";

export type CameraLockState = {
  readonly reason: CameraLockReason | null;
};

export function createCameraLockState(): CameraLockState {
  return { reason: null };
}

export function lockCamera(_state: CameraLockState, reason: CameraLockReason): CameraLockState {
  return { reason };
}

export function unlockCamera(state: CameraLockState, reason: CameraLockReason): CameraLockState {
  return state.reason === reason ? { reason: null } : state;
}

export function isCameraLocked(state: CameraLockState): boolean {
  return state.reason !== null;
}
