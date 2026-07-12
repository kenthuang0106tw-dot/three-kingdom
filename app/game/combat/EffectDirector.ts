import * as Phaser from "phaser";
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

  constructor(scene: Phaser.Scene, lifecycleClock: LifecycleClock) {
    this.scene = scene;
    this.lifecycleClock = lifecycleClock;
  }

  createHitSparkAnimation() {
    if (!this.scene.anims.exists("hit-spark")) {
      const graphics = new Phaser.GameObjects.Graphics(this.scene);
      for (let frame = 0; frame < 5; frame += 1) {
        const key = `hit-spark-${frame}`;
        if (this.scene.textures.exists(key)) continue;
        const radius = 4 + frame * 4;
        graphics.clear();
        graphics.fillStyle(frame < 2 ? 0xffffff : 0xffd84a, 1);
        graphics.fillRect(24 - radius, 22, radius * 2, 4);
        graphics.fillRect(22, 24 - radius, 4, radius * 2);
        graphics.fillStyle(0xff7b24, Math.max(0.25, 1 - frame * 0.17));
        graphics.fillRect(24 - radius, 24 - radius, 4, 4);
        graphics.fillRect(24 + radius - 4, 24 - radius, 4, 4);
        graphics.fillRect(24 - radius, 24 + radius - 4, 4, 4);
        graphics.fillRect(24 + radius - 4, 24 + radius - 4, 4, 4);
        graphics.generateTexture(key, 48, 48);
      }
      graphics.destroy();
      this.scene.anims.create({
        key: "hit-spark",
        frames: [0, 1, 2, 3, 4].map(frame => ({ key: `hit-spark-${frame}` })),
        frameRate: EFFECT_PARAMS.hitSparkFrameRate,
        repeat: 0,
      });
    }
  }

  flash(sprite: Phaser.GameObjects.Sprite) {
    sprite.setTintFill(0xffffff);
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
    this.scene.cameras.main.shake(EFFECT_PARAMS.cameraShakeMs, EFFECT_PARAMS.cameraShakeIntensity);
  }

  beginHitStop() {
    if (this.lifecycleClock.isPaused()) return false;
    this.lifecycleClock.beginHitStop(EFFECT_PARAMS.hitStopMs);
    return true;
  }

  isHitStopActive() {
    return this.lifecycleClock.state.has("hitStop");
  }

  createHitSpark(x: number, y: number) {
    this.createHitSparkAnimation();
    const spark = this.scene.add.sprite(x, y, "hit-spark-0").setDepth(2000).play("hit-spark");
    spark.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => spark.destroy());
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
