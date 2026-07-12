import * as Phaser from "phaser";

export class PlayerActor {
  readonly bodyZone: Phaser.GameObjects.Zone;
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly body: Phaser.Physics.Arcade.Body;
  private facing: 1 | -1 = 1;

  constructor(scene: Phaser.Scene, x: number, footY: number) {
    this.bodyZone = scene.add.zone(x, footY, 86, 54).setOrigin(0.5, 1);
    scene.physics.add.existing(this.bodyZone);
    this.body = this.bodyZone.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true).setAllowGravity(false);
    this.sprite = scene.add.sprite(x, footY, "guanyu-idle", "idle-0");
  }

  setFacing(direction: 1 | -1): void {
    this.facing = direction;
    this.sprite.setFlipX(direction < 0);
  }

  showIdleFrame(): void {
    this.sprite.stop().setTexture("guanyu-idle", "idle-0")
      .setOrigin(0.5, 1388 / 1536).setScale(0.22).setFlipX(this.facing < 0);
  }

  playWalk(originY: number): void {
    this.sprite.setOrigin(0.5, originY).setScale(0.44)
      .setFlipX(this.facing < 0).play("guanyu-walk");
  }

  playAttack(animationKey: string, originY: number): void {
    this.sprite.setOrigin(0.5, originY).setScale(0.64)
      .setFlipX(this.facing < 0).play(animationKey);
  }

  setAnimationOrigin(originY: number): void {
    this.sprite.setOrigin(0.5, originY);
  }

  syncVisuals(): void {
    const x = Math.round(this.bodyZone.x);
    const y = Math.round(this.bodyZone.y);
    this.sprite.setPosition(x, y).setDepth(y);
  }

  destroy(): void {
    this.sprite.destroy();
    this.bodyZone.destroy();
  }
}
