export type AccessibilitySettingsSnapshot = Readonly<{
  reducedFlash: boolean;
  reducedShake: boolean;
}>;

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettingsSnapshot = Object.freeze({
  reducedFlash: false,
  reducedShake: false,
});

export const ACCESSIBILITY_PRESENTATION = Object.freeze({
  fullFlashTint: 0xffffff,
  reducedFlashTint: 0x9fb3a0,
  fullShakeIntensity: 0.003,
  reducedShakeIntensity: 0.0008,
});

export function resolveFlashTint(settings: AccessibilitySettingsSnapshot): number {
  return settings.reducedFlash
    ? ACCESSIBILITY_PRESENTATION.reducedFlashTint
    : ACCESSIBILITY_PRESENTATION.fullFlashTint;
}

export function resolveShakeIntensity(settings: AccessibilitySettingsSnapshot): number {
  return settings.reducedShake
    ? ACCESSIBILITY_PRESENTATION.reducedShakeIntensity
    : ACCESSIBILITY_PRESENTATION.fullShakeIntensity;
}

/** Scene-owned session settings. Scene restart deliberately does not reset them. */
export class AccessibilitySettings {
  private state = DEFAULT_ACCESSIBILITY_SETTINGS;

  getSnapshot(): AccessibilitySettingsSnapshot {
    return this.state;
  }

  toggleReducedFlash(): AccessibilitySettingsSnapshot {
    this.state = Object.freeze({ ...this.state, reducedFlash: !this.state.reducedFlash });
    return this.state;
  }

  toggleReducedShake(): AccessibilitySettingsSnapshot {
    this.state = Object.freeze({ ...this.state, reducedShake: !this.state.reducedShake });
    return this.state;
  }
}
