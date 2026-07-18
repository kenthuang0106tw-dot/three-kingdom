import * as Phaser from "phaser";
import { EnemyCombatant, EnemyManager } from "./EnemyManager";
import { createActionSnapshot, type ActionSnapshot } from "./input/ActionSnapshot";
import { TouchInputController } from "./input/TouchInputController";
import { LifecycleClock } from "./time/LifecycleClock";
import { PhaserGameplayClock, SeededRandom } from "./time/GameplayTime";
import { GameplayEventHub, type GameplaySnapshot } from "./events/GameplayEvents";
import { StageCompletionGate } from "./events/StageCompletion";
import { createAssetFailureReporter, queueRuntimeAssets } from "./assets/AssetManifest";
import { PlayerStateMachine, type PlayerState } from "./player/PlayerStateMachine";
import { PlayerLifecycle } from "./player/PlayerLifecycle";
import { PlayerActor } from "./player/PlayerActor";
import { PLAYER_ATTACKS, PlayerAttackController, type AttackStep } from "./player/PlayerAttackController";
import { resolveAttack } from "./combat/CombatResolver";
import { EffectDirector, EFFECT_PARAMS } from "./combat/EffectDirector";
import { BAMBOO_BOSS_ARENA, BAMBOO_COMBAT_ROOM, clampStageX } from "./stage/StageConfig";
import { advanceCameraHandoff, beginCameraHandoff, calculateCameraScroll, type CameraHandoffState } from "./camera/CameraFollow";
import { createCameraLockState, hasCameraLock, isCameraLocked, lockCamera, unlockCamera, type CameraLockState } from "./camera/CameraLock";
import { createStageExitState, makeExitAvailable, resetStageExit, type StageExitState } from "./stage/StageExit";
import { clearActiveEncounter, createBossEntryState, createEncounterSequence, isEncounterSequenceCleared, makeBossEntryEligible, triggerBossEntry, triggerNextEncounter, type BossEntryState, type EncounterSequenceState } from "./stage/EncounterFlow";
import { DUELIST_ENEMY_CONFIG, MAULER_ENEMY_CONFIG, SOLDIER_ENEMY_CONFIG, enemyAnimationKey } from "./enemy/EnemyConfig";
import { BOSS_ACTOR_CONFIG, BossActor } from "./boss/BossActor";
import { GameFlowStateMachine } from "./flow/GameFlowStateMachine";
import { TitleStartController } from "./flow/TitleStartController";
import { GameHud } from "./ui/GameHud";
import { PauseController } from "./ui/PauseController";
import { FailureController, type FailureRestartSource as ExplicitFailureRestartSource } from "./ui/FailureController";
import { ResultController, type ResultReplaySource as ExplicitResultReplaySource } from "./ui/ResultController";

type AttackState = "attack1" | "attack2" | "attack3";
type TitleStartSource = "keyboard" | "pointer" | "smoke";
type FailureRestartSource = ExplicitFailureRestartSource | "smoke";
type ResultReplaySource = ExplicitResultReplaySource | "smoke";
type PreviewFrame = {
  name: string; x: number; y: number; width: number; height: number;
  originY: number; offsetX: number; offsetY: number; classification: string;
};

const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 720;
const START_X = BAMBOO_COMBAT_ROOM.playerSpawn.x;
const START_FOOT_Y = BAMBOO_COMBAT_ROOM.playerSpawn.y;
const WALK_SPEED = 235;
const PLAYER_MAX_HP = 10;
const ENEMY_FRAME_SIZE = 384;
const ENEMY_FEET_Y = 354;
const HURT_MS = 300;
const COMBO_WINDOW_MS = 360;
const FAILURE_SMOKE_RESTART_MS = 500;
const RESULT_SMOKE_REPLAY_MS = 500;
const RESULT_SMOKE_BOSS_HIT_MS = 35;
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

  consumeAttackPress(): void {
    Phaser.Input.Keyboard.JustDown(this.attack);
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
  private bossActor?: BossActor;
  private readonly playerStateMachine = new PlayerStateMachine();
  private readonly playerLifecycle = new PlayerLifecycle(PLAYER_MAX_HP);
  private readonly attackController = new PlayerAttackController();
  private readonly gameFlow = new GameFlowStateMachine();
  private readonly titleStartController = new TitleStartController(this.gameFlow);
  private titleOverlay?: Phaser.GameObjects.Container;
  private hud!: GameHud;
  private pauseController!: PauseController;
  private failureController!: FailureController;
  private resultController!: ResultController;
  private titleStartCount = 0;
  private pauseCount = 0;
  private resumeCount = 0;
  private readonly handleTitleKeyboardStart = () => this.startGame("keyboard");
  private readonly handleTitlePointerStart = () => this.startGame("pointer");
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
  private encounterSmokeMode = false;
  private cameraHandoffSmokeMode = false;
  private cameraScrollSamples: number[] = [];
  private cameraMaxFrameDelta = 0;
  private cameraHandoffMaxFrameDelta = 0;
  private bossEntrySmokeMode = false;
  private bossMovementSmokeMode = false;
  private bossMovementSmokeStep = 0;
  private bossMovementSmokeStepStartedAt = 0;
  private bossCombatSmokeMode = false;
  private bossCombatSmokeStep = 0;
  private failureSmokeMode = false;
  private failureSmokeCycleActive = false;
  private failureSmokeIteration = 0;
  private failureRestartCount = 0;
  private failureTotalEntryCount = 0;
  private failureEntryCount = 0;
  private clearedEntryCount = 0;
  private resultSmokeMode = false;
  private resultSmokeCycleActive = false;
  private resultSmokeIteration = 0;
  private resultReplayCount = 0;
  private resultTotalEntryCount = 0;
  private resultSmokeTimer?: Phaser.Time.TimerEvent;
  private failureSmokeAllInputBlocked = true;
  private failureSmokeAllActorsSuspended = true;
  private failureSmokeTimer?: Phaser.Time.TimerEvent;
  private bossSmokeMode = false;
  private bossClearedSmokeMode = false;
  private bossSmokeTimer?: Phaser.Time.TimerEvent;
  private readonly bossSmokeLog: string[] = [];
  private bossArenaReleaseCount = 0;
  private bossArenaDebug?: Phaser.GameObjects.Graphics;
  private readonly stageCompletion = new StageCompletionGate();
  private stageCompleteEventCount = 0;
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
  private cameraLockState: CameraLockState = createCameraLockState();
  private stageExitState: StageExitState = createStageExitState(BAMBOO_COMBAT_ROOM.exits);
  private encounterSequence: EncounterSequenceState = createEncounterSequence();
  private previousPlayerPosition = { x: START_X, y: START_FOOT_Y };
  private encounterCameraScrollX: number | null = null;
  private cameraHandoff: CameraHandoffState = { active: false, x: 0, y: 0 };
  private bossEntryState: BossEntryState = createBossEntryState();
  private previousBossEntryPosition = { x: START_X, y: START_FOOT_Y };

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
    this.bossMovementSmokeMode = development && query.get("bossMovementSmoke") === "1";
    this.bossCombatSmokeMode = development && query.get("bossCombatSmoke") === "1";
    this.resultSmokeMode = development && query.get("resultSmoke") === "1";
    this.resultSmokeCycleActive = this.resultSmokeMode && this.resultSmokeIteration < 10;
    const bossClearedSmokeRequested = query.get("bossClearedSmoke") === "1";
    this.bossClearedSmokeMode = development
      && ((bossClearedSmokeRequested && this.resultTotalEntryCount === 0) || this.resultSmokeCycleActive);
    this.failureSmokeMode = development && query.get("failureSmoke") === "1";
    this.cameraHandoffSmokeMode = development && query.get("cameraHandoffSmoke") === "1";
    this.failureSmokeCycleActive = this.failureSmokeMode && this.failureSmokeIteration < 10;
    this.bossEntrySmokeMode = development && (query.get("bossEntrySmoke") === "1" || this.bossMovementSmokeMode);
    this.encounterSmokeMode = development && (query.get("encounterSmoke") === "1" || this.bossEntrySmokeMode || this.cameraHandoffSmokeMode);
    this.bossSmokeMode = development && (query.get("bossSmoke") === "1" || this.bossClearedSmokeMode);
    if (this.bossSmokeMode) this.bossSmokeLog.length = 0;
    this.bossArenaReleaseCount = 0;
    this.bossMovementSmokeStep = 0;
    this.bossMovementSmokeStepStartedAt = 0;
    this.bossCombatSmokeStep = 0;
    this.failureEntryCount = 0;
    this.clearedEntryCount = 0;
    this.stageCompletion.reset();
    this.stageCompleteEventCount = 0;
    this.gameFlow.resetForNewRun();
    this.titleStartCount = 0;
    this.pauseCount = 0;
    this.resumeCount = 0;
    if (development) {
      this.game.canvas.dataset.stageCompleteCount = "0";
      delete this.game.canvas.dataset.stageCompleteStageId;
      delete this.game.canvas.dataset.stageCompleteAfterArenaRelease;
      delete this.game.canvas.dataset.playerHitEnemyIds;
      delete this.game.canvas.dataset.titleStartSource;
      delete this.game.canvas.dataset.bossMovementSmokeLeft;
      delete this.game.canvas.dataset.bossMovementSmokeRight;
      delete this.game.canvas.dataset.bossMovementSmokeComplete;
      delete this.game.canvas.dataset.bossCombatSmokeAlignmentGate;
      delete this.game.canvas.dataset.bossCombatSmokeComplete;
      delete this.game.canvas.dataset.failureSmokeComplete;
      delete this.game.canvas.dataset.failureInputBlocked;
      delete this.game.canvas.dataset.failureActorsSuspended;
      delete this.game.canvas.dataset.clearedInputBlocked;
      delete this.game.canvas.dataset.clearedActorsSuspended;
      delete this.game.canvas.dataset.clearedAfterArenaRelease;
      delete this.game.canvas.dataset.clearedAfterStageComplete;
      delete this.game.canvas.dataset.bossCleanupReason;
      delete this.game.canvas.dataset.bossCleanupFlowState;
      delete this.game.canvas.dataset.bossClearedSmokeComplete;
      delete this.game.canvas.dataset.resultSmokeComplete;
      delete this.game.canvas.dataset.resultReplaySource;
      delete this.game.canvas.dataset.cameraHandoffSmokeComplete;
      this.game.canvas.dataset.clearedEntryCount = "0";
      this.game.canvas.dataset.failureEntryCount = "0";
      this.game.canvas.dataset.failureTotalEntryCount = String(this.failureTotalEntryCount);
      this.game.canvas.dataset.failureRestartCount = String(this.failureRestartCount);
      this.game.canvas.dataset.resultOverlayVisible = "false";
      this.game.canvas.dataset.resultEntryCount = "0";
      this.game.canvas.dataset.resultTotalEntryCount = String(this.resultTotalEntryCount);
      this.game.canvas.dataset.resultReplayCount = String(this.resultReplayCount);
    }
    this.playerStateMachine.reset();
    this.playerLifecycle.reset();
    if (development) this.game.canvas.dataset.playerHp = String(this.playerHp);
    this.cameraLockState = createCameraLockState();
    this.stageExitState = resetStageExit();
    this.encounterSequence = createEncounterSequence();
    this.previousPlayerPosition = { x: START_X, y: START_FOOT_Y };
    this.encounterCameraScrollX = null;
    this.cameraHandoff = { active: false, x: 0, y: 0 };
    this.cameraScrollSamples = [];
    this.cameraMaxFrameDelta = 0;
    this.cameraHandoffMaxFrameDelta = 0;
    this.bossEntryState = createBossEntryState();
    this.previousBossEntryPosition = { x: START_X, y: START_FOOT_Y };
    this.bossActor = undefined;
    this.defeatedText = undefined;
    if (this.enemyPreviewMode) { this.createEnemyAlignmentPreview(); return; }
    if (this.previewMode) { this.createPreviewMode(); return; }

    this.lifecycleClock = new LifecycleClock(this);
    this.lastLifecyclePaused = false;
    this.effectDirector = new EffectDirector(this, this.lifecycleClock);
    this.createCombatAnimations();
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setBounds(
      BAMBOO_COMBAT_ROOM.worldBounds.x,
      BAMBOO_COMBAT_ROOM.worldBounds.y,
      BAMBOO_COMBAT_ROOM.worldBounds.width,
      BAMBOO_COMBAT_ROOM.worldBounds.height,
    );
    this.physics.world.setBounds(
      BAMBOO_COMBAT_ROOM.walkBounds.x,
      BAMBOO_COMBAT_ROOM.walkBounds.y,
      BAMBOO_COMBAT_ROOM.walkBounds.width,
      BAMBOO_COMBAT_ROOM.walkBounds.height,
    );
    for (const section of BAMBOO_COMBAT_ROOM.backgroundSections) {
      const background = this.add.image(
        section.bounds.x + section.bounds.width / 2,
        section.bounds.y + section.bounds.height / 2,
        section.textureKey,
      );
      background.setScale(Math.max(
        section.bounds.width / background.width,
        section.bounds.height / background.height,
      )).setDepth(0);
    }

    this.playerActor = new PlayerActor(this, START_X, START_FOOT_Y);
    this.showIdleFrame();

    this.attackZone = this.add.zone(START_X, START_FOOT_Y - 48, 142, 86).setOrigin(0.5);
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
      onPlayerHit: enemy => this.applyHitToPlayer(enemy.id, enemy.facing, enemy.config.id),
      onAllDefeated: () => this.handleEncounterCleared(),
    }, development, { clock: new PhaserGameplayClock(this), random: new SeededRandom(0x3a6f2d1) });
    this.updateEncounterDataset();
    if (development) this.game.canvas.dataset.bossActorCount = "0";
    if (this.bossSmokeMode || this.bossCombatSmokeMode || this.failureSmokeCycleActive) {
      this.bossEntryState = "active";
      this.createBossActor(development);
      if (this.bossSmokeMode) this.scheduleBossSmokeHit();
      this.cameraLockState = lockCamera(this.cameraLockState, "encounter");
      this.activateBossArena(development);
      this.updateBossEntryDataset(development);
    } else {
      this.updateBossArenaDataset(development);
      this.updateBossEntryDataset(development);
    }

    if (development) {
      this.diagnosticMode = new URLSearchParams(window.location.search).get("debugInput") === "1";
      this.debugText = this.add.text(12, 90, "", { fontFamily: "Consolas, monospace", fontSize: "15px", color: "#fff", backgroundColor: "rgba(0,0,0,.78)", padding: { x: 8, y: 7 } }).setScrollFactor(0).setDepth(22000);
      this.game.canvas.dataset.stageWorldWidth = String(BAMBOO_COMBAT_ROOM.worldBounds.width);
      this.game.canvas.dataset.stageSectionCount = String(BAMBOO_COMBAT_ROOM.backgroundSections.length);
    }
    this.hud = new GameHud(this, this.gameplayEvents, development);
    this.pauseController = new PauseController(this);
    this.failureController = new FailureController(this);
    this.resultController = new ResultController(this);
    this.updateFailureDataset();
    this.updateResultDataset();
    this.updateCamera();
    this.createTitleOverlay(keyboard);
    this.updatePauseDataset();
    this.updateHud();
    if (this.bossClearedSmokeMode) this.startGame("smoke");
    this.prepareFailureSmokeCycle();
    this.prepareResultSmokeCycle();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.playerSprite.off(Phaser.Animations.Events.ANIMATION_UPDATE, this.handleAnimationUpdate, this);
      this.playerSprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this);
      this.disableAttackHitbox();
      this.touchInputController.destroy();
      this.effectDirector.destroy();
      this.lifecycleClock.destroy();
      this.enemyManager.destroy();
      this.bossSmokeTimer?.remove(false);
      this.bossSmokeTimer = undefined;
      this.failureSmokeTimer?.remove(false);
      this.failureSmokeTimer = undefined;
      this.resultSmokeTimer?.remove(false);
      this.resultSmokeTimer = undefined;
      this.bossActor?.destroy();
      this.bossActor = undefined;
      this.hud.destroy();
      this.pauseController.destroy();
      this.failureController.destroy();
      this.resultController.destroy();
      if (development) this.game.canvas.dataset.bossActorCount = "0";
      this.bossArenaDebug?.destroy();
      this.bossArenaDebug = undefined;
      this.playerActor.destroy();
      keyboard.off("keydown", this.handleTitleKeyboardStart, this);
      this.titleOverlay?.destroy(true);
      this.titleOverlay = undefined;
    });

    if (this.resetSmokeMode) {
      this.resetSmokeIteration += 1;
      this.game.canvas.dataset.resetSmokeCount = String(this.resetSmokeIteration);
      this.time.delayedCall(20, () => {
        if (this.resetSmokeIteration < 10 && this.scene.isActive()) this.restartStage();
      });
    }
  }

  update() {
    if (this.enemyPreviewMode) { this.updateEnemyAlignmentPreview(); return; }
    if (this.previewMode) { this.updatePreviewMode(); return; }
    if (this.pauseController.consumeToggleRequest()) this.togglePause();
    const failureRestartSource = this.failureController.consumeRestartRequest();
    if (failureRestartSource) {
      this.restartAfterFailure(failureRestartSource);
      return;
    }
    const resultReplaySource = this.resultController.consumeReplayRequest();
    if (resultReplaySource) {
      this.replayAfterClear(resultReplaySource);
      return;
    }
    if (this.gameFlow.state === "title") return;
    if (this.gameFlow.state === "paused") {
      this.playerBody.setVelocity(0, 0);
      this.updateDebugText();
      return;
    }
    if (this.gameFlow.state === "failed" || this.gameFlow.state === "cleared") {
      this.playerBody.setVelocity(0, 0);
      this.updateDebugText();
      return;
    }
    if (this.lifecycleClock.isPaused()) { this.updateDebugText(); return; }
    this.playerBody.setVelocity(0, 0);
    this.currentInput = this.touchInputController.readSnapshot(this.inputController.readSnapshot());
    if (!this.bossSmokeMode && !this.bossCombatSmokeMode && !this.failureSmokeCycleActive) {
      this.updateEncounterSmoke();
      this.updateEncounterProgress();
      this.constrainPlayerToEncounterCamera();
      this.updateBossEntrySmoke();
      this.updateBossEntryProgress();
    }
    this.constrainPlayerToBossArena();

    this.enemyManager.update();
    this.updateBossMovementSmoke();
    this.updateBossCombatSmoke();
    if (!this.bossCombatSmokeMode || this.bossCombatSmokeStep < 4) {
      this.bossActor?.update(
        { x: this.playerBodyZone.x, y: this.playerBodyZone.y },
        BAMBOO_BOSS_ARENA.bounds,
      );
      this.resolveBossAttackHit();
    }
    this.updateBossMovementDataset();
    this.updateBossSmokeDataset();

    if (this.state === "hurt") {
      this.syncVisualsToBody();
      this.updateCamera();
      this.updateDebugText();
      return;
    }
    if (this.state === "dead") {
      this.playerBody.setVelocity(0, 0);
      this.syncVisualsToBody();
      this.updateCamera();
      this.updateDebugText();
      return;
    }

    if (this.isAttackState(this.state)) {
      this.updateAttackState();
      this.syncVisualsToBody();
      this.updateCamera();
      this.updateDebugText();
      return;
    }

    if (this.currentInput.attackPressed) {
      this.attackTriggerCount += 1;
      this.startAttack(1);
      this.syncVisualsToBody();
      this.updateCamera();
      this.updateDebugText();
      return;
    }

    const { moveX, moveY } = this.currentInput;
    if (moveX || moveY) {
      const velocity = new Phaser.Math.Vector2(moveX, moveY).scale(WALK_SPEED);
      this.playerBody.setVelocity(velocity.x, velocity.y);
      if (moveX > 0) this.setFacing(1); else if (moveX < 0) this.setFacing(-1);
      this.transitionTo("walk");
    } else this.transitionTo("idle");
    this.syncVisualsToBody();
    this.updateCamera();
    this.updateDebugText();
  }

  private togglePause(): boolean {
    if (this.gameFlow.state === "playing") {
      this.playerBody.setVelocity(0, 0);
      this.currentInput = createActionSnapshot({ up: false, down: false, left: false, right: false });
      this.inputController.consumeAttackPress();
      this.touchInputController.clearTransientInput();
      this.gameFlow.transition("paused");
      this.lifecycleClock.setManualPaused(true);
      this.pauseCount += 1;
    } else if (this.gameFlow.state === "paused") {
      this.inputController.consumeAttackPress();
      this.touchInputController.clearTransientInput();
      this.gameFlow.transition("playing");
      this.lifecycleClock.setManualPaused(false);
      this.resumeCount += 1;
    } else return false;

    this.pauseController.setFlowState(this.gameFlow.state);
    this.updateTitleDataset();
    this.updatePauseDataset();
    this.updateHud();
    return true;
  }

  private updateCamera() {
    const wasHandoffActive = this.cameraHandoff.active;
    if (!isCameraLocked(this.cameraLockState)) {
      const target = calculateCameraScroll(
        { x: this.playerBodyZone.x, y: this.playerBodyZone.y },
        BAMBOO_COMBAT_ROOM.worldBounds,
        { width: this.cameras.main.width, height: this.cameras.main.height },
      );
      this.cameraHandoff = this.cameraHandoff.active
        ? advanceCameraHandoff(this.cameraHandoff, target, this.game.loop.delta)
        : { active: false, x: target.x, y: target.y };
      this.cameras.main.setScroll(Math.round(this.cameraHandoff.x), Math.round(this.cameraHandoff.y));
    }
    if (process.env.NODE_ENV !== "production") {
      const cameraScrollX = Math.round(this.cameras.main.scrollX);
      const previousScrollX = this.cameraScrollSamples.at(-1);
      if (previousScrollX !== undefined) {
        const frameDelta = Math.abs(cameraScrollX - previousScrollX);
        this.cameraMaxFrameDelta = Math.max(this.cameraMaxFrameDelta, frameDelta);
        if (wasHandoffActive) this.cameraHandoffMaxFrameDelta = Math.max(this.cameraHandoffMaxFrameDelta, frameDelta);
      }
      this.cameraScrollSamples.push(cameraScrollX);
      if (this.cameraScrollSamples.length > 60) this.cameraScrollSamples.shift();
      this.game.canvas.dataset.cameraScrollX = String(cameraScrollX);
      this.game.canvas.dataset.cameraScrollSamples = this.cameraScrollSamples.join(",");
      this.game.canvas.dataset.cameraMaxFrameDelta = String(this.cameraMaxFrameDelta);
      this.game.canvas.dataset.cameraHandoffMaxFrameDelta = String(this.cameraHandoffMaxFrameDelta);
      this.game.canvas.dataset.cameraHandoffActive = String(this.cameraHandoff.active);
      this.game.canvas.dataset.playerWorldX = String(Math.round(this.playerBodyZone.x));
    }
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
    for (const config of [SOLDIER_ENEMY_CONFIG, MAULER_ENEMY_CONFIG, DUELIST_ENEMY_CONFIG]) {
      this.anims.create({ key: enemyAnimationKey(config, "idle"), frames: config.animations.idle.map(frame => ({ key: config.assetKey, frame })), frameRate: config.animationRates.idle, repeat: -1 });
      this.anims.create({ key: enemyAnimationKey(config, "walk"), frames: config.animations.walk.map(frame => ({ key: config.assetKey, frame })), frameRate: config.animationRates.walk, repeat: -1 });
      this.anims.create({ key: enemyAnimationKey(config, "attack"), frames: config.animations.attack.map(frame => ({ key: config.assetKey, frame })), frameRate: config.animationRates.attack, repeat: 0 });
      this.anims.create({ key: enemyAnimationKey(config, "hurt"), frames: config.animations.hurt.map(frame => ({ key: config.assetKey, frame })), frameRate: config.animationRates.hurt, repeat: 0 });
      this.anims.create({ key: enemyAnimationKey(config, "dead"), frames: config.animations.dead.map(frame => ({ key: config.assetKey, frame })), frameRate: config.animationRates.dead, repeat: 0 });
    }
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
      let hitLanded = false;
      let globalEffectsTriggered = false;
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
        hitLanded = true;
        globalEffectsTriggered = true;
        hits.forEach((enemy, index) => this.applyHitToEnemy(enemy, index === 0));
      }
      const bossActor = this.bossActor;
      if (bossActor?.isDamageable && this.physics.overlap(this.attackZone, bossActor.bodyZone)) {
        const bossResolution = resolveAttack({
          attackId: this.playerAttackId,
          damage: 1,
          targets: [{ id: bossActor.targetId, hp: bossActor.hp, active: true }],
          hitTargetIds: this.playerHitTargetIds,
        });
        this.playerHitTargetIds = bossResolution.hitTargetIds;
        if (bossResolution.hits.length) {
          hitLanded = true;
          this.applyHitToBoss(!globalEffectsTriggered);
        }
      }
      if (hitLanded) {
        this.hitConfirmed = true;
        this.comboWindowOpen = this.comboStep < 3;
        this.comboWindowEndsAt = this.time.now + COMBO_WINDOW_MS;
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

  private applyHitToBoss(triggerGlobalEffects: boolean) {
    const bossActor = this.bossActor;
    if (!bossActor) return;
    const damage = bossActor.damage(1);
    if (!damage.applied) return;
    this.hitCount += 1;
    this.totalDamage += 1;

    const left = Math.max(this.attackBody.x, bossActor.body.x);
    const right = Math.min(this.attackBody.right, bossActor.body.right);
    const top = Math.max(this.attackBody.y, bossActor.body.y);
    const bottom = Math.min(this.attackBody.bottom, bossActor.body.bottom);
    const hitX = Math.round((left + right) / 2);
    const hitY = Math.round((top + bottom) / 2);

    this.effectDirector.flash(bossActor.sprite);
    this.effectDirector.createHitSpark(hitX, hitY);
    if (triggerGlobalEffects) this.effectDirector.cameraShake();
    const targetX = clampStageX(
      bossActor.bodyZone.x + this.facing * EFFECT_PARAMS.knockbackDistance,
      BAMBOO_BOSS_ARENA.bounds,
    );
    this.effectDirector.knockback(bossActor.bodyZone, targetX, () => bossActor.syncVisuals());
    this.playHitSound();
    if (triggerGlobalEffects) this.effectDirector.beginHitStop();
  }

  private applyHitToPlayer(attackerId: number, attackerFacing: 1 | -1, sourceId: string) {
    if (this.gameFlow.state !== "playing" || this.state === "hurt") return;
    const damage = this.playerLifecycle.applyDamage(1);
    if (!damage.applied) return;
    this.gameplayEvents.publish({ type: "player-hit", enemyId: attackerId, at: this.time.now });
    if (process.env.NODE_ENV !== "production") {
      const hitEnemyIds = new Set((this.game.canvas.dataset.playerHitEnemyIds ?? "").split(",").filter(Boolean));
      hitEnemyIds.add(sourceId);
      this.game.canvas.dataset.playerHitEnemyIds = [...hitEnemyIds].join(",");
      this.game.canvas.dataset.playerHp = String(this.playerHp);
    }
    this.disableAttackHitbox();
    this.comboStep = 0;
    this.hitConfirmed = false;
    this.comboBuffered = false;
    this.comboWindowOpen = false;
    this.transitionTo("hurt");
    this.playerBody.setVelocity(0, 0);

    this.effectDirector.flash(this.playerSprite);
    const targetX = clampStageX(this.playerBodyZone.x + attackerFacing * EFFECT_PARAMS.knockbackDistance, BAMBOO_COMBAT_ROOM.walkBounds);
    this.effectDirector.knockback(this.playerBodyZone, targetX, () => this.syncVisualsToBody());
    this.effectDirector.beginHitStop();
    if (damage.becameDead) {
      this.transitionTo("dead");
      this.enterFailedState();
    } else {
      this.time.delayedCall(HURT_MS, () => { if (this.state === "hurt") this.transitionTo("idle"); });
    }
  }

  private playHitSound() {
    // Interface reserved for a future hit sound asset.
  }

  private updateEncounterProgress() {
    const current = { x: this.playerBodyZone.x, y: this.playerBodyZone.y };
    const triggered = triggerNextEncounter(
      this.encounterSequence,
      BAMBOO_COMBAT_ROOM.encounters,
      this.previousPlayerPosition,
      current,
    );
    this.previousPlayerPosition = current;
    if (!triggered) return;

    const spawnIds = new Set(triggered.encounter.spawnPointIds);
    const spawns = BAMBOO_COMBAT_ROOM.spawnPoints.filter(spawn => spawnIds.has(spawn.id));
    const scroll = calculateCameraScroll(
      current,
      BAMBOO_COMBAT_ROOM.worldBounds,
      { width: this.cameras.main.width, height: this.cameras.main.height },
    );
    this.cameras.main.setScroll(Math.round(scroll.x), Math.round(scroll.y));
    this.cameraHandoff = { active: false, x: scroll.x, y: scroll.y };
    this.encounterCameraScrollX = Math.round(scroll.x);
    this.encounterSequence = triggered.state;
    this.cameraLockState = lockCamera(this.cameraLockState, "encounter");
    this.enemyManager.spawnAll(spawns);
    this.updateEncounterDataset();
  }

  private updateEncounterSmoke() {
    if (!this.encounterSmokeMode) return;
    if (this.encounterSequence.activeEncounterId) {
      if (this.cameraHandoffSmokeMode && this.encounterCameraScrollX !== null) {
        this.playerBody.reset(this.encounterCameraScrollX + 1100, this.playerBodyZone.y);
      }
      for (const enemy of this.enemyManager.getLivingEnemies()) {
        if (enemy.state !== "hurt" && enemy.state !== "dead") this.enemyManager.damage(enemy);
      }
      return;
    }
    if (this.cameraHandoffSmokeMode && this.encounterSequence.nextEncounterIndex > 0) {
      if (this.cameraHandoff.active) return;
      if (this.encounterSequence.nextEncounterIndex >= BAMBOO_COMBAT_ROOM.encounters.length) {
        this.game.canvas.dataset.cameraHandoffSmokeComplete = "true";
        return;
      }
    }
    const encounter = BAMBOO_COMBAT_ROOM.encounters[this.encounterSequence.nextEncounterIndex];
    if (!encounter) return;
    const y = encounter.trigger.y + encounter.trigger.height / 2;
    this.previousPlayerPosition = { x: encounter.trigger.x - 1, y };
    this.playerBody.reset(encounter.trigger.x + 1, y);
  }

  private constrainPlayerToEncounterCamera() {
    if (this.encounterCameraScrollX === null || !this.encounterSequence.activeEncounterId) return;
    const minX = this.encounterCameraScrollX + BAMBOO_COMBAT_ROOM.walkBounds.x;
    const maxX = this.encounterCameraScrollX + VIEWPORT_WIDTH - BAMBOO_COMBAT_ROOM.walkBounds.x;
    const x = Phaser.Math.Clamp(this.playerBodyZone.x, minX, maxX);
    if (x !== this.playerBodyZone.x) this.playerBody.reset(x, this.playerBodyZone.y);
  }

  private handleEncounterCleared() {
    const encounterId = this.encounterSequence.activeEncounterId;
    if (!encounterId) return;
    this.encounterSequence = clearActiveEncounter(this.encounterSequence, encounterId);
    this.encounterCameraScrollX = null;
    this.cameraHandoff = beginCameraHandoff({ x: this.cameras.main.scrollX, y: this.cameras.main.scrollY });
    this.cameraLockState = unlockCamera(this.cameraLockState, "encounter");
    this.updateEncounterDataset();
    if (isEncounterSequenceCleared(this.encounterSequence, BAMBOO_COMBAT_ROOM.encounters.length)) {
      this.bossEntryState = makeBossEntryEligible(this.bossEntryState);
      this.updateBossEntryDataset(process.env.NODE_ENV !== "production");
      this.showAllEnemiesDefeated();
    }
  }

  private showAllEnemiesDefeated() {
    this.cameraLockState = unlockCamera(this.cameraLockState, "encounter");
    this.updateBossArenaDataset(process.env.NODE_ENV !== "production");
    this.stageExitState = makeExitAvailable(this.stageExitState, BAMBOO_COMBAT_ROOM.exits, "room-exit");
    if (this.defeatedText) return;
    this.defeatedText = this.add.text(VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2, "All Enemies Defeated", {
      fontFamily: "Consolas, monospace", fontSize: "36px", color: "#ffffff",
      backgroundColor: "rgba(0,0,0,.72)", padding: { x: 20, y: 12 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);
  }

  private enterFailedState() {
    if (this.gameFlow.state !== "playing" && this.gameFlow.state !== "paused") return;
    if (this.gameFlow.state === "paused") this.lifecycleClock.setManualPaused(false);
    this.gameFlow.transition("failed");
    this.pauseController.setFlowState(this.gameFlow.state);
    this.failureEntryCount += 1;
    this.failureTotalEntryCount += 1;
    this.playerBody.stop();
    this.disableAttackHitbox();
    this.enemyManager.suspendCombat();
    this.bossActor?.suspendCombat();
    this.failureController.show();
    this.updateFailureDataset();
    this.updateTitleDataset();
    this.updatePauseDataset();

    if (process.env.NODE_ENV !== "production") {
      this.game.canvas.dataset.failureEntryCount = String(this.failureEntryCount);
      this.game.canvas.dataset.failureTotalEntryCount = String(this.failureTotalEntryCount);
      const inputBlocked = this.playerBody.velocity.x === 0 && this.playerBody.velocity.y === 0 && !this.attackBody.enable;
      const actorsSuspended = this.enemyManager.isCombatSuspended
        && (!this.bossActor || (this.bossActor.isCombatSuspended && !this.bossActor.isAttackHitboxEnabled));
      this.game.canvas.dataset.failureInputBlocked = String(inputBlocked);
      this.game.canvas.dataset.failureActorsSuspended = String(actorsSuspended);
      if (this.failureSmokeCycleActive) {
        this.failureSmokeAllInputBlocked &&= inputBlocked;
        this.failureSmokeAllActorsSuspended &&= actorsSuspended;
      }
    }

    if (this.failureSmokeCycleActive) {
      this.failureSmokeIteration += 1;
      this.failureSmokeTimer?.remove(false);
      this.failureSmokeTimer = this.time.delayedCall(FAILURE_SMOKE_RESTART_MS, () => {
        this.failureSmokeTimer = undefined;
        this.restartAfterFailure("smoke");
      });
    }
  }

  private restartAfterFailure(source: FailureRestartSource) {
    if (this.gameFlow.state !== "failed") return false;
    this.failureController.hide();
    this.failureRestartCount += 1;
    if (process.env.NODE_ENV !== "production") {
      this.game.canvas.dataset.failureRestartCount = String(this.failureRestartCount);
      this.game.canvas.dataset.failureRestartSource = source;
    }
    this.updateFailureDataset();
    this.restartStage();
    return true;
  }

  private replayAfterClear(source: ResultReplaySource) {
    if (this.gameFlow.state !== "cleared") return false;
    this.resultController.hide();
    this.resultReplayCount += 1;
    if (process.env.NODE_ENV !== "production") {
      this.game.canvas.dataset.resultReplayCount = String(this.resultReplayCount);
      this.game.canvas.dataset.resultReplaySource = source;
    }
    this.updateResultDataset();
    this.restartStage();
    return true;
  }

  private prepareFailureSmokeCycle() {
    if (!this.failureSmokeMode) return;
    if (!this.failureSmokeCycleActive) {
      const initialStateRestored = this.gameFlow.state === "title"
        && this.playerHp === PLAYER_MAX_HP
        && this.playerBodyZone.x === START_X
        && this.encounterSequence.nextEncounterIndex === 0
        && this.bossEntryState === "locked"
        && this.bossActor === undefined
        && !isCameraLocked(this.cameraLockState)
        && this.stageCompleteEventCount === 0;
      this.game.canvas.dataset.failureSmokeComplete = String(
        this.failureSmokeIteration === 10
        && this.failureRestartCount === 10
        && this.failureTotalEntryCount === 10
        && this.failureSmokeAllInputBlocked
        && this.failureSmokeAllActorsSuspended
        && initialStateRestored,
      );
      this.game.canvas.dataset.failureSmokeAllInputBlocked = String(this.failureSmokeAllInputBlocked);
      this.game.canvas.dataset.failureSmokeAllActorsSuspended = String(this.failureSmokeAllActorsSuspended);
      return;
    }

    const bossActor = this.bossActor;
    if (!bossActor) return;
    this.playerLifecycle.applyDamage(PLAYER_MAX_HP - 1);
    this.game.canvas.dataset.playerHp = String(this.playerHp);
    this.playerBody.reset(bossActor.bodyZone.x - 145, bossActor.bodyZone.y);
    this.syncVisualsToBody();
    this.failureSmokeTimer = this.time.delayedCall(20, () => {
      this.failureSmokeTimer = undefined;
      if (this.gameFlow.state === "title") this.startGame("smoke");
    });
  }

  private prepareResultSmokeCycle() {
    if (!this.resultSmokeMode || this.resultSmokeCycleActive) return;
    const initialStateRestored = this.gameFlow.state === "title"
      && this.playerHp === PLAYER_MAX_HP
      && this.playerBodyZone.x === START_X
      && this.encounterSequence.nextEncounterIndex === 0
      && this.bossEntryState === "locked"
      && this.bossActor === undefined
      && !isCameraLocked(this.cameraLockState)
      && this.stageCompleteEventCount === 0
      && !this.resultController.isVisible;
    this.game.canvas.dataset.resultSmokeComplete = String(
      this.resultSmokeIteration === 10
      && this.resultReplayCount === 10
      && this.resultTotalEntryCount === 10
      && initialStateRestored,
    );
  }

  private restartStage() {
    this.scene.restart();
  }

  private createTitleOverlay(keyboard: Phaser.Input.Keyboard.KeyboardPlugin) {
    const shade = this.add.rectangle(VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, 0x07120d, 0.94)
      .setScrollFactor(0)
      .setInteractive();
    const title = this.add.text(VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2 - 48, "THREE KINGDOMS", {
      fontFamily: "Georgia, serif", fontSize: "62px", color: "#f6d56b",
      stroke: "#5b170d", strokeThickness: 7,
    }).setOrigin(0.5).setScrollFactor(0);
    const prompt = this.add.text(VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2 + 50, "PRESS ANY KEY / TAP TO START", {
      fontFamily: "Consolas, monospace", fontSize: "24px", color: "#ffffff",
    }).setOrigin(0.5).setScrollFactor(0);
    this.titleOverlay = this.add.container(0, 0, [shade, title, prompt]).setDepth(20000);
    shade.once("pointerdown", this.handleTitlePointerStart, this);
    keyboard.once("keydown", this.handleTitleKeyboardStart, this);
    this.updateTitleDataset();
  }

  private startGame(source: TitleStartSource) {
    if (!this.titleStartController.requestStart()) return;
    this.titleStartCount += 1;
    this.input.keyboard?.off("keydown", this.handleTitleKeyboardStart, this);
    this.titleOverlay?.destroy(true);
    this.titleOverlay = undefined;
    this.pauseController.consumeToggleRequest();
    this.pauseController.setFlowState(this.gameFlow.state);
    this.inputController.readSnapshot();
    this.currentInput = createActionSnapshot({ up: false, down: false, left: false, right: false });
    this.updateTitleDataset(source);
    this.updatePauseDataset();
    this.updateHud();
  }

  private updateTitleDataset(source?: TitleStartSource) {
    if (process.env.NODE_ENV === "production") return;
    this.game.canvas.dataset.gameFlowState = this.gameFlow.state;
    this.game.canvas.dataset.titleVisible = String(this.gameFlow.state === "title");
    this.game.canvas.dataset.titleStartCount = String(this.titleStartCount);
    if (source) this.game.canvas.dataset.titleStartSource = source;
  }

  private updatePauseDataset() {
    if (process.env.NODE_ENV === "production" || !this.pauseController) return;
    const dataset = this.game.canvas.dataset;
    dataset.pauseOverlayVisible = String(this.gameFlow.state === "paused");
    dataset.pauseManualClock = String(this.lifecycleClock.isManualPaused());
    dataset.pauseHitStopActive = String(this.effectDirector.isHitStopActive());
    dataset.pauseCount = String(this.pauseCount);
    dataset.resumeCount = String(this.resumeCount);
    dataset.pauseObjectCount = "5";
    dataset.pausePlayerX = String(Math.round(this.playerBodyZone.x));
    dataset.pausePlayerY = String(Math.round(this.playerBodyZone.y));
    dataset.pausePlayerVelocityX = String(Math.round(this.playerBody.velocity.x));
    dataset.pausePlayerVelocityY = String(Math.round(this.playerBody.velocity.y));
    dataset.pauseAttackHitboxEnabled = String(this.attackBody.enable);
    dataset.pauseCameraScrollX = String(Math.round(this.cameras.main.scrollX));
    dataset.pauseAnimation = this.playerSprite.anims.currentAnim?.key ?? "idle";
    dataset.pauseAnimationFrame = String(this.playerSprite.anims.currentFrame?.index ?? 0);
    dataset.pauseSceneTime = String(Math.round(this.time.now));
  }

  private updateFailureDataset() {
    const development = (import.meta as ImportMeta & { env: { DEV: boolean } }).env.DEV;
    if (!development || !this.failureController) return;
    const dataset = this.game.canvas.dataset;
    dataset.failureOverlayVisible = String(this.failureController.isVisible);
    dataset.failureObjectCount = "3";
  }

  private updateResultDataset() {
    const development = (import.meta as ImportMeta & { env: { DEV: boolean } }).env.DEV;
    if (!development || !this.resultController) return;
    const dataset = this.game.canvas.dataset;
    dataset.resultOverlayVisible = String(this.resultController.isVisible);
    dataset.resultObjectCount = "4";
  }

  private updateBossEntrySmoke() {
    if (!this.bossEntrySmokeMode || this.bossEntryState !== "eligible") return;
    const trigger = BAMBOO_BOSS_ARENA.entryTrigger;
    const y = trigger.y + trigger.height / 2;
    this.previousBossEntryPosition = { x: trigger.x - 1, y };
    this.playerBody.reset(trigger.x + 1, y);
  }

  private updateBossEntryProgress() {
    const current = { x: this.playerBodyZone.x, y: this.playerBodyZone.y };
    const nextState = triggerBossEntry(
      this.bossEntryState,
      BAMBOO_BOSS_ARENA.entryTrigger,
      this.previousBossEntryPosition,
      current,
    );
    this.previousBossEntryPosition = current;
    if (!nextState) return;
    this.bossEntryState = nextState;
    this.defeatedText?.destroy();
    this.defeatedText = undefined;
    const development = process.env.NODE_ENV !== "production";
    this.createBossActor(development);
    this.activateBossArena(development);
    this.updateBossEntryDataset(development);
  }

  private constrainPlayerToBossArena() {
    if (this.bossEntryState !== "active" || !hasCameraLock(this.cameraLockState, "boss")) return;
    const bounds = BAMBOO_BOSS_ARENA.bounds;
    const x = Phaser.Math.Clamp(this.playerBodyZone.x, bounds.x, bounds.x + bounds.width);
    const y = Phaser.Math.Clamp(this.playerBodyZone.y, bounds.y, bounds.y + bounds.height);
    if (x !== this.playerBodyZone.x || y !== this.playerBodyZone.y) this.playerBody.reset(x, y);
  }

  private createBossActor(development: boolean) {
    if (this.bossActor) return;
    this.bossActor = new BossActor(
      this,
      BAMBOO_BOSS_ARENA.spawn.x,
      BAMBOO_BOSS_ARENA.spawn.y,
      new PhaserGameplayClock(this),
      new SeededRandom(0xb0555),
      {
        onCleaned: reason => this.handleBossCleaned(reason, development),
      },
    );
    if (development) this.game.canvas.dataset.bossActorCount = "1";
    this.updateBossMovementDataset();
    this.updateBossSmokeDataset();
  }

  private updateBossMovementSmoke() {
    const bossActor = this.bossActor;
    if (!this.bossMovementSmokeMode || !bossActor) return;
    const bounds = BAMBOO_BOSS_ARENA.bounds;
    if (this.bossMovementSmokeStep === 0) {
      this.playerBody.reset(bounds.x + 120, bounds.y + 60);
      this.bossMovementSmokeStep = 1;
      this.bossMovementSmokeStepStartedAt = this.time.now;
      return;
    }
    if (this.bossMovementSmokeStep === 1 && this.time.now - this.bossMovementSmokeStepStartedAt >= 2200) {
      this.game.canvas.dataset.bossMovementSmokeLeft = `${bossActor.bodyZone.x.toFixed(1)},${bossActor.bodyZone.y.toFixed(1)},${bossActor.facing}`;
      this.playerBody.reset(bounds.x + bounds.width - 90, bounds.y + bounds.height - 15);
      this.bossMovementSmokeStep = 2;
      this.bossMovementSmokeStepStartedAt = this.time.now;
      return;
    }
    if (this.bossMovementSmokeStep === 2 && this.time.now - this.bossMovementSmokeStepStartedAt >= 1800) {
      this.game.canvas.dataset.bossMovementSmokeRight = `${bossActor.bodyZone.x.toFixed(1)},${bossActor.bodyZone.y.toFixed(1)},${bossActor.facing}`;
      this.game.canvas.dataset.bossMovementSmokeComplete = "true";
      this.bossMovementSmokeStep = 3;
    }
  }

  private handleBossCleaned(reason: "defeated" | "destroyed", development: boolean) {
    this.bossActor = undefined;
    this.updateHud();
    if (development) {
      this.game.canvas.dataset.bossActorCount = "0";
      this.game.canvas.dataset.bossCleanupReason = reason;
      this.game.canvas.dataset.bossCleanupFlowState = this.gameFlow.state;
    }
    this.releaseBossArena(development);
    if (reason !== "defeated" || this.gameFlow.state !== "playing") return;
    if (!this.publishStageComplete(development)) return;
    this.enterClearedState(development);
  }

  private updateBossCombatSmoke() {
    const bossActor = this.bossActor;
    if (!this.bossCombatSmokeMode || !bossActor) return;
    const bounds = BAMBOO_BOSS_ARENA.bounds;
    if (this.bossCombatSmokeStep === 0) {
      this.playerBody.reset(bossActor.bodyZone.x - 145, bounds.y + 48);
      this.game.canvas.dataset.bossCombatSmokeAlignmentGate = "pending";
      this.bossCombatSmokeStep = 1;
      return;
    }
    if (this.bossCombatSmokeStep === 1
      && Math.abs(this.playerBodyZone.y - bossActor.bodyZone.y) > 30
      && bossActor.attackStartCount === 0) {
      this.game.canvas.dataset.bossCombatSmokeAlignmentGate = "passed";
      this.bossCombatSmokeStep = 2;
    }
    if (this.bossCombatSmokeStep === 2
      && bossActor.playerHitCount >= 9
      && bossActor.attackStartCount >= 10
      && bossActor.state === "attack") {
      this.playerBody.reset(this.playerBodyZone.x, bounds.y + bounds.height - 10);
      this.bossCombatSmokeStep = 3;
    }
    if (this.bossCombatSmokeStep === 3 && bossActor.attackCompleteCount >= 10) {
      this.game.canvas.dataset.bossCombatSmokeComplete = String(
        bossActor.playerHitCount === 9 && this.playerHp === 1,
      );
      bossActor.body.setVelocity(0, 0);
      this.bossCombatSmokeStep = 4;
    }
  }

  private resolveBossAttackHit() {
    const bossActor = this.bossActor;
    if (!bossActor || this.state === "hurt" || this.state === "dead") return;
    if (!bossActor.attackBody.enable || !this.physics.overlap(bossActor.attackZone, this.playerBodyZone)) return;
    if (bossActor.tryConsumePlayerHit(this.playerBodyZone.y)) {
      this.applyHitToPlayer(bossActor.targetId, bossActor.facing, "boss");
    }
  }

  private updateBossMovementDataset() {
    if (process.env.NODE_ENV === "production") return;
    const bossActor = this.bossActor;
    if (!bossActor) return;
    this.game.canvas.dataset.bossWorldX = bossActor.bodyZone.x.toFixed(1);
    this.game.canvas.dataset.bossWorldY = bossActor.bodyZone.y.toFixed(1);
    this.game.canvas.dataset.bossHp = String(bossActor.hp);
    this.game.canvas.dataset.bossState = bossActor.state;
    this.game.canvas.dataset.bossVelocityX = bossActor.body.velocity.x.toFixed(1);
    this.game.canvas.dataset.bossVelocityY = bossActor.body.velocity.y.toFixed(1);
    this.game.canvas.dataset.bossFacing = String(bossActor.facing);
    this.game.canvas.dataset.bossAttackEligible = String(bossActor.attackEligible);
    this.game.canvas.dataset.bossAnimation = bossActor.sprite.anims.currentAnim?.key ?? "";
    this.game.canvas.dataset.bossAttackHitboxEnabled = String(bossActor.isAttackHitboxEnabled);
    this.game.canvas.dataset.bossAttackStartCount = String(bossActor.attackStartCount);
    this.game.canvas.dataset.bossAttackCompleteCount = String(bossActor.attackCompleteCount);
    this.game.canvas.dataset.bossPlayerHitCount = String(bossActor.playerHitCount);
  }

  private activateBossArena(development: boolean) {
    this.cameraLockState = lockCamera(this.cameraLockState, "boss");
    this.cameras.main.setScroll(BAMBOO_BOSS_ARENA.cameraScroll.x, BAMBOO_BOSS_ARENA.cameraScroll.y);
    this.cameraHandoff = { active: false, x: BAMBOO_BOSS_ARENA.cameraScroll.x, y: BAMBOO_BOSS_ARENA.cameraScroll.y };
    if (development) {
      const { x, y, width, height } = BAMBOO_BOSS_ARENA.bounds;
      this.bossArenaDebug = this.add.graphics().lineStyle(2, 0x38d9ff, 0.9)
        .strokeRect(x, y, width, height).setDepth(9999);
    }
    this.updateBossArenaDataset(development);
  }

  private releaseBossArena(development: boolean) {
    if (!hasCameraLock(this.cameraLockState, "boss")) return;
    this.cameraLockState = unlockCamera(this.cameraLockState, "boss");
    this.bossArenaReleaseCount += 1;
    this.bossArenaDebug?.destroy();
    this.bossArenaDebug = undefined;
    this.updateBossArenaDataset(development);
  }

  private updateBossArenaDataset(development: boolean) {
    if (!development) return;
    this.game.canvas.dataset.bossArenaLocked = String(hasCameraLock(this.cameraLockState, "boss"));
    this.game.canvas.dataset.bossArenaReleaseCount = String(this.bossArenaReleaseCount);
    this.game.canvas.dataset.cameraLockReasons = this.cameraLockState.reasons.join(",");
  }

  private updateBossEntryDataset(development: boolean) {
    if (!development) return;
    this.game.canvas.dataset.bossEntryState = this.bossEntryState;
    this.game.canvas.dataset.bossEntryEligible = String(this.bossEntryState === "eligible");
  }

  private publishStageComplete(development: boolean) {
    const event = this.stageCompletion.complete(BAMBOO_COMBAT_ROOM.id, this.time.now);
    if (!event) return false;
    this.gameplayEvents.publish(event);
    this.stageCompleteEventCount += 1;
    if (development) {
      this.game.canvas.dataset.stageCompleteCount = String(this.stageCompleteEventCount);
      this.game.canvas.dataset.stageCompleteStageId = event.stageId;
      this.game.canvas.dataset.stageCompleteAfterArenaRelease = String(!hasCameraLock(this.cameraLockState, "boss"));
    }
    return true;
  }

  private enterClearedState(development: boolean) {
    if (this.gameFlow.state !== "playing") return false;
    if (!this.gameFlow.transition("cleared")) return false;
    this.pauseController.setFlowState(this.gameFlow.state);
    this.clearedEntryCount += 1;
    this.resultTotalEntryCount += 1;
    this.playerBody.stop();
    this.disableAttackHitbox();
    this.enemyManager.suspendCombat();
    this.bossActor?.suspendCombat();
    this.resultController.show();
    this.updateResultDataset();
    this.currentInput = createActionSnapshot({ up: false, down: false, left: false, right: false });
    this.updateTitleDataset();
    this.updatePauseDataset();
    if (development) {
      const inputBlocked = this.playerBody.velocity.x === 0 && this.playerBody.velocity.y === 0 && !this.attackBody.enable;
      const actorsSuspended = this.enemyManager.isCombatSuspended && this.bossActor === undefined;
      this.game.canvas.dataset.clearedEntryCount = String(this.clearedEntryCount);
      this.game.canvas.dataset.resultEntryCount = String(this.clearedEntryCount);
      this.game.canvas.dataset.resultTotalEntryCount = String(this.resultTotalEntryCount);
      this.game.canvas.dataset.clearedInputBlocked = String(inputBlocked);
      this.game.canvas.dataset.clearedActorsSuspended = String(actorsSuspended);
      this.game.canvas.dataset.clearedAfterArenaRelease = String(!hasCameraLock(this.cameraLockState, "boss"));
      this.game.canvas.dataset.clearedAfterStageComplete = String(this.stageCompleteEventCount === 1);
      if (this.bossClearedSmokeMode) {
        this.game.canvas.dataset.bossClearedSmokeComplete = String(
          this.clearedEntryCount === 1
          && this.stageCompleteEventCount === 1
          && !hasCameraLock(this.cameraLockState, "boss")
          && this.bossActor === undefined
          && inputBlocked
          && actorsSuspended,
        );
      }
    }
    if (this.resultSmokeCycleActive) {
      this.resultSmokeIteration += 1;
      this.resultSmokeTimer?.remove(false);
      this.resultSmokeTimer = this.time.delayedCall(RESULT_SMOKE_REPLAY_MS, () => {
        this.resultSmokeTimer = undefined;
        this.replayAfterClear("smoke");
      });
    }
    return true;
  }

  private scheduleBossSmokeHit() {
    if (this.resultSmokeCycleActive) {
      this.scheduleBossSmokeDamage(RESULT_SMOKE_BOSS_HIT_MS);
      return;
    }
    this.bossSmokeTimer = this.time.delayedCall(700, () => this.applyBossSmokeDamage());
  }

  private scheduleBossSmokeDamage(delay: number) {
    this.bossSmokeTimer = this.time.delayedCall(delay, () => this.applyBossSmokeDamage());
  }

  private applyBossSmokeDamage() {
    this.bossSmokeTimer = undefined;
    const bossActor = this.bossActor;
    if (!this.scene.isActive() || !bossActor || bossActor.state === "dead" || bossActor.state === "cleaned") return;
    if (bossActor.isDamageable) bossActor.damage(1);
    this.updateBossSmokeDataset();
    if (bossActor.hp > 0) this.scheduleBossSmokeHit();
  }

  private updateBossSmokeDataset() {
    const bossActor = this.bossActor;
    if (!this.bossSmokeMode || !bossActor) return;
    const snapshot = `${bossActor.state}:${bossActor.hp}:p${bossActor.phase}`;
    if (this.bossSmokeLog[this.bossSmokeLog.length - 1] !== snapshot) this.bossSmokeLog.push(snapshot);
    this.game.canvas.dataset.bossSmokeState = snapshot;
    this.game.canvas.dataset.bossSmokeLog = this.bossSmokeLog.join(",");
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
    guide.lineStyle(2, 0xff3b30, 1).lineBetween(100, groundY, VIEWPORT_WIDTH - 100, groundY);
    guide.fillStyle(0x00ffff, 1).fillCircle(VIEWPORT_WIDTH / 2, groundY, 5);
    this.enemyPreviewSprite = this.add.sprite(VIEWPORT_WIDTH / 2, groundY, "enemy-soldier", ENEMY_PREVIEW_FRAMES[0])
      .setOrigin(0.5, ENEMY_FEET_Y / ENEMY_FRAME_SIZE)
      .setScale(SOLDIER_ENEMY_CONFIG.displayScale);
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
      .setScale(SOLDIER_ENEMY_CONFIG.displayScale)
      .setPosition(VIEWPORT_WIDTH / 2, 580);
    this.enemyPreviewText!.setText([
      "ENEMY FEET ALIGNMENT PREVIEW",
      `frame: ${this.enemyPreviewIndex} / ${ENEMY_PREVIEW_FRAMES.length - 1}`,
      `name: ${name}`,
      `source: ${frame.cutX}, ${frame.cutY}, ${frame.cutWidth}, ${frame.cutHeight}`,
      `origin: 0.5, ${(ENEMY_FEET_Y / ENEMY_FRAME_SIZE).toFixed(6)}`,
      `feet anchor: ${ENEMY_FRAME_SIZE / 2}, ${ENEMY_FEET_Y}`,
      `display scale: ${SOLDIER_ENEMY_CONFIG.displayScale}`,
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
    this.onionSprite = this.add.sprite(VIEWPORT_WIDTH / 2, 600, "guanyu-attack", "attack-0").setAlpha(0.32).setTint(0x69cfff).setScale(0.64).setVisible(false);
    this.previewSprite = this.add.sprite(VIEWPORT_WIDTH / 2, 600, "guanyu-attack", "attack-0").setScale(0.64);
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
    this.previewSprite!.setTexture("guanyu-attack", current.name).setOrigin(0.5, current.originY).setPosition(VIEWPORT_WIDTH / 2, 600);
    const previous = PREVIEW_FRAMES[Phaser.Math.Wrap(this.previewIndex - 1, 0, PREVIEW_FRAMES.length)];
    this.onionSprite!.setTexture("guanyu-attack", previous.name).setOrigin(0.5, previous.originY).setPosition(VIEWPORT_WIDTH / 2, 600).setVisible(this.onionEnabled);
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
  private positionAttackHitbox() { const x = Math.round(this.playerBodyZone.x + this.facing * 104), y = Math.round(this.playerBodyZone.y - 48); this.attackZone.setPosition(x, y); this.attackBody.reset(x, y); }
  private enableAttackHitbox() { this.attackZone.setActive(true); this.attackBody.enable = true; this.positionAttackHitbox(); }
  private disableAttackHitbox() { if (!this.attackBody) return; this.attackBody.stop(); this.attackBody.enable = false; this.attackZone.setActive(false); }

  private updateDebugText() {
    this.updateHud();
    this.updateEncounterDataset();
    this.updatePauseDataset();
    if (!this.debugText) return;
    const v = this.playerBody.velocity, i = this.currentInput;
    const enemies = this.enemyManager.getAllEnemies();
    const lines = [
      `Alive Enemy Count: ${this.enemyManager.getLivingEnemies().length}`,
      `Current Attacker ID: ${this.enemyManager.currentAttackerId ?? "none"}`,
      `Player State: ${this.state}`,
      `Player HP: ${this.playerHp}`,
      `Boss State: ${this.bossActor ? `${this.bossActor.state} HP:${this.bossActor.hp} Phase:${this.bossActor.phase} X:${this.bossActor.bodyZone.x.toFixed(0)} Y:${this.bossActor.bodyZone.y.toFixed(0)} VX:${this.bossActor.body.velocity.x.toFixed(0)} VY:${this.bossActor.body.velocity.y.toFixed(0)} Face:${this.bossActor.facing}` : "inactive"}`,
      `Boss Arena: ${hasCameraLock(this.cameraLockState, "boss") ? "locked" : "released"}`,
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

  private updateEncounterDataset() {
    if (process.env.NODE_ENV === "production") return;
    const enemies = this.enemyManager?.getAllEnemies() ?? [];
    this.game.canvas.dataset.playerState = this.state;
    this.game.canvas.dataset.playerWorldY = String(Math.round(this.playerBodyZone.y));
    this.game.canvas.dataset.playerHitCount = String(this.hitCount);
    this.game.canvas.dataset.enemyStates = enemies.map(enemy => [
      enemy.id,
      enemy.state,
      enemy.hp,
      Math.round(enemy.bodyZone.x - this.playerBodyZone.x),
      Math.round(enemy.bodyZone.y - this.playerBodyZone.y),
    ].join(":")).join(",");
    this.game.canvas.dataset.encounterNextIndex = String(this.encounterSequence.nextEncounterIndex);
    this.game.canvas.dataset.encounterActiveId = this.encounterSequence.activeEncounterId ?? "";
    this.game.canvas.dataset.encounterClearedIds = this.encounterSequence.clearedEncounterIds.join(",");
    this.game.canvas.dataset.encounterEnemyCount = String(enemies.length);
    this.game.canvas.dataset.encounterCameraLocked = String(hasCameraLock(this.cameraLockState, "encounter"));
    this.game.canvas.dataset.cameraLockReasons = this.cameraLockState.reasons.join(",");
  }

  private publishGameplaySnapshot() {
    if (!this.enemyManager || !this.playerBodyZone || !this.lifecycleClock) return;
    const snapshot: GameplaySnapshot = {
      flow: this.gameFlow.state,
      player: { state: this.state, hp: this.playerHp, maxHp: PLAYER_MAX_HP, x: this.playerBodyZone.x, y: this.playerBodyZone.y },
      enemies: this.enemyManager.getAllEnemies().map(enemy => ({
        id: enemy.id, state: enemy.state, hp: enemy.hp, x: enemy.bodyZone.x, y: enemy.bodyZone.y,
      })),
      boss: this.bossActor ? {
        state: this.bossActor.state,
        hp: this.bossActor.hp,
        maxHp: BOSS_ACTOR_CONFIG.maxHp,
      } : null,
      lifecycle: { paused: this.lifecycleClock.isPaused(), visibilityPaused: this.lifecycleClock.isVisibilityPaused() },
    };
    this.gameplayEvents.publishSnapshot(snapshot);
    const paused = snapshot.lifecycle.paused;
    if (paused !== this.lastLifecyclePaused) {
      this.lastLifecyclePaused = paused;
      this.gameplayEvents.publish({ type: "lifecycle-changed", paused, at: this.time.now });
    }
  }

  private updateHud() {
    this.publishGameplaySnapshot();
    this.hud.update();
  }
}
