export type CameraLockReason = "encounter" | "boss";

export type CameraLockState = {
  readonly reasons: readonly CameraLockReason[];
};

export function createCameraLockState(): CameraLockState {
  return { reasons: [] };
}

export function lockCamera(state: CameraLockState, reason: CameraLockReason): CameraLockState {
  return state.reasons.includes(reason) ? state : { reasons: [...state.reasons, reason] };
}

export function unlockCamera(state: CameraLockState, reason: CameraLockReason): CameraLockState {
  return state.reasons.includes(reason)
    ? { reasons: state.reasons.filter(activeReason => activeReason !== reason) }
    : state;
}

export function isCameraLocked(state: CameraLockState): boolean {
  return state.reasons.length > 0;
}

export function hasCameraLock(state: CameraLockState, reason: CameraLockReason): boolean {
  return state.reasons.includes(reason);
}
