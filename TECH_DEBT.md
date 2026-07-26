# Technical Debt Register

更新規則：每項債務必須有 Evidence、Impact、Resolution、Target。修復後移至文末 Resolved，不直接刪除紀錄。

## High

### TD-H03 — MainScene owns too many responsibilities

- **Evidence:** 約 571 行，同時處理 input、player state、combo、effects、debug 與 previews。
- **Impact:** 任一新功能容易破壞玩家輸入或戰鬥時序。
- **Resolution:** 依 M1/M2逐步抽出 Input、Player、Combat Effect、Debug；禁止一次性 rewrite。
- **Target:** M1–M2。

### TD-H05 — Mobile is a release target but has no Phaser touch input

- **Evidence:** 正式 Phaser input 只有 keyboard；舊 mobile DOM controls 屬未使用 legacy runtime。
- **Impact:** 手機使用者無法操作。
- **Resolution:** Phaser UI/input action layer；不得復用 DOM gameplay controls。
- **Target:** M1。

## Medium

### TD-M02 — Combat tuning constants are split across modules

- **Evidence:** Player effects在 `MainScene.ts`，Enemy timing/formation 在 `EnemyManager.ts`。
- **Impact:** 調整手感難以 review，測試沒有單一參照。
- **Resolution:** M2/M3 時建立最小 config modules，不做通用配置框架。
- **Target:** M2–M3。

### TD-M03 — Asset pipeline is incomplete

- **Evidence:** Enemy 有重建工具與 metadata；Guanyu atlas 產生工具未保留；Zhang Fei/Zhao Yun 無 atlas。
- **Impact:** 素材無法可靠重製或驗證。
- **Resolution:** 每種 layout 建立可重跑工具與 validation。
- **Target:** M0 asset documentation；M2/M3/M8 implementation。

### TD-M04 — Optional full-stack starter infrastructure is unused

- **Evidence:** D1 schema 空白，R2/D1 hosting bindings為 null，auth/examples 未被遊戲引用。
- **Impact:** 增加認知負擔與 typecheck surface。
- **Resolution:** M0 決定隔離或保留；在需要存檔／排行榜前不接 gameplay。
- **Target:** M0。

### TD-M05 — EnemyManager couples rendering, physics and AI

- **Evidence:** Combatant constructor 建立 GameObjects；Manager 同時處理 steering、animations、colliders、debug。
- **Impact:** 新 archetype 與測試會變困難。
- **Resolution:** 先以 tests 固定現況；只有第二 archetype 接入時才抽出 config/actor boundary。
- **Target:** M3。

## Low

### TD-L01 — Next image lint warnings

- **Evidence:** Side art 使用原生 `<img>` 產生四個 warning。
- **Impact:** LCP 警告；不影響 Phaser gameplay。
- **Resolution:** 評估保留原生 pixel rendering或配置 Image component；不要為消 warning 破壞像素縮放。
- **Target:** M0/M8。

### TD-L02 — Large client chunk warning

- **Evidence:** Build 報告 chunk 大於 500KB，主要包含 Phaser。
- **Impact:** 首次載入時間與手機流量。
- **Resolution:** M8 量測後再決定 lazy loading/code split。
- **Target:** M8。

### TD-L03 — Unused scene/reference assets

- **Evidence:** `mounted.png`、`enemies.png` 等未在正式 runtime 載入。
- **Impact:** Repository 體積與 ownership 不清楚。
- **Resolution:** Asset inventory 標示 reference/source/runtime；確認後清理。
- **Target:** M0/M8。

### TD-H05 Update — 2026-07-12

Phaser touch controls are now implemented through `TouchInputController` and merged into the shared action snapshot. Desktop/browser smoke passed; physical iOS/Android validation remains part of M1 / Task 1.7.

### TD-H07 — Physical visibility lifecycle not yet validated

- **Evidence:** Browser focus-change smoke passed, but no physical mobile browser is available in the current harness.
- **Impact:** Safari/Android background suspension behavior still needs release validation.
- **Resolution:** Validate on physical devices during M1.7 responsive mobile acceptance.
- **Target:** M1.7

### TD-H08 Update — Gameplay observation boundary added

`GameplayEventHub` now provides frozen primitive snapshots and typed events without actor references. UI/Audio/Debug consumers can be migrated incrementally; MainScene remains the current publisher until later ownership extraction.

### TD-M09 Update — Deterministic timing seams added

EnemyManager now receives `GameplayClock` and `RandomSource` services. Runtime uses a fixed seed and Phaser clock; tests can reproduce director delays and recovery timing with `TestClock`. Full deterministic combat simulation remains future work.

### TD-H05 Update — 2026-07-12

The logical 1280×720 canvas now has a FIT/safe-area mobile landscape contract;
physical iOS/Android smoke is still pending and remains a release-QA item.

### TD-H07 Update — 2026-07-12

Browser viewport resize smoke passed with one Canvas and no visible runtime error.
Physical orientation and background-suspension behavior still need device validation.

### TD-H09 Resolved — 2026-07-12

Scene reset cleanup is now exercised by a ten-cycle development smoke path. Phaser
animation definitions are idempotent and Scene shutdown removes runtime listeners,
timers, colliders, touch input, and enemy resources.

### TD-M03 Update — 2026-07-12

Runtime asset ownership is now explicit through a typed manifest and deterministic
development load-error reporting. Character expansion and full asset QA metadata
remain future work.

### TD-M05 Update — 2026-07-12

Player transition rules are now isolated and tested. MainScene still owns actor
visuals, physics, input, and combat orchestration until the next M2 extraction.

### TD-M05 Update — 2026-07-12

Player sprite, feet anchor, and Arcade body ownership are now isolated in
`PlayerActor`. MainScene still owns input and combat orchestration until the next
M2 extraction.

### TD-M05 Update — 2026-07-12

Player attack frame timing is now isolated in a pure controller and consumed by
MainScene. Combo input and combat resolution remain orchestration concerns;
CombatResolver extraction is the next M2 task.

### TD-M02 Update — 2026-07-12

Player attack target selection, damage calculation, and per-attack hit records
now pass through a pure `CombatResolver`. Hit presentation and timing effects
remain in MainScene until the planned EffectDirector extraction.

### TD-M02 Update — 2026-07-12

Hit presentation and timing effects now have an `EffectDirector` boundary with
explicit shutdown cleanup. Actor state and combat resolution remain separate;
player hurt/dead/restart behavior is the next M2 extraction.

### TD-M02 Update — 2026-07-12

Player HP, terminal death, and Scene reset now use a Phaser-free lifecycle
contract. Game Over presentation remains intentionally deferred; EnemyManager
cleanup and director test coverage is next.

### TD-M05 Update — 2026-07-12

EnemyManager now cancels per-enemy state timers and performs explicit body,
hitbox, listener, collider, and GameObject cleanup on removal and shutdown.
Director timing remains injectable and deterministic; full combat-room
acceptance is the next milestone gate.

### TD-M02 Update — 2026-07-12

M2 combat-room acceptance now covers the three-enemy runtime contracts and
reset smoke. Remaining physical-device and long-session QA is deferred before
Stage work; the next implementation task is StageConfig.

### TD-M03 Update — Stage configuration boundary

M3 / Task 3.1 now provides a Phaser-free, validated configuration for the
current bamboo room. Camera movement, encounter gates, and full stage flow are
intentionally deferred to later tasks; no new runtime behavior was introduced.

### TD-M03 Update — Shared walk bounds

M3 / Task 3.2 now centralizes coordinate clamping in the Phaser-free StageConfig
helper and applies it to player/enemy room movement and knockback. Camera
viewport policy is intentionally deferred to the next Stage task.

### TD-M03 Update — Bounded camera follow

M3 / Task 3.3 now calculates bounded, integer camera scroll through a pure
helper and applies it from MainScene. The current room is the same size as the
logical viewport, so no visible scroll is introduced; encounter lock behavior
remains deferred.

### TD-M03 Update — Encounter camera lock

M3 / Task 3.4 adds an explicit Phaser-free encounter lock reason owned by
MainScene. The existing combat room locks follow while enemies are active and
releases it through the all-clear callback; full encounter gates remain deferred.

### TD-M03 Update — Spawn and all-clear contract

M3 / Task 3.5 now makes the current room's single spawn and all-clear lifecycle
explicit and deterministic. Duplicate spawn requests and duplicate removal
notifications are ignored; respawn and stage transitions remain deferred.

### TD-M03 Update — Stage exit and restart

M3 / Task 3.6 now models the current room's exit eligibility separately from
presentation and routes restart through Scene lifecycle cleanup. There is still
no second stage or automatic transition, by design.

### TD-M03 Resolved — Stage traversal acceptance

M3 / Task 3.7 validates the complete current-room contract path and reset
behavior. Future content can build on the accepted boundaries without changing
the existing combat-room ownership model.

### TD-M04 Update — EnemyConfig boundary

M4 / Task 4.1 centralizes the existing soldier's stable tuning in a validated,
Phaser-free config. It intentionally does not introduce an archetype framework;
the next task must prove a real second-melee difference before generalizing.

### TD-M04 Update — Second melee soldier assets

M4 / Task 4.2 adds a real mauler sprite sheet, atlas metadata, debug sheet, and
distinct config values. It is intentionally not mixed into the current room;
encounter composition remains a later acceptance task.

### TD-M04 Update — Third melee soldier assets

M4 / Task 4.3 adds the real duelist sprite sheet, atlas metadata, debug sheet,
and distinct config values. Both additional archetypes remain routed but not
spawned until the mixed-composition task validates director fairness and cleanup.

### TD-M04 Update — Mixed encounter composition

M4 / Task 4.4 now routes one soldier, one mauler, and one duelist through the
same deterministic room. Per-archetype tuning stays in validated config data;
the existing single Attack Director and cleanup contracts remain shared. A
short encounter-tuning pass is still needed before balancing is considered
complete; no generic enemy framework was introduced.

### TD-M04 Update — Encounter tuning pass

M4 / Task 4.5 raises mixed-room durability to 12 total HP and narrows the
director/recovery ranges into a deterministic 36-second reference budget. This
is a contract estimate based on one successful hit every three seconds, not a
substitute for later physical-player balancing. Y dodge space, single-attacker
ownership, and per-archetype movement differences remain intact.

### TD-M04 Resolved — Multi-archetype regression

M4 / Task 4.6 covers every removal order for soldier, mauler, and duelist and
confirms that the shared damage/removal paths do not branch by archetype. Attack
slot release, survivor continuity, cleanup ownership, encounter progress, and
ten Scene restarts are accepted. Milestone 4 can now close without introducing
a broader enemy framework.

### Resolved M4 Regression — Mixed enemy facing and reachability

Soldier art faces left while mauler and duelist art face right, but the runtime
previously applied one global flip rule. The two later archetypes also selected
Phaser animation index 1 as active even though their real `attack-1` pose is
index 2. Per-config source facing, corrected 1-based active indices, and a
1500 ms Attack Slot approach deadline now prevent reversed presentation and a
permanently blocked attacker. Follow-up browser revalidation exposed candidate
starvation when two aligned enemies alternated until Player HP reached zero.
A Phaser-free least-grants-first policy with deterministic ID tie-breaking now
ensures every eligible archetype receives a turn. Boss walk behavior remains a
separate deferred M5 limitation and was not changed by this repair.

### TD-M05 Update — Boss ownership contract

M5 / Task 5.1 establishes a Phaser-free `BossLifecycle` with one state field,
HP, legal transitions, damage/death entry, explicit cleanup, and reset. It is
not instantiated by `EnemyManager` or the current Scene. Rendering, physics,
attacks, AI, arena rules, and presentation stay intentionally undefined until
their concrete tasks provide requirements.

### TD-M05 Update — Boss attack assets

M5 / Task 5.2 adds nine original Boss attack frames, explicit source rectangles,
one shared scale/feet anchor, atlas metadata, debug QA, and a reproducible build
tool. The attacks remain unspawned and AI-free. Idle, walk, hurt, dead, arena,
and actor integration are still missing; the next task may define decision
rhythm but must not treat these attack-only assets as a complete Boss actor.

### TD-M05 Update — Boss decision rhythm

M5 / Task 5.3 adds a Phaser-free attack-selection policy with deterministic
seeded choices, explicit pending-attack ownership, and 900–1300ms post-attack
recovery. It intentionally accepts the existing attack definitions as a
dependency and remains unconnected to `MainScene` until a real Boss actor
exists. Distance, movement, phase, arena, and presentation decisions remain
undefined rather than being guessed early.

### TD-M05 Update — Boss actor lifecycle

M5 / Task 5.4 connects one Scene-owned Boss actor with real idle, hurt,
phase-transition, and death presentation. Lifecycle cleanup is idempotent,
animation completion has one listener, and Scene restart destroys ownership.
The actor intentionally has no arena ownership, player-damaging attack hitbox,
walk behavior, HUD, audio, or stage-clear publication. Those are explicit
remaining tasks rather than hidden temporary behavior.

### TD-M05 Update — Boss arena ownership

M5 / Task 5.5 gave camera locks independent `encounter` and `boss` ownership
and reuses the room walk bounds as the current Boss arena. This removes early
unlock and competing-clamp risks without adding a general arena framework.
At that acceptance point the world was still one 1280×720 room. M5R.1 has since
expanded traversal; multi-screen arena entry remains Task 5R.3.

### TD-M05 Update — Stage completion publication

M5 / Task 5.6 adds one frozen primitive `stage-completed` event with a resettable
one-shot gate. Boss cleanup distinguishes defeat from Scene destruction, so
restart cannot publish a false clear. No current UI consumes the event; Result,
game-flow, persistence, scoring, and audio remain intentionally deferred.

### TD-M05 Update — Full-stage acceptance

M5 / Task 5.7 verified the existing stage contracts as one deterministic run
and across desktop, landscape-touch, portrait-fitted, and ten-restart browser
smokes. No acceptance failure required a runtime patch. Remaining limitations
at that acceptance point included a 1280×720 room. M5R.1 has since resolved the
three-screen traversal gap; Boss damage, Boss walk behavior, Result UI, HUD,
audio, scoring, persistence, and physical-device feel remain deferred.

### TD-M06 Update — Game-flow ownership contract

M6 / Task 6.1 adds a pure state contract before any product UI is introduced.
The contract prevents Title, Pause, Failure, and Result consumers from inventing
competing modes. It is deliberately not wired to `MainScene` yet; Task 6.2 must
connect one Title/start consumer without duplicating Phaser Scene or React
lifecycle ownership. Pause timing, continue rules, Result presentation, and
persistence remain deferred to their dedicated tasks.

### TD-M06 Update — Title/start presentation

M6 / Task 6.2 connects the flow contract to one Phaser-owned overlay and keeps
React free of product state. The current Title deliberately uses system text and
the accepted room behind an opaque shade; custom Title art and font assets remain
asset work, not a hidden dependency of the flow contract. HUD, Pause, Failure,
Result, and persistence remain separate tasks.

### TD-M06 Update — Player/Boss HUD

M6 / Task 6.3 adds a Phaser-owned HUD that consumes only the frozen gameplay
snapshot. The HUD creates a fixed 13 GameObjects per Scene and mutates only
their drawing, text, and visibility. Boss actor references remain private to
`MainScene`; cleanup and restart publish a nullable Boss observation instead.
Pause, Result, replay, audio, and custom HUD art remain deferred.

### TD-M06 Update — Pause/resume ownership

M6 / Task 6.4 connects the existing `paused` product mode to one Phaser-owned
keyboard/touch controller. Manual pause is independent from Hit Stop and
visibility, freezes Scene timers through clock time scale, and pauses Physics,
animations, and tweens without disabling the keyboard path required to resume.
Scene shutdown guards manager teardown ordering and removes the pause listener
and overlay. Desktop, two mobile viewports, production, camera handoff, Boss,
and ten-cycle failure/restart acceptance passed. Audio pause remains explicitly
deferred to M7 because no runtime audio system exists yet.

### TD-M06 Update — Failure/restart ownership

M6 / Task 6.5 replaces per-failure overlay/listener creation with one
Phaser-owned `FailureController` and an exactly-once restart request gate.
Keyboard and pointer no longer call restart through parallel handlers, and all
Failure children are camera-fixed so the touch hit area remains aligned in the
Boss arena. Ten deterministic failure/restart cycles, desktop keyboard retry,
landscape/portrait pointer retry, and production builds passed. Continue lives
only as a fresh-run retry; lives, checkpoints, scoring, persistence, Result,
and Audio remain deferred rather than being hidden in this controller.

### TD-M06 Update — Result/replay ownership

M6 / Task 6.6 closes the remaining terminal presentation gap with one
Phaser-owned `ResultController` and an exactly-once `ResultReplayGate`. Replay
uses the existing Scene new-run lifecycle instead of duplicating completion or
reset logic. Ten clear/replay cycles restore Title, HP 10, encounter 0, Boss
locked, zero completion state, one Canvas, and zero browser errors.

Result remains functional prototype art. Scoring, persistence, post-stage
progression, custom Result art, Audio, and visual polish remain intentionally
deferred to their roadmap milestones.

### TD-M06 Update — UI/mobile acceptance and production debug boundary

M6 / Task 6.7 closes Product Flow acceptance across desktop keyboard, 844×390
landscape touch, and 390×844 portrait FIT. The acceptance pass found that the
vinext build did not reliably replace the client-side `process.env.NODE_ENV`, so
production still exposed Physics debug and diagnostic text. `vite.config.ts` now
defines the value from Vite mode, matching the GitHub Pages production config;
production browser evidence confirms one Canvas, no development telemetry or
debug presentation, and zero browser errors.

Physical iOS/Android device feel, portrait readability as a release target, and
custom UI art remain later release/visual-upgrade QA rather than hidden M6 scope.

### TD-M6A Update — Visual direction and comparison baseline

M6A / Task 6A.1 resolves the absence of a shared visual target before asset
replacement. `ART_BIBLE.md` now defines measurable actor ratios, palette,
lighting, pixel-density, Stage, Effects, UI, feet-anchor and runtime-contract
gates. Fifteen revision-pinned before captures cover desktop, landscape, and
portrait at five matching product checkpoints; the capture README records the
development instrumentation that must remain constant in later comparisons.

M6A / Task 6A.2 resolves Guan Yu's animation-specific scales, one-frame idle,
incomplete walk/attack transitions, and missing grounded hurt/dead runtime art.
The accepted replacement has 43 distinct frames, one scale/origin/feet contract,
explicit provenance, a reproducible component-isolation build, and automated
phase-timing/atlas checks. Legacy frames remain only as a documented audit and
fallback reference, not active runtime content.

Remaining production art debt stays ordered rather than opportunistic: Enemy
and Boss visual density/facing/alignment is 6A.3; the three reused Stage sections
are 6A.4; Effects/UI prototype art is 6A.5; final comparison/freeze is 6A.6.

M6A / Task 6A.3 resolves the cast proportion and alignment mismatch. Soldier,
Mauler, and Duelist now share one 384×384 cell and `(192,354)` feet contract,
while each actor uses exactly one Art-Bible-derived display scale. Boss attack
and lifecycle sets share scale `1.27` and `(224,420)` feet. Source-facing,
active frame index, timing, body, hitbox, AI, balance, and camera remain frozen.
The reproducible pipeline now emits processed sources, atlas metadata,
provenance, red-box/feet-line, onion, silhouette, and shared lineup QA.

M6A / Task 6A.4 resolves the repeated three-section prototype Stage art. Forest
Entry, Forest Ambush, and Boss Arena now use nine explicit layers with frozen
world geometry, shared palette processing, normalized seams, source provenance,
and reproducible overview/seam/depth QA. Runtime review accepted desktop,
844×390 landscape, and 390×844 portrait without changing collision, camera,
encounter, or Boss coordinates. The next ordered visual debt is procedural
combat Effects and prototype product UI in 6A.5; asset-size/load optimization
remains intentionally deferred to 6A.6/M8 measurement.

### TD-M6A.5 Update — Procedural effects and prototype product UI

M6A / Task 6A.5 resolves the visible mismatch between the accepted cast/Stage
and procedural Hit Spark, missing ground contact, system-font overlays, and
prototype mobile controls. Runtime now uses one explicit combat-effects atlas,
shared actor shadows, original product UI images, and a custom bitmap font.
Source hashes, extraction rectangles, atlas/font metadata, debug previews, and
reproducible tooling are recorded. Slash trails, death/environment effects, and
Audio remain intentionally deferred; 6A.6 only validates and freezes the
accepted set.

### TD-H10 — Encounter-clear camera handoff visibly snaps

- **Severity:** High
- **Status:** Resolved 2026-07-17 by M5R / Task 5R.9.
- **Symptom:** when the last enemy at an encounter node dies, releasing the
  `encounter` camera lock causes a visible one-frame camera reposition. The same
  transition is observable at each stage node.
- **Constraint:** preserve lock ownership, gates, integer scroll, combat timing,
  and existing camera shake. Do not hide the defect with a timeout or alter
  enemy death/combat behavior.
- **Root cause:** `MainScene` released the encounter lock and applied the full
  centered follow target in the same update, producing a measured 460px jump.
- **Resolution evidence:** the pure handoff policy starts before unlock and
  advances at 960px/s with a 32px/update safety cap. Both encounters completed
  at maximum observed deltas of 17px desktop, 17px landscape, and 16px portrait,
  then converged to the normal target. Boss, failure/retry, HUD, production, and
  72 automated tests remained green.

### TD-M6A.6 Update — Visual baseline frozen; optimization measured

Task 6A.6 closes the open-ended visual-review debt with 15 matching
before/after comparisons, a reproducible provenance/pipeline audit, and an
accepted 300-frame runtime baseline. The M6A asset set is frozen; later work may
only reopen it for a reproducible objective defect.

Two non-blocking measurements remain deferred to M8 performance work: the
production Phaser chunk is large, and estimated decoded RGBA texture memory is
136,629,760 bytes. The current browser baseline is one Canvas, zero runtime
errors, 60.00 FPS average, and 59.92 FPS 1% low, so Task 6A.6 does not perform
premature bundling or texture-memory optimization.

### TD-M7.1 Update — Audio lifecycle boundary established

Task 7.1 resolves the missing Audio ownership and cleanup boundary. One
Scene-owned `AudioManager` now owns SFX/BGM channel state, gameplay-event
subscription, manual/visibility pause reasons, user-gesture unlock, and
idempotent reset/shutdown behavior. Ten Scene resets retain one manager and one
subscription.

No audio files or event mappings exist yet. Combat/UI SFX remain Task 7.2,
Stage/Boss music remains 7.3, and physical iOS/Android unlock/background
recovery remains 7.4 rather than being claimed by the desktop browser smoke.

### TD-M7.2 Update — Combat/UI SFX integrated

Task 7.2 resolves the missing combat and product-flow sound content with ten
deterministic project-owned WAV cues, reproducible synthesis, SHA-256
provenance, manifest loading, and one immutable event mapping. Same-frame
multi-target hit events coalesce before playback, and locked output queues
without falsely increasing the play count.

Stage/Boss BGM remains Task 7.3. Physical iOS/Android autoplay, background
recovery, and device mix acceptance remain Tasks 7.4–7.5; desktop browser
evidence does not claim those platform gates.

### TD-M7.3 Update — Stage/Boss music integrated

Task 7.3 resolves the missing Stage and Boss music with two deterministic
project-owned PCM WAV loops, reproducible composition/synthesis, full-file loop
points, SHA-256 provenance, manifest loading, and a pure semantic BGM mapping.
One `AudioManager`-owned track transitions Stage→Boss exactly once and stops on
Failure or Result; duplicate events, Scene reset, retry, and replay cannot layer
tracks.

The current browser acceptance covers desktop development and production plus
responsive game flow, but it does not claim physical iOS Safari or Android
Chrome autoplay/background recovery. Those platform lifecycle gates remain
Task 7.4, and full-device loudness/mix acceptance remains Task 7.5.

### TD-M7.4 Update — Mobile unlock and recovery hardened

Task 7.4 resolves the missing post-unlock AudioContext lifecycle boundary.
`AudioManager` now observes context state, coalesces recovery requests, preserves
one current BGM, rejects stale SFX after backgrounding, and keeps manual and
visibility pause ownership independent. Context listeners are removed with the
existing Scene lifecycle.

Automated unlock, interruption, pause ordering, stale-cue, reset, and cleanup
coverage passed together with browser lifecycle smoke. The user explicitly
accepted physical iOS Safari and Android Chrome behavior; device, OS, and
browser versions were not supplied and are recorded as unavailable. Overall
loudness, balance, and full-run duplicate/missing-cue review remain Task 7.5.

### TD-M7.5 Update — Audio mix and full-run acceptance closed

Task 7.5 closes the remaining Audio acceptance debt. A complete success and
Failure/retry cue matrix is locked by tests, and measured WAV peaks exposed a
worst-case simultaneous final-hit sum above unity. Existing catalog gains only
were reduced to retain deterministic Stage and Boss peak headroom without
changing master playback, assets, channel ownership, lifecycle, or gameplay.

Development and production browser smoke retained one Canvas, one manager, one
subscription, one BGM owner, and stable ten-cycle retry/replay behavior. The
user explicitly accepted the deployed mix on physical iOS Safari and Android
Chrome. Device, OS, and browser versions were not supplied and remain
unavailable. No Critical or High Audio debt remains for the Vertical Slice;
future accessibility controls stay in M8.6 rather than reopening M7.

## Resolved

### TD-C02 — Test suite validated deleted starter content

- **Resolved:** 2026-07-12，M0 / Task 0.4。
- **Evidence:** 移除 `tests/rendered-html.test.mjs`，新增 app shell、lifecycle、production route 與 combat contract tests；`pnpm test` 4/4 通過。

### TD-C04 — Production asset routing was unreliable

- **Resolved:** 2026-07-12，M0 / Task 0.4。
- **Evidence:** `tools/serve-production.mjs` 直接服務 `dist/client` 並將 SSR 交給既有 Worker；`pnpm start` 下 HTML、動態 JS/CSS、atlas、PNG route 均 200，無 proxy browser smoke Canvas count = 1、console error = 0。

### TD-H04 — No gameplay regression tests

- **Resolved:** 2026-07-12，M0 / Task 0.4（baseline contracts）。
- **Evidence:** lifecycle 20 次 mount/destroy、EnemyManager/combat source contracts 與 production route integration tests 已建立；更深的 deterministic gameplay tests 仍排在 M1/M2。

### TD-C01 — Core prototype changes were uncommitted

- **Resolved:** 2026-07-12，M0 / Task 0.1。
- **Evidence:** `bae05a1` 保存 Phase 3／4 prototype；build、desktop combat smoke 與 clean worktree 通過。

### TD-C03 — Suspected mojibake in product and design documents

- **Resolved:** 2026-07-12，M0 / Task 0.2。
- **Evidence:** 以 UTF-8 明確解碼 repository 文字檔，無 `U+FFFD` 或常見 mojibake；`GAME_SPEC.md`、`ART_BIBLE.md`、UI 與 launch scripts 可讀。先前異常來自 Windows PowerShell 5 `Get-Content` 的預設編碼。

### TD-H01 — Legacy Canvas runtime remained in active TypeScript scope

- **Resolved:** 2026-07-12，M0 / Task 0.2。
- **Evidence:** 全 repository reference scan 證明 `app/game.tsx`、`game-extra.css`、`scene-overrides.css` 未被引用後移除；正式入口維持 `app/page.tsx → PhaserGame.tsx → MainScene.ts`。

### TD-H02 — Typecheck was not part of the quality gate

- **Resolved:** 2026-07-12，M0 / Task 0.3。
- **Evidence:** `pnpm typecheck` 以 `skipLibCheck: false` 驗證完整 `app/**` 與獨立 Worker project；正式 source errors 已修復，command exit code 0。

### TD-M01 — Dual package manager lockfiles

- **Resolved:** 2026-07-12，M0 / Task 0.3。
- **Evidence:** package manager 固定為 pnpm 11.7.0、刪除 `package-lock.json`，`pnpm install --frozen-lockfile` 通過且未修改 lockfile。

### TD-H06 — Keyboard input was not exposed as a shared action contract

- **Resolved:** 2026-07-12，M1 / Task 1.1。
- **Evidence:** `app/game/input/ActionSnapshot.ts` 統一方向與 edge-trigger attack；6 tests、browser keyboard smoke、build、lint、typecheck 通過。

### TD-C05 — Contract acceptance was reported as playable Stage/Boss completion

- **Resolved:** 2026-07-17，M5R / Task 5R.8。
- **Evidence:** M5R.1–5R.7 completed the 3840×720 three-screen world, two ordered encounters, gated moving/damaging Boss, deterministic failed/retry, and exactly-once cleared flow. M5R.8 then completed real-input runs from Title through both encounters and Boss on desktop, 844×390 landscape touch, and 390×844 portrait FIT; a separate real failure/retry restored the documented initial state. All runs retained one Canvas and zero runtime errors.
## TD-M8.1 Resolved — Production packaging boundary

M8 / Task 8.4 reduced the GitHub Pages artifact from 125,451,173 to
18,172,139 bytes by excluding 99 copied non-runtime public files. Both
production outputs retain exactly 46 required public files with source-identical
SHA-256 values. Repository source and QA assets remain available to the
reproducible art pipeline.

Decoded RGBA remains 136,629,760 bytes and passes the 140 MiB budget, so no
atlas rebuild was performed. Task 8.1 also found no growth that justifies
conditional pooling; those changes remain deferred unless new measurements
fail.

## TD-M10 — Temporary Shield Guard and Crossbow presentation

- **Evidence:** TP-1 and TP-2 deliberately reuse the Soldier visual contract
  while their gameplay roles are accepted. ER.2 has now replaced the formal
  Soldier with production art, but both development-only roles still reuse it.
- **Impact:** Their combat behavior is readable through development markers,
  but their final silhouettes and state-specific animation poses do not exist.
- **Resolution:** ER.2 proved the one-actor production pipeline. Shield Guard
  and Crossbow still require their larger role-specific frame budgets and must
  be replaced only in separate tasks after the formal melee cast.
- **Target:** Enemy Redesign Track after Duelist and Mauler replacement.

## TD-M11 — pnpm build dependency-approval blocker

- **Evidence:** On 2026-07-26, both `pnpm build` and `pnpm test` stopped during
  pnpm's dependency-status install because `esbuild`, `sharp`, `workerd`, and
  related build scripts are marked ignored. Neither command reached its
  project script. Direct Node tests, TypeScript, ESLint, Vinext, Vite, and
  packaging commands all completed independently.
- **Impact:** The documented package-manager build command cannot currently be
  used as a clean acceptance gate in this environment.
- **Resolution:** Review the repository's pnpm dependency-build approval policy
  in a dedicated tooling task. Until then, record both the pnpm failure and the
  already-established direct Vinext/Vite build result; do not silently claim
  that `pnpm build` passed.
- **Target:** Tooling maintenance, outside ER.1 scope.

## ER.3 update — Legacy Duelist presentation resolved

- **Resolved:** 2026-07-26.
- **Evidence:** Duelist now has fifteen distinct project-owned poses, measured
  non-equal source rectangles, a 288×288 atlas, common `(144,265)` feet anchor,
  one display scale, alpha/debug/onion/silhouette QA, and three-viewport
  production smoke.
- **Remaining:** Mauler is still on its earlier 384×384 presentation. Shield
  Guard and Crossbow remain intentionally temporary under TD-M10.
