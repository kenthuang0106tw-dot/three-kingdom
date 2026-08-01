import * as Phaser from "phaser";
import { EnemyCombatant, EnemyManager } from "./EnemyManager";
import { createActionSnapshot, type ActionSnapshot } from "./input/ActionSnapshot";
import { TouchInputController } from "./input/TouchInputController";
import { LifecycleClock } from "./time/LifecycleClock";
import { PhaserGameplayClock, SeededRandom } from "./time/GameplayTime";
import { GameplayEventHub, type GameplaySnapshot } from "./events/GameplayEvents";
import { StageCompletionGate } from "./events/StageCompletion";
import { createAssetFailureReporter, queueRuntimeAssets, resolveRuntimeAssetUrl } from "./assets/AssetManifest";
import { PlayerStateMachine, type PlayerState } from "./player/PlayerStateMachine";
import { PlayerLifecycle } from "./player/PlayerLifecycle";
import { PlayerActor } from "./player/PlayerActor";
import { PlayerAttackController } from "./player/PlayerAttackController";
import { GUANYU_ANIMATION_FRAMES, GUANYU_ATTACK_PHASES, GUANYU_PLAYER_DEFINITION } from "./player/GuanYuAnimationMetadata.ts";
import { ZHANGFEI_PLAYER_DEFINITION } from "./player/ZhangFeiAnimationMetadata.ts";
import type { AttackStep, PlayerAnimationDefinition, PlayerDefinition } from "./player/PlayerDefinition.ts";
import { getPlayerDefinition, isPlayerId, type PlayerId } from "./player/PlayerSelection.ts";
import { resolveAttack } from "./combat/CombatResolver";
import { EffectDirector, EFFECT_PARAMS } from "./combat/EffectDirector";
import { BAMBOO_BOSS_ARENA, BAMBOO_COMBAT_ROOM, clampStageX } from "./stage/StageConfig";
import { advanceCameraHandoff, beginCameraHandoff, calculateCameraScroll, type CameraHandoffState } from "./camera/CameraFollow";
import { createCameraLockState, hasCameraLock, isCameraLocked, lockCamera, unlockCamera, type CameraLockState } from "./camera/CameraLock";
import { createStageExitState, makeExitAvailable, resetStageExit, type StageExitState } from "./stage/StageExit";
import { clearActiveEncounter, createBossEntryState, createEncounterSequence, isEncounterSequenceCleared, makeBossEntryEligible, triggerBossEntry, triggerNextEncounter, type BossEntryState, type EncounterSequenceState } from "./stage/EncounterFlow";
import { CROSSBOW_ENEMY_CONFIG, CROSSBOW_EXTRA_ANIMATIONS, DUELIST_ENEMY_CONFIG, MAULER_ENEMY_CONFIG, SHIELD_GUARD_ENEMY_CONFIG, SHIELD_GUARD_EXTRA_ANIMATIONS, SOLDIER_ENEMY_CONFIG, crossbowAnimationKey, enemyAnimationKey, shieldGuardAnimationKey } from "./enemy/EnemyConfig";
import { duelistLeapAnimationKey, type DuelistLeapPhase } from "./enemy/DuelistLeap";
import { BOSS_ACTOR_CONFIG, BossActor } from "./boss/BossActor";
import { GameFlowStateMachine } from "./flow/GameFlowStateMachine";
import { TitleStartController } from "./flow/TitleStartController";
import { GameHud } from "./ui/GameHud";
import { PauseController } from "./ui/PauseController";
import { FailureController, type FailureRestartSource as ExplicitFailureRestartSource } from "./ui/FailureController";
import { ResultController, type ResultReplaySource as ExplicitResultReplaySource } from "./ui/ResultController";
import { addButtonFrame, addModalFrame, addUiText, UI_COLORS } from "./ui/UiArt";
import { AudioManager, type AudioContextBackend, type AudioSoundBackend, type AudioTrackBackend } from "./audio/AudioManager";
import { PERFORMANCE_SAMPLE_CONFIG, PerformanceSampler } from "./debug/PerformanceSampler";
import { AccessibilitySettings } from "./accessibility/AccessibilitySettings";

type AttackState = "attack1" | "attack2" | "attack3";
type TitleStartSource = "keyboard" | "pointer" | "smoke";
type FailureRestartSource = ExplicitFailureRestartSource | "smoke";
type ResultReplaySource = ExplicitResultReplaySource | "smoke";
type PlayerPrototypeScenario = "entry" | "ambush" | "boss";
type PlayerPrototypeStrategy = "baseline" | "aware";
type PrototypeAttackPhase = "idle" | "startup" | "active" | "recovery";
type MainSceneInitData = { playerId?: PlayerId; autoStartSource?: TitleStartSource };
const PROTOTYPE_NEARBY_THREAT_RADIUS = 230;
const PROTOTYPE_REPOSITION_WINDOW_MS = 1000;
const PROTOTYPE_REPOSITION_DISTANCE = 64;
type PrototypeTrialMetrics = {
  attacksStarted: [number, number, number];
  attacksHit: [number, number, number];
  attacksMissed: [number, number, number];
  attacksBlocked: [number, number, number];
  attacksInterrupted: [number, number, number];
  voluntaryStopsAfterAttack1: number;
  voluntaryStopsAfterAttack2: number;
  recoveryHitsReceived: number;
  multiTargetHits: number;
  confirmedAttacks: number;
  displacedTargets: number;
  commitmentMs: number;
  bossAttack3Hits: number;
  groupedAttack2Confirms: number;
  repositionAfterAttack2: number;
  isolatedAttack3Starts: number;
  unsafeAttack3Starts: number;
};
type PreviewFrame = {
  name: string; x: number; y: number; width: number; height: number;
  originY: number; offsetX: number; offsetY: number; classification: string;
};
type ZhangFeiPreviewFrame = {
  name: string; animation: string; animationFrame: number; phase: string;
  sourceRect: { x: number; y: number; width: number; height: number };
  alphaBounds: { x: number; y: number; width: number; height: number };
  displayOffset: { x: number; y: number };
  feetAnchor: { x: number; y: number };
  origin: { x: number; y: number };
  displayScale: number; pixelHash: string;
};
type ZhangFeiPreviewMetadata = { frames: ZhangFeiPreviewFrame[] };

const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 720;
const START_X = BAMBOO_COMBAT_ROOM.playerSpawn.x;
const START_FOOT_Y = BAMBOO_COMBAT_ROOM.playerSpawn.y;
const ENEMY_FRAME_SIZE = 384;
const ENEMY_FEET_Y = 354;
const COMBO_WINDOW_MS = 360;
const FAILURE_SMOKE_RESTART_MS = 500;
const RESULT_SMOKE_REPLAY_MS = 500;
const RESULT_SMOKE_BOSS_HIT_MS = 35;
const ATTACK_STATES: AttackState[] = ["attack1", "attack2", "attack3"];
const GUANYU_ATTACK_FRAME_OFFSET = GUANYU_ANIMATION_FRAMES.idle.length + GUANYU_ANIMATION_FRAMES.walk.length;
const PREVIEW_FRAMES: PreviewFrame[] = (["attack1", "attack2", "attack3"] as const).flatMap(animation =>
  GUANYU_ANIMATION_FRAMES[animation].map((name, localIndex) => {
    const previousCount = animation === "attack1" ? 0 : animation === "attack2"
      ? GUANYU_ANIMATION_FRAMES.attack1.length
      : GUANYU_ANIMATION_FRAMES.attack1.length + GUANYU_ANIMATION_FRAMES.attack2.length;
    const atlasIndex = GUANYU_ATTACK_FRAME_OFFSET + previousCount + localIndex;
    const { cellWidth, cellHeight, columns } = GUANYU_PLAYER_DEFINITION.atlas;
    return {
      name,
      x: (atlasIndex % columns) * cellWidth,
      y: Math.floor(atlasIndex / columns) * cellHeight,
      width: cellWidth,
      height: cellHeight,
      originY: GUANYU_PLAYER_DEFINITION.presentation.originY,
      offsetX: 0,
      offsetY: 0,
      classification: `${animation} ${GUANYU_ATTACK_PHASES[animation][localIndex]}`,
    };
  }),
);
const ENEMY_PREVIEW_FRAMES = [
  "idle-0", "idle-1", "walk-0", "walk-1", "walk-2", "walk-3",
  "attack-0", "attack-1", "attack-2", "hurt-0", "hurt-1",
  "dead-0", "dead-1", "dead-2", "dead-3",
];
const MAULER_PREVIEW_FRAMES = [
  "idle-0", "idle-1", "walk-0", "walk-1", "walk-2", "walk-3",
  "attack-0", "attack-1", "attack-2", "attack-3", "attack-4",
  "hurt-0", "hurt-1", "dead-0", "dead-1", "dead-2", "dead-3",
];
const CAST_PREVIEW_ACTORS = [
  { id: "soldier", texture: "enemy-soldier", scale: SOLDIER_ENEMY_CONFIG.displayScale, frameSize: 384, feetY: 354, frames: ENEMY_PREVIEW_FRAMES },
  { id: "mauler", texture: "enemy-mauler", scale: MAULER_ENEMY_CONFIG.displayScale, frameSize: MAULER_ENEMY_CONFIG.frameSize, feetY: MAULER_ENEMY_CONFIG.feetY, frames: MAULER_PREVIEW_FRAMES },
  { id: "duelist", texture: "enemy-duelist", scale: DUELIST_ENEMY_CONFIG.displayScale, frameSize: DUELIST_ENEMY_CONFIG.frameSize, feetY: DUELIST_ENEMY_CONFIG.feetY, frames: ENEMY_PREVIEW_FRAMES },
  {
    id: "boss", texture: "boss-warlord-lifecycle", scale: BOSS_ACTOR_CONFIG.displayScale, frameSize: 448, feetY: 420,
    frames: [
      "idle-0", "idle-1", "walk-0", "walk-1", "walk-2", "walk-3",
      "attack1-startup", "attack1-active", "attack1-recovery",
      "attack2-startup", "attack2-active", "attack2-recovery",
      "attack3-startup", "attack3-active", "attack3-recovery",
      "hurt-0", "hurt-1", "phase-0", "phase-1", "phase-2", "dead-0", "dead-1", "dead-2", "dead-3",
    ],
  },
] as const;

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
  private playerDefinition: PlayerDefinition = GUANYU_PLAYER_DEFINITION;
  private playerActor!: PlayerActor;
  private attackZone!: Phaser.GameObjects.Zone;
  private get playerSprite() { return this.playerActor.sprite; }
  private get playerBodyZone() { return this.playerActor.bodyZone; }
  private get playerBody() { return this.playerActor.body; }
  private attackBody!: Phaser.Physics.Arcade.Body;
  private inputController!: PlayerInputController;
  private touchInputController!: TouchInputController;
  private lifecycleClock!: LifecycleClock;
  private audioManager!: AudioManager;
  private effectDirector!: EffectDirector;
  private readonly accessibilitySettings = new AccessibilitySettings();
  private readonly gameplayEvents = new GameplayEventHub();
  private lastLifecyclePaused = false;
  private pendingRestartAudioAction?: "retry" | "replay";
  private enemyManager!: EnemyManager;
  private bossActor?: BossActor;
  private readonly playerStateMachine = new PlayerStateMachine();
  private playerLifecycle = new PlayerLifecycle(this.playerDefinition.lifecycle.maxHp);
  private attackController = new PlayerAttackController(this.playerDefinition.attacks);
  private readonly gameFlow = new GameFlowStateMachine();
  private readonly titleStartController = new TitleStartController(this.gameFlow);
  private titleOverlay?: Phaser.GameObjects.Container;
  private titleSelectedPlayerId: PlayerId = "guanyu";
  private titleOptionFrames?: Record<PlayerId, Phaser.GameObjects.NineSlice>;
  private autoStartSource?: TitleStartSource;
  private hud!: GameHud;
  private pauseController!: PauseController;
  private failureController!: FailureController;
  private resultController!: ResultController;
  private titleStartCount = 0;
  private pauseCount = 0;
  private resumeCount = 0;
  private readonly handleTitleKeyboardStart = (event: KeyboardEvent) => {
    if (event.code === "ArrowLeft" || event.code === "KeyA") {
      this.selectTitlePlayer("guanyu");
      return;
    }
    if (event.code === "ArrowRight" || event.code === "KeyD") {
      this.selectTitlePlayer("zhangfei");
      return;
    }
    if (event.code === "Enter" || event.code === "Space" || event.code === "KeyJ") {
      this.confirmTitlePlayer("keyboard");
    }
  };
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
  private playerBlockedTargetIds: ReadonlySet<number> = new Set();
  private defeatedText?: Phaser.GameObjects.Container;
  private readonly transitionLog: string[] = [];
  private diagnosticMode = false;
  private visualFreezeMode = false;
  private visualFreezeWarmupFrames = 0;
  private readonly visualFreezeDeltas: number[] = [];
  private performanceProfileMode = false;
  private performanceCheckpoint = "unspecified";
  private performanceViewport = "desktop";
  private performanceProfileStarted = false;
  private performanceSampler?: PerformanceSampler;
  private previewMode = false;
  private zhangFeiPreviewMode = false;
  private playerPrototypeMode = false;
  private playerPrototypeScenario?: PlayerPrototypeScenario;
  private playerPrototypeStrategy?: PlayerPrototypeStrategy;
  private prototypeNextAttackInputAt = 0;
  private prototypeStopCurrentCombo = false;
  private prototypeTrialStartedAt = 0;
  private prototypeTrialComplete = false;
  private prototypeAttackPhase: PrototypeAttackPhase = "idle";
  private prototypeCurrentAttackHitRecorded = false;
  private prototypeCurrentAttackBlocked = false;
  private prototypeCurrentAttackInterrupted = false;
  private prototypeGroupedAttack2Current = false;
  private prototypeRepositionPending = false;
  private prototypeRepositionStartedAt = 0;
  private prototypeRepositionOrigin = { x: 0, y: 0 };
  private prototypeRepositionDirection: -1 | 1 = -1;
  private prototypeTrialMetrics: PrototypeTrialMetrics = this.createPrototypeTrialMetrics();
  private shieldGuardTestMode?: "A" | "B";
  private crossbowTestMode?: "A" | "B";
  private shieldCrossbowTestMode = false;
  private duelistLeapTestMode = false;
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
  private zhangFeiPreviewKeys?: Record<"left" | "right" | "statePrevious" | "stateNext" | "play" | "slower" | "faster" | "loop" | "onion", Phaser.Input.Keyboard.Key>;
  private previewIndex = 0;
  private previewFpsIndex = 3;
  private readonly previewSpeeds = [2, 4, 6, 8, 10];
  private previewPlaying = false;
  private previewLoop = false;
  private onionEnabled = false;
  private nextPreviewFrameAt = 0;
  private zhangFeiPreviewStateIndex = 0;
  private readonly zhangFeiPreviewStates = ["idle", "walk", "attack1", "attack2", "attack3", "hurt", "dead"];
  private enemyPreviewSprite?: Phaser.GameObjects.Sprite;
  private enemyPreviewText?: Phaser.GameObjects.Text;
  private enemyPreviewKeys?: Record<"left" | "right" | "up" | "down", Phaser.Input.Keyboard.Key>;
  private enemyPreviewIndex = 0;
  private enemyPreviewActorIndex = 0;
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

  private configurePlayer(id: PlayerId) {
    this.playerDefinition = getPlayerDefinition(id);
    this.playerLifecycle = new PlayerLifecycle(this.playerDefinition.lifecycle.maxHp);
    this.attackController = new PlayerAttackController(this.playerDefinition.attacks);
    this.titleSelectedPlayerId = id;
  }

  init(data: MainSceneInitData = {}) {
    if (data.playerId) this.configurePlayer(data.playerId);
    this.autoStartSource = data.autoStartSource;
  }

  preload() {
    queueRuntimeAssets(this.load);
    if (process.env.NODE_ENV !== "production") {
      const query = new URLSearchParams(window.location.search);
      const prototypePlayer = query.get("playerPrototype");
      if (isPlayerId(prototypePlayer)) this.configurePlayer(prototypePlayer);
      if (query.get("previewZhangFei") === "1") {
        this.load.atlas(
          "zhangfei-v2-preview",
          resolveRuntimeAssetUrl("/art/zhangfei-v2/zhangfei-v2.png"),
          resolveRuntimeAssetUrl("/art/zhangfei-v2/zhangfei-v2.atlas.json"),
        );
        this.load.json(
          "zhangfei-v2-preview-metadata",
          resolveRuntimeAssetUrl("/art/zhangfei-v2/zhangfei-v2.metadata.json"),
        );
      }
      const reportFailure = createAssetFailureReporter();
      this.assetFailureListener = (file: Phaser.Loader.File) => reportFailure(file.key);
      this.load.on("loaderror", this.assetFailureListener);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        if (this.assetFailureListener) this.load.off("loaderror", this.assetFailureListener);
        this.assetFailureListener = undefined;
      });
    }
    if (this.playerDefinition.id === "zhangfei" && !this.textures.exists(ZHANGFEI_PLAYER_DEFINITION.textureKey)) {
      this.load.atlas(
        ZHANGFEI_PLAYER_DEFINITION.textureKey,
        resolveRuntimeAssetUrl("/art/zhangfei-v2/zhangfei-v2.png"),
        resolveRuntimeAssetUrl("/art/zhangfei-v2/zhangfei-v2.atlas.json"),
      );
    }
  }

  create() {
    const development = process.env.NODE_ENV !== "production";
    const query = new URLSearchParams(window.location.search);
    this.titleSelectedPlayerId = isPlayerId(this.playerDefinition.id) ? this.playerDefinition.id : "guanyu";
    const localPrototypeHost = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
    this.enemyPreviewMode = development && query.get("previewEnemy") === "1";
    if (this.enemyPreviewMode) {
      const requestedActor = query.get("previewEnemyActor");
      const actorIndex = CAST_PREVIEW_ACTORS.findIndex(actor => actor.id === requestedActor);
      this.enemyPreviewActorIndex = actorIndex < 0 ? 0 : actorIndex;
      const requestedFrame = query.get("previewEnemyFrame");
      const frameIndex = CAST_PREVIEW_ACTORS[this.enemyPreviewActorIndex].frames.findIndex(frame => frame === requestedFrame);
      this.enemyPreviewIndex = frameIndex < 0 ? 0 : frameIndex;
    }
    this.previewMode = development && query.get("previewAttack") === "1";
    this.zhangFeiPreviewMode = development && query.get("previewZhangFei") === "1";
    const prototypeScenario = query.get("prototypeScenario");
    this.playerPrototypeMode = development
      && (query.get("playerPrototype") === "guanyu" || query.get("playerPrototype") === "zhangfei")
      && (prototypeScenario === "entry" || prototypeScenario === "ambush" || prototypeScenario === "boss");
    this.playerPrototypeScenario = this.playerPrototypeMode ? prototypeScenario as PlayerPrototypeScenario : undefined;
    const prototypeStrategy = query.get("prototypeStrategy");
    this.playerPrototypeStrategy = this.playerPrototypeMode
      && (prototypeStrategy === "baseline" || prototypeStrategy === "aware")
      ? prototypeStrategy
      : undefined;
    if (this.playerPrototypeMode) {
      this.game.canvas.tabIndex = 0;
      this.game.canvas.focus();
    }
    const shieldGuardTest = query.get("shieldGuardTest")?.toUpperCase();
    this.shieldGuardTestMode = development && (shieldGuardTest === "A" || shieldGuardTest === "B") ? shieldGuardTest : undefined;
    const crossbowTest = query.get("crossbowTest")?.toUpperCase();
    this.crossbowTestMode = development && (crossbowTest === "A" || crossbowTest === "B") ? crossbowTest : undefined;
    this.shieldCrossbowTestMode = development && query.get("shieldCrossbowTest") === "1";
    this.duelistLeapTestMode = (development || localPrototypeHost) && query.get("duelistLeapTest") === "1";
    this.visualFreezeMode = development && query.get("visualFreeze") === "1";
    this.visualFreezeWarmupFrames = 0;
    this.visualFreezeDeltas.length = 0;
    this.performanceProfileMode = development && query.get("performanceProfile") === "1";
    this.performanceCheckpoint = query.get("performanceCheckpoint") ?? "unspecified";
    this.performanceViewport = query.get("performanceViewport") ?? "desktop";
    this.performanceProfileStarted = false;
    this.performanceSampler = this.performanceProfileMode ? new PerformanceSampler() : undefined;
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
      this.game.canvas.dataset.playerDefinitionId = this.playerDefinition.id;
      this.game.canvas.dataset.playerPrototypeMode = String(this.playerPrototypeMode);
      this.game.canvas.dataset.playerPrototypeScenario = this.playerPrototypeScenario ?? "";
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
    this.resetComboState();
    this.resetPrototypeTrialMetrics();
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
    if (this.zhangFeiPreviewMode) { this.createZhangFeiPreviewMode(); return; }
    if (this.enemyPreviewMode) { this.createEnemyAlignmentPreview(); return; }
    if (this.previewMode) { this.createPreviewMode(); return; }

    this.lifecycleClock = new LifecycleClock(this);
    const audioContext = "context" in this.sound
      ? (this.sound.context as unknown as AudioContextBackend)
      : undefined;
    this.audioManager = new AudioManager(
      this.sound as unknown as AudioSoundBackend,
      this.game.events,
      this.gameplayEvents,
      (key, config) => this.sound.add(key, config) as unknown as AudioTrackBackend,
      audioContext,
    );
    this.audioManager.start();
    const pendingRestartAudioAction = this.pendingRestartAudioAction;
    this.pendingRestartAudioAction = undefined;
    if (pendingRestartAudioAction) {
      this.gameplayEvents.publish({ type: "ui-action", action: pendingRestartAudioAction, at: this.time.now });
    }
    this.lastLifecyclePaused = false;
    this.effectDirector = new EffectDirector(
      this,
      this.lifecycleClock,
      () => this.accessibilitySettings.getSnapshot(),
    );
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
      for (const layer of section.layers) {
        this.add.image(
          section.bounds.x + section.bounds.width / 2,
          section.bounds.y + section.bounds.height / 2,
          layer.textureKey,
        ).setDisplaySize(section.bounds.width, section.bounds.height).setDepth(layer.depth);
      }
    }

    this.playerActor = new PlayerActor(this, START_X, START_FOOT_Y, this.playerDefinition);
    this.showIdleFrame();

    const attackHitbox = this.playerDefinition.attackHitbox;
    this.attackZone = this.add.zone(
      START_X,
      START_FOOT_Y + attackHitbox.offsetY,
      attackHitbox.width,
      attackHitbox.height,
    ).setOrigin(0.5);
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
      onCrossbowLocked: enemy => this.gameplayEvents.publish({ type: "crossbow-locked", enemyId: enemy.id, at: this.time.now }),
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
      this.game.canvas.dataset.stageLayerCount = String(BAMBOO_COMBAT_ROOM.backgroundSections.flatMap(section => section.layers).length);
      if (this.visualFreezeMode) {
        this.game.canvas.dataset.visualFreezeComplete = "false";
        this.game.canvas.dataset.visualFreezeTextureCount = String(
          this.textures.getTextureKeys().filter(key => !key.startsWith("__")).length,
        );
      }
      if (this.performanceProfileMode) {
        this.game.canvas.dataset.performanceProfileComplete = "false";
        this.game.canvas.dataset.performanceProfileCheckpoint = this.performanceCheckpoint;
        this.game.canvas.dataset.performanceProfileViewport = this.performanceViewport;
        this.game.canvas.dataset.performanceProfileWarmupFrames = String(PERFORMANCE_SAMPLE_CONFIG.warmupFrames);
        this.game.canvas.dataset.performanceProfileTargetSamples = String(PERFORMANCE_SAMPLE_CONFIG.sampleFrames);
      }
    }
    this.hud = new GameHud(this, this.gameplayEvents, development);
    this.pauseController = new PauseController(
      this,
      this.accessibilitySettings,
      () => this.updateAccessibilityDataset(),
    );
    this.failureController = new FailureController(this);
    this.resultController = new ResultController(this);
    this.updateFailureDataset();
    this.updateResultDataset();
    this.updateCamera();
    this.createTitleOverlay(keyboard);
    this.updatePauseDataset();
    this.updateAccessibilityDataset();
    this.updateAudioDataset();
    this.updateHud();
    if (this.bossClearedSmokeMode) this.startGame("smoke");
    if (this.playerPrototypeMode) this.startGame("smoke");
    if (this.autoStartSource && this.gameFlow.state === "title") {
      const source = this.autoStartSource;
      this.autoStartSource = undefined;
      this.startGame(source);
    }
    this.prepareFailureSmokeCycle();
    this.prepareResultSmokeCycle();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.playerSprite.off(Phaser.Animations.Events.ANIMATION_UPDATE, this.handleAnimationUpdate, this);
      this.playerSprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this);
      this.disableAttackHitbox();
      this.touchInputController.destroy();
      this.effectDirector.destroy();
      this.audioManager.destroy();
      if (development) this.game.canvas.dataset.audioManagerCount = "0";
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
      this.titleOptionFrames = undefined;
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
    this.updatePerformanceProfileMetrics();
    if (this.zhangFeiPreviewMode) { this.updateZhangFeiPreviewMode(); return; }
    if (this.enemyPreviewMode) { this.updateEnemyAlignmentPreview(); return; }
    if (this.previewMode) { this.updatePreviewMode(); return; }
    this.updateVisualFreezeMetrics();
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
    this.updatePrototypeTrialMetrics();
    this.playerBody.setVelocity(0, 0);
    this.currentInput = this.touchInputController.readSnapshot(this.inputController.readSnapshot());
    if (this.playerPrototypeStrategy) this.currentInput = this.createPrototypeActionSnapshot(this.playerPrototypeStrategy);
    if (!this.playerPrototypeMode && !this.shieldGuardTestMode && !this.crossbowTestMode && !this.shieldCrossbowTestMode && !this.duelistLeapTestMode && !this.bossSmokeMode && !this.bossCombatSmokeMode && !this.failureSmokeCycleActive) {
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
      if (this.playerPrototypeMode && this.prototypeAttackPhase === "recovery") {
        this.prototypeTrialMetrics.commitmentMs += this.game.loop.delta;
      }
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
      const velocity = new Phaser.Math.Vector2(moveX, moveY).scale(this.playerDefinition.movement.speed);
      this.playerBody.setVelocity(velocity.x, velocity.y);
      if (moveX > 0) this.setFacing(1); else if (moveX < 0) this.setFacing(-1);
      this.transitionTo("walk");
    } else this.transitionTo("idle");
    this.syncVisualsToBody();
    this.updateCamera();
    this.updateDebugText();
  }

  private updateVisualFreezeMetrics() {
    if (!this.visualFreezeMode || this.gameFlow.state !== "playing" || this.lifecycleClock.isPaused()) return;
    if (this.visualFreezeWarmupFrames < 60) {
      this.visualFreezeWarmupFrames += 1;
      return;
    }
    if (this.visualFreezeDeltas.length >= 300) return;
    this.visualFreezeDeltas.push(Math.max(this.game.loop.delta, 1));
    if (this.visualFreezeDeltas.length !== 300) return;

    const totalDelta = this.visualFreezeDeltas.reduce((sum, delta) => sum + delta, 0);
    const slowestDeltas = [...this.visualFreezeDeltas].sort((left, right) => right - left).slice(0, 3);
    const slowestAverage = slowestDeltas.reduce((sum, delta) => sum + delta, 0) / slowestDeltas.length;
    this.game.canvas.dataset.visualFreezeSampleCount = String(this.visualFreezeDeltas.length);
    this.game.canvas.dataset.visualFreezeAverageFps = (this.visualFreezeDeltas.length * 1000 / totalDelta).toFixed(2);
    this.game.canvas.dataset.visualFreezeOnePercentLowFps = (1000 / slowestAverage).toFixed(2);
    this.game.canvas.dataset.visualFreezeComplete = "true";
  }

  private updatePerformanceProfileMetrics() {
    if (!this.performanceProfileMode) return;
    if (!this.performanceProfileStarted) {
      this.performanceProfileStarted = this.isPerformanceCheckpointReady();
      if (!this.performanceProfileStarted) return;
      this.game.canvas.dataset.performanceProfileStarted = "true";
    }
    const sample = this.performanceSampler?.record(this.game.loop.delta);
    if (!sample) return;

    const memory = (window.performance as Performance & {
      readonly memory?: Readonly<{
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      }>;
    }).memory;
    const dataset = this.game.canvas.dataset;
    dataset.performanceProfileSampleCount = String(sample.sampleCount);
    dataset.performanceProfileAverageFps = sample.averageFps.toFixed(2);
    dataset.performanceProfileOnePercentLowFps = sample.onePercentLowFps.toFixed(2);
    dataset.performanceProfileWorstFrameTimeMs = sample.worstFrameTimeMs.toFixed(2);
    dataset.performanceProfileTextureCount = String(
      this.textures.getTextureKeys().filter(key => !key.startsWith("__")).length,
    );
    dataset.performanceProfileGameObjectCount = String(this.children.list.length);
    dataset.performanceProfileHeapUsedBytes = memory ? String(memory.usedJSHeapSize) : "unavailable";
    dataset.performanceProfileHeapTotalBytes = memory ? String(memory.totalJSHeapSize) : "unavailable";
    dataset.performanceProfileHeapLimitBytes = memory ? String(memory.jsHeapSizeLimit) : "unavailable";
    dataset.performanceProfileComplete = "true";
  }

  private isPerformanceCheckpointReady() {
    switch (this.performanceCheckpoint) {
      case "title":
        return this.gameFlow.state === "title";
      case "combat":
        return this.gameFlow.state === "playing" && this.enemyManager.getLivingEnemies().length > 0;
      case "handoff":
        return this.gameFlow.state === "playing" && this.cameraHandoff.active;
      case "boss":
        return this.gameFlow.state === "playing" && this.bossActor !== undefined;
      case "failure":
        return this.gameFlow.state === "failed";
      case "result":
        return this.gameFlow.state === "cleared";
      default:
        return true;
    }
  }

  private togglePause(): boolean {
    if (this.gameFlow.state === "playing") {
      this.playerBody.setVelocity(0, 0);
      this.currentInput = createActionSnapshot({ up: false, down: false, left: false, right: false });
      this.inputController.consumeAttackPress();
      this.touchInputController.clearTransientInput();
      this.gameFlow.transition("paused");
      this.lifecycleClock.setManualPaused(true);
      this.audioManager.setManualPaused(true);
      this.gameplayEvents.publish({ type: "ui-action", action: "pause", at: this.time.now });
      this.pauseCount += 1;
    } else if (this.gameFlow.state === "paused") {
      this.inputController.consumeAttackPress();
      this.touchInputController.clearTransientInput();
      this.gameFlow.transition("playing");
      this.lifecycleClock.setManualPaused(false);
      this.audioManager.setManualPaused(false);
      this.gameplayEvents.publish({ type: "ui-action", action: "resume", at: this.time.now });
      this.resumeCount += 1;
    } else return false;

    this.pauseController.setFlowState(this.gameFlow.state);
    this.updateTitleDataset();
    this.updatePauseDataset();
    this.updateAudioDataset();
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
    for (const animation of Object.values(this.playerDefinition.animations)) {
      if (!this.anims.exists(animation.key)) this.createPlayerAnimation(animation);
    }
    for (const attack of Object.values(this.playerDefinition.attacks)) {
      if (this.anims.exists(attack.animationKey)) continue;
      this.anims.create({
        key: attack.animationKey,
        frames: attack.frames.map((frame, index) => ({
          key: this.playerDefinition.textureKey,
          frame,
          duration: attack.extraFrameDurationsMs[index],
        })),
        frameRate: attack.frameRate,
        repeat: 0,
      });
    }
    for (const config of [SOLDIER_ENEMY_CONFIG, MAULER_ENEMY_CONFIG, DUELIST_ENEMY_CONFIG, SHIELD_GUARD_ENEMY_CONFIG, CROSSBOW_ENEMY_CONFIG]) {
      const idleKey = enemyAnimationKey(config, "idle");
      const walkKey = enemyAnimationKey(config, "walk");
      const attackKey = enemyAnimationKey(config, "attack");
      const hurtKey = enemyAnimationKey(config, "hurt");
      const deadKey = enemyAnimationKey(config, "dead");
      if (!this.anims.exists(idleKey)) this.anims.create({ key: idleKey, frames: config.animations.idle.map(frame => ({ key: config.assetKey, frame })), frameRate: config.animationRates.idle, repeat: -1 });
      if (!this.anims.exists(walkKey)) this.anims.create({ key: walkKey, frames: config.animations.walk.map(frame => ({ key: config.assetKey, frame })), frameRate: config.animationRates.walk, repeat: -1 });
      if (!this.anims.exists(attackKey)) {
        this.anims.create({
          key: attackKey,
          frames: config.animations.attack.map((frame, index) => ({
            key: config.assetKey,
            frame,
            duration: config.attackFrameDurationsMs?.[index] ?? 0,
          })),
          frameRate: config.animationRates.attack,
          repeat: 0,
        });
      }
      if (!this.anims.exists(hurtKey)) this.anims.create({ key: hurtKey, frames: config.animations.hurt.map(frame => ({ key: config.assetKey, frame })), frameRate: config.animationRates.hurt, repeat: 0 });
      if (!this.anims.exists(deadKey)) this.anims.create({ key: deadKey, frames: config.animations.dead.map(frame => ({ key: config.assetKey, frame })), frameRate: config.animationRates.dead, repeat: 0 });
    }
    for (const state of ["guard", "block", "recovery"] as const) {
      if (this.anims.exists(shieldGuardAnimationKey(state))) continue;
      this.anims.create({
        key: shieldGuardAnimationKey(state),
        frames: SHIELD_GUARD_EXTRA_ANIMATIONS[state].map(frame => ({ key: SHIELD_GUARD_ENEMY_CONFIG.assetKey, frame })),
        frameRate: state === "block" ? 8 : 4,
        repeat: state === "block" ? 0 : -1,
      });
    }
    for (const state of ["aim", "locked", "reload"] as const) {
      if (this.anims.exists(crossbowAnimationKey(state))) continue;
      this.anims.create({
        key: crossbowAnimationKey(state),
        frames: CROSSBOW_EXTRA_ANIMATIONS[state].map(frame => ({ key: CROSSBOW_ENEMY_CONFIG.assetKey, frame })),
        frameRate: state === "locked" ? 1 : 4,
        repeat: -1,
      });
    }
    const leapFrames: Record<DuelistLeapPhase, string> = {
      takeoff: "leap-takeoff",
      airborne: "leap-airborne",
      descent: "leap-descent",
      landing: "leap-landing",
    };
    for (const phase of Object.keys(leapFrames) as DuelistLeapPhase[]) {
      if (this.anims.exists(duelistLeapAnimationKey(phase))) continue;
      this.anims.create({
        key: duelistLeapAnimationKey(phase),
        frames: [{ key: "enemy-duelist-leap", frame: leapFrames[phase] }],
        frameRate: 8,
        repeat: 0,
      });
    }
    this.effectDirector.createHitSparkAnimation();
  }

  private createPlayerAnimation(animation: PlayerAnimationDefinition) {
    this.anims.create({
      key: animation.key,
      frames: animation.frames.map(frame => ({ key: this.playerDefinition.textureKey, frame })),
      frameRate: animation.frameRate,
      repeat: animation.repeat,
      ...(animation.durationMs === undefined ? {} : { duration: animation.durationMs }),
    });
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
      const blocked = overlapping.filter(enemy => this.enemyManager.isGuardBlocking(
        enemy,
        this.playerBodyZone.x,
        this.playerBodyZone.y,
      ) && !this.playerBlockedTargetIds.has(enemy.id));
      if (blocked.length) {
        this.playerBlockedTargetIds = new Set([...this.playerBlockedTargetIds, ...blocked.map(enemy => enemy.id)]);
        if (this.playerPrototypeMode && !this.prototypeCurrentAttackBlocked) {
          this.prototypeTrialMetrics.attacksBlocked[this.comboStep - 1] += 1;
          this.prototypeCurrentAttackBlocked = true;
        }
        blocked.forEach(enemy => this.applyBlockToEnemy(enemy));
      }
      const resolution = resolveAttack({
        attackId: this.playerAttackId,
        damage: this.currentAttackImpact().damage,
        targets: overlapping
          .filter(enemy => !this.playerBlockedTargetIds.has(enemy.id))
          .map(enemy => ({ id: enemy.id, hp: enemy.hp, active: enemy.state !== "dead" })),
        hitTargetIds: this.playerHitTargetIds,
      });
      this.playerHitTargetIds = resolution.hitTargetIds;
      const hits = resolution.hits
        .map(hit => overlapping.find(enemy => enemy.id === hit.targetId))
        .filter((enemy): enemy is EnemyCombatant => enemy !== undefined);
      if (hits.length) {
        hitLanded = true;
        globalEffectsTriggered = true;
        this.recordPrototypeConfirmedAttack(hits.length);
        hits.forEach((enemy, index) => this.applyHitToEnemy(enemy, index === 0));
      }
      const bossActor = this.bossActor;
      if (bossActor?.isDamageable && this.physics.overlap(this.attackZone, bossActor.bodyZone)) {
        const bossResolution = resolveAttack({
          attackId: this.playerAttackId,
          damage: this.currentAttackImpact().damage,
          targets: [{ id: bossActor.targetId, hp: bossActor.hp, active: true }],
          hitTargetIds: this.playerHitTargetIds,
        });
        this.playerHitTargetIds = bossResolution.hitTargetIds;
        if (bossResolution.hits.length) {
          hitLanded = true;
          this.recordPrototypeConfirmedAttack(1);
          if (this.playerPrototypeMode && this.comboStep === 3) this.prototypeTrialMetrics.bossAttack3Hits += 1;
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
    if (this.playerPrototypeMode) {
      if (step === 1) this.prototypeStopCurrentCombo = false;
      this.prototypeTrialMetrics.attacksStarted[step - 1] += 1;
      if (step === 3) {
        const nearbyThreats = this.prototypeNearbyThreatCount();
        if (nearbyThreats <= 1) this.prototypeTrialMetrics.isolatedAttack3Starts += 1;
        else this.prototypeTrialMetrics.unsafeAttack3Starts += 1;
      }
      this.prototypeAttackPhase = "startup";
      this.prototypeCurrentAttackHitRecorded = false;
      this.prototypeCurrentAttackBlocked = false;
      this.prototypeCurrentAttackInterrupted = false;
      this.prototypeGroupedAttack2Current = false;
    }
    this.playerHitTargetIds = new Set();
    this.playerBlockedTargetIds = new Set();
    this.gameplayEvents.publish({ type: "player-attack-started", step, at: this.time.now });
    this.playerBody.setVelocity(0, 0);
    this.disableAttackHitbox();
    this.playerActor.playAttack(attack.animationKey);
  }

  private handleAnimationComplete(animation: Phaser.Animations.Animation) {
    if (animation.key === "hit-spark") return;
    if (!this.attackController.isAttackAnimation(animation.key)) return;
    this.disableAttackHitbox();
    this.attackCompleteCount += 1;
    if (this.playerPrototypeMode) {
      if (!this.hitConfirmed && !this.prototypeCurrentAttackBlocked && !this.prototypeCurrentAttackInterrupted) {
        this.prototypeTrialMetrics.attacksMissed[this.comboStep - 1] += 1;
      }
      if (this.comboStep < 3 && this.hitConfirmed && !this.comboBuffered) {
        if (this.comboStep === 1) this.prototypeTrialMetrics.voluntaryStopsAfterAttack1 += 1;
        else this.prototypeTrialMetrics.voluntaryStopsAfterAttack2 += 1;
      }
    }
    if (this.comboStep < 3 && this.hitConfirmed && this.comboBuffered) this.startAttack(this.comboStep + 1);
    else this.finishCombo();
  }

  private handleAnimationUpdate(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
    if (!this.attackController.isAttackAnimation(animation.key)) return;
    if (this.attackController.isActiveFrame(animation.key, frame.index)) {
      this.prototypeAttackPhase = "active";
      this.enableAttackHitbox();
    } else {
      const activeFrames = this.attackController.activeAttack?.activeFrames ?? [];
      this.prototypeAttackPhase = activeFrames.length && frame.index > Math.max(...activeFrames) ? "recovery" : "startup";
      this.disableAttackHitbox();
    }
  }

  private finishCombo() {
    this.disableAttackHitbox();
    this.comboStep = 0;
    this.hitConfirmed = false;
    this.comboBuffered = false;
    this.comboWindowOpen = false;
    this.comboWindowEndsAt = 0;
    this.attackController.finish();
    this.prototypeAttackPhase = "idle";
    this.transitionTo("idle");
  }

  private resetComboState() {
    this.comboStep = 0;
    this.hitConfirmed = false;
    this.comboBuffered = false;
    this.comboWindowOpen = false;
    this.comboWindowEndsAt = 0;
    this.playerHitTargetIds = new Set();
    this.playerBlockedTargetIds = new Set();
    this.attackController.finish();
    this.prototypeAttackPhase = "idle";
  }

  private currentAttackImpact() {
    return this.attackController.activeAttack?.impact ?? this.playerDefinition.attacks[1].impact;
  }

  private applyHitToEnemy(enemy: EnemyCombatant, triggerGlobalEffects: boolean) {
    const impact = this.currentAttackImpact();
    this.hitCount += 1;
    this.totalDamage += impact.damage;

    const left = Math.max(this.attackBody.x, enemy.body.x);
    const right = Math.min(this.attackBody.right, enemy.body.right);
    const top = Math.max(this.attackBody.y, enemy.body.y);
    const bottom = Math.min(this.attackBody.bottom, enemy.body.bottom);
    const hitX = Math.round((left + right) / 2);
    const hitY = Math.round((top + bottom) / 2);

    this.effectDirector.flash(enemy.sprite);
    this.effectDirector.createHitSpark(hitX, hitY);
    if (triggerGlobalEffects) this.effectDirector.cameraShake();

    const targetX = clampStageX(enemy.bodyZone.x + this.facing * impact.knockbackDistance, BAMBOO_COMBAT_ROOM.walkBounds);
    this.effectDirector.knockback(enemy.bodyZone, targetX, () => this.enemyManager.syncPhysicsFromZone(enemy));

    const damage = this.enemyManager.damage(enemy, impact.damage);
    this.gameplayEvents.publish({ type: "enemy-hit", enemyId: enemy.id, damage: impact.damage, at: this.time.now });
    if (damage.becameDead) {
      this.gameplayEvents.publish({ type: "enemy-defeated", enemyId: enemy.id, at: this.time.now });
    }
    if (triggerGlobalEffects) this.effectDirector.beginHitStop(impact.hitStopMs);
  }

  private applyBlockToEnemy(enemy: EnemyCombatant) {
    this.enemyManager.reinforceGuardAfterBlock(enemy);
    const hitX = Math.round((this.attackBody.x + enemy.body.x) / 2);
    const hitY = Math.round((this.attackBody.y + enemy.body.y) / 2);
    this.effectDirector.createHitSpark(hitX, hitY);
    this.gameplayEvents.publish({ type: "enemy-blocked", enemyId: enemy.id, at: this.time.now });
  }

  private applyHitToBoss(triggerGlobalEffects: boolean) {
    const bossActor = this.bossActor;
    if (!bossActor) return;
    const impact = this.currentAttackImpact();
    const damage = bossActor.damage(impact.damage);
    if (!damage.applied) return;
    this.hitCount += 1;
    this.totalDamage += impact.damage;

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
      bossActor.bodyZone.x + this.facing * impact.knockbackDistance,
      BAMBOO_BOSS_ARENA.bounds,
    );
    this.effectDirector.knockback(bossActor.bodyZone, targetX, () => bossActor.syncVisuals());
    this.gameplayEvents.publish({ type: "enemy-hit", enemyId: bossActor.targetId, damage: impact.damage, at: this.time.now });
    if (triggerGlobalEffects) this.effectDirector.beginHitStop(impact.hitStopMs);
  }

  private applyHitToPlayer(attackerId: number, attackerFacing: 1 | -1, sourceId: string) {
    if (this.gameFlow.state !== "playing" || this.state === "hurt") return;
    if (this.playerPrototypeMode && this.isAttackState(this.state)) {
      this.prototypeTrialMetrics.attacksInterrupted[this.comboStep - 1] += 1;
      if (this.prototypeAttackPhase === "recovery") this.prototypeTrialMetrics.recoveryHitsReceived += 1;
      this.prototypeCurrentAttackInterrupted = true;
    }
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
      this.time.delayedCall(this.playerDefinition.lifecycle.hurtDurationMs, () => {
        if (this.state === "hurt") this.transitionTo("idle");
      });
    }
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
    const frame = addButtonFrame(this, VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2, 430, 72);
    const label = addUiText(this, VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2 - 14, "ALL ENEMIES DEFEATED", 28)
      .setOrigin(0.5, 0);
    this.defeatedText = this.add.container(0, 0, [frame, label]).setScrollFactor(0).setDepth(10000);
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

    if (this.failureSmokeCycleActive
      && !(this.performanceProfileMode && this.performanceCheckpoint === "failure")) {
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
    if (source !== "smoke") this.pendingRestartAudioAction = "retry";
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
    if (source !== "smoke") this.pendingRestartAudioAction = "replay";
    this.restartStage();
    return true;
  }

  private prepareFailureSmokeCycle() {
    if (!this.failureSmokeMode) return;
    if (!this.failureSmokeCycleActive) {
      const initialStateRestored = this.gameFlow.state === "title"
        && this.playerHp === this.playerDefinition.lifecycle.maxHp
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
    this.playerLifecycle.applyDamage(this.playerDefinition.lifecycle.maxHp - 1);
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
      && this.playerHp === this.playerDefinition.lifecycle.maxHp
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
      .setScrollFactor(0);
    const modal = addModalFrame(this, VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2, 900, 470);
    const title = addUiText(this, VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2 - 172, "SELECT FIGHTER", 46, UI_COLORS.antiqueGold)
      .setOrigin(0.5).setScrollFactor(0);
    const trial = addUiText(this, VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2 - 122, "ZHANG FEI - TRIAL BALANCE", 18, UI_COLORS.boneWhite)
      .setOrigin(0.5).setScrollFactor(0);
    const guanyuFrame = addButtonFrame(this, VIEWPORT_WIDTH / 2 - 205, VIEWPORT_HEIGHT / 2 + 6, 330, 180)
      .setScrollFactor(0).setInteractive({ useHandCursor: true });
    const zhangfeiFrame = addButtonFrame(this, VIEWPORT_WIDTH / 2 + 205, VIEWPORT_HEIGHT / 2 + 6, 330, 180)
      .setScrollFactor(0).setInteractive({ useHandCursor: true });
    const guanyuName = addUiText(this, VIEWPORT_WIDTH / 2 - 205, VIEWPORT_HEIGHT / 2 - 17, "GUAN YU", 34)
      .setOrigin(0.5).setScrollFactor(0);
    const guanyuRole = addUiText(this, VIEWPORT_WIDTH / 2 - 205, VIEWPORT_HEIGHT / 2 + 42, "BALANCED", 18, UI_COLORS.antiqueGold)
      .setOrigin(0.5).setScrollFactor(0);
    const zhangfeiName = addUiText(this, VIEWPORT_WIDTH / 2 + 205, VIEWPORT_HEIGHT / 2 - 17, "ZHANG FEI", 34)
      .setOrigin(0.5).setScrollFactor(0);
    const zhangfeiRole = addUiText(this, VIEWPORT_WIDTH / 2 + 205, VIEWPORT_HEIGHT / 2 + 42, "HEAVY TRIAL", 18, UI_COLORS.antiqueGold)
      .setOrigin(0.5).setScrollFactor(0);
    const prompt = addUiText(this, VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2 + 157, "TAP FIGHTER  /  LEFT RIGHT + ENTER", 20)
      .setOrigin(0.5).setScrollFactor(0);
    this.titleOptionFrames = { guanyu: guanyuFrame, zhangfei: zhangfeiFrame };
    this.titleOverlay = this.add.container(0, 0, [
      shade, modal, title, trial, guanyuFrame, zhangfeiFrame,
      guanyuName, guanyuRole, zhangfeiName, zhangfeiRole, prompt,
    ]).setDepth(20000);
    guanyuFrame.on("pointerover", () => this.selectTitlePlayer("guanyu"));
    zhangfeiFrame.on("pointerover", () => this.selectTitlePlayer("zhangfei"));
    guanyuFrame.once("pointerdown", () => {
      this.selectTitlePlayer("guanyu");
      this.confirmTitlePlayer("pointer");
    });
    zhangfeiFrame.once("pointerdown", () => {
      this.selectTitlePlayer("zhangfei");
      this.confirmTitlePlayer("pointer");
    });
    keyboard.on("keydown", this.handleTitleKeyboardStart, this);
    this.selectTitlePlayer(this.titleSelectedPlayerId);
    this.updateTitleDataset();
  }

  private selectTitlePlayer(id: PlayerId) {
    if (this.gameFlow.state !== "title") return;
    this.titleSelectedPlayerId = id;
    this.titleOptionFrames?.guanyu.setTint(id === "guanyu" ? UI_COLORS.antiqueGold : 0x68655b);
    this.titleOptionFrames?.zhangfei.setTint(id === "zhangfei" ? UI_COLORS.antiqueGold : 0x68655b);
    this.updateTitleDataset();
  }

  private confirmTitlePlayer(source: Exclude<TitleStartSource, "smoke">) {
    if (this.gameFlow.state !== "title") return;
    if (this.titleSelectedPlayerId === this.playerDefinition.id) {
      this.startGame(source);
      return;
    }
    this.audioManager.requestUnlock();
    this.scene.restart({ playerId: this.titleSelectedPlayerId, autoStartSource: source } satisfies MainSceneInitData);
  }

  private startGame(source: TitleStartSource) {
    if (!this.titleStartController.requestStart()) return;
    if (source !== "smoke") this.audioManager.requestUnlock();
    if (source !== "smoke") {
      this.gameplayEvents.publish({ type: "title-started", source, at: this.time.now });
    }
    this.titleStartCount += 1;
    this.input.keyboard?.off("keydown", this.handleTitleKeyboardStart, this);
    this.titleOverlay?.destroy(true);
    this.titleOverlay = undefined;
    this.titleOptionFrames = undefined;
    this.pauseController.consumeToggleRequest();
    this.pauseController.setFlowState(this.gameFlow.state);
    this.inputController.readSnapshot();
    this.currentInput = createActionSnapshot({ up: false, down: false, left: false, right: false });
    if (this.shieldGuardTestMode) this.spawnShieldGuardPrototype(this.shieldGuardTestMode);
    else if (this.crossbowTestMode) this.spawnCrossbowPrototype(this.crossbowTestMode);
    else if (this.shieldCrossbowTestMode) this.spawnShieldCrossbowPrototype();
    else if (this.duelistLeapTestMode) this.spawnDuelistLeapPrototype();
    else if (this.playerPrototypeScenario) this.spawnPlayerPrototypeScenario(this.playerPrototypeScenario);
    this.updateTitleDataset(source);
    this.updatePauseDataset();
    this.updateAudioDataset();
    this.updateHud();
  }

  private spawnPlayerPrototypeScenario(scenario: PlayerPrototypeScenario) {
    this.prototypeTrialStartedAt = this.time.now;
    if (scenario === "entry") {
      this.enemyManager.spawnPrototype([
        { id: "prototype-entry-soldier", x: 520, y: 560, enemyType: "soldier" },
        { id: "prototype-entry-guard", x: 700, y: 470, enemyType: "shield-guard" },
      ]);
    } else if (scenario === "ambush") {
      this.enemyManager.spawnPrototype([
        { id: "prototype-ambush-mauler", x: 560, y: 455, enemyType: "mauler" },
        { id: "prototype-ambush-duelist", x: 700, y: 625, enemyType: "duelist" },
        { id: "prototype-ambush-crossbow", x: 840, y: 530, enemyType: "crossbow" },
      ]);
    } else {
      this.playerBody.reset(BAMBOO_BOSS_ARENA.bounds.x + 260, 560);
      this.bossEntryState = "active";
      this.createBossActor(true);
      this.activateBossArena(true);
    }
    this.game.canvas.dataset.playerPrototypeScenarioReady = scenario;
  }

  private createPrototypeTrialMetrics(): PrototypeTrialMetrics {
    return {
      attacksStarted: [0, 0, 0], attacksHit: [0, 0, 0], attacksMissed: [0, 0, 0],
      attacksBlocked: [0, 0, 0], attacksInterrupted: [0, 0, 0],
      voluntaryStopsAfterAttack1: 0, voluntaryStopsAfterAttack2: 0,
      recoveryHitsReceived: 0, multiTargetHits: 0, confirmedAttacks: 0,
      displacedTargets: 0, commitmentMs: 0, bossAttack3Hits: 0,
      groupedAttack2Confirms: 0, repositionAfterAttack2: 0,
      isolatedAttack3Starts: 0, unsafeAttack3Starts: 0,
    };
  }

  private resetPrototypeTrialMetrics() {
    this.prototypeTrialStartedAt = 0;
    this.prototypeTrialComplete = false;
    this.prototypeAttackPhase = "idle";
    this.prototypeCurrentAttackHitRecorded = false;
    this.prototypeCurrentAttackBlocked = false;
    this.prototypeCurrentAttackInterrupted = false;
    this.prototypeGroupedAttack2Current = false;
    this.prototypeRepositionPending = false;
    this.prototypeRepositionStartedAt = 0;
    this.prototypeRepositionOrigin = { x: 0, y: 0 };
    this.prototypeRepositionDirection = -1;
    this.prototypeNextAttackInputAt = 0;
    this.prototypeStopCurrentCombo = false;
    this.prototypeTrialMetrics = this.createPrototypeTrialMetrics();
    if (process.env.NODE_ENV !== "production") delete this.game.canvas.dataset.prototypeTrialMetrics;
  }

  private recordPrototypeConfirmedAttack(targetCount: number) {
    if (!this.playerPrototypeMode || this.prototypeCurrentAttackHitRecorded) return;
    this.prototypeTrialMetrics.attacksHit[this.comboStep - 1] += 1;
    this.prototypeTrialMetrics.confirmedAttacks += 1;
    this.prototypeTrialMetrics.displacedTargets += targetCount;
    if (targetCount > 1) this.prototypeTrialMetrics.multiTargetHits += 1;
    if (this.comboStep === 2 && targetCount > 1) {
      this.prototypeTrialMetrics.groupedAttack2Confirms += 1;
      this.prototypeGroupedAttack2Current = true;
      if (this.playerPrototypeStrategy === "aware" && this.prototypeStopCurrentCombo) {
        this.beginPrototypeReposition();
      }
    }
    this.prototypeCurrentAttackHitRecorded = true;
  }

  private prototypeNearbyThreatCount() {
    const enemies = this.enemyManager.getLivingEnemies().filter(enemy =>
      Phaser.Math.Distance.Between(
        this.playerBodyZone.x,
        this.playerBodyZone.y,
        enemy.bodyZone.x,
        enemy.bodyZone.y,
      ) <= PROTOTYPE_NEARBY_THREAT_RADIUS,
    ).length;
    const bossNearby = this.bossActor
      && this.bossActor.state !== "dead"
      && this.bossActor.state !== "cleaned"
      && Phaser.Math.Distance.Between(
        this.playerBodyZone.x,
        this.playerBodyZone.y,
        this.bossActor.bodyZone.x,
        this.bossActor.bodyZone.y,
      ) <= PROTOTYPE_NEARBY_THREAT_RADIUS;
    return enemies + (bossNearby ? 1 : 0);
  }

  private beginPrototypeReposition() {
    if (this.prototypeRepositionPending) return;
    this.prototypeRepositionPending = true;
    this.prototypeRepositionStartedAt = this.time.now;
    this.prototypeRepositionOrigin = { x: this.playerBodyZone.x, y: this.playerBodyZone.y };
    this.prototypeRepositionDirection = this.playerBodyZone.y >= 540 ? -1 : 1;
  }

  private updatePrototypeTrialMetrics() {
    if (!this.playerPrototypeMode || !this.prototypeTrialStartedAt) return;
    const scenarioComplete = this.playerPrototypeScenario === "boss"
      ? this.bossArenaReleaseCount > 0 || this.bossActor?.hp === 0 || this.gameFlow.state === "cleared"
      : this.enemyManager.getLivingEnemies().length === 0;
    if (scenarioComplete) this.prototypeTrialComplete = true;
    const durationMs = Math.max(0, this.time.now - this.prototypeTrialStartedAt);
    const metrics = this.prototypeTrialMetrics;
    this.game.canvas.dataset.prototypeTrialMetrics = JSON.stringify({
      ...metrics,
      commitmentMs: Math.round(metrics.commitmentMs),
      averageEnemiesDisplaced: metrics.confirmedAttacks
        ? Number((metrics.displacedTargets / metrics.confirmedAttacks).toFixed(2))
        : 0,
      playerDamageTaken: this.playerDefinition.lifecycle.maxHp - this.playerHp,
      playerHp: this.playerHp,
      durationMs: Math.round(durationMs),
      complete: this.prototypeTrialComplete,
    });
  }

  private createPrototypeActionSnapshot(strategy: PlayerPrototypeStrategy): ActionSnapshot {
    const noInput = () => createActionSnapshot({ up: false, down: false, left: false, right: false });
    if (this.state === "hurt" || this.state === "dead") return noInput();
    if (this.isAttackState(this.state)) {
      if (this.prototypeStopCurrentCombo) return noInput();
      if (!this.comboWindowOpen || this.time.now < this.prototypeNextAttackInputAt) return noInput();
      const nearbyThreats = this.prototypeNearbyThreatCount();
      if (strategy === "aware" && this.comboStep === 2
        && (this.prototypeGroupedAttack2Current || nearbyThreats > 1)) {
        this.prototypeStopCurrentCombo = true;
        if (this.prototypeGroupedAttack2Current) {
          this.beginPrototypeReposition();
        }
        return noInput();
      }
      this.prototypeNextAttackInputAt = this.time.now + 120;
      return createActionSnapshot({ up: false, down: false, left: false, right: false }, true);
    }

    const living = this.enemyManager.getLivingEnemies();
    const boss = this.bossActor && this.bossActor.state !== "dead" && this.bossActor.state !== "cleaned"
      ? this.bossActor
      : undefined;
    if (strategy === "aware" && this.prototypeRepositionPending) {
      const moved = Phaser.Math.Distance.Between(
        this.prototypeRepositionOrigin.x,
        this.prototypeRepositionOrigin.y,
        this.playerBodyZone.x,
        this.playerBodyZone.y,
      );
      if (moved >= PROTOTYPE_REPOSITION_DISTANCE) {
        this.prototypeTrialMetrics.repositionAfterAttack2 += 1;
        this.prototypeRepositionPending = false;
      } else if (this.time.now - this.prototypeRepositionStartedAt <= PROTOTYPE_REPOSITION_WINDOW_MS) {
        const moveY = this.prototypeRepositionDirection;
        return createActionSnapshot({ up: moveY < 0, down: moveY > 0, left: false, right: false });
      } else this.prototypeRepositionPending = false;
    }
    let targetX = boss?.bodyZone.x;
    let targetY = boss?.bodyZone.y;
    let targetEnemy: EnemyCombatant | undefined;
    if (!boss && living.length) {
      targetEnemy = strategy === "aware"
        ? living.find(enemy => enemy.isCrossbow && (enemy.state === "aim" || enemy.state === "locked"))
          ?? [...living].sort((a, b) => Phaser.Math.Distance.Between(this.playerBodyZone.x, this.playerBodyZone.y, a.bodyZone.x, a.bodyZone.y)
            - Phaser.Math.Distance.Between(this.playerBodyZone.x, this.playerBodyZone.y, b.bodyZone.x, b.bodyZone.y))[0]
        : [...living].sort((a, b) => Phaser.Math.Distance.Between(this.playerBodyZone.x, this.playerBodyZone.y, a.bodyZone.x, a.bodyZone.y)
          - Phaser.Math.Distance.Between(this.playerBodyZone.x, this.playerBodyZone.y, b.bodyZone.x, b.bodyZone.y))[0];
      targetX = targetEnemy.bodyZone.x;
      targetY = targetEnemy.bodyZone.y;
    }
    if (targetX === undefined || targetY === undefined) return noInput();

    const dx = targetX - this.playerBodyZone.x;
    const dy = targetY - this.playerBodyZone.y;
    if (strategy === "aware") {
      const lineThreat = living.find(enemy =>
        (enemy.state === "attack" || enemy.state === "locked")
        && Math.abs(enemy.bodyZone.y - this.playerBodyZone.y) < 68,
      );
      if (lineThreat && Math.abs(lineThreat.bodyZone.x - this.playerBodyZone.x) > 115) {
        const moveY = lineThreat.bodyZone.y <= this.playerBodyZone.y ? 1 : -1;
        return createActionSnapshot({ up: moveY < 0, down: moveY > 0, left: false, right: false });
      }
    }

    if (targetEnemy?.isShieldGuard && this.enemyManager.isGuardBlocking(targetEnemy, this.playerBodyZone.x, this.playerBodyZone.y)) {
      if (Math.abs(dy) < 92) {
        const moveY = dy <= 0 ? 1 : -1;
        return createActionSnapshot({ up: moveY < 0, down: moveY > 0, left: false, right: false });
      }
      const moveX = dx > 0 ? 1 : -1;
      return createActionSnapshot({ up: false, down: false, left: moveX < 0, right: moveX > 0 });
    }
    if (Math.abs(dy) > 30) {
      const moveY = dy > 0 ? 1 : -1;
      return createActionSnapshot({ up: moveY < 0, down: moveY > 0, left: false, right: false });
    }
    if (Math.abs(dx) > 105 || dx * this.facing < 0) {
      const moveX = dx > 0 ? 1 : -1;
      return createActionSnapshot({ up: false, down: false, left: moveX < 0, right: moveX > 0 });
    }
    if (this.time.now < this.prototypeNextAttackInputAt) return noInput();
    this.prototypeNextAttackInputAt = this.time.now + 160;
    return createActionSnapshot({ up: false, down: false, left: false, right: false }, true);
  }

  private spawnShieldGuardPrototype(mode: "A" | "B") {
    const spawns = mode === "A"
      ? [{ id: "shield-guard-test", x: 520, y: 560, enemyType: "shield-guard" as const }]
      : [
        { id: "shield-guard-test", x: 520, y: 560, enemyType: "shield-guard" as const },
        { id: "duelist-test", x: 720, y: 635, enemyType: "duelist" as const },
      ];
    this.enemyManager.spawnPrototype(spawns);
    if (process.env.NODE_ENV !== "production") this.game.canvas.dataset.shieldGuardTestMode = mode;
  }

  private spawnCrossbowPrototype(mode: "A" | "B") {
    const spawns = mode === "A"
      ? [{ id: "crossbow-test", x: 650, y: 560, enemyType: "crossbow" as const }]
      : [
        { id: "soldier-test", x: 500, y: 560, enemyType: "soldier" as const },
        { id: "crossbow-test", x: 760, y: 500, enemyType: "crossbow" as const },
      ];
    this.enemyManager.spawnPrototype(spawns);
    if (process.env.NODE_ENV !== "production") this.game.canvas.dataset.crossbowTestMode = mode;
  }

  /** Development-only TP-3 composition: one defender and one line-control threat. */
  private spawnShieldCrossbowPrototype() {
    this.enemyManager.spawnPrototype([
      { id: "shield-guard-test", x: 510, y: 560, enemyType: "shield-guard" as const },
      { id: "crossbow-test", x: 790, y: 500, enemyType: "crossbow" as const },
    ]);
    if (process.env.NODE_ENV !== "production") this.game.canvas.dataset.shieldCrossbowTestMode = "true";
  }

  /** Development-only GX.1 entrance; formal encounter composition is unchanged. */
  private spawnDuelistLeapPrototype() {
    this.enemyManager.spawnPrototype([
      { id: "duelist-leap-test", x: 360, y: 540, enemyType: "duelist" as const },
    ]);
    this.game.canvas.dataset.duelistLeapTestMode = "true";
  }

  private updateTitleDataset(source?: TitleStartSource) {
    if (process.env.NODE_ENV === "production") return;
    this.game.canvas.dataset.gameFlowState = this.gameFlow.state;
    this.game.canvas.dataset.titleVisible = String(this.gameFlow.state === "title");
    this.game.canvas.dataset.titleStartCount = String(this.titleStartCount);
    this.game.canvas.dataset.titleSelectedPlayer = this.titleSelectedPlayerId;
    this.game.canvas.dataset.activePlayerDefinition = this.playerDefinition.id;
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
    dataset.pauseObjectCount = "13";
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

  private updateAudioDataset() {
    if (process.env.NODE_ENV === "production" || !this.audioManager) return;
    const audio = this.audioManager.getSnapshot();
    const dataset = this.game.canvas.dataset;
    dataset.audioManagerCount = audio.status === "running" ? "1" : "0";
    dataset.audioManagerStatus = audio.status;
    dataset.audioSubscriptionCount = String(audio.subscriptionCount);
    dataset.audioUnlocked = String(audio.unlocked);
    dataset.audioPaused = String(audio.paused);
    dataset.audioEventCount = String(audio.eventCount);
    dataset.audioLastEventType = audio.lastEventType ?? "";
    dataset.audioPlayCount = String(audio.playCount);
    dataset.audioSuppressedCount = String(audio.suppressedCount);
    dataset.audioLastCue = audio.lastCue ?? "";
    dataset.audioPendingCueCount = String(audio.pendingCueCount);
    dataset.audioSfxVolume = String(audio.channels.sfx.volume);
    dataset.audioSfxMuted = String(audio.channels.sfx.muted);
    dataset.audioBgmVolume = String(audio.channels.bgm.volume);
    dataset.audioBgmMuted = String(audio.channels.bgm.muted);
    dataset.audioCurrentBgm = audio.currentBgm ?? "";
    dataset.audioPendingBgm = audio.pendingBgm ?? "";
    dataset.audioBgmStartCount = String(audio.bgmStartCount);
    dataset.audioBgmTransitionCount = String(audio.bgmTransitionCount);
    dataset.audioBgmStopCount = String(audio.bgmStopCount);
    dataset.audioContextState = audio.contextState;
    dataset.audioRecoveryPending = String(audio.recoveryPending);
    dataset.audioRecoveryCount = String(audio.recoveryCount);
    dataset.audioStaleCueDropCount = String(audio.staleCueDropCount);
  }

  private updateFailureDataset() {
    const development = (import.meta as ImportMeta & { env: { DEV: boolean } }).env.DEV;
    if (!development || !this.failureController) return;
    const dataset = this.game.canvas.dataset;
    dataset.failureOverlayVisible = String(this.failureController.isVisible);
    dataset.failureObjectCount = "4";
  }

  private updateResultDataset() {
    const development = (import.meta as ImportMeta & { env: { DEV: boolean } }).env.DEV;
    if (!development || !this.resultController) return;
    const dataset = this.game.canvas.dataset;
    dataset.resultOverlayVisible = String(this.resultController.isVisible);
    dataset.resultObjectCount = "5";
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
    this.gameplayEvents.publish({ type: "boss-activated", bossId: "warlord", at: this.time.now });
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
    if (next === "idle") this.playerActor.showIdleFrame();
    else if (next === "walk") this.playerActor.playWalk();
    else if (next === "hurt") this.playerActor.playHurt();
    else if (next === "dead") this.playerActor.playDead();
  }

  private get zhangFeiPreviewFrames() {
    const metadata = this.cache.json.get("zhangfei-v2-preview-metadata") as ZhangFeiPreviewMetadata | undefined;
    if (!metadata || metadata.frames.length !== 47) throw new Error("Zhang Fei preview metadata is unavailable or incomplete");
    return metadata.frames;
  }

  private get selectedZhangFeiFrames() {
    const state = this.zhangFeiPreviewStates[this.zhangFeiPreviewStateIndex];
    return this.zhangFeiPreviewFrames.filter(frame => frame.animation === state);
  }

  private createZhangFeiPreviewMode() {
    this.cameras.main.setBackgroundColor("#101512");
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable");
    this.zhangFeiPreviewKeys = keyboard.addKeys({
      left: "LEFT", right: "RIGHT", statePrevious: "A", stateNext: "D", play: "SPACE",
      slower: "DOWN", faster: "UP", loop: "L", onion: "O",
    }) as typeof this.zhangFeiPreviewKeys;
    const groundY = 600;
    const guide = this.add.graphics().setDepth(20);
    guide.lineStyle(2, 0x00ffff, 1).lineBetween(80, groundY, VIEWPORT_WIDTH - 80, groundY);
    guide.fillStyle(0xffff00, 1).fillCircle(VIEWPORT_WIDTH / 2, groundY, 5);
    this.onionSprite = this.add.sprite(VIEWPORT_WIDTH / 2, groundY, "zhangfei-v2-preview", "idle-0")
      .setOrigin(0.5, 0.9375).setScale(0.64).setAlpha(0.3).setTint(0x69cfff).setVisible(false);
    this.previewSprite = this.add.sprite(VIEWPORT_WIDTH / 2, groundY, "zhangfei-v2-preview", "idle-0")
      .setOrigin(0.5, 0.9375).setScale(0.64);
    this.previewText = this.add.text(24, 22, "", {
      fontFamily: "Consolas, monospace", fontSize: "17px", color: "#fff",
      backgroundColor: "rgba(0,0,0,.82)", padding: { x: 12, y: 10 }, lineSpacing: 2,
    }).setDepth(100);
    this.previewIndex = 0;
    this.showZhangFeiPreviewFrame(0);
  }

  private updateZhangFeiPreviewMode() {
    const keys = this.zhangFeiPreviewKeys!;
    if (Phaser.Input.Keyboard.JustDown(keys.left)) { this.previewPlaying = false; this.showZhangFeiPreviewFrame(this.previewIndex - 1); }
    if (Phaser.Input.Keyboard.JustDown(keys.right)) { this.previewPlaying = false; this.showZhangFeiPreviewFrame(this.previewIndex + 1); }
    if (Phaser.Input.Keyboard.JustDown(keys.statePrevious)) this.changeZhangFeiPreviewState(-1);
    if (Phaser.Input.Keyboard.JustDown(keys.stateNext)) this.changeZhangFeiPreviewState(1);
    if (Phaser.Input.Keyboard.JustDown(keys.slower)) { this.previewFpsIndex = Math.max(0, this.previewFpsIndex - 1); this.refreshZhangFeiPreviewText(); }
    if (Phaser.Input.Keyboard.JustDown(keys.faster)) { this.previewFpsIndex = Math.min(this.previewSpeeds.length - 1, this.previewFpsIndex + 1); this.refreshZhangFeiPreviewText(); }
    if (Phaser.Input.Keyboard.JustDown(keys.loop)) { this.previewLoop = !this.previewLoop; this.refreshZhangFeiPreviewText(); }
    if (Phaser.Input.Keyboard.JustDown(keys.onion)) { this.onionEnabled = !this.onionEnabled; this.showZhangFeiPreviewFrame(this.previewIndex); }
    if (Phaser.Input.Keyboard.JustDown(keys.play)) {
      this.previewPlaying = !this.previewPlaying;
      this.nextPreviewFrameAt = this.time.now + 1000 / this.previewSpeeds[this.previewFpsIndex];
      this.refreshZhangFeiPreviewText();
    }
    if (this.previewPlaying && this.time.now >= this.nextPreviewFrameAt) {
      const frames = this.selectedZhangFeiFrames;
      if (this.previewIndex === frames.length - 1 && !this.previewLoop) {
        this.previewPlaying = false;
        this.refreshZhangFeiPreviewText();
      } else {
        this.showZhangFeiPreviewFrame((this.previewIndex + 1) % frames.length);
        this.nextPreviewFrameAt += 1000 / this.previewSpeeds[this.previewFpsIndex];
      }
    }
  }

  private changeZhangFeiPreviewState(direction: number) {
    this.zhangFeiPreviewStateIndex = Phaser.Math.Wrap(
      this.zhangFeiPreviewStateIndex + direction, 0, this.zhangFeiPreviewStates.length,
    );
    this.previewPlaying = false;
    this.showZhangFeiPreviewFrame(0);
  }

  private showZhangFeiPreviewFrame(index: number) {
    const frames = this.selectedZhangFeiFrames;
    this.previewIndex = Phaser.Math.Wrap(index, 0, frames.length);
    const frame = frames[this.previewIndex];
    const previous = frames[Phaser.Math.Wrap(this.previewIndex - 1, 0, frames.length)];
    this.previewSprite!.setFrame(frame.name).setPosition(VIEWPORT_WIDTH / 2, 600);
    this.onionSprite!.setFrame(previous.name).setPosition(VIEWPORT_WIDTH / 2, 600).setVisible(this.onionEnabled);
    this.game.canvas.dataset.zhangFeiPreviewState = frame.animation;
    this.game.canvas.dataset.zhangFeiPreviewFrame = frame.name;
    this.game.canvas.dataset.zhangFeiPreviewFps = String(this.previewSpeeds[this.previewFpsIndex]);
    this.game.canvas.dataset.zhangFeiPreviewFeetY = String(frame.feetAnchor.y);
    this.refreshZhangFeiPreviewText();
  }

  private refreshZhangFeiPreviewText() {
    const frames = this.selectedZhangFeiFrames;
    const frame = frames[this.previewIndex];
    this.previewText!.setText([
      "ZHANG FEI ANIMATION PREVIEW (DEV ONLY)",
      `state: ${frame.animation}  frame: ${frame.animationFrame} / ${frames.length - 1}`,
      `name: ${frame.name}  phase: ${frame.phase}`,
      `source: ${frame.sourceRect.x}, ${frame.sourceRect.y}, ${frame.sourceRect.width}, ${frame.sourceRect.height}`,
      `alpha: ${frame.alphaBounds.x}, ${frame.alphaBounds.y}, ${frame.alphaBounds.width}, ${frame.alphaBounds.height}`,
      `origin: ${frame.origin.x}, ${frame.origin.y}`,
      `offset: ${frame.displayOffset.x}, ${frame.displayOffset.y}  scale: ${frame.displayScale}`,
      `feet: ${frame.feetAnchor.x}, ${frame.feetAnchor.y}  hash: ${frame.pixelHash.slice(0, 12)}`,
      `speed: ${this.previewSpeeds[this.previewFpsIndex]} FPS  play: ${this.previewPlaying}  loop: ${this.previewLoop}  onion: ${this.onionEnabled}`,
      "",
      "A/D state | Left/Right frame | Space play/pause",
      "Up/Down FPS | L once/loop | O onion-skin",
    ]);
  }

  private createEnemyAlignmentPreview() {
    this.cameras.main.setBackgroundColor("#101512");
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable");
    this.enemyPreviewKeys = keyboard.addKeys({ left: "LEFT", right: "RIGHT", up: "UP", down: "DOWN" }) as typeof this.enemyPreviewKeys;
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
    this.showEnemyPreviewFrame(this.enemyPreviewIndex);
  }

  private updateEnemyAlignmentPreview() {
    const keys = this.enemyPreviewKeys!;
    if (Phaser.Input.Keyboard.JustDown(keys.left)) this.showEnemyPreviewFrame(this.enemyPreviewIndex - 1);
    if (Phaser.Input.Keyboard.JustDown(keys.right)) this.showEnemyPreviewFrame(this.enemyPreviewIndex + 1);
    if (Phaser.Input.Keyboard.JustDown(keys.up)) this.showEnemyPreviewActor(this.enemyPreviewActorIndex - 1);
    if (Phaser.Input.Keyboard.JustDown(keys.down)) this.showEnemyPreviewActor(this.enemyPreviewActorIndex + 1);
  }

  private showEnemyPreviewActor(index: number) {
    this.enemyPreviewActorIndex = Phaser.Math.Wrap(index, 0, CAST_PREVIEW_ACTORS.length);
    this.enemyPreviewIndex = 0;
    this.showEnemyPreviewFrame(0);
  }

  private showEnemyPreviewFrame(index: number) {
    const actor = CAST_PREVIEW_ACTORS[this.enemyPreviewActorIndex];
    this.enemyPreviewIndex = Phaser.Math.Wrap(index, 0, actor.frames.length);
    const name = actor.frames[this.enemyPreviewIndex];
    const texture = actor.id === "boss" && name.startsWith("attack") ? "boss-warlord-attacks" : actor.texture;
    const frame = this.textures.getFrame(texture, name);
    this.enemyPreviewSprite!.setTexture(texture, name)
      .setOrigin(0.5, actor.feetY / actor.frameSize)
      .setScale(actor.scale)
      .setPosition(VIEWPORT_WIDTH / 2, 580);
    if (process.env.NODE_ENV !== "production") {
      this.game.canvas.dataset.castPreviewActor = actor.id;
      this.game.canvas.dataset.castPreviewFrame = name;
      this.game.canvas.dataset.castPreviewScale = String(actor.scale);
    }
    this.enemyPreviewText!.setText([
      "CAST FEET ALIGNMENT PREVIEW",
      `actor: ${actor.id} (${this.enemyPreviewActorIndex + 1} / ${CAST_PREVIEW_ACTORS.length})`,
      `frame: ${this.enemyPreviewIndex} / ${actor.frames.length - 1}`,
      `name: ${name}`,
      `source: ${frame.cutX}, ${frame.cutY}, ${frame.cutWidth}, ${frame.cutHeight}`,
      `origin: 0.5, ${(actor.feetY / actor.frameSize).toFixed(6)}`,
      `feet anchor: ${actor.frameSize / 2}, ${actor.feetY}`,
      `display scale: ${actor.scale}`,
      "",
      "Up / Down: previous / next actor",
      "Left / Right: previous / next frame",
      "Red line: fixed world ground  |  Cyan point: feet anchor",
    ]);
  }

  private createPreviewMode() {
    this.cameras.main.setBackgroundColor("#101512");
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error("Keyboard input is unavailable");
    this.previewKeys = keyboard.addKeys({ left: "LEFT", right: "RIGHT", play: "SPACE", slower: "DOWN", faster: "UP", loop: "L", onion: "O" }) as typeof this.previewKeys;
    const { textureKey, presentation } = this.playerDefinition;
    this.onionSprite = this.add.sprite(VIEWPORT_WIDTH / 2, 600, textureKey, PREVIEW_FRAMES[0].name)
      .setAlpha(0.32)
      .setTint(0x69cfff)
      .setScale(presentation.displayScale)
      .setVisible(false);
    this.previewSprite = this.add.sprite(VIEWPORT_WIDTH / 2, 600, textureKey, PREVIEW_FRAMES[0].name)
      .setScale(presentation.displayScale);
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
    this.previewSprite!.setTexture(this.playerDefinition.textureKey, current.name)
      .setOrigin(this.playerDefinition.presentation.originX, current.originY)
      .setPosition(VIEWPORT_WIDTH / 2, 600);
    const previous = PREVIEW_FRAMES[Phaser.Math.Wrap(this.previewIndex - 1, 0, PREVIEW_FRAMES.length)];
    this.onionSprite!.setTexture(this.playerDefinition.textureKey, previous.name)
      .setOrigin(this.playerDefinition.presentation.originX, previous.originY)
      .setPosition(VIEWPORT_WIDTH / 2, 600)
      .setVisible(this.onionEnabled);
    this.refreshPreviewText();
  }

  private refreshPreviewText() {
    const frame = PREVIEW_FRAMES[this.previewIndex];
    const { atlas, presentation } = this.playerDefinition;
    this.previewText!.setText([
      "ATTACK ANIMATION PREVIEW", `frame: ${this.previewIndex} / ${PREVIEW_FRAMES.length - 1}`, `name: ${frame.name}`,
      `x: ${frame.x}  y: ${frame.y}`, `width: ${frame.width}  height: ${frame.height}`,
      `origin: 0.5, ${frame.originY.toFixed(6)}`, `display offset: ${frame.offsetX}, ${frame.offsetY}`,
      `classification: ${frame.classification}`, `speed: ${this.previewSpeeds[this.previewFpsIndex]} FPS`,
      `playing: ${this.previewPlaying}  loop: ${this.previewLoop}  onion: ${this.onionEnabled}`, "",
      "Left/Right frame | Space play/pause | Up/Down FPS | L loop | O onion-skin",
      `All frames use the shared ${atlas.cellWidth}x${atlas.cellHeight} cell, feet anchor (${atlas.feetX}, ${atlas.feetY}), and display scale ${presentation.displayScale}.`,
    ]);
  }

  private isAttackState(state: PlayerState): state is AttackState { return ATTACK_STATES.includes(state as AttackState); }
  private showIdleFrame() { this.playerActor.showIdleFrame(); }
  private setFacing(direction: 1 | -1) { this.facing = direction; this.playerActor.setFacing(direction); }
  private syncVisualsToBody() { this.playerActor.syncVisuals(); if (this.attackBody.enable) this.positionAttackHitbox(); }
  private positionAttackHitbox() {
    const hitbox = this.playerDefinition.attackHitbox;
    const x = Math.round(this.playerBodyZone.x + this.facing * hitbox.offsetX);
    const y = Math.round(this.playerBodyZone.y + hitbox.offsetY);
    this.attackZone.setPosition(x, y);
    this.attackBody.reset(x, y);
  }
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
    this.game.canvas.dataset.encounterEnemyTypes = enemies.map(enemy => enemy.config.id).join(",");
    this.game.canvas.dataset.encounterCameraLocked = String(hasCameraLock(this.cameraLockState, "encounter"));
    this.game.canvas.dataset.cameraLockReasons = this.cameraLockState.reasons.join(",");
  }

  private updateAccessibilityDataset() {
    if (process.env.NODE_ENV === "production") return;
    const settings = this.accessibilitySettings.getSnapshot();
    this.game.canvas.dataset.reducedFlash = String(settings.reducedFlash);
    this.game.canvas.dataset.reducedShake = String(settings.reducedShake);
  }

  private publishGameplaySnapshot() {
    if (!this.enemyManager || !this.playerBodyZone || !this.lifecycleClock) return;
    const snapshot: GameplaySnapshot = {
      flow: this.gameFlow.state,
      player: {
        state: this.state,
        hp: this.playerHp,
        maxHp: this.playerDefinition.lifecycle.maxHp,
        x: this.playerBodyZone.x,
        y: this.playerBodyZone.y,
      },
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
    this.updateAudioDataset();
    this.hud.update();
  }
}
