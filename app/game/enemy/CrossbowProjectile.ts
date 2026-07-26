import * as Phaser from "phaser";
import { CROSSBOW_TIMING } from "./CrossbowLine";

/** Development-only straight projectile. It owns one body and is destroyed after its first target. */
export class CrossbowProjectile {
  readonly zone: Phaser.GameObjects.Zone;
  readonly body: Phaser.Physics.Arcade.Body;
  readonly graphic: Phaser.GameObjects.Graphics;
  private distance = 0;

  constructor(scene: Phaser.Scene, readonly shooterId: number, x: number, readonly y: number, readonly facing: 1 | -1) {
    this.zone = scene.add.zone(x, y, 28, 10).setOrigin(0.5);
    scene.physics.add.existing(this.zone);
    this.body = this.zone.body as Phaser.Physics.Arcade.Body;
    this.body.setAllowGravity(false).setVelocityX(facing * CROSSBOW_TIMING.projectileSpeed);
    this.graphic = scene.add.graphics().setDepth(9100);
    this.draw();
  }

  update(deltaMs: number) {
    // A locked shot is a horizontal lane, never a tracking or diagonal projectile.
    this.body.setVelocityY(0);
    this.distance += Math.abs(this.body.velocity.x) * deltaMs / 1000;
    this.zone.y = this.y;
    this.body.updateFromGameObject();
    this.graphic.setPosition(this.zone.x, this.zone.y);
  }

  get expired() { return this.distance >= CROSSBOW_TIMING.projectileRange; }

  destroy() {
    this.body.stop();
    this.zone.destroy();
    this.graphic.destroy();
  }

  private draw() {
    this.graphic.clear();
    this.graphic.fillStyle(0xf5d78b, 1).fillRect(-13, -2, 20, 4);
    this.graphic.fillStyle(0xffffff, 1).fillTriangle(14, 0, 6, -5, 6, 5);
    this.graphic.fillStyle(0x6e3820, 1).fillRect(-15, -5, 4, 10);
    this.graphic.setScale(this.facing, 1);
  }
}
