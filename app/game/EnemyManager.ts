import * as Phaser from "phaser";
import { PhaserGameplayClock, SeededRandom, type GameplayClock, type RandomSource } from "./time/GameplayTime";

export type EnemyState = "idle" | "walk" | "attack" | "hurt" | "dead";

export const ENEMY_MAX_HP = 3;
export const ENEMY_ATTACK_X_RANGE = 110;
export const ENEMY_ATTACK_Y_RANGE = 45;
export const ENEMY_MIN_SPACING = 72;
export const ENEMY_DISPLAY_SCALE = 1.4;

const WALK_SPEED = 70;
const DETECTION_DISTANCE = 500;
const HURT_MS = 300;
const DIRECTOR_DELAY_MIN = 400;
const DIRECTOR_DELAY_MAX = 800;
const RECOVERY_MIN = 800;
const RECOVERY_MAX = 1200;
const FRAME_SIZE = 384;
const FEET_Y = 354;
const WALK_BOUNDS = new Phaser.Geom.Rectangle(70, 390, 1140, 245);

const FORMATION_SLOTS = [
  { name: "front", x: 135, y: 0 },
  { name: "upper-rear", x: -135, y: -80 },
  { name: "lower-front", x: 135, y: 80 },
] as const;

const TRANSITIONS: Record<EnemyState, ReadonlySet<EnemyState>> = {
  idle: new Set(["walk", "attack", "hurt", "dead"]),
  walk: new Set(["idle", "attack", "hurt", "dead"]),
  attack: new Set(["idle", "hurt", "dead"]),
  hurt: new Set(["idle", "dead"]),
  dead: new Set(),
};

export class EnemyCombatant {
  readonly bodyZone: Phaser.GameObjects.Zone;
  readonly attackZone: Phaser.GameObjects.Zone;
  readonly body: Phaser.Physics.Arcade.Body;
  readonly attackBody: Phaser.Physics.Arcade.Body;
  readonly sprite: Phaser.GameObjects.Sprite;
  state: EnemyState = "idle";
  hp = ENEMY_MAX_HP;
  facing: 1 | -1 = -1;
  cooldownUntil = 0;
  attackHitPlayer = false;
  lastPlayerAttackId = -1;
  hasAttackSlot = false;

  constructor(readonly id: number, readonly assignedSlot: number, scene: Phaser.Scene, x: number, y: number) {
    this.bodyZone = scene.add.zone(x, y, 58, 52).setOrigin(0.5, 1);
    scene.physics.add.existing(this.bodyZone);
    this.body = this.bodyZone.body as Phaser.Physics.Arcade.Body;
    this.body.setAllowGravity(false).setCollideWorldBounds(true);

    this.attackZone = scene.add.zone(x - 78, y - 58, 112, 68).setOrigin(0.5);
    scene.physics.add.existing(this.attackZone);
    this.attackBody = this.attackZone.body as Phaser.Physics.Arcade.Body;
    this.attackBody.setAllowGravity(false).setEnable(false);
    this.attackZone.setActive(false);

    this.sprite = scene.add.sprite(x, y, "enemy-soldier", "idle-0")
      .setOrigin(0.5, FEET_Y / FRAME_SIZE)
      .setScale(ENEMY_DISPLAY_SCALE)
      .setDepth(y)
      .play("enemy-idle");
  }

  get slotName() { return FORMATION_SLOTS[this.assignedSlot].name; }
}

type ManagerCallbacks = {
  onPlayerHit: (enemy: EnemyCombatant) => void;
  onAllDefeated: () => void;
};

export class EnemyManager {
  private readonly enemies: EnemyCombatant[] = [];
  private readonly colliders: Phaser.Physics.Arcade.Collider[] = [];
  private readonly colliderOwners = new Map<EnemyCombatant, Phaser.Physics.Arcade.Collider[]>();
  private readonly slotGraphics?: Phaser.GameObjects.Graphics;
  private currentAttacker: EnemyCombatant | null = null;
  private lastAttackerId: number | null = null;
  private directorReadyAt = 0;
  private readonly clock: GameplayClock;
  private readonly random: RandomSource;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly playerBodyZone: Phaser.GameObjects.Zone,
    private readonly callbacks: ManagerCallbacks,
    development: boolean,
    services: { clock?: GameplayClock; random?: RandomSource } = {},
  ) {
    this.clock = services.clock ?? new PhaserGameplayClock(scene);
    this.random = services.random ?? new SeededRandom(0x3a6f2d1);
    if (development) this.slotGraphics = scene.add.graphics().setDepth(9000);
  }

  spawnAll() {
    const spawns = [
      { x: 900, y: 560 },
      { x: 830, y: 455 },
      { x: 850, y: 625 },
    ];
    spawns.forEach((spawn, index) => this.addEnemy(new EnemyCombatant(index + 1, index, this.scene, spawn.x, spawn.y)));
  }

  private addEnemy(enemy: EnemyCombatant) {
    this.enemies.push(enemy);
    this.colliderOwners.set(enemy, []);
    const update = (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
      if (animation.key !== "enemy-attack") return;
      if (frame.index === 2 && enemy.state === "attack") this.enableAttackHitbox(enemy);
      else this.disableAttackHitbox(enemy);
    };
    const complete = (animation: Phaser.Animations.Animation) => this.handleAnimationComplete(enemy, animation);
    enemy.sprite.setData("animationUpdate", update).setData("animationComplete", complete);
    enemy.sprite.on(Phaser.Animations.Events.ANIMATION_UPDATE, update);
    enemy.sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, complete);
    const playerCollider = this.scene.physics.add.collider(this.playerBodyZone, enemy.bodyZone);
    this.colliders.push(playerCollider);
    this.colliderOwners.get(enemy)!.push(playerCollider);
    for (const other of this.enemies) {
      if (other !== enemy) {
        const collider = this.scene.physics.add.collider(other.bodyZone, enemy.bodyZone);
        this.colliders.push(collider);
        this.colliderOwners.get(enemy)!.push(collider);
        this.colliderOwners.get(other)!.push(collider);
      }
    }
    this.syncPhysicsFromZone(enemy);
  }

  update() {
    const alive = this.getLivingEnemies();
    this.drawSlots(alive);
    for (const enemy of alive) {
      enemy.body.setVelocity(0, 0);
      this.syncSprite(enemy);
      if (enemy.state === "dead" || enemy.state === "hurt") continue;
      if (enemy.state === "attack") {
        this.positionAttackHitbox(enemy);
        if (enemy.attackBody.enable && !enemy.attackHitPlayer && this.scene.physics.overlap(enemy.attackZone, this.playerBodyZone)) {
          enemy.attackHitPlayer = true;
          this.callbacks.onPlayerHit(enemy);
        }
        continue;
      }
      if (enemy.hasAttackSlot) this.updateAttackApproach(enemy);
      else this.updateFormationMovement(enemy);
    }
    this.assignAttackSlot(alive);
  }

  private updateAttackApproach(enemy: EnemyCombatant) {
    const dx = this.playerBodyZone.x - enemy.bodyZone.x;
    const dy = this.playerBodyZone.y - enemy.bodyZone.y;
    enemy.facing = dx >= 0 ? 1 : -1;
    enemy.sprite.setFlipX(enemy.facing > 0);
    if (Math.abs(dx) <= ENEMY_ATTACK_X_RANGE && Math.abs(dy) < ENEMY_ATTACK_Y_RANGE && this.clock.now() >= enemy.cooldownUntil) {
      this.setState(enemy, "attack");
      return;
    }
    const attackX = this.playerBodyZone.x - enemy.facing * ENEMY_ATTACK_X_RANGE * 0.82;
    this.moveToward(enemy, attackX, this.playerBodyZone.y);
  }

  private updateFormationMovement(enemy: EnemyCombatant) {
    if (this.clock.now() < enemy.cooldownUntil) { this.setState(enemy, "idle"); return; }
    const slot = FORMATION_SLOTS[enemy.assignedSlot];
    const targetX = Phaser.Math.Clamp(this.playerBodyZone.x + slot.x, WALK_BOUNDS.left, WALK_BOUNDS.right);
    const targetY = Phaser.Math.Clamp(this.playerBodyZone.y + slot.y, WALK_BOUNDS.top, WALK_BOUNDS.bottom);
    const distance = Phaser.Math.Distance.Between(enemy.bodyZone.x, enemy.bodyZone.y, this.playerBodyZone.x, this.playerBodyZone.y);
    if (distance > DETECTION_DISTANCE) { this.setState(enemy, "idle"); return; }
    this.moveToward(enemy, targetX, targetY);
  }

  private moveToward(enemy: EnemyCombatant, targetX: number, targetY: number) {
    const dx = targetX - enemy.bodyZone.x;
    const dy = targetY - enemy.bodyZone.y;
    if (Math.hypot(dx, dy) < 10) { this.setState(enemy, "idle"); return; }
    this.setState(enemy, "walk");
    if (dx !== 0) {
      enemy.facing = dx > 0 ? 1 : -1;
      enemy.sprite.setFlipX(enemy.facing > 0);
    }
    const velocity = new Phaser.Math.Vector2(dx, dy * 0.7).normalize().scale(WALK_SPEED);
    for (const other of this.getLivingEnemies()) {
      if (other === enemy) continue;
      const ox = enemy.bodyZone.x - other.bodyZone.x;
      const oy = enemy.bodyZone.y - other.bodyZone.y;
      const separation = Math.hypot(ox, oy);
      if (separation > 0 && separation < ENEMY_MIN_SPACING) velocity.add(new Phaser.Math.Vector2(ox, oy).normalize().scale(18));
    }
    velocity.limit(WALK_SPEED);
    enemy.body.setVelocity(velocity.x, velocity.y);
  }

  private assignAttackSlot(alive: EnemyCombatant[]) {
    if (this.currentAttacker || this.clock.now() < this.directorReadyAt) return;
    const candidates = alive.filter(enemy => enemy.state !== "hurt" && enemy.state !== "dead" && this.clock.now() >= enemy.cooldownUntil &&
      Math.abs(enemy.bodyZone.x - this.playerBodyZone.x) < 220 && Math.abs(enemy.bodyZone.y - this.playerBodyZone.y) < 140);
    if (!candidates.length) return;
    candidates.sort((a, b) => a.id - b.id);
    const nextIndex = this.lastAttackerId === null
      ? 0
      : Math.max(0, candidates.findIndex(enemy => enemy.id > this.lastAttackerId!));
    const enemy = candidates[nextIndex];
    this.currentAttacker = enemy;
    enemy.hasAttackSlot = true;
  }

  releaseAttackSlot(enemy: EnemyCombatant) {
    enemy.hasAttackSlot = false;
    if (this.currentAttacker !== enemy) return;
    this.currentAttacker = null;
    this.lastAttackerId = enemy.id;
    this.directorReadyAt = this.clock.now() + this.random.between(DIRECTOR_DELAY_MIN, DIRECTOR_DELAY_MAX);
  }

  markPlayerAttackHit(enemy: EnemyCombatant, attackId: number) {
    if (enemy.state === "dead" || enemy.lastPlayerAttackId === attackId) return false;
    enemy.lastPlayerAttackId = attackId;
    return true;
  }

  damage(enemy: EnemyCombatant) {
    if (enemy.state === "dead") return;
    enemy.hp = Math.max(0, enemy.hp - 1);
    this.releaseAttackSlot(enemy);
    if (enemy.hp === 0) this.setState(enemy, "dead");
    else this.setState(enemy, "hurt");
  }

  private setState(enemy: EnemyCombatant, next: EnemyState) {
    if (next === enemy.state) return;
    if (!TRANSITIONS[enemy.state].has(next)) throw new Error(`Invalid enemy transition: ${enemy.state} -> ${next}`);
    enemy.state = next;
    enemy.body.setVelocity(0, 0);
    this.disableAttackHitbox(enemy);
    if (next === "idle") enemy.sprite.play("enemy-idle", true);
    else if (next === "walk") enemy.sprite.play("enemy-walk", true);
    else if (next === "attack") {
      enemy.attackHitPlayer = false;
      enemy.sprite.play("enemy-attack", true);
    } else if (next === "hurt") {
      enemy.sprite.play("enemy-hurt", true);
      this.scene.time.delayedCall(HURT_MS, () => {
        if (enemy.sprite.active && enemy.state === "hurt") {
          enemy.cooldownUntil = this.clock.now() + this.random.between(RECOVERY_MIN, RECOVERY_MAX);
          this.setState(enemy, "idle");
        }
      });
    } else {
      enemy.body.enable = false;
      enemy.sprite.play("enemy-dead", true);
    }
  }

  private handleAnimationComplete(enemy: EnemyCombatant, animation: Phaser.Animations.Animation) {
    if (!enemy.sprite.active) return;
    if (animation.key === "enemy-attack" && enemy.state === "attack") {
      this.releaseAttackSlot(enemy);
      enemy.cooldownUntil = this.clock.now() + this.random.between(RECOVERY_MIN, RECOVERY_MAX);
      this.setState(enemy, "idle");
    } else if (animation.key === "enemy-dead" && enemy.state === "dead") {
      enemy.sprite.setFrame("dead-3");
      this.scene.tweens.add({ targets: enemy.sprite, alpha: 0, duration: 500, onComplete: () => this.remove(enemy) });
    }
  }

  private remove(enemy: EnemyCombatant) {
    this.releaseAttackSlot(enemy);
    for (const collider of this.colliderOwners.get(enemy) ?? []) {
      collider.destroy();
      const globalIndex = this.colliders.indexOf(collider);
      if (globalIndex >= 0) this.colliders.splice(globalIndex, 1);
      for (const owned of this.colliderOwners.values()) {
        const ownedIndex = owned.indexOf(collider);
        if (ownedIndex >= 0) owned.splice(ownedIndex, 1);
      }
    }
    this.colliderOwners.delete(enemy);
    const update = enemy.sprite.getData("animationUpdate");
    const complete = enemy.sprite.getData("animationComplete");
    enemy.sprite.off(Phaser.Animations.Events.ANIMATION_UPDATE, update);
    enemy.sprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE, complete);
    enemy.sprite.destroy();
    enemy.bodyZone.destroy();
    enemy.attackZone.destroy();
    const index = this.enemies.indexOf(enemy);
    if (index >= 0) this.enemies.splice(index, 1);
    if (this.enemies.length === 0) this.callbacks.onAllDefeated();
  }

  syncSprite(enemy: EnemyCombatant) {
    const x = Math.round(enemy.bodyZone.x), y = Math.round(enemy.bodyZone.y);
    enemy.sprite.setPosition(x, y).setDepth(y);
    if (enemy.attackBody.enable) this.positionAttackHitbox(enemy);
  }

  syncPhysicsFromZone(enemy: EnemyCombatant) {
    enemy.body.updateFromGameObject();
    this.syncSprite(enemy);
  }

  private positionAttackHitbox(enemy: EnemyCombatant) {
    const x = Math.round(enemy.bodyZone.x + enemy.facing * 78), y = Math.round(enemy.bodyZone.y - 58);
    enemy.attackZone.setPosition(x, y);
    enemy.attackBody.reset(x, y);
  }

  private enableAttackHitbox(enemy: EnemyCombatant) {
    enemy.attackZone.setActive(true);
    enemy.attackBody.enable = true;
    this.positionAttackHitbox(enemy);
  }

  private disableAttackHitbox(enemy: EnemyCombatant) {
    enemy.attackBody.stop();
    enemy.attackBody.enable = false;
    enemy.attackZone.setActive(false);
  }

  private drawSlots(alive: EnemyCombatant[]) {
    if (!this.slotGraphics) return;
    this.slotGraphics.clear().lineStyle(2, 0x00ffff, 0.7);
    for (const enemy of alive) {
      const slot = FORMATION_SLOTS[enemy.assignedSlot];
      const x = Phaser.Math.Clamp(this.playerBodyZone.x + slot.x, WALK_BOUNDS.left, WALK_BOUNDS.right);
      const y = Phaser.Math.Clamp(this.playerBodyZone.y + slot.y, WALK_BOUNDS.top, WALK_BOUNDS.bottom);
      this.slotGraphics.strokeCircle(x, y, 10);
    }
  }

  getLivingEnemies() { return this.enemies.filter(enemy => enemy.state !== "dead"); }
  getAllEnemies() { return [...this.enemies]; }
  get currentAttackerId() { return this.currentAttacker?.id ?? null; }

  destroy() {
    this.colliders.forEach(collider => collider.destroy());
    this.colliders.length = 0;
    for (const enemy of [...this.enemies]) {
      enemy.sprite.destroy(); enemy.bodyZone.destroy(); enemy.attackZone.destroy();
    }
    this.enemies.length = 0;
    this.colliderOwners.clear();
    this.slotGraphics?.destroy();
  }
}
