import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  ACCESSIBILITY_PRESENTATION,
  AccessibilitySettings,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  resolveFlashTint,
  resolveShakeIntensity,
} from "../app/game/accessibility/AccessibilitySettings.ts";

test("accessibility settings preserve the default arcade presentation", () => {
  const settings = new AccessibilitySettings();
  assert.deepEqual(settings.getSnapshot(), DEFAULT_ACCESSIBILITY_SETTINGS);
  assert.equal(resolveFlashTint(settings.getSnapshot()), 0xffffff);
  assert.equal(resolveShakeIntensity(settings.getSnapshot()), 0.003);
});

test("reduced flash and shake are independent presentation-only policies", () => {
  const settings = new AccessibilitySettings();
  settings.toggleReducedFlash();
  assert.equal(resolveFlashTint(settings.getSnapshot()), ACCESSIBILITY_PRESENTATION.reducedFlashTint);
  assert.equal(resolveShakeIntensity(settings.getSnapshot()), ACCESSIBILITY_PRESENTATION.fullShakeIntensity);

  settings.toggleReducedShake();
  assert.equal(resolveShakeIntensity(settings.getSnapshot()), ACCESSIBILITY_PRESENTATION.reducedShakeIntensity);
  settings.toggleReducedFlash();
  assert.equal(resolveFlashTint(settings.getSnapshot()), ACCESSIBILITY_PRESENTATION.fullFlashTint);
});

test("MainScene owns one settings instance across Scene create and restart paths", async () => {
  const source = await readFile(new URL("../app/game/MainScene.ts", import.meta.url), "utf8");
  assert.match(source, /private readonly accessibilitySettings = new AccessibilitySettings\(\)/);
  assert.match(source, /\(\) => this\.accessibilitySettings\.getSnapshot\(\)/);
  assert.doesNotMatch(source, /accessibilitySettings\.(?:reset|clear)\(/);
});

test("Pause UI owns keyboard and pointer toggles with shutdown cleanup", async () => {
  const source = await readFile(new URL("../app/game/ui/PauseController.ts", import.meta.url), "utf8");
  assert.match(source, /keyboard\.on\("keydown-F", this\.onFlashKey\)/);
  assert.match(source, /keyboard\.on\("keydown-K", this\.onShakeKey\)/);
  assert.match(source, /flashPanel\.on\("pointerdown", this\.onFlashPointer\)/);
  assert.match(source, /shakePanel\.on\("pointerdown", this\.onShakePointer\)/);
  assert.match(source, /keyboard\?\.off\("keydown-F", this\.onFlashKey\)/);
  assert.match(source, /keyboard\?\.off\("keydown-K", this\.onShakeKey\)/);
});

test("EffectDirector changes only flash tint and shake intensity", async () => {
  const source = await readFile(new URL("../app/game/combat/EffectDirector.ts", import.meta.url), "utf8");
  assert.match(source, /setTintFill\(resolveFlashTint\(this\.getAccessibilitySettings\(\)\)\)/);
  assert.match(source, /resolveShakeIntensity\(this\.getAccessibilitySettings\(\)\)/);
  assert.match(source, /this\.schedule\(EFFECT_PARAMS\.hitFlashMs/);
  assert.match(source, /EFFECT_PARAMS\.cameraShakeMs/);
  assert.match(source, /this\.lifecycleClock\.beginHitStop\(duration\)/);
});
