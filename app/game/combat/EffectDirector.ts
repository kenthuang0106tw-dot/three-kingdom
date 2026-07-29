import * as Phaser from "phaser";
import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  resolveFlashTint,
  resolveShakeIntensity,
  type AccessibilitySettingsSnapshot,
} from "../accessibility/AccessibilitySettings";
import { LifecycleClock } from "../time/LifecycleClock";

export const EFFECT_PARAMS = {
  hitStopMs: (1000 / 60) * 4,
  hitFlashMs: 90,
  knockbackDistance: 26,
  knockbackMs: 120,
  cameraShakeMs: 50,
  cameraShakeIntensity: 0.003,
  hitSparkFrameRate: 24,
} as const;

type SyncCallback = () => void;

/** Owns hit presentation and timing, without resolving damage or actor state. */
export class EffectDirector {
  private readonly timers = new Set<Phaser.Time.TimerEvent>();
  private readonly tweens = new Set<Phaser.Tweens.Tween>();
  private readonly scene: Phaser.Scene;
  private readonly lifecycleClock: LifecycleClock;
  private readonly getAccessibilitySettings: () => AccessibilitySettingsSnapshot;

  constructor(
    scene: Phaser.Scene,
    lifecycleClock: LifecycleClock,
    getAccessibilitySettings: () => AccessibilitySettingsSnapshot = () => DEFAULT_ACCESSIBILITY_SETTINGS,
  ) {
    this.scene = scene;
    this.lifecycleClock = lifecycleClock;
    this.getAccessibilitySettings = getAccessibilitySettings;
  }

  createHitSparkAnimation() {
    if (!this.scene.anims.exists("hit-spark")) {
      this.scene.anims.create({
        key: "hit-spark",
        frames: [0, 1, 2, 3, 4].map(frame => ({ key: "combat-effects", frame: `hit-spark-${frame}` })),
        frameRate: EFFECT_PARAMS.hitSparkFrameRate,
        repeat: 0,
      });
    }
    if (!this.scene.anims.exists("impact-dust")) {
      this.scene.anims.create({
        key: "impact-dust",
        frames: [0, 1, 2, 3].map(frame => ({ key: "combat-effects", frame: `dust-${frame}` })),
        frameRate: EFFECT_PARAMS.hitSparkFrameRate,
        repeat: 0,
      });
    }
  }

  flash(sprite: Phaser.GameObjects.Sprite) {
    sprite.setTintFill(resolveFlashTint(this.getAccessibilitySettings()));
    this.schedule(EFFECT_PARAMS.hitFlashMs, () => {
      if (sprite.active) sprite.clearTint();
    });
  }

  knockback(target: Phaser.GameObjects.Zone, targetX: number, sync: SyncCallback) {
    const tween = this.scene.tweens.add({
      targets: target,
      x: targetX,
      duration: EFFECT_PARAMS.knockbackMs,
      ease: "Cubic.Out",
      onUpdate: sync,
      onComplete: sync,
    });
    this.tweens.add(tween);
    tween.once(Phaser.Tweens.Events.TWEEN_COMPLETE, () => this.tweens.delete(tween));
  }

  cameraShake() {
    this.scene.cameras.main.shake(
      EFFECT_PARAMS.cameraShakeMs,
      resolveShakeIntensity(this.getAccessibilitySettings()),
    );
  }

  beginHitStop(duration = EFFECT_PARAMS.hitStopMs) {
    if (this.lifecycleClock.isPaused()) return false;
    this.lifecycleClock.beginHitStop(duration);
    return true;
  }

  isHitStopActive() {
    return this.lifecycleClock.state.has("hitStop");
  }

  createHitSpark(x: number, y: number) {
    this.createHitSparkAnimation();
    const spark = this.scene.add.sprite(x, y, "combat-effects", "hit-spark-0").setDepth(2000).play("hit-spark");
    const dustY = y + 28;
    const dust = this.scene.add.sprite(x, dustY, "combat-effects", "dust-0")
      .setDepth(Math.round(dustY) - 1)
      .play("impact-dust");
    spark.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => spark.destroy());
    dust.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => dust.destroy());
  }

  destroy() {
    for (const timer of this.timers) timer.remove(false);
    this.timers.clear();
    for (const tween of this.tweens) tween.stop();
    this.tweens.clear();
  }

  private schedule(delay: number, callback: () => void) {
    const timer = this.scene.time.delayedCall(delay, () => {
      this.timers.delete(timer);
      callback();
    });
    this.timers.add(timer);
  }
}
