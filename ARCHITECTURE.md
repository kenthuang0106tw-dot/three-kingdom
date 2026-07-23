# Architecture

## 1. Current Runtime

```text
Next/Vinext page
  └─ React arcade shell
      └─ PhaserGame lifecycle component
          └─ Phaser.Game (1280×720)
              └─ MainScene
                  ├─ Player input/state/animation/physics
                  ├─ Combat effects and combo flow
                  ├─ EnemyManager
                  │   └─ EnemyCombatant × 3
                  ├─ Debug overlays
                  └─ Animation preview modes
```

React 不參與 gameplay update。`PhaserGame.tsx` 動態載入 Phaser 和 `MainScene`，確保 Fast Refresh／React remount 前銷毀舊 instance。正式頁面入口是 `app/page.tsx`，gameplay runtime 只有 Phaser；舊 React Canvas runtime 已移除。

## 2. Current Data Flow

### Player input

1. `PlayerInputController` 在 Scene `create()` 建立 keyboard keys 一次。
2. `readSnapshot()` 每幀讀取 `isDown`，並以 `JustDown` 產生 edge-trigger `attackPressed`。
3. `ActionSnapshot` 提供方向按鈕、normalized movement vector 與攻擊 edge；後續 touch 必須寫入同一 contract。
4. Player body velocity 由當前 snapshot 重算；無輸入下一幀為零。
5. Sprite 跟隨 body zone，腳底 Y 同時決定 depth。

### Player attack

1. `JustDown(J)` 進入 attack state。
2. Phaser animation frame event 控制獨立 attack zone。
3. `playerAttackId` 與 Enemy 的 `lastPlayerAttackId` 防止同段重複命中。
4. MainScene 套用傷害、Flash、Spark、Knockback。
5. 同 frame 多目標只由第一個命中觸發全域 Hit Stop／Camera Shake。

### Enemy flow

1. `EnemyManager` 擁有 EnemyCombatant collection、colliders、Formation 與 Attack Slot。
2. 每隻 EnemyCombatant 擁有獨立 state、HP、sprite、body、attack zone、hit record。
3. Manager 每幀重算站位或攻擊接近方向。
4. 單一 Attack Slot 控制同時出手數量。
5. Hurt／Dead 立即釋放 Attack Slot；死亡動畫完成後移除 collider、listener 與 GameObjects。

## 3. Module Responsibilities

| Module | Owns | Must Not Own |
|---|---|---|
| React shell | Page layout、arcade side art、Phaser host | Actor state、input snapshot、physics、animations |
| `PhaserGame` | Phaser config、instance create/destroy、host focus | Combat rules、enemy AI |
| Scene | Lifecycle、orchestration、world services | 長期堆積所有 actor 細節 |
| Player actor/controller | Input interpretation、state、body、sprite、player attack zone | Enemy collection、stage progression |
| EnemyCombatant | 單一敵人物件與本地 state | 全域 Attack Slot、Camera、Hit Stop |
| EnemyManager | Enemy collection、formation、director、cleanup | Player state、global time scale |
| Combat resolver | Hit eligibility、damage event、attack-local records | Rendering、DOM、Scene navigation |
| Effect director | Hit Stop／Shake 去重與 hit effects 排程 | Damage 判定、AI state |
| Stage director | World bounds、encounters、gates、spawn | Player animation、Enemy attack logic |
| Camera controller | Follow、lock、shake policy | Combat damage |
| Debug overlay | Runtime snapshot visualization | 修改 gameplay state |
| Asset pipeline | Source processing、atlas、metadata、validation | Runtime combat tuning |

## 4. Target Scene Shape

Vertical Slice 建議採最少必要 Scene：

- `BootScene`: preload manifest、全域 animation registration。
- `StageScene`: world、player、enemy、combat、camera、stage progression。
- `UIScene`: HUD、pause、mobile controls；以事件讀取 Stage snapshot。

不要為每個功能建立 Scene。Title／Result 可先由 UIScene 的明確 mode 管理，直到流程複雜度需要獨立 Scene。

## 5. State Machines

### Player

目前：`idle | walk | attack1 | attack2 | attack3 | hurt`。

未來加入 `dead` 前，必須先定義合法 transition。不得使用第二組 `isAttacking` 等 boolean 重複表達 state。

### Enemy

`idle | walk | attack | hurt | dead`。所有 transition 經過單一方法；Attack Slot 是 Manager 資源，不是 Enemy state。

### Stage

規劃為 `entering | traversal | encounter | boss | cleared | failed | paused`。Stage state 不直接設定 actor animation。

## 6. Physics and Coordinate Contract

- 世界位置以腳底座標為基準。
- 地面 body 只覆蓋腳底占位範圍。
- Attack hitbox 永遠是獨立 Arcade Zone。
- Sprite 跟隨 body；禁止只 tween sprite。
- Knockback 修改 physics owner，第一階段只做水平位移。
- Actor depth = rounded feet world Y。
- Walk bounds、attack X/Y range 與 body sizes 必須資料化並集中管理。

## 7. Animation Contract

- Animation key 全域唯一。
- 每個 animation 定義 frame order、FPS、repeat、startup、active、recovery。
- Frame-specific feet anchor 放在 atlas／metadata，不用不同 scale 補償。
- Animation listener 在 create/constructor 註冊一次，destroy 時移除。
- `animationcomplete` 必須檢查 animation key。

## 8. Debug Contract

Development-only：Arcade Physics debug、input diagnostic、attack preview、enemy alignment preview、formation target slots。Production 不顯示 debug body、文字或 target markers。

Debug 只能觀察狀態；不得透過 Debug UI 修正或覆寫正式狀態。

## 9. Asset Pipeline

```text
source image
  → chroma/alpha cleanup
  → frame boundary analysis
  → feet-anchor normalization
  → atlas + metadata
  → debug sheet
  → automated bounds validation
  → runtime load
```

Runtime 不猜測等寬切圖。任何 atlas 改動都必須重新產生 debug sheet 並人工確認。

## Touch Input Contract (M1 / Task 1.2)

`TouchInputController` owns Phaser interactive touch buttons and pointer lifecycle only. It merges current touch direction state and one-shot attack presses with the keyboard snapshot, then emits the same `ActionSnapshot` consumed by `MainScene`. It does not own player state, combat, or React state. All touch objects and listeners are destroyed during Scene shutdown.

## Lifecycle Clock Contract (M1 / Task 1.3)

`LifecycleClock` owns only the `visibility` and `hitStop` pause reasons. It listens to Phaser game `blur`/`focus` events, pauses/resumes the Scene for visibility changes, and pauses Arcade Physics, animations, and tweens during hit-stop. A Phaser `delayedCall` clears hit-stop; no DOM listener, timeout, or interval is used. Gameplay reads the readonly pause state and does not own clock transitions.

## Readonly Gameplay Observation Contract (M1 / Task 1.4)

`GameplayEventHub` is a narrow observation boundary owned by `MainScene`. It publishes frozen primitive snapshots and typed events; player/enemy sprites, bodies, timers, and managers never cross the boundary. Consumers receive an unsubscribe function and cannot mutate the stored snapshot. Debug remains a consumer of Scene state for now and is not an event producer.

## Deterministic Time and Randomness Contract (M1 / Task 1.6)

`GameplayClock` and `RandomSource` are injectable interfaces. Runtime uses `PhaserGameplayClock` plus a seeded `SeededRandom`; tests use `TestClock` and the same seeded adapter. EnemyManager owns no global random state and no longer calls `Phaser.Math.Between` directly. Lifecycle hit-stop continues to use Phaser's real delayed call.

## Responsive Mobile Landscape Contract (M1 / Task 1.7)

The playable surface remains a logical 1280×720 Phaser canvas. `Phaser.Scale.FIT`
and `CENTER_BOTH` fit that surface inside the available viewport without changing
the scene coordinate system or stretching the canvas. The document viewport uses
`device-width`, `initialScale: 1`, and `viewport-fit: cover`; the shell accounts for
safe-area insets and uses `100dvh` bounds while preserving the 32:15 arcade shell
and 16:9 playable stage ratios. Touch controls stay in the 1280×720 scene and are
therefore scaled together with the canvas. React lifecycle ownership remains the
same across resize, orientation, and focus changes.

## Scene Reset Contract (M1 / Task 1.8)

Development query `?resetSmoke=1` restarts `MainScene` ten times through Phaser's
Scene lifecycle. The Scene `SHUTDOWN` handler removes animation listeners,
disables the attack body, destroys touch input, lifecycle clock, enemy manager,
colliders, and owned GameObjects before the next create. Global animation keys are
created only once, so a restart cannot duplicate animation definitions. The smoke
path is development-only and does not alter production gameplay.

## Runtime Asset Manifest Contract (M1 / Task 1.5)

`app/game/assets/AssetManifest.ts` is the single typed list of runtime image and
atlas keys, URLs, and loader kinds. `MainScene.preload()` queues this manifest so
asset keys remain identical to the existing animation and gameplay code. In
development, Phaser's loader `loaderror` event is mapped to a deterministic
required-asset message and removed during Scene shutdown. Production does not
install the reporting listener or add an error UI.

## Player State Machine Contract (M2 / Task 2.1)

`app/game/player/PlayerStateMachine.ts` is a pure transition boundary for
`idle`, `walk`, `attack1`, `attack2`, `attack3`, and `hurt`. It owns only the
current state and allowed transitions; input, animation, physics, combo timing,
and gameplay event publication remain in `MainScene` until later extraction
tasks. Invalid transitions throw deterministic errors, while `reset()` returns
the machine to `idle` for Scene lifecycle reuse.

## Player Actor Contract (M2 / Task 2.2)

`PlayerActor` owns the player sprite, feet-anchored Arcade body zone, body
configuration, facing, display scale, animation frame origin, and sprite/body
synchronization. `MainScene` retains orchestration responsibilities and asks the
actor to move visuals, play the existing animations, or sync depth; attack hitbox
and combat effects remain outside the actor for the next M2 tasks.

## Player Attack Controller Contract (M2 / Task 2.3)

`PlayerAttackController` owns immutable metadata for the three existing attack
stages: Phaser animation key, frame sequence, 8 FPS rate, and startup, active,
and recovery frame indexes. `MainScene` remains responsible for combo input and
state transitions, while the controller answers which animation is active and
whether the current frame enables the independent attack hitbox. It has no
Scene, sprite, camera, UI, or effect references, so timing metadata is tested
without a renderer and can later feed a dedicated combat resolver.

## Combat Resolver Contract (M2 / Task 2.4)

`resolveAttack` is a pure, Phaser-free boundary that receives the current
attack id, damage value, overlapping target snapshots, and the immutable set of
targets already hit by that attack. It returns hit records, remaining HP
values, and a new hit-target set. MainScene still owns overlap detection and
visual effects; EnemyManager still owns enemy state transitions and cleanup.
This keeps camera, flash, spark, knockback, and hit-stop timing out of damage
resolution and leaves those effects for the next extraction.

## Effect Director Contract (M2 / Task 2.5)

`EffectDirector` owns the existing hit presentation and timing effects: white
flash, five-frame hit spark, knockback tween, camera shake, and hit-stop
request. It tracks its timers and tweens for Scene shutdown cleanup and keeps
the established parameters in `EFFECT_PARAMS`. It does not resolve damage,
select targets, transition actors, or own Combo state.

## Player Lifecycle Contract (M2 / Task 2.6)

`PlayerLifecycle` owns HP, the alive/dead life state, damage floor, and reset
behavior without Phaser dependencies. `PlayerStateMachine` adds an explicit
terminal `dead` state; MainScene keeps the existing 300ms hurt lockout and
presentation effects, blocks input while dead, and resets the lifecycle during
Scene creation/restart. Game Over UI and continue flow remain outside this
contract.

## EnemyManager Cleanup Contract (M2 / Task 2.7)

EnemyManager now tracks per-enemy hurt timers and cancels them on state changes,
death, removal, or Scene shutdown. Cleanup disables bodies and attack hitboxes,
removes animation listeners, destroys owned colliders and GameObjects, clears
manager references, and releases the attack slot. Director timing continues to
use injected `GameplayClock` and `RandomSource` services for deterministic tests.

## Combat Room Acceptance Contract (M2 / Task 2.8)

The M2 combat room is accepted through deterministic contracts covering three
formation spawns, attack-slot exclusivity, X/Y attack alignment, minimum enemy
spacing, multi-target resolution, hurt/death cleanup, and surviving-enemy
continuity. Browser smoke additionally verifies one Canvas and ten Scene reset
cycles without duplicate runtime ownership. No StageConfig or camera behavior
is included in this acceptance boundary.

## StageConfig Contract (M3 / Task 3.1)

`app/game/stage/StageConfig.ts` is a Phaser-free, data-only boundary for world
bounds, walk bounds, player and enemy spawn points, encounter references, and
future exit metadata. `BAMBOO_COMBAT_ROOM` preserves the current 1280x720 room
and three enemy coordinates. `validateStageConfig` checks containment, unique
IDs, and encounter references deterministically. MainScene and EnemyManager
consume the configuration without adding camera, scrolling, gates, or stage
flow; those behaviors remain later Stage tasks.

## World/Walk Bounds Contract (M3 / Task 3.2)

`clampStageX`, `clampStageY`, and `clampStagePoint` provide the shared
Phaser-free edge policy. MainScene uses the configured walk rectangle for the
Arcade world bounds and horizontal player/enemy knockback. EnemyManager uses
the same rectangle for formation targets and debug slot markers. No actor owns
a second numeric bounds policy; camera and stage-flow bounds remain separate
future responsibilities.

## Camera Follow Contract (M3 / Task 3.3)

`app/game/camera/CameraFollow.ts` owns the Phaser-free calculation of camera
scroll from a target, world rectangle, and viewport. MainScene applies the
bounded integer scroll and configures camera world bounds while preserving
round-pixel rendering. The current 1280x720 room intentionally resolves to a
zero scroll range; encounter locks and camera policy remain separate tasks.

## Encounter Camera Lock Contract (M3 / Task 3.4)

`CameraLock.ts` is a Phaser-free state contract with an explicit `encounter`
reason. MainScene locks it when the existing combat-room enemies are spawned,
skips follow updates while locked, and unlocks it from the existing all-clear
callback. EnemyManager is not imported by the camera contract; restart resets
the lock state with the Scene lifecycle.

## Spawn and All-Clear Contract (M3 / Task 3.5)

`EncounterFlow.ts` is the Phaser-free state contract for the current room's
spawn count and removed enemy IDs. EnemyManager starts one encounter, ignores
duplicate spawn requests, records removals after cleanup, and emits the
all-clear callback only when every spawned enemy is removed. MainScene owns the
clear presentation and camera unlock; respawn and stage transitions remain
outside this contract.

## Stage Exit and Restart Contract (M3 / Task 3.6)

`StageExit.ts` is a Phaser-free eligibility state: an exit starts locked,
becomes available only after the existing all-clear callback, and can then be
requested. MainScene resets this state with Scene creation and routes the
existing development reset smoke through one `restartStage` lifecycle method.
No second stage, save data, or automatic respawn is introduced.

## Stage Traversal Acceptance (M3 / Task 3.7)

The M3 gate now composes the Phaser-free contracts in one deterministic path:
room encounter starts, three enemies are removed once each, camera unlocks,
the configured exit becomes requestable, and all contracts reset to their
initial states. Browser smoke additionally verifies ten Scene restarts with a
single Canvas and no page errors. M4 content work starts only after this gate.

## EnemyConfig Boundary (M4 / Task 4.1)

`app/game/enemy/EnemyConfig.ts` is a Phaser-free data boundary for the current
soldier's stable tuning: health, movement, detection, attack alignment,
spacing, timing, frame anchor, and display scale. `EnemyManager` consumes the
validated `SOLDIER_ENEMY_CONFIG`; no AI or visual behavior changed. The schema
is intentionally limited to values already used by one archetype.

## Second Melee Soldier (M4 / Task 4.2)

The mauler asset set is a real 4×4 sheet with 15 named frames: idle, walk,
three-stage attack, hurt, and dead. `mauler.atlas.json` records 313×313 frame
rectangles with a shared 0.9 feet pivot; `EnemyConfig.ts` gives it a distinct
150px attack range, 62px walk speed, and longer recovery. The asset is routed
through the manifest but is not yet placed into the current encounter; mixed
composition is reserved for Task 4.4.

## Third Melee Soldier (M4 / Task 4.3)

The duelist asset set adds a real teal masked dual-blade soldier with 15 named
frames, 313x313 atlas rectangles, shared 0.9 feet pivot, and a debug sheet.
`DUELIST_ENEMY_CONFIG` gives it faster movement and recovery than the soldier
and mauler, with a shorter attack range. Its asset is routed through the
manifest but remains out of the current room until mixed-composition work.

## Mixed Encounter Composition (M4 / Task 4.4)

The bamboo combat room now resolves each spawn point to an explicit archetype:
soldier at the front, mauler at the upper rear, and duelist at the lower front.
`EnemyManager` keeps the existing single Attack Director slot while reading
movement, attack, spacing, and animation values from each combatant's immutable
`EnemyConfig`. Pairwise spacing uses the stricter configured minimum, and all
existing Y-alignment, hurt, death, hit-record, and camera-lock cleanup contracts
remain shared. M4 / Task 4.5 is reserved for tuning this deterministic mix.

## Multi-Archetype Regression (M4 / Task 4.6)

All three archetypes intentionally share the same damage, hurt/dead transition,
Attack Director release, object cleanup, collection removal, and encounter-flow
path. Deterministic tests cover all six removal orders and prove that surviving
archetypes remain tracked until the third unique removal. Browser combat/reset
smoke verifies this ownership model survives ten Scene restarts.

## Enemy Facing and Attack Reachability (M4 / Task 4.7)

Each `EnemyConfig` declares the horizontal direction its source art faces.
`EnemyManager` derives `flipX` from that metadata and the combatant's logical
facing, so rendering, movement, and attack-zone direction share one decision.
Animation active-frame metadata uses Phaser's 1-based animation-frame index.

An enemy holding the single Attack Slot gets a 1500 ms approach deadline on the
existing gameplay clock. If bodies or formation prevent it reaching valid X/Y
attack range, it releases the slot and returns to idle so another living enemy
can be selected. This adds no second timer owner and does not alter combat range.

`AttackSlotPolicy.ts` prevents a temporarily misaligned archetype from being
starved by two repeatedly eligible neighbors. Among current eligible candidates,
the manager selects the lowest slot-grant count first, then uses the existing
ID rotation as a deterministic tie-breaker. Each combatant owns its own count;
the policy owns no Phaser object, timer, damage, or movement behavior.

## Boss Lifecycle Boundary (M5 / Task 5.1)

`app/game/boss/BossLifecycle.ts` is the sole owner of the first Boss's HP and
lifecycle state. It is Phaser-free and models inactive, idle, attack, hurt,
dead, and cleaned transitions plus deterministic damage, cleanup, and reset.
`EnemyManager` must never own or instantiate this contract: normal-enemy
Formation and Attack Slot rules do not apply to the Boss. A future Scene-owned
Boss actor may consume the contract after real attack assets exist.

## Boss Attack Metadata (M5 / Task 5.2)

`BossAttackMetadata.ts` defines three Phaser-free attacks with independent
animation keys, frame order, 6 FPS playback, and explicit startup, active,
recovery, and telegraph indexes. `warlord-attacks.atlas.json` provides nine
fixed 448×448 frames and a shared `(224,420)` feet pivot. The manifest preloads
the atlas, but MainScene does not instantiate a Boss or create Boss animations;
decision rhythm and actor integration remain separate future tasks.

## Boss Decision Policy (M5 / Task 5.3)

`BossDecisionPolicy.ts` is a Phaser-free policy that receives the existing
gameplay clock, seeded random source, and `BOSS_ATTACKS` definitions. It selects
one attack only while `BossLifecycle` is idle, keeps that attack pending until
the lifecycle is in `attack`, and starts a deterministic 900–1300ms recovery
when the attack completes. Pending selection and recovery prevent seamless
reselection; `reset()` clears both for Scene restart. The policy owns no actor,
movement, distance, phase, arena, rendering, or `EnemyManager` dependency.

## Boss Actor Lifecycle (M5 / Task 5.4)

`BossActor.ts` is owned directly by `MainScene` and composes `BossLifecycle`,
`BossDecisionPolicy`, the two Boss atlases, one sprite, and one feet-oriented
Arcade body. All lifecycle and attack animation listeners are registered once
and removed by idempotent cleanup. The actor uses one `0.9` display scale and
the shared `(224,420)` feet anchor for idle, hurt, phase, death, and attacks.

Player attack overlap is resolved through the existing `CombatResolver` and
`EffectDirector`; `EnemyManager` does not import or own the Boss. Arena bounds,
Boss-to-player attack damage, stage-complete events, HUD, audio, and a reusable
Boss framework remain outside this actor boundary.

## Boss Arena and Camera Ownership (M5 / Task 5.5)

`BAMBOO_BOSS_ARENA` is the one concrete arena configuration for the current
single-room prototype. It deliberately reuses `BAMBOO_COMBAT_ROOM.walkBounds`,
so Arcade world bounds and Boss knockback cannot disagree or create a second
clamping path.

`CameraLockState` stores independent `encounter` and `boss` reasons. MainScene
acquires the Boss reason after creating the Boss actor and releases only that
reason from the actor's idempotent cleanup callback. Releasing one reason never
removes another owner. Development mode draws the arena boundary and exposes
lock ownership on the Canvas; production contains no debug presentation.

## Stage Completion Event (M5 / Task 5.6)

`StageCompletionGate` owns one-shot completion publication for a Scene run and
is reset in `MainScene.create()`. `BossActor` reports whether cleanup followed
defeat or ordinary destruction; MainScene first releases the Boss arena, then
publishes one frozen `stage-completed` event through the existing
`GameplayEventHub` only for defeated cleanup.

The payload contains only `type`, `stageId`, and `at`. It exposes no Boss,
Scene, sprite, physics, UI, or mutable state reference. Result presentation and
game-flow transitions remain future consumers rather than event responsibilities.

## Milestone 5 Integrated Acceptance (M5 / Task 5.7)

The accepted stage path composes existing Phaser-free contracts in this order:
encounter ownership, independent encounter/Boss camera locks, Boss lifecycle,
Boss cleanup, arena release, and one `stage-completed` publication. Restart
resets the completion gate, lifecycle, encounter flow, and camera-lock state.

This task added regression coverage only. It introduced no new runtime module or
ownership path; `MainScene` remains the composition root, `EnemyManager` owns
normal enemies, and the Scene-owned `BossActor` remains outside that manager.

## Game-flow State Contract (M6 / Task 6.1)

`app/game/flow/GameFlowStateMachine.ts` is the sole Phaser-free contract for
product modes: `title`, `playing`, `paused`, `failed`, and `cleared`. Legal
transitions are explicit; `failed` and `cleared` are terminal until
`resetForNewRun()` returns the contract to `title`.

The contract owns no Scene, actor, input, React state, UI, timer, or persistence.
It is intentionally not connected to `MainScene` until Title/start presentation
has a real consumer in Task 6.2, preventing a second lifecycle owner or a hidden
change to the accepted M0–M5 runtime.

## Title/start Ownership (M6 / Task 6.2)

`TitleStartController` maps Phaser keyboard or pointer input to the one
`GameFlowStateMachine`. `MainScene` owns a single presentation-only overlay and
blocks gameplay updates while the flow is `title`; starting destroys only the
overlay and transitions the existing run to `playing` without restarting the
Scene or recreating actors.

React remains limited to the Phaser host lifecycle. Scene shutdown removes the
one keyboard listener and any remaining overlay. The input edge used for Title
start is consumed before gameplay resumes, preventing a J-key start from also
triggering an attack.

## Vertical Slice Recovery Boundary (Planning Correction 2026-07-14)

The accepted M3 modules are foundation contracts for bounds, camera math,
encounter state, exits, and reset; they do not constitute the originally
promised three-screen playable stage. Runtime remains one 1280×720 world, so
camera follow has no visible scroll range. The accepted M5 modules likewise
prove Boss lifecycle, presentation, cleanup, arena-lock ownership, and
completion-event ordering, but the Boss has no locomotion, alignment policy,
player-damaging hitbox, or real stage-entry sequence.

Milestone 5R now owns the missing composition work. It must reuse the existing
contracts rather than introduce parallel Stage, Camera, Boss, or flow state.
M6.1–6.2 remain valid consumers; M6.3 and later product UI are blocked until the
Recovery end-to-end gate passes.

## End-to-end Vertical Slice Acceptance Contract (M5R / Task 5R.8)

The recovery boundary is now closed by real-input acceptance rather than a
diagnostic shortcut. Desktop keyboard/pointer and both mobile FIT viewports
traverse the Stage-owned encounter sequence, activate the Boss through the
Stage-owned entry gate, and reach the existing terminal flow. A separate failed
run uses the same explicit Scene restart ownership and returns to Title with all
actors, locks, timers, hitboxes, camera state, HP, and progression reset.

Player attacks continue to resolve only against independent Arcade Physics
zones. The attack zone is vertically aligned with the feet-based occupancy
bodies, so a valid 2.5D Y alignment can overlap without changing sprite origin,
damage, animation timing, or actor body ownership. Development-only Canvas
datasets expose readonly state, position, HP, and encounter observations for
acceptance; they do not drive gameplay and are absent from production behavior.

M6 may now resume at Task 6.3. Product UI must consume the readonly gameplay
snapshot/event boundary and must not reopen Stage, Boss, input, or reset
ownership.

## Three-screen Traversal Contract (M5R / Task 5R.1)

`BAMBOO_COMBAT_ROOM` now describes one 3840×720 world with three explicit,
contiguous 1280×720 background sections. Validation rejects gaps, vertical
misalignment, duplicate section IDs, or incomplete world coverage. The Phaser
Canvas remains a fixed logical 1280×720 surface.

MainScene renders sections from Stage data, sets Arcade Physics to the shared
3700px walk rectangle, and applies the accepted bounded integer camera helper.
Normal play begins with no encounter or Boss camera lock; diagnostic Boss smoke
retains explicit lock ownership. Ordinary enemy entry is now owned by the
ordered encounter contract below. Boss entry sequencing remains exclusively
owned by Task 5R.3.

## Two Encounter Gate Contract (M5R / Task 5R.2)

`StageConfig` is authoritative for two ordered trigger rectangles and their
existing spawn-point IDs. The Phaser-free `EncounterSequenceState` owns only
progression: next trigger, active encounter, cleared IDs, forward-entry checks,
and reset. It does not create actors or control the camera.

`MainScene` observes the player's previous/current feet position, asks the pure
sequence to advance, resolves the selected Stage spawn group, and acquires the
existing `encounter` camera lock at the current bounded scroll position. While
that lock is active the player is clamped to the locked viewport. On the
EnemyManager all-clear callback, MainScene clears the active encounter and
releases only the `encounter` reason.

`EnemyManager` owns only the currently requested spawn group and uses monotonic
enemy IDs across both encounters. It does not choose triggers, progression, or
Boss activation. Scene creation resets the sequence and manager ownership, so
restart cannot retain completed triggers, actors, or camera locks. Boss entry is
deliberately not coupled to encounter completion in this task.

## Boss Arena Entry Contract (M5R / Task 5R.3)

`BAMBOO_BOSS_ARENA.entryTrigger` is the authoritative Stage coordinate for Boss
entry. The Phaser-free `BossEntryState` owns only `locked`, `eligible`, and
`active`: clearing both ordinary encounters makes it eligible; one forward,
Y-aligned trigger crossing makes it active; active entry cannot retrigger.

`MainScene` remains the composition boundary. Encounter all-clear changes only
entry eligibility and never calls Boss internals. On entry activation, the Scene
creates the one Scene-owned `BossActor`, acquires the existing `boss` camera-lock
reason, sets the authoritative arena scroll, and clamps the player to arena
bounds while that lock exists. Normal Scene creation owns no Boss actor.

Boss cleanup retains the existing order: destroy actor resources, release only
the `boss` lock, then publish the one stage-completion event for a defeated Boss.
Restart resets entry state, Boss ownership, camera locks, and completion. The
development Boss smoke remains an isolated fixture and does not run ordinary
encounter progression.

## Boss Locomotion Contract (M5R / Task 5R.4)

`BossLocomotion.ts` is a Phaser-free policy boundary. Given Boss state, Boss
feet, player feet, and the previous facing, it returns velocity, facing,
movement, and attack-eligibility decisions. Idle locomotion first aligns the Y
axis, then approaches or separates on X; attack eligibility is true only in the
configured X band and Y tolerance. Non-idle lifecycle states always return zero
velocity.

`BossActor` owns the Arcade body, one shared display scale, animation switching,
source-facing conversion, and arena clamping. `MainScene` supplies only the
player feet and Stage-owned arena bounds. The decision policy may choose an
attack only after locomotion reports eligibility; attack hitboxes and player
damage remain a separate 5R.5 responsibility.

The lifecycle atlas contains four distinct `walk-*` frames at the same feet
anchor as idle/hurt/phase/dead. Animation frames never move the world body, and
movement never uses sprite-only tweens.

## Boss Attack Hitbox and Player Damage Contract (M5R / Task 5R.5)

`BossAttackMetadata.ts` is authoritative for each attack's startup, active,
recovery, and hitbox geometry. `BossAttackCombat.ts` keeps active-frame,
left/right placement, feet-lane tolerance, and once-per-swing eligibility as a
Phaser-free contract. `BossActor` alone owns the independent Arcade Physics
attack zone and its one Scene-lifecycle animation-update listener.

`MainScene` resolves overlap between that zone and the Player ground body, then
routes a consumed Boss hit through the same Player damage path already used by
ordinary enemies. Boss code does not own Player HP, flash, hit stop, knockback,
or hurt recovery. Animation completion, Boss damage, and Scene shutdown all
disable the zone; actor destruction removes both animation listeners and the
zone so restart cannot retain a collider or hit record.

## Player Failure and Deterministic Restart Contract (M5R / Task 5R.6)

`PlayerLifecycle` remains the sole HP/death owner and `GameFlowStateMachine`
remains the sole product-mode owner. When terminal damage is accepted,
`MainScene` transitions Player state to `dead` and game flow exactly once to
`failed`; it no longer schedules an automatic death restart.

Failed mode is a Scene orchestration boundary. Player velocity and attack
hitbox are stopped, `EnemyManager.suspendCombat()` stops every body, attack
zone, animation, Attack Slot, and owned state timer, and
`BossActor.suspendCombat()` stops its body, animation, and attack zone. Scene
`update()` returns before input, encounter, Enemy, Boss, or combat processing.

One Phaser-owned failure overlay accepts a keyboard or pointer/touch edge and
routes both through `restartAfterFailure()`. That method is valid only while
flow is `failed` and uses the existing `scene.restart()` lifecycle. Scene
shutdown removes the keyboard listener, smoke timer, overlay, actors, hitboxes,
colliders, and managers; the next `create()` resets flow to Title and rebuilds
the documented initial Stage state.

## Boss Defeat and Cleared Flow Contract (M5R / Task 5R.7)

`BossActor` still owns death animation, the 500ms fade, and idempotent resource
cleanup. Its cleanup callback reports `defeated` or `destroyed`; `MainScene`
then clears the actor reference and releases the Boss arena for either reason.
Only a `defeated` callback received while game flow is `playing` may continue.

The successful terminal order is fixed: Boss cleanup, arena release, one
`StageCompletionGate` publication, then one `GameFlowStateMachine` transition
to `cleared`. Duplicate callbacks, ordinary destruction, Title, `failed`, and
an already-completed gate cannot publish again or enter cleared.

Cleared mode stops the Player body and attack zone, suspends `EnemyManager`,
clears the current action snapshot, and returns from Scene `update()` before
gameplay input, encounter progression, AI, damage, or camera progression. The
Phaser-owned `ResultController` remains responsive and accepts exactly one replay
request; `failed` and `cleared` stay mutually exclusive until their explicit
Scene restart paths rebuild a new Title run.

## Phaser HUD Observation Boundary (M6 / Task 6.3)

`GameHud` owns only Phaser containers, graphics, and text. It is created once by
`MainScene`, uses `setScrollFactor(0)`, updates existing objects, and is destroyed
with the Scene. React remains limited to mounting the Phaser lifecycle.

HUD data crosses only `GameplayEventHub.getSnapshot()`. The frozen snapshot now
contains primitive flow, Player HP/max HP, nullable Boss HP/max HP, enemies, and
lifecycle state; no actor, sprite, body, manager, or callback crosses the
boundary. `HudViewModel` clamps deterministic bar values independently of
Phaser. Boss cleanup publishes `null`, so reset cannot retain a stale Boss bar.

## Pause/Resume Ownership (M6 / Task 6.4)

`PauseController` owns one Phaser keyboard `keydown-P` listener, one fixed touch
button, and one presentation-only overlay. It converts keyboard or pointer edges
into a single toggle request; key repeat is ignored. `MainScene` remains the sole
orchestrator of legal `playing → paused → playing` transitions. React, DOM state,
actors, and the HUD do not own pause state.

`LifecycleClock` keeps `manual`, `hitStop`, and `visibility` as independent pause
reasons. Manual pause sets the Scene clock time scale to zero so TimerEvents stop
without disabling Phaser keyboard input, then pauses Arcade Physics, global
animations, and tweens while any reason remains. Resume clears only `manual`, so
an active Hit Stop continues to own the freeze until its Phaser timer completes.

Paused updates stop Player velocity and return before input snapshots, encounter
progression, AI, combat, or camera follow. Actor states, HP, animation frame,
hitboxes, encounter/Boss ownership, and camera locks are preserved rather than
rebuilt. Resume clears transient touch and attack edges, then the next frame reads
current input normally. Scene shutdown removes listeners and GameObjects, clears
pause reasons, restores clock time scale, and safely resumes managers that still
exist during Phaser shutdown ordering.

## Failure/Restart Ownership (M6 / Task 6.5)

`FailureController` owns one persistent Phaser keyboard listener, one fixed
pointer surface, and one three-object failure overlay for the Scene lifetime.
The controller never changes game flow or restarts the Scene. Keyboard and touch
edges enter `FailureRestartGate`, which accepts at most one source each time the
failed presentation opens; `MainScene.update()` consumes that request and remains
the only caller of the failed-only `restartAfterFailure()` lifecycle path.

All overlay children use camera-fixed coordinates. This is required for Phaser
pointer hit testing after the camera reaches the Boss arena, not only for visual
placement. `hide()` closes the request gate before `scene.restart()`, and Scene
shutdown removes both input handlers and destroys the fixed GameObjects. The
next `create()` rebuilds Title, Player, Stage, encounter, Boss, camera, Pause,
HUD, and Failure ownership from their documented initial state.

## Result/Replay Ownership (M6 / Task 6.6)

`ResultController` owns one persistent Phaser keyboard listener, one fixed
pointer surface, and one four-object Result overlay for the Scene lifetime.
Keyboard and touch edges enter `ResultReplayGate`, which accepts at most one
source each time the cleared presentation opens. The controller never publishes
stage completion, changes flow, or restarts the Scene.

`MainScene` enters `cleared` only after Boss cleanup releases the arena and the
`StageCompletionGate` publishes once. It then suspends combat and opens Result.
`update()` consumes the accepted request and is the only caller of the
cleared-only `replayAfterClear()` path. That path closes Result before the
existing Scene restart rebuilds Title, HP, encounters, Boss eligibility, camera
locks, Pause, Failure, HUD, and Result from the documented new-run state.

Failure and Result keep independent gates that remain closed outside their own
terminal mode. Scene shutdown removes both Result input handlers, cancels the
development smoke timer, and destroys the camera-fixed overlay. Development
telemetry verifies lifecycle ownership but is not emitted by production builds.

## UI/Mobile Acceptance Boundary (M6 / Task 6.7)

The world remains 1280×720 and Phaser Scale FIT/CENTER_BOTH maps it into desktop,
844×390 landscape, and 390×844 portrait viewports. CSS owns only the arcade shell,
safe-area padding, aspect ratio, pixel rendering, and host focus; it does not own
gameplay state or animation. Title, HUD, Pause, Failure, Result, joystick, and
attack input remain Phaser objects with camera-fixed coordinates.

Both production build paths explicitly compile `process.env.NODE_ENV` from the
Vite mode. This is an architectural boundary: development may expose Physics
debug and dataset telemetry, while production must contain neither. React still
owns exactly one Phaser mount/destroy lifecycle and no product-flow state.

## Encounter-clear Camera Handoff Contract (M5R / Task 5R.9)

`CameraFollow.ts` owns a Phaser-free handoff policy in addition to the existing
bounded follow calculation. `beginCameraHandoff()` captures the camera's current
scroll before `MainScene` releases the `encounter` lock. While active,
`advanceCameraHandoff()` follows the current bounded target at 960px/s with a
hard maximum of 32px per update, including a stalled frame. This prevents the
former one-frame jump while still converging if the player continues moving.

`MainScene` is the composition boundary: it supplies `game.loop.delta`, rounds
the returned scroll before applying it to the pixel camera, and keeps camera
shake independent from follow ownership. A new encounter lock or Boss arena
lock explicitly ends the handoff because those systems provide an authoritative
scroll. Enemy death, combat timing, player position, gates, and lock ownership
are not delayed or modified to hide the transition.

Development-only `cameraHandoffSmoke` telemetry records consecutive scroll
samples and maximum frame delta across both encounters. It observes the real
Scene progression but is absent from production. The accepted three-viewport
run reduced the former 460px release-frame jump to 16–17px and converged to the
normal target without a soft lock.

## Cast Visual Contract (M6A / Task 6A.3)

Runtime identity remains config-driven: `EnemyConfig` owns one display scale,
source-facing direction, cell size, and feet anchor per ordinary archetype;
`BossActor` owns the same visual contract for both Boss atlases. Animation
switching never changes scale or world feet Y. Body and attack-zone geometry
remain independent from source-cell dimensions.

`tools/build_cast_consistency_art.py` is the reproducible orchestration boundary.
It rebuilds three enemy atlases from preserved source art, runs the existing two
Boss builders, and emits provenance, alpha-bound, feet-line, onion, silhouette,
and lineup QA. The development-only cast preview observes runtime textures and
does not participate in gameplay, AI, collision, or production presentation.

The accepted logical idle heights are Soldier 213.06px, Duelist 212.44px,
Mauler 239.8px, and Boss 300.99px against Guan Yu 230.4px. Soldier/Boss source
art faces left; Mauler/Duelist faces right. `enemySpriteShouldFlip` and the Boss
source-facing rule remain the only runtime mirroring boundaries.

## Stage Visual Contract (M6A / Task 6A.4)

`StageConfig` remains the gameplay geometry owner and now declares three
ordered visual layers for each immutable 1280×720 section. Background, ground,
and foreground use depths `-1000`, `-900`, and `640`; texture keys are unique,
validated, and loaded only through `AssetManifest`. `MainScene` composes these
declarations into image objects but does not derive collision, camera locks,
encounter triggers, spawns, or Boss coordinates from image pixels.

The three sections still form one 3840×720 world. Visual generation and seam
normalization belong to `tools/build_bamboo_stage_art.py`, not runtime code.
Metadata records source hashes, prompt IDs, palette, seam width, alpha bounds,
and the explicit `gameplayCoordinatesChanged: false` decision. Foreground
occlusion is decorative and must stay below HUD/mobile controls and outside the
central combat-readability band.

## Effects and Product UI Visual Contract (M6A / Task 6A.5)

`AssetManifest` is the sole preload boundary for the combat-effects atlas,
product UI images, and `dragon-pixel` bitmap font. `EffectDirector` owns effect
presentation and animation creation, but accepted damage, Hit Stop, flash,
shake, knockback, Combo, and camera contracts remain outside the art pipeline.
Player, Enemy, and Boss actors own only the lifecycle and feet-position sync of
their ground-shadow image; shadow pixels never define physics or depth.

`UiArt.ts` is a presentation helper for bitmap text and reusable nine-slice
frames. Title, HUD, Pause, Failure, Result, and touch controllers retain their
existing state, input, safe-area, and listener ownership. React still owns only
the outer cabinet and Phaser mount lifecycle. Product UI must never mutate actor
state or derive gameplay rules from image dimensions.

`tools/build_effects_ui_art.py` converts preserved imagegen sources into
runtime PNG/atlas/font assets, records hashes and extraction rectangles, and
generates visual QA sheets. Runtime coordinates and timing are explicitly
frozen; M6A.6 may measure and document the accepted set but must not redesign it.

## 10. External and Optional Infrastructure

Cloudflare Worker、D1、Drizzle、ChatGPT auth 與 examples 是 starter infrastructure，目前不在 gameplay data flow。除非 Sprint 明確需要存檔、排行榜或身份功能，禁止讓 gameplay 依賴這些服務。

TypeScript 以兩個明確 project boundary 驗證：`tsconfig.json` 覆蓋正式 `app/**` gameplay/browser source，`tsconfig.worker.json` 只覆蓋 Cloudflare Worker。未啟用的 examples、DB 與 build tooling 不得污染正式 app typecheck。
