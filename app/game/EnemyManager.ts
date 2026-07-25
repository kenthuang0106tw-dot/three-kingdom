import * as Phaser from "phaser";
import { PhaserGameplayClock, SeededRandom, type GameplayClock, type RandomSource } from "./time/GameplayTime";
import { BAMBOO_COMBAT_ROOM, clampStageX, clampStageY, type StageSpawnPoint } from "./stage/StageConfig";
import { beginEncounter, createEncounterFlow, isEncounterCleared, recordEnemyRemoved, type EncounterFlowState } from "./stage/EncounterFlow";
import { DUELIST_ENEMY_CONFIG, MAULER_ENEMY_CONFIG, SOLDIER_ENEMY_CONFIG, enemyAnimationKey, enemySpriteShouldFlip, type EnemyConfig } from "./enemy/EnemyConfig";
import { selectFairAttackCandidate } from "./enemy/AttackSlotPolicy";

export type EnemyState = "idle" | "walk" | "attack" | "hurt" | "dead";
export type EnemyDamageResult = Readonly<{
  applied: boolean;
  becameDead: boolean;
}>;

const ENEMY_CONFIGS: Record<"soldier" | "mauler" | "duelist", EnemyConfig> = {
  soldier: SOLDIER_ENEMY_CONFIG,
  mauler: MAULER_ENEMY_CONFIG,
  duelist: DUELIST_ENEMY_CONFIG,
};

const ATTACK_APPROACH_TIMEOUT_MS = 1500;

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
  readonly shadow: Phaser.GameObjects.Image;
  state: EnemyState = "idle";
  hp: number;
  facing: 1 | -1 = -1;
  cooldownUntil = 0;
  attackHitPlayer = false;
  hasAttackSlot = false;
  attackApproachEndsAt = 0;
  attackSlotGrantCount = 0;

  constructor(readonly id: number, readonly assignedSlot: number, readonly config: EnemyConfig, scene: Phaser.Scene, x: number, y: number) {
    this.hp = config.maxHp;
    this.bodyZone = scene.add.zone(x, y, 58, 52).setOrigin(0.5, 1);
    scene.physics.add.existing(this.bodyZone);
    this.body = this.bodyZone.body as Phaser.Physics.Arcade.Body;
    this.body.setAllowGravity(false).setCollideWorldBounds(true);

    this.attackZone = scene.add.zone(x - config.combat.attackXRange * 0.7, y - 58, Math.max(112, config.combat.attackXRange * 0.8), 68).setOrigin(0.5);
    scene.physics.add.existing(this.attackZone);
    this.attackBody = this.attackZone.body as Phaser.Physics.Arcade.Body;
    this.attackBody.setAllowGravity(false).setEnable(false);
    this.attackZone.setActive(false);

    this.shadow = scene.add.image(x, y + 4, "combat-effects", "actor-shadow").setAlpha(0.48).setScale(0.8);
    this.sprite = scene.add.sprite(x, y, config.assetKey, config.animations.idle[0])
      .setOrigin(0.5, config.feetY / config.frameSize)
      .setScale(config.displayScale)
      .setFlipX(enemySpriteShouldFlip(config, this.facing))
      .setDepth(y)
      .play(enemyAnimationKey(config, "idle"));
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
  private readonly stateTimers = new Map<EnemyCombatant, Phaser.Time.TimerEvent>();
  private readonly slotGraphics?: Phaser.GameObjects.Graphics;
  private currentAttacker: EnemyCombatant | null = null;
  private encounterFlow: EncounterFlowState = createEncounterFlow();
  private nextEnemyId = 1;
  private lastAttackerId: number | null = null;
  private directorReadyAt = 0;
  private combatSuspended = false;
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

  spawnAll(spawns: readonly StageSpawnPoint[]) {
    if (this.enemies.length > 0 || this.encounterFlow.status === "active") return;
    this.encounterFlow = beginEncounter(this.encounterFlow, spawns.length);
    spawns.forEach((spawn, index) => {
      const config = ENEMY_CONFIGS[spawn.enemyType ?? "soldier"];
      this.addEnemy(new EnemyCombatant(this.nextEnemyId++, index, config, this.scene, spawn.x, spawn.y));
    });
  }

  private addEnemy(enemy: EnemyCombatant) {
    this.enemies.push(enemy);
    this.colliderOwners.set(enemy, []);
    const update = (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
      if (animation.key !== enemyAnimationKey(enemy.config, "attack")) return;
      if (frame.index === enemy.config.attackActiveFrame && enemy.state === "attack") this.enableAttackHitbox(enemy);
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
    if (this.combatSuspended) return;
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
    this.setFacing(enemy, dx >= 0 ? 1 : -1);
    if (Math.abs(dx) <= enemy.config.combat.attackXRange && Math.abs(dy) < enemy.config.combat.attackYRange && this.clock.now() >= enemy.cooldownUntil) {
      this.setState(enemy, "attack");
      return;
    }
    if (this.clock.now() >= enemy.attackApproachEndsAt) {
      this.releaseAttackSlot(enemy);
      this.setState(enemy, "idle");
      return;
    }
    const attackX = this.playerBodyZone.x - enemy.facing * enemy.config.combat.attackXRange * 0.82;
    this.moveToward(enemy, attackX, this.playerBodyZone.y);
  }

  private updateFormationMovement(enemy: EnemyCombatant) {
    if (this.clock.now() < enemy.cooldownUntil) { this.setState(enemy, "idle"); return; }
    const slot = FORMATION_SLOTS[enemy.assignedSlot];
    const targetX = clampStageX(this.playerBodyZone.x + slot.x, BAMBOO_COMBAT_ROOM.walkBounds);
    const targetY = clampStageY(this.playerBodyZone.y + slot.y, BAMBOO_COMBAT_ROOM.walkBounds);
    const distance = Phaser.Math.Distance.Between(enemy.bodyZone.x, enemy.bodyZone.y, this.playerBodyZone.x, this.playerBodyZone.y);
    if (distance > enemy.config.movement.detectionDistance) { this.setState(enemy, "idle"); return; }
    this.moveToward(enemy, targetX, targetY);
  }

  private moveToward(enemy: EnemyCombatant, targetX: number, targetY: number) {
    const dx = targetX - enemy.bodyZone.x;
    const dy = targetY - enemy.bodyZone.y;
    if (Math.hypot(dx, dy) < 10) { this.setState(enemy, "idle"); return; }
    this.setState(enemy, "walk");
    if (dx !== 0) this.setFacing(enemy, dx > 0 ? 1 : -1);
    const velocity = new Phaser.Math.Vector2(dx, dy * enemy.config.movement.verticalScale).normalize().scale(enemy.config.movement.walkSpeed);
    for (const other of this.getLivingEnemies()) {
      if (other === enemy) continue;
      const ox = enemy.bodyZone.x - other.bodyZone.x;
      const oy = enemy.bodyZone.y - other.bodyZone.y;
      const separation = Math.hypot(ox, oy);
      if (separation > 0 && separation < Math.max(enemy.config.combat.minSpacing, other.config.combat.minSpacing)) velocity.add(new Phaser.Math.Vector2(ox, oy).normalize().scale(18));
    }
    velocity.limit(enemy.config.movement.walkSpeed);
    enemy.body.setVelocity(velocity.x, velocity.y);
  }

  private setFacing(enemy: EnemyCombatant, facing: 1 | -1) {
    enemy.facing = facing;
    enemy.sprite.setFlipX(enemySpriteShouldFlip(enemy.config, facing));
  }

  private assignAttackSlot(alive: EnemyCombatant[]) {
    if (this.currentAttacker || this.clock.now() < this.directorReadyAt) return;
    const candidates = alive.filter(enemy => enemy.state !== "hurt" && enemy.state !== "dead" && this.clock.now() >= enemy.cooldownUntil &&
      Math.abs(enemy.bodyZone.x - this.playerBodyZone.x) < 220 && Math.abs(enemy.bodyZone.y - this.playerBodyZone.y) < 140);
    if (!candidates.length) return;
    const enemy = selectFairAttackCandidate(candidates, this.lastAttackerId);
    if (!enemy) return;
    this.currentAttacker = enemy;
    enemy.hasAttackSlot = true;
    enemy.attackSlotGrantCount += 1;
    enemy.attackApproachEndsAt = this.clock.now() + ATTACK_APPROACH_TIMEOUT_MS;
  }

  releaseAttackSlot(enemy: EnemyCombatant) {
    enemy.hasAttackSlot = false;
    enemy.attackApproachEndsAt = 0;
    if (this.currentAttacker !== enemy) return;
    this.currentAttacker = null;
    this.lastAttackerId = enemy.id;
    this.directorReadyAt = this.clock.now() + this.random.between(enemy.config.timing.directorDelayMin, enemy.config.timing.directorDelayMax);
  }

  damage(enemy: EnemyCombatant, amount = 1): EnemyDamageResult {
    if (enemy.state === "dead" || enemy.state === "hurt") {
      return { applied: false, becameDead: false };
    }
    enemy.hp = Math.max(0, enemy.hp - Math.max(0, Math.floor(amount)));
    this.releaseAttackSlot(enemy);
    if (enemy.hp === 0) this.setState(enemy, "dead");
    else this.setState(enemy, "hurt");
    return { applied: true, becameDead: enemy.hp === 0 };
  }

  private setState(enemy: EnemyCombatant, next: EnemyState) {
    if (next === enemy.state) return;
    if (!TRANSITIONS[enemy.state].has(next)) throw new Error(`Invalid enemy transition: ${enemy.state} -> ${next}`);
    this.clearStateTimer(enemy);
    enemy.state = next;
    enemy.body.setVelocity(0, 0);
    this.disableAttackHitbox(enemy);
    if (next === "idle") enemy.sprite.play(enemyAnimationKey(enemy.config, "idle"), true);
    else if (next === "walk") enemy.sprite.play(enemyAnimationKey(enemy.config, "walk"), true);
    else if (next === "attack") {
      enemy.attackHitPlayer = false;
      enemy.sprite.play(enemyAnimationKey(enemy.config, "attack"), true);
    } else if (next === "hurt") {
      enemy.sprite.play(enemyAnimationKey(enemy.config, "hurt"), true);
      const timer = this.scene.time.delayedCall(enemy.config.timing.hurtMs, () => {
        this.stateTimers.delete(enemy);
        if (enemy.sprite.active && enemy.state === "hurt") {
          enemy.cooldownUntil = this.clock.now() + this.random.between(enemy.config.timing.recoveryMin, enemy.config.timing.recoveryMax);
          this.setState(enemy, "idle");
        }
      });
      this.stateTimers.set(enemy, timer);
    } else {
      enemy.body.enable = false;
      enemy.sprite.play(enemyAnimationKey(enemy.config, "dead"), true);
    }
  }

  private handleAnimationComplete(enemy: EnemyCombatant, animation: Phaser.Animations.Animation) {
    if (!enemy.sprite.active) return;
    if (animation.key === enemyAnimationKey(enemy.config, "attack") && enemy.state === "attack") {
      this.releaseAttackSlot(enemy);
      enemy.cooldownUntil = this.clock.now() + this.random.between(enemy.config.timing.recoveryMin, enemy.config.timing.recoveryMax);
      this.setState(enemy, "idle");
    } else if (animation.key === enemyAnimationKey(enemy.config, "dead") && enemy.state === "dead") {
      enemy.sprite.setFrame(enemy.config.animations.dead.at(-1)!);
      this.scene.tweens.add({ targets: [enemy.sprite, enemy.shadow], alpha: 0, duration: 500, onComplete: () => this.remove(enemy) });
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
    this.cleanupEnemy(enemy);
    const index = this.enemies.indexOf(enemy);
    if (index >= 0) this.enemies.splice(index, 1);
    this.encounterFlow = recordEnemyRemoved(this.encounterFlow, enemy.id);
    if (isEncounterCleared(this.encounterFlow)) this.callbacks.onAllDefeated();
  }

  private cleanupEnemy(enemy: EnemyCombatant) {
    this.clearStateTimer(enemy);
    enemy.body.setVelocity(0, 0);
    enemy.body.enable = false;
    this.disableAttackHitbox(enemy);
    const update = enemy.sprite.getData("animationUpdate");
    const complete = enemy.sprite.getData("animationComplete");
    enemy.sprite.off(Phaser.Animations.Events.ANIMATION_UPDATE, update);
    enemy.sprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE, complete);
    enemy.sprite.destroy();
    enemy.shadow.destroy();
    enemy.bodyZone.destroy();
    enemy.attackZone.destroy();
  }

  private clearStateTimer(enemy: EnemyCombatant) {
    const timer = this.stateTimers.get(enemy);
    if (!timer) return;
    timer.remove(false);
    this.stateTimers.delete(enemy);
  }

  syncSprite(enemy: EnemyCombatant) {
    const x = Math.round(enemy.bodyZone.x), y = Math.round(enemy.bodyZone.y);
    enemy.shadow.setPosition(x, y + 4).setDepth(y - 1);
    enemy.sprite.setPosition(x, y).setDepth(y);
    if (enemy.attackBody.enable) this.positionAttackHitbox(enemy);
  }

  syncPhysicsFromZone(enemy: EnemyCombatant) {
    enemy.body.updateFromGameObject();
    this.syncSprite(enemy);
  }

  private positionAttackHitbox(enemy: EnemyCombatant) {
    const x = Math.round(enemy.bodyZone.x + enemy.facing * enemy.config.combat.attackXRange * 0.7), y = Math.round(enemy.bodyZone.y - 58);
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
      const x = clampStageX(this.playerBodyZone.x + slot.x, BAMBOO_COMBAT_ROOM.walkBounds);
      const y = clampStageY(this.playerBodyZone.y + slot.y, BAMBOO_COMBAT_ROOM.walkBounds);
      this.slotGraphics.strokeCircle(x, y, 10);
    }
  }

  getLivingEnemies() { return this.enemies.filter(enemy => enemy.state !== "dead"); }
  getAllEnemies() { return [...this.enemies]; }
  get currentAttackerId() { return this.currentAttacker?.id ?? null; }
  get isCombatSuspended() { return this.combatSuspended; }

  suspendCombat() {
    if (this.combatSuspended) return;
    this.combatSuspended = true;
    if (this.currentAttacker) this.currentAttacker.hasAttackSlot = false;
    this.currentAttacker = null;
    for (const timer of this.stateTimers.values()) timer.paused = true;
    for (const enemy of this.enemies) {
      enemy.body.stop();
      this.disableAttackHitbox(enemy);
      enemy.sprite.anims.pause();
    }
    this.slotGraphics?.clear();
  }

  destroy() {
    this.colliders.forEach(collider => collider.destroy());
    this.colliders.length = 0;
    for (const enemy of [...this.enemies]) this.cleanupEnemy(enemy);
    this.enemies.length = 0;
    this.colliderOwners.clear();
    this.stateTimers.clear();
    this.currentAttacker = null;
    this.combatSuspended = false;
    this.encounterFlow = createEncounterFlow();
    this.nextEnemyId = 1;
    this.slotGraphics?.destroy();
  }
}
