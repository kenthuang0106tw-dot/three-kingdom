import * as Phaser from "phaser";

type PlayerState = "idle" | "walk" | "attack1" | "attack2" | "attack3";
type AttackState = "attack1" | "attack2" | "attack3";
type DirectionSnapshot = { moveX: number; moveY: number; up: boolean; down: boolean; left: boolean; right: boolean };
type PreviewFrame = {
  name: string; x: number; y: number; width: number; height: number;
  originY: number; offsetX: number; offsetY: number; classification: string;
};

const WIDTH = 1280;
const HEIGHT = 720;
const START_X = 180;
const START_FOOT_Y = 602;
const WALK_SPEED = 235;
const COMBO_WINDOW_MS = 360;
const EARLY_BUFFER_MS = 160;
const WALK_BOUNDS = new Phaser.Geom.Rectangle(70, 390, 1140, 245);
const ATTACK_STATES: AttackState[] = ["attack1", "attack2", "attack3"];
const ATTACK_ANIMATIONS: Record<AttackState, string> = {
  attack1: "guanyu-attack1",
  attack2: "guanyu-attack2",
  attack3: "guanyu-attack3",
};
const ALLOWED_TRANSITIONS: Record<PlayerState, ReadonlySet<PlayerState>> = {
  idle: new Set(["walk", "attack1"]),
  walk: new Set(["idle", "attack1"]),
  attack1: new Set(["idle", "attack2"]),
  attack2: new Set(["idle", "attack3"]),
  attack3: new Set(["idle"]),
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

class PlayerInputController {
  readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  readonly wasd: Record<"up" | "down" | "left" | "right", Phaser.Input.Keyboard.Key>;
  readonly attack: Phaser.Input.Keyboard.Key;

  constructor(keyboard: Phaser.Input.Keyboard.KeyboardPlugin) {
    this.cursors = keyboard.createCursorKeys();
    this.wasd = keyboard.addKeys({ up: "W", down: "S", left: "A", right: "D" }) as typeof this.wasd;
    this.attack = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
  }

  readDirection(): DirectionSnapshot {
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;
    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    return { moveX: Number(right) - Number(left), moveY: Number(down) - Number(up), up, down, left, right };
  }

  attackJustPressed() { return Phaser.Input.Keyboard.JustDown(this.attack); }
}

export default class MainScene extends Phaser.Scene {
  private playerSprite!: Phaser.GameObjects.Sprite;
  private playerBodyZone!: Phaser.GameObjects.Zone;
  private attackZone!: Phaser.GameObjects.Zone;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private attackBody!: Phaser.Physics.Arcade.Body;
  private inputController!: PlayerInputController;
  private developmentTarget?: Phaser.GameObjects.Zone;
  private debugText?: Phaser.GameObjects.Text;
  private state: PlayerState = "idle";
  private facing: 1 | -1 = -1;
  private currentInput: DirectionSnapshot = { moveX: 0, moveY: 0, up: false, down: false, left: false, right: false };
  private comboStep = 0;
  private hitConfirmed = false;
  private comboBuffered = false;
  private bufferedAt = -Infinity;
  private comboWindowOpen = false;
  private comboWindowOpenedAt = 0;
  private comboWindowEndsAt = 0;
  private attackAnimationComplete = false;
  private attackTriggerCount = 0;
  private attackCompleteCount = 0;
  private readonly transitionLog: string[] = [];
  private diagnosticMode = false;
  private previewMode = false;
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

  constructor() { super("MainScene"); }

  preload() {
    this.load.image("forest", "/scene/forest-camp.png");
    this.load.atlas("guanyu-idle", "/art/guanyu/guanyu-master.png", "/art/guanyu/guanyu-idle.atlas.json");
    this.load.atlas("guanyu-walk", "/art/guanyu/guanyu-walk.png", "/art/guanyu/guanyu-walk.atlas.json");
    this.load.atlas("guanyu-attack", "/art/guanyu/guanyu-combo-frames.png", "/art/guanyu/guanyu-attack.atlas.json");
  }

  create() {
    const development = process.env.NODE_ENV !== "production";
    this.previewMode = development && new URLSearchParams(window.location.search).get("previewAttack") === "1";
    if (this.previewMode) { this.createPreviewMode(); return; }

    this.createCombatAnimations();
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
    this.playerSprite.on(Phaser.Animations.Events.ANIMATION_UPDATE, this.handleAnimationUpdate, this);
    this.playerSprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this);

    if (development) {
      this.developmentTarget = this.add.zone(78, START_FOOT_Y, 56, 138).setOrigin(0.5, 1);
      this.physics.add.existing(this.developmentTarget, true);
      this.diagnosticMode = new URLSearchParams(window.location.search).get("debugInput") === "1";
      this.debugText = this.add.text(12, 12, "", { fontFamily: "Consolas, monospace", fontSize: "15px", color: "#fff", backgroundColor: "rgba(0,0,0,.78)", padding: { x: 8, y: 7 } }).setDepth(10000);
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.playerSprite.off(Phaser.Animations.Events.ANIMATION_UPDATE, this.handleAnimationUpdate, this);
      this.playerSprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this);
      this.disableAttackHitbox();
    });
  }

  update() {
    if (this.previewMode) { this.updatePreviewMode(); return; }
    this.playerBody.setVelocity(0, 0);
    this.currentInput = this.inputController.readDirection();

    if (this.isAttackState(this.state)) {
      this.updateAttackState();
      this.syncVisualsToBody();
      this.updateDebugText();
      return;
    }

    if (this.inputController.attackJustPressed()) {
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
    const groups = [["attack-0", "attack-1", "attack-0"], ["attack-2", "attack-3", "attack-2"], ["attack-4", "attack-5", "attack-4"]];
    groups.forEach((frames, index) => this.anims.create({ key: `guanyu-attack${index + 1}`, frames: frames.map(frame => ({ key: "guanyu-attack", frame })), frameRate: 8, repeat: 0 }));
  }

  private updateAttackState() {
    if (this.inputController.attackJustPressed() && this.comboStep < 3) {
      this.attackTriggerCount += 1;
      this.bufferedAt = this.time.now;
      this.comboBuffered = this.comboWindowOpen || this.time.now >= this.comboWindowOpenedAt - EARLY_BUFFER_MS;
    }
    if (this.attackBody.enable && this.developmentTarget && !this.hitConfirmed && this.physics.overlap(this.attackZone, this.developmentTarget)) this.confirmHit();
    if (!this.attackAnimationComplete) return;
    if (!this.hitConfirmed || this.comboStep === 3 || this.time.now > this.comboWindowEndsAt) { this.finishCombo(); return; }
    if (this.comboWindowOpen && this.comboBuffered) this.startAttack(this.comboStep + 1);
  }

  private startAttack(step: number) {
    const nextState = ATTACK_STATES[step - 1];
    this.transitionTo(nextState);
    this.comboStep = step;
    this.hitConfirmed = false;
    this.comboBuffered = false;
    this.bufferedAt = -Infinity;
    this.comboWindowOpen = false;
    this.comboWindowOpenedAt = 0;
    this.comboWindowEndsAt = 0;
    this.attackAnimationComplete = false;
    this.playerBody.setVelocity(0, 0);
    this.disableAttackHitbox();
    const firstFrame = PREVIEW_FRAMES[(step - 1) * 2];
    this.playerSprite.setOrigin(0.5, firstFrame.originY).setScale(0.64).setFlipX(this.facing < 0).play(ATTACK_ANIMATIONS[nextState]);
  }

  private confirmHit() {
    this.hitConfirmed = true;
    this.comboWindowOpen = true;
    this.comboWindowOpenedAt = this.time.now;
    this.comboWindowEndsAt = this.time.now + COMBO_WINDOW_MS;
    this.comboBuffered = this.bufferedAt >= this.comboWindowOpenedAt - EARLY_BUFFER_MS;
  }

  private finishCombo() {
    this.disableAttackHitbox();
    this.comboStep = 0;
    this.hitConfirmed = false;
    this.comboBuffered = false;
    this.comboWindowOpen = false;
    this.attackAnimationComplete = false;
    this.transitionTo("idle");
  }

  private handleAnimationComplete(animation: Phaser.Animations.Animation) {
    if (!Object.values(ATTACK_ANIMATIONS).includes(animation.key)) return;
    this.disableAttackHitbox();
    this.attackCompleteCount += 1;
    this.attackAnimationComplete = true;
    if (!this.hitConfirmed || this.comboStep === 3) this.finishCombo();
  }

  private handleAnimationUpdate(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
    const frameName = String(frame.textureFrame);
    this.playerSprite.setOrigin(0.5, FRAME_ORIGIN_Y[frameName] ?? this.playerSprite.originY);
    if (!Object.values(ATTACK_ANIMATIONS).includes(animation.key)) return;
    if (frame.index === 2) this.enableAttackHitbox(); else this.disableAttackHitbox();
  }

  private transitionTo(next: PlayerState) {
    if (next === this.state) return;
    if (!ALLOWED_TRANSITIONS[this.state].has(next)) throw new Error(`Invalid player transition: ${this.state} -> ${next}`);
    const previous = this.state; this.state = next;
    this.transitionLog.push(`${previous} -> ${next}`); if (this.transitionLog.length > 20) this.transitionLog.shift();
    if (next === "idle") this.showIdleFrame();
    else if (next === "walk") this.playerSprite.setOrigin(0.5, FRAME_ORIGIN_Y["walk-0"]).setScale(0.44).setFlipX(this.facing < 0).play("guanyu-walk");
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
    const lines = [
      `state: ${this.state}`, `velocity: ${v.x.toFixed(1)}, ${v.y.toFixed(1)}`, `keys UDLR: ${i.up} ${i.down} ${i.left} ${i.right}`,
      `J down: ${this.inputController.attack.isDown}`, `attack trigger/complete: ${this.attackTriggerCount}/${this.attackCompleteCount}`,
      `comboStep: ${this.comboStep}`, `hitConfirmed: ${this.hitConfirmed}`, `comboBuffered: ${this.comboBuffered}`, `comboWindowOpen: ${this.comboWindowOpen}`,
      `animation: ${this.playerSprite.anims.currentAnim?.key ?? "idle"}`, `frame: ${this.playerSprite.anims.currentFrame?.index ?? 0}`,
    ];
    if (this.diagnosticMode) lines.push("", "transitions:", ...this.transitionLog);
    this.debugText.setText(lines);
  }
}
