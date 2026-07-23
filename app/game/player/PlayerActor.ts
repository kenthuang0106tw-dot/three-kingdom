import * as Phaser from "phaser";
import { GUANYU_DISPLAY_SCALE, GUANYU_ORIGIN_X, GUANYU_ORIGIN_Y, GUANYU_TEXTURE_KEY } from "./GuanYuAnimationMetadata.ts";

export class PlayerActor {
  readonly bodyZone: Phaser.GameObjects.Zone;
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly shadow: Phaser.GameObjects.Image;
  readonly body: Phaser.Physics.Arcade.Body;
  private facing: 1 | -1 = 1;

  constructor(scene: Phaser.Scene, x: number, footY: number) {
    this.bodyZone = scene.add.zone(x, footY, 86, 54).setOrigin(0.5, 1);
    scene.physics.add.existing(this.bodyZone);
    this.body = this.bodyZone.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true).setAllowGravity(false);
    this.shadow = scene.add.image(x, footY + 4, "combat-effects", "actor-shadow").setAlpha(0.54);
    this.sprite = scene.add.sprite(x, footY, GUANYU_TEXTURE_KEY, "idle-0")
      .setOrigin(GUANYU_ORIGIN_X, GUANYU_ORIGIN_Y)
      .setScale(GUANYU_DISPLAY_SCALE);
  }

  setFacing(direction: 1 | -1): void {
    this.facing = direction;
    this.sprite.setFlipX(direction < 0);
  }

  showIdleFrame(): void {
    this.sprite.setOrigin(GUANYU_ORIGIN_X, GUANYU_ORIGIN_Y)
      .setScale(GUANYU_DISPLAY_SCALE).setFlipX(this.facing < 0).play("guanyu-idle", true);
  }

  playWalk(): void {
    this.sprite.setOrigin(GUANYU_ORIGIN_X, GUANYU_ORIGIN_Y).setScale(GUANYU_DISPLAY_SCALE)
      .setFlipX(this.facing < 0).play("guanyu-walk");
  }

  playAttack(animationKey: string): void {
    this.sprite.setOrigin(GUANYU_ORIGIN_X, GUANYU_ORIGIN_Y).setScale(GUANYU_DISPLAY_SCALE)
      .setFlipX(this.facing < 0).play(animationKey);
  }

  playHurt(): void {
    this.sprite.setFlipX(this.facing < 0).play("guanyu-hurt", true);
  }

  playDead(): void {
    this.sprite.setFlipX(this.facing < 0).play("guanyu-dead", true);
  }

  syncVisuals(): void {
    const x = Math.round(this.bodyZone.x);
    const y = Math.round(this.bodyZone.y);
    this.shadow.setPosition(x, y + 4).setDepth(y - 1);
    this.sprite.setPosition(x, y).setDepth(y);
  }

  destroy(): void {
    this.sprite.destroy();
    this.shadow.destroy();
    this.bodyZone.destroy();
  }
}
