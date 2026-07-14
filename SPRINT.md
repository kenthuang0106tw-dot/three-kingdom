# Current Sprint — Sprint 1: Runtime Input Contract

## Sprint Goal

在不增加新 gameplay 的前提下，固定 keyboard action snapshot 與輸入邊界，讓後續 touch、pause 與 visibility contract 有單一輸入來源。

## Cadence

- Duration：2 weeks
- Capacity：1 developer + AI，約 40–55 hours
- Milestone：M1 — Runtime Contracts and Mobile Input
- Scope rule：本 Sprint 只做 keyboard action snapshot；禁止加入 touch、pause、Stage、Boss、新角色、新招式或 Audio

## Task List

| Order | Task | Estimate | Deliverable | Verification |
|---:|---|---:|---|---|
| 1 | ✅ M1 / Task 1.1 — Define Action Snapshot and Keyboard Input Boundary | 6–10h | `ActionSnapshot`、keyboard contract tests | tests + browser keyboard smoke passed |
| 2 | ▶ M1 / Task 1.2 — Phaser Touch Controls | 10–16h | touch action adapter | pointer/multi-touch smoke |
| 3 | Pause/hit-stop/visibility clock contract | 8–12h | lifecycle clock contract | deterministic time tests |
| 4 | Readonly gameplay events/snapshot | 6–10h | event/snapshot types | consumer contract tests |
| 5 | Deterministic seed/test clock | 6–10h | RNG/time adapter | repeatable director tests |

## Detailed Acceptance

### Previous baseline

- [x] Current Phaser multi-enemy prototype 有清楚 commit：`bae05a1`。
- [x] Worktree clean。
- [x] Checkout 後依 README 可重建並通過 desktop combat smoke。

### Toolchain

- [x] Node requirement 與 package manager 明確：Node `>=22.13.0`、pnpm `11.7.0`。
- [x] 只保留 pnpm lockfile。
- [ ] `pnpm dev` 可啟動。
- [x] `pnpm build` 通過。
- [x] `pnpm lint` 通過（0 errors；4 個既有 `<img>` warnings）。
- [x] `pnpm typecheck` 通過（app + worker）。
- [x] `pnpm test` 通過（4 tests passed）。

### Current Sprint

- [x] Action snapshot reads current key state each frame.
- [x] Keyup／無輸入 produces zero movement vector.
- [x] WASD／方向鍵 diagonal vector normalized.
- [x] J edge-trigger is read through `Phaser.Input.Keyboard.JustDown` once per snapshot.
- [x] No DOM keyboard listener or React gameplay state.
- [x] Tests 6/6、build、lint、typecheck passed.
- [x] Browser keyboard smoke completed with console error count 0.

### Repository

- [x] 正式 runtime 只有 Phaser。
- [x] 文件與 UI 沒有 mojibake；30 個目標文字檔嚴格 UTF-8 解碼通過。
- [x] Starter tests 已移除並替換為 app/lifecycle/route contracts。
- [x] Cloudflare/browser TypeScript surface 正確隔離。

### Runtime Smoke

- [x] Phaser instance 只建立一次；Task 0.2 smoke 的 Canvas count = 1。
- [ ] Keyboard keyup 正常。
- [ ] 三名 Enemy 可生成、移動、輪流攻擊、受擊、死亡。
- [ ] Scene shutdown 無 listener/collider error。
- [x] Production HTML、JS、CSS、atlas、PNG route 都是 200。
- [x] Browser console 無 error（Task 0.2 runtime smoke）。

## Risks

| Risk | Mitigation |
|---|---|
| 編碼原文無法還原 | 只重建可確認內容；產品文案另行確認，不猜測 |
| 清除 legacy code 誤刪素材引用 | 先做引用圖與 baseline screenshot |
| Typecheck 被 Cloudflare ambient types 阻擋 | 分離 app/worker tsconfig，不關閉 strict |
| Tests 過度依賴 Phaser renderer | 優先測 state/config/manager contracts；renderer 用 smoke test |
| Production asset route 只在特定 server 失敗 | 對實際 `start`/hosting route 建 HTTP integration test |

## Task 1.2 Closeout

- [x] Phaser touch controls render inside the Phaser canvas and feed the shared `ActionSnapshot`.
- [x] Direction buttons support multi-touch pointer ownership and release on `pointerup`, `pointerupoutside`, `pointerout`, `pointercancel`, and `gameout`.
- [x] Touch attack is edge-triggered and consumed once per snapshot.
- [x] `pnpm test` 7/7, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke: production route loaded with one 1280×720 Canvas and zero console errors; touch attack button interaction completed.
- [ ] Mobile device smoke remains pending outside the browser harness.

## Task 1.3 Closeout

- [x] Pause reasons are explicit and independent (`visibility`, `hitStop`).
- [x] Phaser `blur` pauses the Scene; `focus` resumes it exactly once.
- [x] Hit-stop uses Phaser `delayedCall`, and managers resume only after all pause reasons clear.
- [x] `pnpm test` 9/9, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke: focus-change navigation retained one Canvas and zero console errors.
- [ ] Physical mobile visibility lifecycle remains pending for release QA.

## Task 1.4 Closeout

- [x] `GameplaySnapshot` exposes only frozen primitive player, enemy, and lifecycle observations.
- [x] `GameplayEventHub` supports typed subscriptions and unsubscribe without actor references.
- [x] MainScene publishes player state, attack, hit, and lifecycle events plus the latest snapshot.
- [x] `pnpm test` 11/11, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke: one 1280×720 Canvas, touch attack interaction, and zero console errors.
- [ ] Physical mobile event-consumer validation remains pending for release QA.

## Task 1.6 Closeout

- [x] Added `SeededRandom` with repeatable inclusive ranges.
- [x] Added `TestClock` and Phaser runtime clock adapter.
- [x] EnemyManager recovery/director timing uses injected clock and random services.
- [x] `pnpm test` 13/13, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke: one 1280×720 Canvas, touch attack interaction, and zero console errors.
- [ ] Physical mobile deterministic-timing validation remains pending for release QA.

## Task 1.7 Closeout

- [x] Added the document mobile viewport contract with safe-area support.
- [x] Phaser uses FIT/CENTER_BOTH for the fixed 1280×720 logical canvas; CSS preserves 16:9 and 32:15 ratios with dynamic viewport bounds.
- [x] Touch controls remain in the Phaser coordinate space and lifecycle ownership is unchanged across resize/focus.
- [x] `pnpm test` 14/14, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser viewport smoke passed at 844×390 and 390×844: one 1280×720 Canvas with fitted aspect ratio.
- [ ] Physical phone LAN/hosted smoke remains pending because no physical device is available in the harness.

## Sprint Exit

## Task 1.5 Closeout

- [x] Added typed runtime manifest entries for the current background, player, and enemy assets.
- [x] MainScene queues the manifest without changing asset keys, atlas metadata, or visuals.
- [x] Development `loaderror` reporting identifies required missing keys deterministically and is removed on shutdown.
- [x] `pnpm test` 16/16, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke loaded the manifest-backed game with one 1280×720 Canvas and no visible runtime error.
- [x] Missing-asset fixture contract test passed without modifying production assets.

## Task 2.1 Closeout

- [x] Added pure `PlayerStateMachine` coverage for idle, walk, attack1/2/3, and hurt.
- [x] Invalid transitions are rejected deterministically; reset returns to idle.
- [x] MainScene delegates state transitions to the machine without changing input, combo, animation, or hit effects.
- [x] `pnpm test` 17/17, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke loaded the updated route with one 1280×720 Canvas and no visible runtime error.

## Task 2.8 Closeout

- [x] Added deterministic combat-room acceptance coverage for three-enemy formation, attack-slot exclusivity, Y alignment, spacing, multi-target records, and surviving-enemy continuity.
- [x] Existing cleanup, player lifecycle, resolver, and effect contracts remain covered without adding gameplay content.
- [x] `pnpm test` 24/24, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke loaded one 1280x720 Canvas, completed 10 Scene resets, and showed no visible runtime error.
- [ ] Physical device combat and long-session QA remain release follow-ups.

## Task 2.7 Closeout

- [x] EnemyManager tracks and cancels per-enemy hurt timers on state changes, removal, and shutdown.
- [x] Enemy damage ignores dead/hurt targets; cleanup disables bodies/hitboxes, removes animation listeners, destroys owned colliders and objects, and releases the attack slot.
- [x] Deterministic director timing continues through injected GameplayClock and RandomSource services with focused cleanup contracts.
- [x] `pnpm test` 23/23, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser reset smoke loaded one 1280x720 Canvas and completed 10 Scene restarts.
- [ ] Full combat-room acceptance remains the next task.

## Task 2.6 Closeout

- [x] Added Phaser-free `PlayerLifecycle` for HP floor, alive/dead state, damage rejection after death, and reset.
- [x] Player state machine now has an explicit terminal `dead` state; MainScene blocks input while dead and resets lifecycle on Scene creation.
- [x] Existing 300ms hurt lockout, white flash, horizontal knockback, and hit-stop behavior remain unchanged.
- [x] `pnpm test` 22/22, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser reset smoke loaded one 1280x720 Canvas and completed 10 Scene restarts.
- [ ] Game Over UI and physical mobile lifecycle remain intentionally deferred.

## Task 2.5 Closeout

- [x] Added `EffectDirector` for existing hit flash, hit spark, knockback, camera shake, and hit-stop orchestration.
- [x] Effect parameters remain unchanged: 4-frame hit-stop, 90ms flash, 26px/120ms knockback, 50ms shake at 0.003, and 24 FPS five-frame spark.
- [x] Director tracks timers/tweens and is destroyed with the Scene; damage, target resolution, EnemyManager state, and Combo remain outside it.
- [x] `pnpm test` 21/21, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke loaded the updated route with one 1280x720 Canvas and no visible runtime error.
- [ ] Physical mobile effect timing remains pending for release QA.

## Task 2.4 Closeout

- [x] Added pure Phaser-free `resolveAttack` CombatResolver for target eligibility, damage, and per-attack hit records.
- [x] MainScene now resolves overlapping enemies through the resolver; existing hit flash, spark, knockback, camera shake, hit-stop, Combo, and EnemyManager transitions remain unchanged.
- [x] Multi-target attacks preserve one hit per target per attack while allowing different enemies to be hit in the same active frame.
- [x] `pnpm test` 20/20, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke loaded the updated route with one 1280x720 Canvas and no visible runtime error.
- [ ] Physical mobile combat timing remains pending for release QA.

## Task 2.3 Closeout

- [x] Added pure `PlayerAttackController` metadata for attack1, attack2, and attack3.
- [x] Each stage has an independent frame sequence, 8 FPS rate, startup, active, and recovery frame indexes.
- [x] MainScene animation creation and active hitbox decisions consume the controller metadata; existing Combo and hit effects remain unchanged.
- [x] `pnpm test` 19/19, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke loaded the updated route with one 1280x720 Canvas and no visible runtime error.
- [ ] Physical mobile attack timing remains pending for release QA.

## Task 2.2 Closeout

- [x] Added `PlayerActor` ownership for sprite, feet-anchored body zone, body configuration, facing, and visual synchronization.
- [x] MainScene no longer constructs a parallel player sprite/body; existing input, Combo, attack hitbox, hurt effects, and event flow remain in place.
- [x] Player actor ownership/alignment contract tests passed.
- [x] `pnpm test` 18/18, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke loaded the updated route with one 1280×720 Canvas and no visible runtime error.

## Task 1.8 Closeout

- [x] Added development-only `?resetSmoke=1` Scene restart smoke path.
- [x] Each restart runs the existing shutdown cleanup for input, lifecycle clock, enemy manager, colliders, and animation listeners.
- [x] Animation definitions are guarded against duplicate creation across restarts.
- [x] `pnpm test` 15/15, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke completed 10 Scene restarts with one 1280×720 Canvas and reset count 10.
- [x] No new gameplay or production UI was added.

## M3 / Task 3.1 Closeout

- [x] Added Phaser-free `StageConfig` types for world/walk bounds, spawns, encounters, and exits.
- [x] Added validated `BAMBOO_COMBAT_ROOM` data preserving the current room dimensions and three enemy positions.
- [x] MainScene and EnemyManager consume the room configuration without adding stage flow or camera behavior.
- [x] `pnpm test` 25/25, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke verified one 1280x720 Canvas, ten reset cycles, and zero page errors.
- [ ] Physical mobile and long-session validation remain deferred.

## M3 / Task 3.3 Closeout

- [x] Added pure camera scroll calculation with world and viewport bounds.
- [x] MainScene configures camera bounds, preserves round pixels, and applies integer scroll.
- [x] Current 1280x720 room remains visually unchanged because its world equals the viewport.
- [x] `pnpm test` 27/27, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke verified one 1280x720 Canvas, ten reset cycles, and zero page errors.
- [ ] Physical mobile and long-session validation remain deferred.

## M3 / Task 3.4 Closeout

- [x] Added a Phaser-free camera lock state with explicit `encounter` reason.
- [x] Existing combat-room spawn locks camera follow; all-clear unlocks it.
- [x] Restart resets camera lock state and no camera/enemy ownership coupling was added.
- [x] `pnpm test` 29/29, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke verified one 1280x720 Canvas, ten reset cycles, and zero page errors.
- [ ] Physical mobile and long-session validation remain deferred.

## M3 / Task 3.5 Closeout

- [x] Added a Phaser-free spawn/all-clear state contract with reset semantics.
- [x] EnemyManager starts one three-enemy encounter and ignores duplicate spawns/removals.
- [x] All-clear is emitted only after every spawned enemy is removed; MainScene owns presentation.
- [x] `pnpm test` 31/31, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke verified one 1280x720 Canvas, ten reset cycles, and zero page errors.
- [ ] Physical mobile and long-session validation remain deferred.

## M3 / Task 3.6 Closeout

- [x] Added Phaser-free stage exit eligibility and restart state contract.
- [x] Added the current room's `room-exit` metadata; it becomes available only after all-clear.
- [x] Scene restart uses one lifecycle method and resets player, enemy, camera, timers, and listeners.
- [x] `pnpm test` 33/33, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke verified one 1280x720 Canvas, ten reset cycles, and zero page errors.
- [ ] Physical mobile and long-session validation remain deferred.

## M3 / Task 3.7 Closeout

- [x] Added deterministic traversal acceptance from spawn through clear, camera unlock, exit request, and reset.
- [x] Verified bounds, three-enemy spawn count, duplicate-safe removal, exit eligibility, and lifecycle reset together.
- [x] `pnpm test` 34/34, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke verified one 1280x720 Canvas, ten reset cycles, and zero page errors.
- [ ] Physical mobile and long-session validation remain deferred.

## M4 / Task 4.1 Closeout

- [x] Added Phaser-free validated `SOLDIER_ENEMY_CONFIG` for existing tuning values.
- [x] EnemyManager and enemy preview consume config values without gameplay or art changes.
- [x] Added parity and validation tests for HP, movement, attack ranges, spacing, and timing.
- [x] `pnpm test` 36/36, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke verified one 1280x720 Canvas and zero page errors.
- [ ] Physical mobile and long-session validation remain deferred.

## M4 / Task 4.2 Closeout

- [x] Generated and committed a distinct red-armored mauler sprite sheet with 15 real frames.
- [x] Added chroma-key-removed PNG, atlas metadata, and red-box debug sheet.
- [x] Added `MAULER_ENEMY_CONFIG` with distinct attack range, movement speed, and recovery timing.
- [x] Added `enemy-mauler` asset manifest route without changing the current encounter composition.
- [x] `pnpm test` 37/37, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke verified one 1280x720 Canvas and zero page errors.
- [ ] Mixed encounter wiring remains deferred to Task 4.4.

## M4 / Task 4.3 Closeout

- [x] Generated and committed a distinct teal dual-blade duelist sprite sheet with 15 real frames.
- [x] Added chroma-key-removed PNG, atlas metadata, and red-box debug sheet.
- [x] Added `DUELIST_ENEMY_CONFIG` with faster movement/recovery and shorter attack range.
- [x] Added `enemy-duelist` asset manifest route without changing current encounter composition.
- [x] `pnpm test` 38/38, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke verified one 1280x720 Canvas and zero page errors.
- [ ] Mixed encounter wiring remains deferred to Task 4.4.

## M4 / Task 4.4 Closeout

- [x] Bamboo combat room now deterministically spawns soldier, mauler, and duelist.
- [x] EnemyManager preserves per-archetype config, animation keys, hit records, hurt/death cleanup, and the single Attack Director slot.
- [x] Mixed encounter tests cover composition, Y alignment, pairwise spacing, attack-slot exclusivity, and animation setup.
- [x] `pnpm test` 39/39, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke verified one 1280x720 Canvas and zero page errors.
- [ ] Encounter tuning and physical mobile validation remain deferred to later tasks.

## M4 / Task 4.5 Closeout

- [x] Tuned mixed-enemy durability to 4 / 5 / 3 HP for soldier, mauler, and duelist.
- [x] Tuned director delays, recovery windows, and minimum spacing without changing the single Attack Director slot.
- [x] Deterministic reference model estimates 36 seconds at one successful hit every 3 seconds, inside the 30–90 second budget.
- [x] Attack Y ranges remain at or below 48px, preserving vertical dodge space in the 245px walk area.
- [x] `pnpm test` 40/40, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser movement/attack smoke verified one 1280x720 Canvas, all three archetypes visible, and zero page errors.
- [ ] Physical-player duration sampling remains deferred to later balancing QA.

## M4 / Task 4.6 Closeout

- [x] Added all six soldier / mauler / duelist removal-order permutations.
- [x] Every first removal preserves both surviving archetypes; all-clear occurs only after the third unique removal.
- [x] Verified the shared damage path releases the Attack Director slot before hurt/dead, without archetype branches.
- [x] Verified the shared removal path releases slot ownership, cleans objects, removes the collection entry, and records encounter progress.
- [x] `pnpm test` 41/41, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser combat/reset smoke completed 10 Scene restarts with one 1280x720 Canvas and zero page errors.
- [ ] Physical mobile and long-session validation remain deferred to release QA.

## M5 / Task 5.1 Closeout

- [x] Added one Phaser-free `BossLifecycle` owning HP and a single explicit state.
- [x] Legal transitions cover inactive, idle, attack, hurt, dead, and cleaned without animation or AI assumptions.
- [x] Damage, terminal death, idempotent cleanup, and reset/reactivation are deterministic.
- [x] `EnemyManager` does not import, instantiate, or own the Boss contract.
- [x] `pnpm test` 42/42, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke verified the unchanged room with one 1280x720 Canvas and zero page errors.
- [ ] Boss art, attacks, AI, arena, HUD, and audio remain deferred.

## M5 / Task 5.2 Closeout

- [x] Added one original indigo/gold heavy warlord with three distinct attack strips.
- [x] Each attack has real startup, active, and recovery poses with a readable startup telegraph.
- [x] Explicit non-equal source rectangles prevent weapon overlap between generated poses.
- [x] Runtime sheet contains nine 448x448 frames with shared `(224, 420)` feet anchor, source scale, and display scale.
- [x] Added Phaser-free `BOSS_ATTACKS`, atlas, metadata, debug sheet, manifest route, and reproducible builder.
- [x] `pnpm test` 43/43, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke returned 200 for Boss PNG/atlas and retained one 1280x720 Canvas with zero page errors.
- [ ] Boss actor, AI, phase, arena, idle/walk/hurt/dead art, HUD, and audio remain deferred.

## M5 / Task 5.3 Closeout

- [x] Added one Phaser-free Boss decision policy using the existing gameplay clock, seeded random source, and attack definitions.
- [x] Attack selection is limited to idle lifecycle state and one pending attack at a time.
- [x] Attack completion requires attack lifecycle state and starts a deterministic 900–1300ms recovery.
- [x] Deterministic sequence, recovery lockout, illegal-state, and reset contracts passed.
- [x] `pnpm test` 45/45, `pnpm build`, `pnpm typecheck`, and lint with 0 errors passed.
- [x] Browser smoke retained one 1280×720 Canvas and zero page errors.
- [ ] Boss actor, phase presentation, hurt/dead art, arena, HUD, and audio remain deferred.

## M3 / Task 3.2 Closeout

- [x] Added deterministic Phaser-free X/Y and point clamping helpers.
- [x] MainScene uses StageConfig walk bounds for Arcade world bounds and horizontal knockback.
- [x] EnemyManager uses the same contract for formation targets and slot markers.
- [x] `pnpm test` 26/26, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke verified one 1280x720 Canvas, ten reset cycles, and zero page errors.
- [ ] Physical mobile and long-session validation remain deferred.

## M5 / Task 5.4 Closeout

- [x] Added one Scene-owned `BossActor` separate from `EnemyManager`.
- [x] Added real feet-aligned idle, hurt, phase-transition, and death frames at one `0.9` display scale.
- [x] Boss attacks, hurt recovery, one phase change, death fade, cleanup, and restart ownership use one lifecycle.
- [x] Player attacks resolve the Boss through the existing combat/effect path without adding arena, HUD, audio, or stage-clear flow.
- [x] `pnpm test` 47/47, `pnpm build`, `pnpm typecheck`, and lint with 0 errors passed.
- [x] Browser smoke completed phase/death/cleanup, then 10 Scene restarts with one 1280×720 Canvas, one Boss actor, and zero page errors.
- [ ] Boss arena bounds/camera lock, walk behavior, attack damage, HUD, audio, and stage completion remain deferred.

M5 / Task 5.4 已完成；下一步只執行 M5 / Task 5.5。其餘未完成項目依 Roadmap 保留。

## M5 / Task 5.5 Closeout

- [x] Added one concrete bamboo Boss arena that reuses the room's authoritative walk bounds.
- [x] Camera lock now preserves independent `encounter` and `boss` ownership without premature unlock.
- [x] Boss cleanup releases only the Boss lock exactly once; encounter ownership remains intact.
- [x] Player, normal enemies, Boss bodies, and Boss knockback use the same effective walk boundary.
- [x] Development presentation shows the arena outline and live locked/released state.
- [x] `pnpm test` 48/48, `pnpm build`, `pnpm typecheck`, and lint with 0 errors passed.
- [x] Browser smoke verified lock → release, one release, 10 Scene restarts, one Boss/Canvas, and zero page errors.
- [ ] Stage-complete publication, Boss attack damage, HUD, audio, and multi-room arena traversal remain deferred.

M5 / Task 5.5 已完成；下一步只執行 M5 / Task 5.6。其餘未完成項目依 Roadmap 保留。

## M5 / Task 5.6 Closeout

- [x] Added one typed readonly `stage-completed` event to the existing `GameplayEventHub`.
- [x] Added a one-shot `StageCompletionGate` with explicit Scene-restart re-arming.
- [x] Boss cleanup reports `defeated` versus ordinary destruction, preventing restart/shutdown false positives.
- [x] MainScene releases the Boss arena before publishing one primitive `{ stageId, at }` payload.
- [x] `pnpm test` 50/50, `pnpm build`, `pnpm typecheck`, and lint with 0 errors passed.
- [x] Browser smoke verified count 0 before defeat, count 1 after cleanup/release, and count 0 after 10 restarts.
- [ ] Result UI, game-flow modes, audio, scoring, Boss attack damage, and a second stage remain deferred.

## M5 / Task 5.7 Closeout

- [x] Added one deterministic integrated acceptance test covering encounter clear, independent camera-lock ownership, Boss phase/death/cleanup, exactly-once stage completion, and restart re-arming.
- [x] `pnpm test` passed 51/51; `pnpm build`, `pnpm typecheck`, and lint with 0 errors passed.
- [x] Browser Boss smoke passed at 1280×720, 844×390, and 390×844 with one logical 1280×720 Canvas, one completion event, released Boss arena, and zero page errors.
- [x] Ten Scene restarts retained one Canvas, one Boss, zero stale completion events, and exactly one `encounter,boss` lock ownership set.
- [x] Milestone 5 is complete; no gameplay, art, balance, or runtime behavior changed in this acceptance task.
- [ ] Physical-device feel, Boss attack damage, Result UI, audio, scoring, and additional stages remain deferred to their planned milestones.

The next eligible task is M6 / Task 6.1. Do not begin it until the next task-runner cycle.

M5 / Task 5.6 已完成；下一步只執行 M5 / Task 5.7。其餘未完成項目依 Roadmap 保留。

## M4 / Task 4.7 Regression Closeout

- [x] Added per-archetype source-facing metadata; soldier remains left-facing while mauler and duelist use their right-facing source art correctly.
- [x] Corrected ordinary-enemy active attacks to Phaser's 1-based frame index 2 (`attack-1`).
- [x] Added a gameplay-clock 1500 ms approach deadline so a blocked attacker releases the single Attack Slot.
- [x] Follow-up revalidation found and fixed Attack Slot starvation with a Phaser-free least-grants-first policy and deterministic ID tie-breaking.
- [x] Separate real touch-movement lane smokes recorded player damage from `mauler`, `duelist`, and `soldier`; duelist movement and attack presentation faced forward.
- [x] `pnpm test` passed 53/53; build and typecheck passed; lint passed with 0 errors and the existing 4 `<img>` warnings.
- [x] Ten Scene restarts retained one Canvas, one Boss, no stale completion, and zero browser errors.
- [ ] Boss movement remains deferred and was not part of this M4 regression repair.

The next eligible task remains M6 / Task 6.1. Do not begin it until the next task-runner cycle.

## M6 / Task 6.1 Closeout

- [x] Added one Phaser-free `GameFlowStateMachine` for `title`, `playing`, `paused`, `failed`, and `cleared`.
- [x] Defined every legal transition; invalid transitions fail deterministically.
- [x] Kept `failed` and `cleared` terminal until the explicit `resetForNewRun()` path re-arms the flow at `title`.
- [x] Kept Phaser objects, Scene lifecycle, React state, actors, UI, persistence, and gameplay out of the contract.
- [x] `pnpm test` passed 54/54; build, lint, and typecheck passed.
- [x] Existing M0–M5 runtime path was not modified.
- [ ] Title presentation and start input remain M6 / Task 6.2.

The next eligible task is M6 / Task 6.2. Do not begin it until the next task-runner cycle.

## M6 / Task 6.2 Closeout

- [x] Added one Phaser-owned Title overlay without React state or a second Scene.
- [x] Keyboard and pointer/touch each start the existing run through the single game-flow contract.
- [x] Repeated start input is ignored; starting does not restart the Scene or recreate actors.
- [x] The keyboard edge used to start is consumed so J does not leak into the first gameplay attack.
- [x] Browser smoke verified Title visibility, pointer start, keyboard start, one Canvas, unchanged gameplay, and zero errors.
- [x] Ten restart cycles retained one Canvas, one Boss, zero stale completion, and a freshly re-armed Title.
- [x] `pnpm test` passed 56/56; build, lint, and typecheck passed.
- [ ] HUD, Pause, Failure, Result, audio, persistence, and custom Title art remain deferred.

The next eligible task is M6 / Task 6.3. Do not begin it until the next task-runner cycle.
