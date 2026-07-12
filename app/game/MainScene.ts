import * as Phaser from "phaser";
import { EnemyCombatant, EnemyManager, ENEMY_DISPLAY_SCALE } from "./EnemyManager";
import { createActionSnapshot, type ActionSnapshot } from "./input/ActionSnapshot";
import { TouchInputController } from "./input/TouchInputController";
import { LifecycleClock } from "./time/LifecycleClock";
import { PhaserGameplayClock, SeededRandom } from "./time/GameplayTime";
import { GameplayEventHub, type GameplaySnapshot } from "./events/GameplayEvents";
import { createAssetFailureReporter, queueRuntimeAssets } from "./assets/AssetManifest";
import { PlayerStateMachine, type PlayerState } from "./player/PlayerStateMachine";
import { PlayerLifecycle } from "./player/PlayerLifecycle";
import { PlayerActor } from "./player/PlayerActor";
import { PLAYER_ATTACKS, PlayerAttackController, type AttackStep } from "./player/PlayerAttackController";
import { resolveAttack } from "./combat/CombatResolver";
import { EffectDirector, EFFECT_PARAMS } from "./combat/EffectDirector";
import { BAMBOO_COMBAT_ROOM, clampStageX } from "./stage/StageConfig";

type AttackState = "attack1" | "attack2" | "attack3";
type PreviewFrame = {
  name: string; x: number; y: number; width: number; height: number;
  originY: number; offsetX: number; offsetY: number; classification: string;
};

const WIDTH = BAMBOO_COMBAT_ROOM.worldBounds.width;
const HEIGHT = BAMBOO_COMBAT_ROOM.worldBounds.height;
const START_X = BAMBOO_COMBAT_ROOM.playerSpawn.x;
const START_FOOT_Y = BAMBOO_COMBAT_ROOM.playerSpawn.y;
const WALK_SPEED = 235;
const PLAYER_MAX_HP = 10;
const ENEMY_FRAME_SIZE = 384;
const ENEMY_FEET_Y = 354;
const HURT_MS = 300;
const COMBO_WINDOW_MS = 360;
const ATTACK_STATES: AttackState[] = ["attack1", "attack2", "attack3"];
const FRAME_ORIGIN_Y: Record<string, number> = {
  "walk-0": 739 / 793, "walk-1": 736 / 793, "walk-2": 746 / 793, "walk-3": 741 / 793,
  "attack-0": 586 / 724, "attack-1": 582 / 724, "attack-2": 586 / 724,
  "attack-3": 586 / 724, "attack-4": 586 / 724, "attack-5": 587 / 724,
};
const PREVIEW_FRAMES: PreviewFrame[] = [
  { name: "attack-0", x: 0, y: 0, width: 512, height: 724, originY: 586 / 724, offsetX: 106, offsetY: 135, classification: "attack1 startup / recovery" },
  { name: "attack-1", x: 512, y: 0, width: 512, height: 724, originY: 582 / 724, offsetX: 75, offsetY: 147, classification: "attack1 active straight punch" },
  { name: "attack-2", x: 1024, y: 0, width: 512, height: 724, originY: 586 / 724, offsetX: 122, offsetY: 138, classification: "attack2 startup / recovery" },
  { name: "attack-3", x: 1536, y: 0, width: 512, height: 724, originY: 586 / 724, offsetX: 97, offsetY: 148, classification: "attack2 active short punch" },
  { name: "attack-4", x: 2048, y: 0, width: 512, height: 724, originY: 586 / 724, offsetX: 86, offsetY: 130, classification: "attack3 startup / recovery raised arm" },
  { name: "attack-5", x: 2560, y: 0, width: 512, height: 724, originY: 587 / 724, offsetX: 30, offsetY: 165, classification: "attack3 active palm strike" },
];
const ENEMY_PREVIEW_FRAMES = [
  "idle-0", "idle-1", "walk-0", "walk-1", "walk-2", "walk-3",
  "attack-0", "attack-1", "attack-2", "hurt-0", "hurt-1",
  "dead-0", "dead-1", "dead-2", "dead-3",
];

class PlayerInputController {
  readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  readonly wasd: Record<"up" | "down" | "left" | "right", Phaser.Input.Keyboard.Key>;
  readonly attack: Phaser.Input.Keyboard.Key;

  constructor(keyboard: Phaser.Input.Keyboard.KeyboardPlugin) {
    this.cursors = keyboard.createCursorKeys();
    this.wasd = keyboard.addKeys({ up: "W", down: "S", left: "A", right: "D" }) as typeof this.wasd;
    this.attack = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
  }

  readSnapshot(): ActionSnapshot {
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;
    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    return createActionSnapshot({ up, down, left, right }, Phaser.Input.Keyboard.JustDown(this.attack));
  }
}

export default class MainScene extends Phaser.Scene {
  private playerActor!: PlayerActor;
  private attackZone!: Phaser.GameObjects.Zone;
  private get playerSprite() { return this.playerActor.sprite; }
  private get playerBodyZone() { return this.playerActor.bodyZone; }
  private get playerBody() { return this.playerActor.body; }
  private attackBody!: Phaser.Physics.Arcade.Body;
  private inputController!: PlayerInputController;
  private touchInputController!: TouchInputController;
  private lifecycleClock!: LifecycleClock;
  private effectDirector!: EffectDirector;
  private readonly gameplayEvents = new GameplayEventHub();
  private lastLifecyclePaused = false;
  private enemyManager!: EnemyManager;
  private readonly playerStateMachine = new PlayerStateMachine();
  private readonly playerLifecycle = new PlayerLifecycle(PLAYER_MAX_HP);
  private readonly attackController = new PlayerAttackController();
  private debugText?: Phaser.GameObjects.Text;
  private get state(): PlayerState { return this.playerStateMachine.state; }
  private facing: 1 | -1 = 1;
  private currentInput: ActionSnapshot = createActionSnapshot({ up: false, down: false, left: false, right: false });
  private attackTriggerCount = 0;
  private attackCompleteCount = 0;
  private comboStep = 0;
  private hitConfirmed = false;
  private comboBuffered = false;
  private comboWindowOpen = false;
  private comboWindowEndsAt = 0;
  private get playerHp() { return this.playerLifecycle.hp; }
  private hitCount = 0;
  private totalDamage = 0;
  private playerAttackId = 0;
  private playerHitTargetIds: ReadonlySet<number> = new Set();
  private defeatedText?: Phaser.GameObjects.Text;
  private readonly transitionLog: string[] = [];
  private diagnosticMode = false;
  private previewMode = false;
  private enemyPreviewMode = false;
  private resetSmokeMode = false;
  private resetSmokeIteration = 0;
  private previewSprite?: Phaser.GameObjects.Sprite;
  private onionSprite?: Phaser.GameObjects.Sprite;
  private previewText?: Phaser.GameObjects.Text;
  private previewKeys?: Record<"left" | "right" | "play" | "slower" | "faster" | "loop" | "onion", Phaser.Input.Keyboard.Key>;
  private previewIndex = 0;
  private previewFpsIndex = 3;
  private readonly previewSpeeds = [2, 4, 6, 8, 10];
  private previewPlaying = false;
  private previewLoop = false;
  private onionEnabled = false;
  private nextPreviewFrameAt = 0;
  private enemyPreviewSprite?: Phaser.GameObjects.Sprite;
  private enemyPreviewText?: Phaser.GameObjects.Text;
  private enemyPreviewKeys?: Record<"left" | "right", Phaser.Input.Keyboard.Key>;
  private enemyPreviewIndex = 0;
  private assetFailureListener?: (file: Phaser.Loader.File) => void;

  constructor() { super("MainScene"); }

  getGameplayEvents() { return this.gameplayEvents; }

  preload() {
    queueRuntimeAssets(this.load);
    if (process.env.NODE_ENV !== "production") {
      const reportFailure = createAssetFailureReporter();
      this.assetFailureListener = (file: Phaser.Loader.File) => reportFailure(file.key);
      this.load.on("loaderror", this.assetFailureListener);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        if (this.assetFailureListener) this.load.off("loaderror", this.assetFailureListener);
        this.assetFailureListener = undefined;
      });
    }
  }

  create() {
    const development = process.env.NODE_ENV !== "production";
    const query = new URLSearchParams(window.location.search);
    this.enemyPreviewMode = development && query.get("previewEnemy") === "1";
    this.previewMode = development && query.get("previewAttack") === "1";
    this.resetSmokeMode = development && query.get("resetSmoke") === "1";
    this.playerStateMachine.reset();
    this.playerLifecycle.reset();
    if (this.enemyPreviewMode) { this.createEnemyAlignmentPreview(); return; }
    if (this.previewMode) { this.createPreviewMode(); return; }

    this.lifecycleClock = new LifecycleClock(this);
    this.effectDirector = new EffectDirector(this, this.lifecycleClock);
    this.createCombatAnimations();
    this.cameras.main.setRoundPixels(true);
    this.physics.world.setBounds(
      BAMBOO_COMBAT_ROOM.walkBounds.x,
      BAMBOO_COMBAT_ROOM.walkBounds.y,
      BAMBOO_COMBAT_ROOM.walkBounds.width,
      BAMBOO_COMBAT_ROOM.walkBounds.height,
    );
    const background = this.add.image(WIDTH / 2, HEIGHT / 2, "forest");
    background.setScale(Math.max(WIDTH / background.width, HEIGHT / background.height)).setDepth(0);

    this.playerActor = new PlayerActor(this, START_X, START_FOOT_Y);
    this.showIdleFrame();

    this.attackZone = this.add.zone(START_X, START_FOOT_Y - 92, 142, 86).setOrigin(0.5);
    this.physics.add.existing(this.attackZone);
    this.attackBody = this.attackZone.body as Phaser.Physics.Arcade.Body;
    this.attackBody.setAllowGravity(false);
    this.disableAttackHitbox();

    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable");
    this.inputController = new PlayerInputController(keyboard);
    this.touchInputController = new TouchInputController(this);
    this.playerSprite.on(Phaser.Animations.Events.ANIMATION_UPDATE, this.handleAnimationUpdate, this);
    this.playerSprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this);

    this.enemyManager = new EnemyManager(this, this.playerBodyZone, {
      onPlayerHit: enemy => this.applyHitToPlayer(enemy),
      onAllDefeated: () => this.showAllEnemiesDefeated(),
    }, development, { clock: new PhaserGameplayClock(this), random: new SeededRandom(0x3a6f2d1) });
    this.enemyManager.spawnAll(BAMBOO_COMBAT_ROOM.spawnPoints);

    if (development) {
      this.diagnosticMode = new URLSearchParams(window.location.search).get("debugInput") === "1";
      this.debugText = this.add.text(12, 12, "", { fontFamily: "Consolas, monospace", fontSize: "15px", color: "#fff", backgroundColor: "rgba(0,0,0,.78)", padding: { x: 8, y: 7 } }).setDepth(10000);
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.playerSprite.off(Phaser.Animations.Events.ANIMATION_UPDATE, this.handleAnimationUpdate, this);
      this.playerSprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this);
      this.disableAttackHitbox();
      this.touchInputController.destroy();
      this.effectDirector.destroy();
      this.lifecycleClock.destroy();
      this.enemyManager.destroy();
      this.playerActor.destroy();
    });

    if (this.resetSmokeMode) {
      this.resetSmokeIteration += 1;
      this.game.canvas.dataset.resetSmokeCount = String(this.resetSmokeIteration);
      this.time.delayedCall(20, () => {
        if (this.resetSmokeIteration < 10 && this.scene.isActive()) this.scene.restart();
      });
    }
  }

  update() {
    if (this.enemyPreviewMode) { this.updateEnemyAlignmentPreview(); return; }
    if (this.previewMode) { this.updatePreviewMode(); return; }
    if (this.lifecycleClock.isPaused()) { this.updateDebugText(); return; }
    this.playerBody.setVelocity(0, 0);
    this.currentInput = this.touchInputController.readSnapshot(this.inputController.readSnapshot());

    this.enemyManager.update();

    if (this.state === "hurt") {
      this.syncVisualsToBody();
      this.updateDebugText();
      return;
    }
    if (this.state === "dead") {
      this.playerBody.setVelocity(0, 0);
      this.syncVisualsToBody();
      this.updateDebugText();
      return;
    }

    if (this.isAttackState(this.state)) {
      this.updateAttackState();
      this.syncVisualsToBody();
      this.updateDebugText();
      return;
    }

    if (this.currentInput.attackPressed) {
      this.attackTriggerCount += 1;
      this.startAttack(1);
      this.syncVisualsToBody();
      this.updateDebugText();
      return;
    }

    const { moveX, moveY } = this.currentInput;
    if (moveX || moveY) {
      const velocity = new Phaser.Math.Vector2(moveX, moveY).normalize().scale(WALK_SPEED);
      this.playerBody.setVelocity(velocity.x, velocity.y);
      if (moveX > 0) this.setFacing(1); else if (moveX < 0) this.setFacing(-1);
      this.transitionTo("walk");
    } else this.transitionTo("idle");
    this.syncVisualsToBody();
    this.updateDebugText();
  }

  private createCombatAnimations() {
    if (this.anims.exists("guanyu-walk")) return;
    this.anims.create({ key: "guanyu-walk", frames: [0, 1, 2, 3].map(i => ({ key: "guanyu-walk", frame: `walk-${i}` })), frameRate: 8, repeat: -1 });
    for (const attack of Object.values(PLAYER_ATTACKS)) {
      this.anims.create({
        key: attack.animationKey,
        frames: attack.frames.map(frame => ({ key: "guanyu-attack", frame })),
        frameRate: attack.frameRate,
        repeat: 0,
      });
    }
    this.anims.create({ key: "enemy-idle", frames: ["idle-0", "idle-1"].map(frame => ({ key: "enemy-soldier", frame })), frameRate: 4, repeat: -1 });
    this.anims.create({ key: "enemy-walk", frames: [0, 1, 2, 3].map(i => ({ key: "enemy-soldier", frame: `walk-${i}` })), frameRate: 8, repeat: -1 });
    this.anims.create({ key: "enemy-attack", frames: [0, 1, 2].map(i => ({ key: "enemy-soldier", frame: `attack-${i}` })), frameRate: 8, repeat: 0 });
    this.anims.create({ key: "enemy-hurt", frames: ["hurt-0", "hurt-1"].map(frame => ({ key: "enemy-soldier", frame })), frameRate: 8, repeat: 0 });
    this.anims.create({ key: "enemy-dead", frames: [0, 1, 2, 3].map(i => ({ key: "enemy-soldier", frame: `dead-${i}` })), frameRate: 8, repeat: 0 });
    this.effectDirector.createHitSparkAnimation();
  }

  private updateAttackState() {
    if (this.comboWindowOpen && this.time.now > this.comboWindowEndsAt) this.comboWindowOpen = false;
    if (this.comboStep < 3 && this.comboWindowOpen && this.currentInput.attackPressed) {
      this.attackTriggerCount += 1;
      this.comboBuffered = true;
      this.comboWindowOpen = false;
    }
    if (this.attackBody.enable) {
      const overlapping = this.enemyManager.getLivingEnemies().filter(enemy => this.physics.overlap(this.attackZone, enemy.bodyZone));
      const resolution = resolveAttack({
        attackId: this.playerAttackId,
        damage: 1,
        targets: overlapping.map(enemy => ({ id: enemy.id, hp: enemy.hp, active: enemy.state !== "dead" })),
        hitTargetIds: this.playerHitTargetIds,
      });
      this.playerHitTargetIds = resolution.hitTargetIds;
      const hits = resolution.hits
        .map(hit => overlapping.find(enemy => enemy.id === hit.targetId))
        .filter((enemy): enemy is EnemyCombatant => enemy !== undefined);
      if (hits.length) {
        this.hitConfirmed = true;
        this.comboWindowOpen = this.comboStep < 3;
        this.comboWindowEndsAt = this.time.now + COMBO_WINDOW_MS;
        hits.forEach((enemy, index) => this.applyHitToEnemy(enemy, index === 0));
      }
    }
  }

  private startAttack(step: number) {
    const nextState = ATTACK_STATES[step - 1];
    const attack = this.attackController.begin(step as AttackStep);
    this.transitionTo(nextState);
    this.comboStep = step;
    this.hitConfirmed = false;
    this.comboBuffered = false;
    this.comboWindowOpen = false;
    this.comboWindowEndsAt = 0;
    this.playerAttackId += 1;
    this.playerHitTargetIds = new Set();
    this.gameplayEvents.publish({ type: "player-attack-started", step, at: this.time.now });
    this.playerBody.setVelocity(0, 0);
    this.disableAttackHitbox();
    const firstFrame = PREVIEW_FRAMES[(step - 1) * 2];
    this.playerActor.playAttack(attack.animationKey, firstFrame.originY);
  }

  private handleAnimationComplete(animation: Phaser.Animations.Animation) {
    if (animation.key === "hit-spark") return;
    if (!this.attackController.isAttackAnimation(animation.key)) return;
    this.disableAttackHitbox();
    this.attackCompleteCount += 1;
    if (this.comboStep < 3 && this.hitConfirmed && this.comboBuffered) this.startAttack(this.comboStep + 1);
    else this.finishCombo();
  }

  private handleAnimationUpdate(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
    const frameName = String(frame.textureFrame);
    this.playerActor.setAnimationOrigin(FRAME_ORIGIN_Y[frameName] ?? this.playerSprite.originY);
    if (this.attackController.isActiveFrame(animation.key, frame.index)) this.enableAttackHitbox(); else this.disableAttackHitbox();
  }

  private finishCombo() {
    this.disableAttackHitbox();
    this.comboStep = 0;
    this.hitConfirmed = false;
    this.comboBuffered = false;
    this.comboWindowOpen = false;
    this.comboWindowEndsAt = 0;
    this.attackController.finish();
    this.transitionTo("idle");
  }

  private applyHitToEnemy(enemy: EnemyCombatant, triggerGlobalEffects: boolean) {
    this.hitCount += 1;
    this.totalDamage += 1;

    const left = Math.max(this.attackBody.x, enemy.body.x);
    const right = Math.min(this.attackBody.right, enemy.body.right);
    const top = Math.max(this.attackBody.y, enemy.body.y);
    const bottom = Math.min(this.attackBody.bottom, enemy.body.bottom);
    const hitX = Math.round((left + right) / 2);
    const hitY = Math.round((top + bottom) / 2);

    this.effectDirector.flash(enemy.sprite);
    this.effectDirector.createHitSpark(hitX, hitY);
    if (triggerGlobalEffects) this.effectDirector.cameraShake();

    const targetX = clampStageX(enemy.bodyZone.x + this.facing * EFFECT_PARAMS.knockbackDistance, BAMBOO_COMBAT_ROOM.walkBounds);
    this.effectDirector.knockback(enemy.bodyZone, targetX, () => this.enemyManager.syncPhysicsFromZone(enemy));

    this.enemyManager.damage(enemy);
    this.gameplayEvents.publish({ type: "enemy-hit", enemyId: enemy.id, damage: 1, at: this.time.now });
    this.playHitSound();
    if (triggerGlobalEffects) this.effectDirector.beginHitStop();
  }

  private applyHitToPlayer(enemy: EnemyCombatant) {
    if (this.state === "hurt") return;
    const damage = this.playerLifecycle.applyDamage(1);
    if (!damage.applied) return;
    this.gameplayEvents.publish({ type: "player-hit", enemyId: enemy.id, at: this.time.now });
    this.disableAttackHitbox();
    this.comboStep = 0;
    this.hitConfirmed = false;
    this.comboBuffered = false;
    this.comboWindowOpen = false;
    this.transitionTo("hurt");
    this.playerBody.setVelocity(0, 0);

    this.effectDirector.flash(this.playerSprite);
    const targetX = clampStageX(this.playerBodyZone.x + enemy.facing * EFFECT_PARAMS.knockbackDistance, BAMBOO_COMBAT_ROOM.walkBounds);
    this.effectDirector.knockback(this.playerBodyZone, targetX, () => this.syncVisualsToBody());
    this.effectDirector.beginHitStop();
    if (damage.becameDead) {
      this.transitionTo("dead");
    } else {
      this.time.delayedCall(HURT_MS, () => { if (this.state === "hurt") this.transitionTo("idle"); });
    }
  }

  private playHitSound() {
    // Interface reserved for a future hit sound asset.
  }

  private showAllEnemiesDefeated() {
    if (this.defeatedText) return;
    this.defeatedText = this.add.text(WIDTH / 2, HEIGHT / 2, "All Enemies Defeated", {
      fontFamily: "Consolas, monospace", fontSize: "36px", color: "#ffffff",
      backgroundColor: "rgba(0,0,0,.72)", padding: { x: 20, y: 12 },
    }).setOrigin(0.5).setDepth(10000);
  }

  private transitionTo(next: PlayerState) {
    const transition = this.playerStateMachine.transition(next);
    if (!transition) return;
    const { previous } = transition;
    this.gameplayEvents.publish({ type: "player-state-changed", previous, next, at: this.time.now });
    this.transitionLog.push(`${previous} -> ${next}`); if (this.transitionLog.length > 20) this.transitionLog.shift();
    if (next === "idle" || next === "hurt" || next === "dead") this.playerActor.showIdleFrame();
    else if (next === "walk") this.playerActor.playWalk(FRAME_ORIGIN_Y["walk-0"]);
  }

  private createEnemyAlignmentPreview() {
    this.cameras.main.setBackgroundColor("#101512");
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable");
    this.enemyPreviewKeys = keyboard.addKeys({ left: "LEFT", right: "RIGHT" }) as typeof this.enemyPreviewKeys;
    const groundY = 580;
    const guide = this.add.graphics().setDepth(20);
    guide.lineStyle(2, 0xff3b30, 1).lineBetween(100, groundY, WIDTH - 100, groundY);
    guide.fillStyle(0x00ffff, 1).fillCircle(WIDTH / 2, groundY, 5);
    this.enemyPreviewSprite = this.add.sprite(WIDTH / 2, groundY, "enemy-soldier", ENEMY_PREVIEW_FRAMES[0])
      .setOrigin(0.5, ENEMY_FEET_Y / ENEMY_FRAME_SIZE)
      .setScale(ENEMY_DISPLAY_SCALE);
    this.enemyPreviewText = this.add.text(24, 22, "", {
      fontFamily: "Consolas, monospace", fontSize: "18px", color: "#fff",
      backgroundColor: "rgba(0,0,0,.8)", padding: { x: 12, y: 10 }, lineSpacing: 3,
    }).setDepth(100);
    this.showEnemyPreviewFrame(0);
  }

  private updateEnemyAlignmentPreview() {
    const keys = this.enemyPreviewKeys!;
    if (Phaser.Input.Keyboard.JustDown(keys.left)) this.showEnemyPreviewFrame(this.enemyPreviewIndex - 1);
    if (Phaser.Input.Keyboard.JustDown(keys.right)) this.showEnemyPreviewFrame(this.enemyPreviewIndex + 1);
  }

  private showEnemyPreviewFrame(index: number) {
    this.enemyPreviewIndex = Phaser.Math.Wrap(index, 0, ENEMY_PREVIEW_FRAMES.length);
    const name = ENEMY_PREVIEW_FRAMES[this.enemyPreviewIndex];
    const frame = this.textures.getFrame("enemy-soldier", name);
    this.enemyPreviewSprite!.setTexture("enemy-soldier", name)
      .setOrigin(0.5, ENEMY_FEET_Y / ENEMY_FRAME_SIZE)
      .setScale(ENEMY_DISPLAY_SCALE)
      .setPosition(WIDTH / 2, 580);
    this.enemyPreviewText!.setText([
      "ENEMY FEET ALIGNMENT PREVIEW",
      `frame: ${this.enemyPreviewIndex} / ${ENEMY_PREVIEW_FRAMES.length - 1}`,
      `name: ${name}`,
      `source: ${frame.cutX}, ${frame.cutY}, ${frame.cutWidth}, ${frame.cutHeight}`,
      `origin: 0.5, ${(ENEMY_FEET_Y / ENEMY_FRAME_SIZE).toFixed(6)}`,
      `feet anchor: ${ENEMY_FRAME_SIZE / 2}, ${ENEMY_FEET_Y}`,
      `display scale: ${ENEMY_DISPLAY_SCALE}`,
      "",
      "Left / Right: previous / next frame",
      "Red line: fixed world ground  |  Cyan point: feet anchor",
    ]);
  }

  private createPreviewMode() {
    this.cameras.main.setBackgroundColor("#101512");
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable");
    this.previewKeys = keyboard.addKeys({ left: "LEFT", right: "RIGHT", play: "SPACE", slower: "DOWN", faster: "UP", loop: "L", onion: "O" }) as typeof this.previewKeys;
    this.onionSprite = this.add.sprite(WIDTH / 2, 600, "guanyu-attack", "attack-0").setAlpha(0.32).setTint(0x69cfff).setScale(0.64).setVisible(false);
    this.previewSprite = this.add.sprite(WIDTH / 2, 600, "guanyu-attack", "attack-0").setScale(0.64);
    this.previewText = this.add.text(24, 22, "", { fontFamily: "Consolas, monospace", fontSize: "18px", color: "#fff", backgroundColor: "rgba(0,0,0,.8)", padding: { x: 12, y: 10 }, lineSpacing: 3 }).setDepth(100);
    this.showPreviewFrame(0);
  }

  private updatePreviewMode() {
    const keys = this.previewKeys!;
    if (Phaser.Input.Keyboard.JustDown(keys.left)) { this.previewPlaying = false; this.showPreviewFrame(this.previewIndex - 1); }
    if (Phaser.Input.Keyboard.JustDown(keys.right)) { this.previewPlaying = false; this.showPreviewFrame(this.previewIndex + 1); }
    if (Phaser.Input.Keyboard.JustDown(keys.slower)) { this.previewFpsIndex = Math.max(0, this.previewFpsIndex - 1); this.refreshPreviewText(); }
    if (Phaser.Input.Keyboard.JustDown(keys.faster)) { this.previewFpsIndex = Math.min(this.previewSpeeds.length - 1, this.previewFpsIndex + 1); this.refreshPreviewText(); }
    if (Phaser.Input.Keyboard.JustDown(keys.loop)) { this.previewLoop = !this.previewLoop; this.refreshPreviewText(); }
    if (Phaser.Input.Keyboard.JustDown(keys.onion)) { this.onionEnabled = !this.onionEnabled; this.showPreviewFrame(this.previewIndex); }
    if (Phaser.Input.Keyboard.JustDown(keys.play)) { this.previewPlaying = !this.previewPlaying; this.nextPreviewFrameAt = this.time.now + 1000 / this.previewSpeeds[this.previewFpsIndex]; this.refreshPreviewText(); }
    if (this.previewPlaying && this.time.now >= this.nextPreviewFrameAt) {
      if (this.previewIndex === PREVIEW_FRAMES.length - 1 && !this.previewLoop) { this.previewPlaying = false; this.refreshPreviewText(); }
      else {
        this.showPreviewFrame((this.previewIndex + 1) % PREVIEW_FRAMES.length);
        this.nextPreviewFrameAt += 1000 / this.previewSpeeds[this.previewFpsIndex];
      }
    }
  }

  private showPreviewFrame(index: number) {
    this.previewIndex = Phaser.Math.Wrap(index, 0, PREVIEW_FRAMES.length);
    const current = PREVIEW_FRAMES[this.previewIndex];
    this.previewSprite!.setTexture("guanyu-attack", current.name).setOrigin(0.5, current.originY).setPosition(WIDTH / 2, 600);
    const previous = PREVIEW_FRAMES[Phaser.Math.Wrap(this.previewIndex - 1, 0, PREVIEW_FRAMES.length)];
    this.onionSprite!.setTexture("guanyu-attack", previous.name).setOrigin(0.5, previous.originY).setPosition(WIDTH / 2, 600).setVisible(this.onionEnabled);
    this.refreshPreviewText();
  }

  private refreshPreviewText() {
    const frame = PREVIEW_FRAMES[this.previewIndex];
    this.previewText!.setText([
      "ATTACK ANIMATION PREVIEW", `frame: ${this.previewIndex} / ${PREVIEW_FRAMES.length - 1}`, `name: ${frame.name}`,
      `x: ${frame.x}  y: ${frame.y}`, `width: ${frame.width}  height: ${frame.height}`,
      `origin: 0.5, ${frame.originY.toFixed(6)}`, `display offset: ${frame.offsetX}, ${frame.offsetY}`,
      `classification: ${frame.classification}`, `speed: ${this.previewSpeeds[this.previewFpsIndex]} FPS`,
      `playing: ${this.previewPlaying}  loop: ${this.previewLoop}  onion: ${this.onionEnabled}`, "",
      "Left/Right frame | Space play/pause | Up/Down FPS | L loop | O onion-skin",
      "Material note: each pair lacks a dedicated recovery and inter-attack transition frame.",
    ]);
  }

  private isAttackState(state: PlayerState): state is AttackState { return ATTACK_STATES.includes(state as AttackState); }
  private showIdleFrame() { this.playerActor.showIdleFrame(); }
  private setFacing(direction: 1 | -1) { this.facing = direction; this.playerActor.setFacing(direction); }
  private syncVisualsToBody() { this.playerActor.syncVisuals(); if (this.attackBody.enable) this.positionAttackHitbox(); }
  private positionAttackHitbox() { const x = Math.round(this.playerBodyZone.x + this.facing * 104), y = Math.round(this.playerBodyZone.y - 94); this.attackZone.setPosition(x, y); this.attackBody.reset(x, y); }
  private enableAttackHitbox() { this.attackZone.setActive(true); this.attackBody.enable = true; this.positionAttackHitbox(); }
  private disableAttackHitbox() { if (!this.attackBody) return; this.attackBody.stop(); this.attackBody.enable = false; this.attackZone.setActive(false); }

  private updateDebugText() {
    this.publishGameplaySnapshot();
    if (!this.debugText) return;
    const v = this.playerBody.velocity, i = this.currentInput;
    const enemies = this.enemyManager.getAllEnemies();
    const lines = [
      `Alive Enemy Count: ${this.enemyManager.getLivingEnemies().length}`,
      `Current Attacker ID: ${this.enemyManager.currentAttackerId ?? "none"}`,
      `Player State: ${this.state}`,
      ...enemies.map(enemy => {
        const dx = enemy.bodyZone.x - this.playerBodyZone.x;
        const dy = enemy.bodyZone.y - this.playerBodyZone.y;
        return `E${enemy.id} ${enemy.state} HP:${enemy.hp} dX:${dx.toFixed(0)} dY:${dy.toFixed(0)} Slot:${enemy.slotName} Attack:${enemy.hasAttackSlot}`;
      }),
    ];
    if (this.diagnosticMode) lines.push(
      "",
      `Hit Count: ${this.hitCount}`,
      `Total Damage: ${this.totalDamage}`,
      `Combo Step: ${this.comboStep}`,
      `Hit Confirmed: ${this.hitConfirmed}`,
      `Combo Buffered: ${this.comboBuffered}`,
      `Combo Window: ${this.comboWindowOpen}`,
      `velocity: ${v.x.toFixed(1)}, ${v.y.toFixed(1)}`,
      `keys UDLR: ${i.up} ${i.down} ${i.left} ${i.right}`,
      `J down: ${this.inputController.attack.isDown}`,
      `attack trigger/complete: ${this.attackTriggerCount}/${this.attackCompleteCount}`,
      `hit stop: ${this.effectDirector?.isHitStopActive() ?? false}`,
      `animation: ${this.playerSprite.anims.currentAnim?.key ?? "idle"}`,
      `frame: ${this.playerSprite.anims.currentFrame?.index ?? 0}`,
      "",
      "transitions:",
      ...this.transitionLog,
    );
    this.debugText.setText(lines);
  }

  private publishGameplaySnapshot() {
    if (!this.enemyManager || !this.playerBodyZone || !this.lifecycleClock) return;
    const snapshot: GameplaySnapshot = {
      player: { state: this.state, hp: this.playerHp, x: this.playerBodyZone.x, y: this.playerBodyZone.y },
      enemies: this.enemyManager.getAllEnemies().map(enemy => ({
        id: enemy.id, state: enemy.state, hp: enemy.hp, x: enemy.bodyZone.x, y: enemy.bodyZone.y,
      })),
      lifecycle: { paused: this.lifecycleClock.isPaused(), visibilityPaused: this.lifecycleClock.isVisibilityPaused() },
    };
    this.gameplayEvents.publishSnapshot(snapshot);
    const paused = snapshot.lifecycle.paused;
    if (paused !== this.lastLifecyclePaused) {
      this.lastLifecyclePaused = paused;
      this.gameplayEvents.publish({ type: "lifecycle-changed", paused, at: this.time.now });
    }
  }
}
