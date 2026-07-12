import * as Phaser from "phaser";
import { EnemyCombatant, EnemyManager, ENEMY_DISPLAY_SCALE } from "./EnemyManager";
import { createActionSnapshot, type ActionSnapshot } from "./input/ActionSnapshot";
import { TouchInputController } from "./input/TouchInputController";
import { LifecycleClock } from "./time/LifecycleClock";

type PlayerState = "idle" | "walk" | "attack1" | "attack2" | "attack3" | "hurt";
type AttackState = "attack1" | "attack2" | "attack3";
type PreviewFrame = {
  name: string; x: number; y: number; width: number; height: number;
  originY: number; offsetX: number; offsetY: number; classification: string;
};

const WIDTH = 1280;
const HEIGHT = 720;
const START_X = 180;
const START_FOOT_Y = 602;
const WALK_SPEED = 235;
const PLAYER_MAX_HP = 10;
const ENEMY_FRAME_SIZE = 384;
const ENEMY_FEET_Y = 354;
const HURT_MS = 300;
const HIT_STOP_MS = (1000 / 60) * 4;
const HIT_FLASH_MS = 90;
const KNOCKBACK_DISTANCE = 26;
const KNOCKBACK_MS = 120;
const CAMERA_SHAKE_MS = 50;
const CAMERA_SHAKE_INTENSITY = 0.003;
const COMBO_WINDOW_MS = 360;
const WALK_BOUNDS = new Phaser.Geom.Rectangle(70, 390, 1140, 245);
const ATTACK_STATES: AttackState[] = ["attack1", "attack2", "attack3"];
const ATTACK_ANIMATIONS: Record<AttackState, string> = {
  attack1: "guanyu-attack1",
  attack2: "guanyu-attack2",
  attack3: "guanyu-attack3",
};
const ATTACK_ACTIVE_FRAME_INDEXES: Record<string, ReadonlySet<number>> = {
  "guanyu-attack1": new Set([2]),
  "guanyu-attack2": new Set([2]),
  "guanyu-attack3": new Set([2]),
};
const ALLOWED_TRANSITIONS: Record<PlayerState, ReadonlySet<PlayerState>> = {
  idle: new Set(["walk", "attack1", "hurt"]),
  walk: new Set(["idle", "attack1", "hurt"]),
  attack1: new Set(["idle", "attack2", "hurt"]),
  attack2: new Set(["idle", "attack3", "hurt"]),
  attack3: new Set(["idle", "hurt"]),
  hurt: new Set(["idle"]),
};
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
  private playerSprite!: Phaser.GameObjects.Sprite;
  private playerBodyZone!: Phaser.GameObjects.Zone;
  private attackZone!: Phaser.GameObjects.Zone;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private attackBody!: Phaser.Physics.Arcade.Body;
  private inputController!: PlayerInputController;
  private touchInputController!: TouchInputController;
  private lifecycleClock!: LifecycleClock;
  private enemyManager!: EnemyManager;
  private debugText?: Phaser.GameObjects.Text;
  private state: PlayerState = "idle";
  private facing: 1 | -1 = 1;
  private currentInput: ActionSnapshot = createActionSnapshot({ up: false, down: false, left: false, right: false });
  private attackTriggerCount = 0;
  private attackCompleteCount = 0;
  private comboStep = 0;
  private hitConfirmed = false;
  private comboBuffered = false;
  private comboWindowOpen = false;
  private comboWindowEndsAt = 0;
  private playerHp = PLAYER_MAX_HP;
  private hitCount = 0;
  private totalDamage = 0;
  private hitStopActive = false;
  private playerAttackId = 0;
  private defeatedText?: Phaser.GameObjects.Text;
  private readonly transitionLog: string[] = [];
  private diagnosticMode = false;
  private previewMode = false;
  private enemyPreviewMode = false;
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

  constructor() { super("MainScene"); }

  preload() {
    this.load.image("forest", "/scene/forest-camp.png");
    this.load.atlas("guanyu-idle", "/art/guanyu/guanyu-master.png", "/art/guanyu/guanyu-idle.atlas.json");
    this.load.atlas("guanyu-walk", "/art/guanyu/guanyu-walk.png", "/art/guanyu/guanyu-walk.atlas.json");
    this.load.atlas("guanyu-attack", "/art/guanyu/guanyu-combo-frames.png", "/art/guanyu/guanyu-attack.atlas.json");
    this.load.atlas("enemy-soldier", "/art/enemy/enemy-soldier.png", "/art/enemy/enemy-soldier.atlas.json");
  }

  create() {
    const development = process.env.NODE_ENV !== "production";
    const query = new URLSearchParams(window.location.search);
    this.enemyPreviewMode = development && query.get("previewEnemy") === "1";
    this.previewMode = development && query.get("previewAttack") === "1";
    if (this.enemyPreviewMode) { this.createEnemyAlignmentPreview(); return; }
    if (this.previewMode) { this.createPreviewMode(); return; }

    this.createCombatAnimations();
    this.lifecycleClock = new LifecycleClock(this);
    this.cameras.main.setRoundPixels(true);
    this.physics.world.setBounds(WALK_BOUNDS.x, WALK_BOUNDS.y, WALK_BOUNDS.width, WALK_BOUNDS.height);
    const background = this.add.image(WIDTH / 2, HEIGHT / 2, "forest");
    background.setScale(Math.max(WIDTH / background.width, HEIGHT / background.height)).setDepth(0);

    this.playerBodyZone = this.add.zone(START_X, START_FOOT_Y, 86, 54).setOrigin(0.5, 1);
    this.physics.add.existing(this.playerBodyZone);
    this.playerBody = this.playerBodyZone.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setCollideWorldBounds(true).setAllowGravity(false);
    this.playerSprite = this.add.sprite(START_X, START_FOOT_Y, "guanyu-idle", "idle-0");
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
    }, development);
    this.enemyManager.spawnAll();

    if (development) {
      this.diagnosticMode = new URLSearchParams(window.location.search).get("debugInput") === "1";
      this.debugText = this.add.text(12, 12, "", { fontFamily: "Consolas, monospace", fontSize: "15px", color: "#fff", backgroundColor: "rgba(0,0,0,.78)", padding: { x: 8, y: 7 } }).setDepth(10000);
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.playerSprite.off(Phaser.Animations.Events.ANIMATION_UPDATE, this.handleAnimationUpdate, this);
      this.playerSprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this);
      this.disableAttackHitbox();
      this.touchInputController.destroy();
      this.lifecycleClock.destroy();
      this.enemyManager.destroy();
    });
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
    this.anims.create({ key: "guanyu-walk", frames: [0, 1, 2, 3].map(i => ({ key: "guanyu-walk", frame: `walk-${i}` })), frameRate: 8, repeat: -1 });
    this.anims.create({ key: "guanyu-attack1", frames: ["attack-0", "attack-1", "attack-0"].map(frame => ({ key: "guanyu-attack", frame })), frameRate: 8, repeat: 0 });
    this.anims.create({ key: "guanyu-attack2", frames: ["attack-2", "attack-3", "attack-2"].map(frame => ({ key: "guanyu-attack", frame })), frameRate: 8, repeat: 0 });
    this.anims.create({ key: "guanyu-attack3", frames: ["attack-4", "attack-5", "attack-4"].map(frame => ({ key: "guanyu-attack", frame })), frameRate: 8, repeat: 0 });
    this.anims.create({ key: "enemy-idle", frames: ["idle-0", "idle-1"].map(frame => ({ key: "enemy-soldier", frame })), frameRate: 4, repeat: -1 });
    this.anims.create({ key: "enemy-walk", frames: [0, 1, 2, 3].map(i => ({ key: "enemy-soldier", frame: `walk-${i}` })), frameRate: 8, repeat: -1 });
    this.anims.create({ key: "enemy-attack", frames: [0, 1, 2].map(i => ({ key: "enemy-soldier", frame: `attack-${i}` })), frameRate: 8, repeat: 0 });
    this.anims.create({ key: "enemy-hurt", frames: ["hurt-0", "hurt-1"].map(frame => ({ key: "enemy-soldier", frame })), frameRate: 8, repeat: 0 });
    this.anims.create({ key: "enemy-dead", frames: [0, 1, 2, 3].map(i => ({ key: "enemy-soldier", frame: `dead-${i}` })), frameRate: 8, repeat: 0 });
    this.createHitSparkAnimation();
  }

  private updateAttackState() {
    if (this.comboWindowOpen && this.time.now > this.comboWindowEndsAt) this.comboWindowOpen = false;
    if (this.comboStep < 3 && this.comboWindowOpen && this.currentInput.attackPressed) {
      this.attackTriggerCount += 1;
      this.comboBuffered = true;
      this.comboWindowOpen = false;
    }
    if (this.attackBody.enable) {
      const hits = this.enemyManager.getLivingEnemies().filter(enemy =>
        this.physics.overlap(this.attackZone, enemy.bodyZone) && this.enemyManager.markPlayerAttackHit(enemy, this.playerAttackId));
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
    this.transitionTo(nextState);
    this.comboStep = step;
    this.hitConfirmed = false;
    this.comboBuffered = false;
    this.comboWindowOpen = false;
    this.comboWindowEndsAt = 0;
    this.playerAttackId += 1;
    this.playerBody.setVelocity(0, 0);
    this.disableAttackHitbox();
    const firstFrame = PREVIEW_FRAMES[(step - 1) * 2];
    this.playerSprite.setOrigin(0.5, firstFrame.originY).setScale(0.64).setFlipX(this.facing < 0).play(ATTACK_ANIMATIONS[nextState]);
  }

  private handleAnimationComplete(animation: Phaser.Animations.Animation) {
    if (animation.key === "hit-spark") return;
    if (!Object.values(ATTACK_ANIMATIONS).includes(animation.key)) return;
    this.disableAttackHitbox();
    this.attackCompleteCount += 1;
    if (this.comboStep < 3 && this.hitConfirmed && this.comboBuffered) this.startAttack(this.comboStep + 1);
    else this.finishCombo();
  }

  private handleAnimationUpdate(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
    const frameName = String(frame.textureFrame);
    this.playerSprite.setOrigin(0.5, FRAME_ORIGIN_Y[frameName] ?? this.playerSprite.originY);
    const activeFrames = ATTACK_ACTIVE_FRAME_INDEXES[animation.key];
    if (!activeFrames) return;
    if (activeFrames.has(frame.index)) this.enableAttackHitbox(); else this.disableAttackHitbox();
  }

  private finishCombo() {
    this.disableAttackHitbox();
    this.comboStep = 0;
    this.hitConfirmed = false;
    this.comboBuffered = false;
    this.comboWindowOpen = false;
    this.comboWindowEndsAt = 0;
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

    enemy.sprite.setTintFill(0xffffff);
    const struckEnemy = enemy.sprite;
    this.time.delayedCall(HIT_FLASH_MS, () => { if (struckEnemy.active) struckEnemy.clearTint(); });
    this.createHitSpark(hitX, hitY);
    if (triggerGlobalEffects) this.cameras.main.shake(CAMERA_SHAKE_MS, CAMERA_SHAKE_INTENSITY);

    const targetX = Phaser.Math.Clamp(enemy.bodyZone.x + this.facing * KNOCKBACK_DISTANCE, WALK_BOUNDS.left, WALK_BOUNDS.right);
    this.tweens.add({
      targets: enemy.bodyZone,
      x: targetX,
      duration: KNOCKBACK_MS,
      ease: "Cubic.Out",
      onUpdate: () => this.enemyManager.syncPhysicsFromZone(enemy),
      onComplete: () => this.enemyManager.syncPhysicsFromZone(enemy),
    });

    this.enemyManager.damage(enemy);
    this.playHitSound();
    if (triggerGlobalEffects) this.beginHitStop();
  }

  private beginHitStop() {
    if (this.lifecycleClock.isPaused()) return;
    this.hitStopActive = true;
    this.lifecycleClock.beginHitStop(HIT_STOP_MS);
    this.time.delayedCall(HIT_STOP_MS, () => {
      this.hitStopActive = false;
    });
  }

  private createHitSparkAnimation() {
    const graphics = new Phaser.GameObjects.Graphics(this);
    for (let frame = 0; frame < 5; frame += 1) {
      const key = `hit-spark-${frame}`;
      if (this.textures.exists(key)) continue;
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
    this.anims.create({ key: "hit-spark", frames: [0, 1, 2, 3, 4].map(frame => ({ key: `hit-spark-${frame}` })), frameRate: 24, repeat: 0 });
  }

  private createHitSpark(x: number, y: number) {
    const spark = this.add.sprite(x, y, "hit-spark-0").setDepth(2000).play("hit-spark");
    spark.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => spark.destroy());
  }

  private applyHitToPlayer(enemy: EnemyCombatant) {
    if (this.state === "hurt") return;
    this.playerHp = Math.max(0, this.playerHp - 1);
    this.disableAttackHitbox();
    this.comboStep = 0;
    this.hitConfirmed = false;
    this.comboBuffered = false;
    this.comboWindowOpen = false;
    this.transitionTo("hurt");
    this.playerBody.setVelocity(0, 0);

    this.playerSprite.setTintFill(0xffffff);
    this.time.delayedCall(HIT_FLASH_MS, () => { if (this.playerSprite.active) this.playerSprite.clearTint(); });
    const targetX = Phaser.Math.Clamp(this.playerBodyZone.x + enemy.facing * KNOCKBACK_DISTANCE, WALK_BOUNDS.left, WALK_BOUNDS.right);
    this.tweens.add({
      targets: this.playerBodyZone,
      x: targetX,
      duration: KNOCKBACK_MS,
      ease: "Cubic.Out",
      onUpdate: () => this.syncVisualsToBody(),
      onComplete: () => this.syncVisualsToBody(),
    });
    this.beginHitStop();
    this.time.delayedCall(HURT_MS, () => { if (this.state === "hurt") this.transitionTo("idle"); });
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
    if (next === this.state) return;
    if (!ALLOWED_TRANSITIONS[this.state].has(next)) throw new Error(`Invalid player transition: ${this.state} -> ${next}`);
    const previous = this.state; this.state = next;
    this.transitionLog.push(`${previous} -> ${next}`); if (this.transitionLog.length > 20) this.transitionLog.shift();
    if (next === "idle" || next === "hurt") this.showIdleFrame();
    else if (next === "walk") this.playerSprite.setOrigin(0.5, FRAME_ORIGIN_Y["walk-0"]).setScale(0.44).setFlipX(this.facing < 0).play("guanyu-walk");
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
  private showIdleFrame() { this.playerSprite.stop().setTexture("guanyu-idle", "idle-0").setOrigin(0.5, 1388 / 1536).setScale(0.22).setFlipX(this.facing < 0); }
  private setFacing(direction: 1 | -1) { this.facing = direction; this.playerSprite.setFlipX(direction < 0); }
  private syncVisualsToBody() { const x = Math.round(this.playerBodyZone.x), y = Math.round(this.playerBodyZone.y); this.playerSprite.setPosition(x, y).setDepth(y); if (this.attackBody.enable) this.positionAttackHitbox(); }
  private positionAttackHitbox() { const x = Math.round(this.playerBodyZone.x + this.facing * 104), y = Math.round(this.playerBodyZone.y - 94); this.attackZone.setPosition(x, y); this.attackBody.reset(x, y); }
  private enableAttackHitbox() { this.attackZone.setActive(true); this.attackBody.enable = true; this.positionAttackHitbox(); }
  private disableAttackHitbox() { if (!this.attackBody) return; this.attackBody.stop(); this.attackBody.enable = false; this.attackZone.setActive(false); }

  private updateDebugText() {
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
      `hit stop: ${this.hitStopActive}`,
      `animation: ${this.playerSprite.anims.currentAnim?.key ?? "idle"}`,
      `frame: ${this.playerSprite.anims.currentFrame?.index ?? 0}`,
      "",
      "transitions:",
      ...this.transitionLog,
    );
    this.debugText.setText(lines);
  }
}
