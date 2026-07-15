# Technical Debt Register

更新規則：每項債務必須有 Evidence、Impact、Resolution、Target。修復後移至文末 Resolved，不直接刪除紀錄。

## Critical

### TD-C05 — Contract acceptance was reported as playable Stage/Boss completion

- **Evidence:** Runtime `worldBounds.width` is 1280, equal to the viewport; the Boss has no locomotion, attack hitbox, or player-damage path, while M3 and M5 were described as playable/full-stage complete.
- **Impact:** Later UI work can proceed on top of an incomplete vertical slice, hiding the absence of the core scrolling-stage and Boss-combat loop.
- **Resolution:** Preserve accepted contracts, reopen playable-result acceptance, and complete M5R Tasks 5R.1–5R.8 before resuming M6.3.
- **Target:** M5R Vertical Slice Recovery.
- **Progress 2026-07-15:** M5R.1 completed the 3840×720 world and visible camera traversal. M5R.2 completed two ordered, spawn-on-entry encounters with per-fight camera gates, all-clear release, duplicate protection, and reset coverage. Boss entry/combat and clear/fail remain open in 5R.3–5R.8.

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
