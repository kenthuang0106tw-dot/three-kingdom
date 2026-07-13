import * as Phaser from "phaser";
import { BOSS_ATTACKS } from "./BossAttackMetadata";
import { BossDecisionPolicy } from "./BossDecisionPolicy";
import { BossLifecycle, type BossDamageResult, type BossState } from "./BossLifecycle";
import type { GameplayClock, RandomSource } from "../time/GameplayTime";

export const BOSS_ACTOR_CONFIG = Object.freeze({
  maxHp: 8,
  displayScale: 0.9,
  frameSize: 448,
  feetY: 420,
  bodyWidth: 96,
  bodyHeight: 48,
  deathFadeMs: 500,
});

const LIFECYCLE_TEXTURE = "boss-warlord-lifecycle";
const ATTACK_TEXTURE = "boss-warlord-attacks";
const IDLE_ANIMATION = "boss-idle";
const HURT_ANIMATION = "boss-hurt";
const PHASE_ANIMATION = "boss-phase";
const DEAD_ANIMATION = "boss-dead";

type BossActorCallbacks = Readonly<{ onCleaned?: () => void }>;

/** Scene-owned Phaser presentation for the first Boss. EnemyManager never owns this actor. */
export class BossActor {
  readonly targetId = 10_000;
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly bodyZone: Phaser.GameObjects.Zone;
  readonly body: Phaser.Physics.Arcade.Body;
  readonly lifecycle = new BossLifecycle(BOSS_ACTOR_CONFIG.maxHp);
  private readonly scene: Phaser.Scene;
  private readonly decision: BossDecisionPolicy;
  private readonly callbacks: BossActorCallbacks;
  private deathTween?: Phaser.Tweens.Tween;

  constructor(
    scene: Phaser.Scene,
    x: number,
    footY: number,
    clock: GameplayClock,
    random: RandomSource,
    callbacks: BossActorCallbacks = {},
  ) {
    this.scene = scene;
    this.callbacks = callbacks;
    this.decision = new BossDecisionPolicy(clock, random, BOSS_ATTACKS);
    this.createAnimations();

    this.bodyZone = scene.add.zone(x, footY, BOSS_ACTOR_CONFIG.bodyWidth, BOSS_ACTOR_CONFIG.bodyHeight)
      .setOrigin(0.5, 1);
    scene.physics.add.existing(this.bodyZone);
    this.body = this.bodyZone.body as Phaser.Physics.Arcade.Body;
    this.body.setAllowGravity(false).setImmovable(true).setCollideWorldBounds(true);

    this.sprite = scene.add.sprite(x, footY, LIFECYCLE_TEXTURE, "idle-0")
      .setOrigin(0.5, BOSS_ACTOR_CONFIG.feetY / BOSS_ACTOR_CONFIG.frameSize)
      .setScale(BOSS_ACTOR_CONFIG.displayScale)
      .setFlipX(true);
    this.sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this);
    this.lifecycle.activate();
    this.playIdle();
    this.syncVisuals();
  }

  get state(): BossState { return this.lifecycle.state; }
  get hp(): number { return this.lifecycle.hp; }
  get phase(): 1 | 2 { return this.lifecycle.phase; }
  get isDamageable(): boolean { return this.state === "idle" || this.state === "attack"; }

  update(): void {
    if (this.state === "cleaned") return;
    if (this.state === "idle") {
      const attackKey = this.decision.selectAttack(this.state);
      if (attackKey) {
        const attack = BOSS_ATTACKS.find(definition => definition.key === attackKey);
        if (attack) {
          this.lifecycle.transition("attack");
          this.sprite.play(attack.animationKey);
        }
      }
    }
    this.syncVisuals();
  }

  damage(amount: number): BossDamageResult {
    if (this.state === "attack") this.decision.completeAttack(this.state);
    const result = this.lifecycle.applyDamage(amount);
    if (!result.applied) return result;
    this.body.stop();
    if (result.becameDead) {
      this.body.enable = false;
      this.sprite.play(DEAD_ANIMATION);
    } else {
      this.sprite.play(result.phaseChanged ? PHASE_ANIMATION : HURT_ANIMATION);
    }
    return result;
  }

  syncVisuals(): void {
    const x = Math.round(this.bodyZone.x);
    const y = Math.round(this.bodyZone.y);
    this.sprite.setPosition(x, y).setDepth(y);
  }

  destroy(): void { this.cleanup(); }

  private createAnimations(): void {
    const definitions = [
      { key: IDLE_ANIMATION, texture: LIFECYCLE_TEXTURE, frames: ["idle-0", "idle-1"], frameRate: 4, repeat: -1 },
      { key: HURT_ANIMATION, texture: LIFECYCLE_TEXTURE, frames: ["hurt-0", "hurt-1"], frameRate: 8, repeat: 0 },
      { key: PHASE_ANIMATION, texture: LIFECYCLE_TEXTURE, frames: ["phase-0", "phase-1", "phase-2"], frameRate: 6, repeat: 0 },
      { key: DEAD_ANIMATION, texture: LIFECYCLE_TEXTURE, frames: ["dead-0", "dead-1", "dead-2", "dead-3"], frameRate: 6, repeat: 0 },
      ...BOSS_ATTACKS.map(attack => ({
        key: attack.animationKey,
        texture: ATTACK_TEXTURE,
        frames: attack.frames,
        frameRate: attack.frameRate,
        repeat: 0,
      })),
    ];
    for (const definition of definitions) {
      if (this.scene.anims.exists(definition.key)) continue;
      this.scene.anims.create({
        key: definition.key,
        frames: definition.frames.map(frame => ({ key: definition.texture, frame })),
        frameRate: definition.frameRate,
        repeat: definition.repeat,
      });
    }
  }

  private handleAnimationComplete(animation: Phaser.Animations.Animation): void {
    if (this.state === "attack" && BOSS_ATTACKS.some(attack => attack.animationKey === animation.key)) {
      this.decision.completeAttack(this.state);
      this.lifecycle.transition("idle");
      this.playIdle();
      return;
    }
    if (this.state === "hurt" && (animation.key === HURT_ANIMATION || animation.key === PHASE_ANIMATION)) {
      this.lifecycle.transition("idle");
      this.playIdle();
      return;
    }
    if (this.state === "dead" && animation.key === DEAD_ANIMATION) this.beginDeathFade();
  }

  private playIdle(): void {
    this.sprite.setTexture(LIFECYCLE_TEXTURE).play(IDLE_ANIMATION);
  }

  private beginDeathFade(): void {
    if (this.deathTween) return;
    this.deathTween = this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: BOSS_ACTOR_CONFIG.deathFadeMs,
      onComplete: () => this.cleanup(),
    });
  }

  private cleanup(): boolean {
    if (!this.lifecycle.cleanup()) return false;
    this.decision.reset();
    if (this.deathTween) {
      this.deathTween.stop();
      this.deathTween = undefined;
    }
    this.sprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this);
    this.body.enable = false;
    this.sprite.destroy();
    this.bodyZone.destroy();
    this.callbacks.onCleaned?.();
    return true;
  }
}
