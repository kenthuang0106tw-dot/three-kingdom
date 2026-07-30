import * as Phaser from "phaser";
import type { PlayerDefinition } from "./PlayerDefinition.ts";

export class PlayerActor {
  readonly bodyZone: Phaser.GameObjects.Zone;
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly shadow: Phaser.GameObjects.Image;
  readonly body: Phaser.Physics.Arcade.Body;
  private readonly definition: PlayerDefinition;
  private facing: 1 | -1 = 1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    footY: number,
    definition: PlayerDefinition,
  ) {
    this.definition = definition;
    const { body, presentation } = definition;
    this.bodyZone = scene.add.zone(x, footY, body.width, body.height).setOrigin(0.5, 1);
    scene.physics.add.existing(this.bodyZone);
    this.body = this.bodyZone.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true).setAllowGravity(false);
    this.shadow = scene.add.image(
      x,
      footY + presentation.shadowOffsetY,
      "combat-effects",
      "actor-shadow",
    ).setAlpha(presentation.shadowAlpha);
    this.sprite = scene.add.sprite(x, footY, definition.textureKey, presentation.idleFrame)
      .setOrigin(presentation.originX, presentation.originY)
      .setScale(presentation.displayScale);
  }

  setFacing(direction: 1 | -1): void {
    this.facing = direction;
    this.sprite.setFlipX(direction < 0);
  }

  showIdleFrame(): void {
    const { presentation } = this.definition;
    this.sprite.setOrigin(presentation.originX, presentation.originY)
      .setScale(presentation.displayScale)
      .setFlipX(this.facing < 0)
      .stop()
      .setFrame(presentation.idleFrame);
  }

  playWalk(): void {
    const { presentation } = this.definition;
    this.sprite.setOrigin(presentation.originX, presentation.originY)
      .setScale(presentation.displayScale)
      .setFlipX(this.facing < 0)
      .play(this.definition.animations.walk.key);
  }

  playAttack(animationKey: string): void {
    const { presentation } = this.definition;
    this.sprite.setOrigin(presentation.originX, presentation.originY)
      .setScale(presentation.displayScale)
      .setFlipX(this.facing < 0)
      .play(animationKey);
  }

  playHurt(): void {
    this.sprite.setFlipX(this.facing < 0).play(this.definition.animations.hurt.key, true);
  }

  playDead(): void {
    this.sprite.setFlipX(this.facing < 0).play(this.definition.animations.dead.key, true);
  }

  syncVisuals(): void {
    const x = Math.round(this.bodyZone.x);
    const y = Math.round(this.bodyZone.y);
    this.shadow.setPosition(x, y + this.definition.presentation.shadowOffsetY).setDepth(y - 1);
    this.sprite.setPosition(x, y).setDepth(y);
  }

  destroy(): void {
    this.sprite.destroy();
    this.shadow.destroy();
    this.bodyZone.destroy();
  }
}
