import * as Phaser from "phaser";
import { BOSS_ATTACKS, BOSS_SOURCE_FACING, type BossAttackDefinition } from "./BossAttackMetadata";
import { canConsumeBossAttackHit, getBossAttackHitboxCenter, isBossAttackActiveFrame } from "./BossAttackCombat";
import { BossDecisionPolicy } from "./BossDecisionPolicy";
import { BossLifecycle, type BossDamageResult, type BossState } from "./BossLifecycle";
import {
  BOSS_LOCOMOTION_CONFIG,
  clampBossFeet,
  decideBossLocomotion,
  type BossBounds,
  type BossFacing,
  type BossPoint,
} from "./BossLocomotion";
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
const WALK_ANIMATION = "boss-walk";
const HURT_ANIMATION = "boss-hurt";
const PHASE_ANIMATION = "boss-phase";
const DEAD_ANIMATION = "boss-dead";

type BossCleanupReason = "defeated" | "destroyed";
type BossActorCallbacks = Readonly<{ onCleaned?: (reason: BossCleanupReason) => void }>;

/** Scene-owned Phaser presentation for the first Boss. EnemyManager never owns this actor. */
export class BossActor {
  readonly targetId = 10_000;
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly bodyZone: Phaser.GameObjects.Zone;
  readonly body: Phaser.Physics.Arcade.Body;
  readonly attackZone: Phaser.GameObjects.Zone;
  readonly attackBody: Phaser.Physics.Arcade.Body;
  readonly lifecycle = new BossLifecycle(BOSS_ACTOR_CONFIG.maxHp);
  private readonly scene: Phaser.Scene;
  private readonly decision: BossDecisionPolicy;
  private readonly callbacks: BossActorCallbacks;
  private deathTween?: Phaser.Tweens.Tween;
  private arenaBoundsRectangle?: Phaser.Geom.Rectangle;
  private currentFacing: BossFacing = -1;
  private canAttack = false;
  private currentAttack?: BossAttackDefinition;
  private currentAttackFrame = -1;
  private attackHitPlayer = false;
  private startedAttacks = 0;
  private completedAttacks = 0;
  private playerHits = 0;

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
    this.body.setAllowGravity(false).setImmovable(false).setCollideWorldBounds(true);

    this.attackZone = scene.add.zone(x, footY, 1, 1).setOrigin(0.5);
    scene.physics.add.existing(this.attackZone);
    this.attackBody = this.attackZone.body as Phaser.Physics.Arcade.Body;
    this.attackBody.setAllowGravity(false);
    this.disableAttackHitbox();

    this.sprite = scene.add.sprite(x, footY, LIFECYCLE_TEXTURE, "idle-0")
      .setOrigin(0.5, BOSS_ACTOR_CONFIG.feetY / BOSS_ACTOR_CONFIG.frameSize)
      .setScale(BOSS_ACTOR_CONFIG.displayScale)
      .setFlipX(false);
    this.sprite.on(Phaser.Animations.Events.ANIMATION_UPDATE, this.handleAnimationUpdate, this);
    this.sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this);
    this.lifecycle.activate();
    this.playIdle();
    this.syncVisuals();
  }

  get state(): BossState { return this.lifecycle.state; }
  get hp(): number { return this.lifecycle.hp; }
  get phase(): 1 | 2 { return this.lifecycle.phase; }
  get isDamageable(): boolean { return this.state === "idle" || this.state === "attack"; }
  get facing(): BossFacing { return this.currentFacing; }
  get attackEligible(): boolean { return this.canAttack; }
  get attackStartCount(): number { return this.startedAttacks; }
  get attackCompleteCount(): number { return this.completedAttacks; }
  get playerHitCount(): number { return this.playerHits; }
  get isAttackHitboxEnabled(): boolean { return this.attackBody.enable; }

  update(target: BossPoint, arenaBounds: BossBounds): void {
    if (this.state === "cleaned") return;
    this.body.setVelocity(0, 0);
    this.clampToArena(arenaBounds);
    if (this.attackBody.enable) this.positionAttackHitbox();
    this.canAttack = false;
    if (this.state === "idle") {
      const locomotion = decideBossLocomotion(
        this.state,
        { x: this.bodyZone.x, y: this.bodyZone.y },
        target,
        this.currentFacing,
      );
      this.setFacing(locomotion.facing);
      this.canAttack = locomotion.attackEligible;
      if (locomotion.isMoving) {
        this.body.setVelocity(locomotion.velocityX, locomotion.velocityY);
        this.playWalk();
      } else {
        this.playIdle();
        if (locomotion.attackEligible) {
          const attackKey = this.decision.selectAttack(this.state);
          const attack = BOSS_ATTACKS.find(definition => definition.key === attackKey);
          if (attack) this.beginAttack(attack);
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
    this.disableAttackHitbox();
    this.currentAttack = undefined;
    this.currentAttackFrame = -1;
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

  tryConsumePlayerHit(playerFeetY: number): boolean {
    const canHit = canConsumeBossAttackHit({
      state: this.state,
      attack: this.currentAttack,
      sourceFrameIndex: this.currentAttackFrame,
      alreadyHitPlayer: this.attackHitPlayer,
      bossFeetY: this.bodyZone.y,
      playerFeetY,
      alignmentToleranceY: BOSS_LOCOMOTION_CONFIG.alignmentToleranceY,
    });
    if (!canHit) return false;
    this.attackHitPlayer = true;
    this.playerHits += 1;
    this.disableAttackHitbox();
    return true;
  }

  private createAnimations(): void {
    const definitions = [
      { key: IDLE_ANIMATION, texture: LIFECYCLE_TEXTURE, frames: ["idle-0", "idle-1"], frameRate: 4, repeat: -1 },
      { key: WALK_ANIMATION, texture: LIFECYCLE_TEXTURE, frames: ["walk-0", "walk-1", "walk-2", "walk-3"], frameRate: 8, repeat: -1 },
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
      this.disableAttackHitbox();
      this.currentAttack = undefined;
      this.currentAttackFrame = -1;
      this.completedAttacks += 1;
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

  private handleAnimationUpdate(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame): void {
    const attack = this.currentAttack;
    if (this.state !== "attack" || !attack || animation.key !== attack.animationKey) {
      this.disableAttackHitbox();
      return;
    }
    this.currentAttackFrame = frame.index - 1;
    if (isBossAttackActiveFrame(attack, this.currentAttackFrame) && !this.attackHitPlayer) this.enableAttackHitbox();
    else this.disableAttackHitbox();
  }

  private beginAttack(attack: BossAttackDefinition): void {
    this.currentAttack = attack;
    this.currentAttackFrame = -1;
    this.attackHitPlayer = false;
    this.startedAttacks += 1;
    this.disableAttackHitbox();
    this.lifecycle.transition("attack");
    this.sprite.play(attack.animationKey);
  }

  private playIdle(): void {
    if (this.sprite.anims.currentAnim?.key === IDLE_ANIMATION && this.sprite.anims.isPlaying) return;
    this.sprite.setTexture(LIFECYCLE_TEXTURE).play(IDLE_ANIMATION);
  }

  private playWalk(): void {
    if (this.sprite.anims.currentAnim?.key === WALK_ANIMATION && this.sprite.anims.isPlaying) return;
    this.sprite.setTexture(LIFECYCLE_TEXTURE).play(WALK_ANIMATION);
  }

  private setFacing(facing: BossFacing): void {
    this.currentFacing = facing;
    this.sprite.setFlipX(facing !== BOSS_SOURCE_FACING);
  }

  private enableAttackHitbox(): void {
    const attack = this.currentAttack;
    if (!attack) return;
    this.attackZone.setSize(attack.hitbox.width, attack.hitbox.height).setActive(true);
    this.attackBody.setSize(attack.hitbox.width, attack.hitbox.height, false);
    this.attackBody.enable = true;
    this.positionAttackHitbox();
  }

  private positionAttackHitbox(): void {
    const attack = this.currentAttack;
    if (!attack) return;
    const center = getBossAttackHitboxCenter(
      { x: this.bodyZone.x, y: this.bodyZone.y },
      this.currentFacing,
      attack,
    );
    const x = Math.round(center.x);
    const y = Math.round(center.y);
    this.attackZone.setPosition(x, y);
    this.attackBody.reset(x, y);
  }

  private disableAttackHitbox(): void {
    this.attackBody.stop();
    this.attackBody.enable = false;
    this.attackZone.setActive(false);
  }

  private clampToArena(bounds: BossBounds): void {
    const point = clampBossFeet(
      { x: this.bodyZone.x, y: this.bodyZone.y },
      bounds,
      BOSS_ACTOR_CONFIG.bodyWidth,
      BOSS_ACTOR_CONFIG.bodyHeight,
    );
    if (point.x !== this.bodyZone.x || point.y !== this.bodyZone.y) this.body.reset(point.x, point.y);
    if (!this.arenaBoundsRectangle) {
      this.arenaBoundsRectangle = new Phaser.Geom.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height);
      this.body.setBoundsRectangle(this.arenaBoundsRectangle);
    }
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
    const reason: BossCleanupReason = this.state === "dead" ? "defeated" : "destroyed";
    if (!this.lifecycle.cleanup()) return false;
    this.decision.reset();
    this.disableAttackHitbox();
    if (this.deathTween) {
      this.deathTween.stop();
      this.deathTween = undefined;
    }
    this.sprite.off(Phaser.Animations.Events.ANIMATION_UPDATE, this.handleAnimationUpdate, this);
    this.sprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this);
    this.body.enable = false;
    this.sprite.destroy();
    this.bodyZone.destroy();
    this.attackZone.destroy();
    this.callbacks.onCleaned?.(reason);
    return true;
  }
}
