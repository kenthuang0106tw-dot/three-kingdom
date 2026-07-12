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

## M3 / Task 3.2 Closeout

- [x] Added deterministic Phaser-free X/Y and point clamping helpers.
- [x] MainScene uses StageConfig walk bounds for Arcade world bounds and horizontal knockback.
- [x] EnemyManager uses the same contract for formation targets and slot markers.
- [x] `pnpm test` 26/26, `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed.
- [x] Browser smoke verified one 1280x720 Canvas, ten reset cycles, and zero page errors.
- [ ] Physical mobile and long-session validation remain deferred.

Task 1.1 已完成；下一步只執行 Task 1.2。Pause、visibility、deterministic clock 與其他未完成項目依 Roadmap 保留。
