# Current Sprint — Game-Feel Timing

## Sprint Goal

M8 / Task 8.4 已修正 production asset packaging，且未改動 frozen runtime 素材。下一步只規劃 M8 / Task 8.2，對既有完整 Vertical Slice 做有 before/after evidence 的 game-feel timing pass；不新增招式、敵人、素材或系統。

Roadmap decision（2026-07-18）：6A.3 必須以 6A.2 已接受的 Guan Yu 比例、palette、feet anchor、capture 與 provenance contract 對齊；不可重新解釋 Art Bible 或更改 gameplay timing。

## Cadence

- Duration：2 weeks
- Capacity：1 developer + AI，約 40–55 hours
- Milestone：M8 — Content Polish and Performance
- Scope rule：一次只做一個 Task；下一個唯一 Task 是 M8 / 8.2 game-feel timing pass

## Task List

| Order | Task | Estimate | Deliverable | Verification |
|---:|---|---:|---|---|
| 1 | ✅ M5R / Task 5R.1 — Three-screen world and visible camera scrolling | 12–18h | 3840px world、三段竹林背景、可見 camera scroll | tests + desktop/mobile browser smoke passed |
| 2 | ✅ M5R / Task 5R.2 — Two encounter triggers and gates | 14–20h | 兩場依序 encounter | trigger/lock/clear browser acceptance passed |
| 3 | ✅ M5R / Task 5R.3 — Boss arena entry sequencing | 8–12h | Boss 延後啟用與 arena entry | desktop/mobile entry smoke passed |
| 4 | ✅ M5R / Task 5R.4 — Boss locomotion, facing, and Y alignment | 16–24h | Boss 會接近、面向與對線 | movement/alignment browser acceptance passed |
| 5 | ✅ M5R / Task 5R.5 — Boss attack hitbox and player damage | 16–24h | Boss active frames 可單次傷害玩家 | hitbox/timing/damage browser acceptance passed |
| 6 | ✅ M5R / Task 5R.6 — Player failure and deterministic restart | 12–18h | HP 0 進入 failed 並可完整重啟 | failure/restart browser acceptance passed |
| 7 | ✅ M5R / Task 5R.7 — Boss defeat and cleared flow | 8–12h | Boss cleanup 後一次進入 cleared | defeat/clear ordering browser acceptance passed |
| 8 | ✅ M5R / Task 5R.8 — End-to-end Vertical Slice acceptance | 16–24h | 從 Title 真實完成整關與失敗重試 | desktop/mobile full-run acceptance passed |
| 9 | ✅ M5R / Task 5R.9 — Encounter-clear camera handoff stability | 6–10h | lock release 連續銜接 bounded follow | tests + three-viewport browser acceptance passed |
| 10 | ✅ M6 / Task 6.4 — Pause/resume | 8–12h | 明確 pause/resume flow 與 clock/input ownership | tests + desktop/mobile browser acceptance passed |
| 11 | ✅ M6 / Task 6.5 — Failure/continue/restart | 8–12h | 正式 Failure UI、單一路徑 retry 與 deterministic reset | 74 tests + desktop/mobile/10-cycle acceptance passed |
| 12 | ✅ M6 / Task 6.6 — Result/replay | 6–10h | 正式 Result UI、單一路徑 replay 與 deterministic new run | 76 tests + desktop/mobile/10-cycle acceptance passed |
| 13 | ✅ M6 / Task 6.7 — UI/mobile acceptance | 8–12h | 三 viewport 完整流程、safe area、production presentation | 77 tests + source/production browser acceptance passed |
| 14 | ✅ M6A / Task 6A.1 — Visual target、Art Bible 與 before/after baseline | 10–16h | 可執行的美術規格與 15 張 before captures | document/visual acceptance passed；production art unchanged |
| 15 | ✅ M6A / Task 6A.2 — Guan Yu animation quality upgrade | 24–40h | 統一 identity/scale/feet anchor 的 43-frame 主角動畫 | 78 tests + metadata/debug/onion/three-viewport/build acceptance passed |
| 16 | ✅ M6A / Task 6A.3 — Enemy and Boss visual consistency | 32–48h | 三小兵與 Boss 對齊主角視覺契約 | 79 tests + metadata/lineup/onion/three-viewport acceptance passed |
| 17 | ✅ M6A / Task 6A.4 — Three-screen bamboo stage upgrade | 32–48h | 三段可辨識、無接縫的竹林與 Boss arena | 80 tests + layer/section/depth/three-viewport acceptance passed |
| 18 | ✅ M6A / Task 6A.5 — Combat effects and product UI art upgrade | 32–48h | 同風格 Spark/impact/dust/shadow 與產品 UI/font | 81 tests + desktop/landscape/portrait/build acceptance passed |
| 19 | ✅ M6A / Task 6A.6 — Visual acceptance and asset freeze | 12–20h | 全關 before/after、效能/載入基線、provenance audit 與 freeze | 15 comparisons + 60 FPS/runtime/asset audit passed |
| 20 | ✅ M7 / Task 7.1 — Audio manager/mixer | 8–12h | Scene-owned SFX/BGM mixer、unlock、pause/visibility、reset cleanup | 86 tests + browser lifecycle/build acceptance passed |
| 21 | ✅ M7 / Task 7.2 — Combat/UI SFX | 10–16h | 十個原創戰鬥／產品流程 SFX、event mapping 與 multi-hit coalescing | 92 tests + complete audio/browser/build acceptance passed |
| 22 | ✅ M7 / Task 7.3 — Stage/Boss music | 12–18h | 兩首原創循環 BGM、Stage→Boss exactly-once transition、terminal stop | 97 tests + development/production audio acceptance passed |
| 23 | ✅ M7 / Task 7.4 — Mobile unlock/recovery | 8–12h | AudioContext recovery、stale-SFX rejection、mobile lifecycle | 101 tests + browser/reset + user-confirmed physical mobile acceptance passed |
| 24 | ✅ M7 / Task 7.5 — Audio acceptance | 8–12h | 完整 cue matrix、peak headroom 與三平台 mix acceptance | 103 tests + browser/reset + user-confirmed physical mobile mix acceptance passed |
| 25 | ✅ M8 / Task 8.1 — Performance Budget and Baseline | 8–12h | 36 checkpoint measurements、delivery/memory budget、reset evidence | 107 tests + desktop/fitted-mobile + production isolation passed |
| 26 | ✅ M8 / Task 8.4 — Production Asset Packaging | 8–12h | 46-file inventory、output-only pruning、hash/route coverage | 110 tests + 17.33 MiB artifact + browser/reset acceptance passed |

## Recovery Planning Correction — 2026-07-14

- [x] 保留 M3 Stage 與 M5 Boss 已完成的純 contracts、assets、cleanup 與 restart evidence。
- [x] 撤銷「M3 已完成三畫面可玩關卡」的結論；目前 runtime 仍是單一 1280×720 room。
- [x] 撤銷「M5 已完成可玩 Boss 戰／完整關卡」的結論；Boss 尚無 locomotion、alignment、attack hitbox 或 player damage。
- [x] 建立 M5R Vertical Slice Recovery，將真正可玩成果拆成 5R.1–5R.8。
- [x] 保留已完成的 M6.1 game-flow contract 與 M6.2 Title/start。
- [x] 暫停 M6.3 HUD；Recovery 全部通過後才恢復 M6。
- [x] 唯一 NEXT_TASK 改為 5R.1。

## M5R / Task 5R.1 Closeout

- [x] `StageConfig` 現在定義 3840×720 world、三段連續 1280×720 竹林 section 與完整覆蓋驗證。
- [x] Player／Enemy／Boss／knockback 共用擴充後的 walk/world contract，正常流程起始不再被未來 encounter／Boss lock 永久鎖住。
- [x] 現有敵人與 Boss 暫放第三畫面；正式 spawn trigger、兩場 encounter 與 Boss entry 仍分別保留給 5R.2／5R.3。
- [x] Desktop browser：`scrollX 0 → 355 → 2560`，Player 到達 `x=3727`，三段背景無 uncovered area，console 0 error。
- [x] 844×390 landscape touch：Canvas 仍為邏輯 1280×720，觸控 traversal 到 `scrollX=758`。
- [x] 390×844 portrait FIT：Canvas 比例維持 16:9，觸控 traversal 到 `scrollX=586`。
- [x] 10 次 Scene restart：一個 Canvas、一個 Player／Boss ownership、camera 回 0、無 stale completion 或 browser error。
- [x] Boss smoke regression：arena release 1 次、stage-complete 1 次且在 release 後發布，browser error 0。
- [x] `pnpm test` 56/56、`pnpm build`、`pnpm typecheck`、lint 0 errors（既有 4 warnings）通過。
- [ ] 三段目前重複使用同一張 forest art；獨特 section art 留在內容 polish，不阻擋 5R.2。

## M5R / Task 5R.2 Closeout

- [x] `StageConfig` 定義兩個有序 trigger 與 spawn groups：第一場 1 隻 soldier，第二場 1 隻 mauler + 1 隻 duelist；Scene 建立時普通敵人數為 0。
- [x] 純 `EncounterSequenceState` 只允許向前進入下一個 trigger；active encounter、倒退跨界、已完成 trigger 都不會重複生成。
- [x] 每場開始只取得 `encounter` camera lock，並將玩家限制在當下 viewport；全清後只釋放該 lock，第二場完成後可繼續前往終點。
- [x] `EnemyManager` 只生成明確傳入的當前群組，跨 encounter 使用唯一 enemy ID；既有 archetype、combat、death 與 cleanup 不變。
- [x] Desktop browser timeline：初始 0 敵人；`forest-entry` 生成 1 隻並鎖在 `scrollX=261`；全清後 `forest-ambush` 生成 2 隻並鎖在 `scrollX=1361`；第二場全清後 0 敵人且 progression index 為 2；全程一個 Canvas。
- [x] `pnpm test` 60/60、`pnpm build`、`pnpm build:github-pages`、`pnpm typecheck`、lint 0 errors（既有 8 個 `<img>` warnings）通過。
- [x] Scene create 明確重設 encounter sequence、camera gate 與前一幀玩家位置；契約測試覆蓋 reset、順序、spawn-once 與 camera ownership。
- [ ] 實體手機與瀏覽器補充 debug 欄位重測因本輪 Browser 連線中斷未執行；主流程 desktop browser smoke 已通過，不阻擋 5R.2 closeout，保留於後續 physical-device QA。

## M5R / Task 5R.3 Closeout

- [x] `BAMBOO_BOSS_ARENA` 定義 Stage-owned `entryTrigger`；純 `BossEntryState` 只允許 `locked → eligible → active`，倒退、Y 未對線與重複跨界均不啟用。
- [x] 正常 Scene 建立時 Boss actor 數量為 0、無 `boss` camera lock；兩場 encounter 全清後只將 entry 標為 eligible，不直接建立或操作 Boss。
- [x] 玩家向前跨入 arena 後才建立唯一 `BossActor`、取得 `boss` lock、將 camera 固定到 `scrollX=2560`，並把玩家限制在 arena bounds 內。
- [x] Boss cleanup 仍只釋放 `boss` lock；Boss defeat 後 arena release 1 次、stage-complete event 1 次且發布時 lock 已釋放。
- [x] Desktop browser：第一場進行中 Boss 仍為 0；兩場全清並跨入 entry 後 Boss 1、entry `active`、Boss lock true、普通敵人 0、console error 0。
- [x] 844×390 landscape 與 390×844 portrait FIT 均完成兩場 encounter 與 Boss entry；Canvas 保持邏輯 1280×720、各只有一個 Canvas、console error 0。
- [x] 10 次 Scene restart：Boss 0、entry `locked`、camera lock 空、completion 0、一個 Canvas、console error 0。
- [x] `pnpm test` 62/62、`pnpm build`、`pnpm build:github-pages`、`pnpm typecheck`、lint 0 errors（既有 8 個 `<img>` warnings）通過。
- [x] Boss locomotion、facing、Y alignment 已由 5R.4 完成；attack hitbox 與 player damage 保留給 5R.5。

## M5R / Task 5R.4 Closeout

- [x] 補入四張真正逐幀、來源朝左、共同腳底 anchor 的 Boss walk frames；未以 transform 偽造行走。
- [x] Boss idle 時以 Arcade velocity 先完成 Y 對線，再依距離靠近或拉開；到攻擊距離才停止並允許既有 decision policy 選招。
- [x] Boss facing 依水平目標方向更新，攻擊／hurt／phase／dead／cleaned 均保持零速度；arena clamp 防止腳底與 body 出界。
- [x] Desktop 與 844×390 landscape smoke 通過：左／右 facing 為 -1／+1，Y 由 560 對線至 478.4，再移至 591.7；一個 Canvas、browser error 0。
- [x] Boss defeat regression：arena release 1 次、stage completion 1 次；10 次 restart 無殘留 Boss、lock、completion 或 Canvas。
- [x] `pnpm test` 64/64、`pnpm typecheck`、lint 0 errors（既有 8 warnings）通過；production builds 完成後記錄於 commit。
- [ ] Boss attack hitbox 與 player damage 未加入，唯一保留給 5R.5。

## Historical Closeout Evidence

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

## M5R / Task 5R.5 Closeout

- [x] All three existing Boss attacks use metadata-owned startup, active, recovery, and independent hitbox geometry.
- [x] `BossActor` owns one Arcade Physics attack zone; only active frames enable it, facing mirrors it, and completion/damage/destroy disable it.
- [x] A per-attack hit record resets at `beginAttack`, so one swing damages Player at most once across overlap updates.
- [x] Boss hits reuse Player HP -1, flash, 4-frame hit stop, 26px horizontal knockback, and 300ms hurt recovery.
- [x] Desktop and 844×390 smoke: 10 starts/completes, nine intentional hits, Player HP 10→1, one wrong-Y miss, disabled hitbox and zero Boss velocity at completion.
- [x] Boss defeat released the arena once and published one completion; 10 restarts retained Boss 0, entry locked, no camera lock or stale completion.
- [x] `pnpm test` 66/66, typecheck, lint 0 errors (8 existing warnings), both production builds, and browser runtime passed.
- [x] Player failure and deterministic restart was selected after 5R.5 and is now completed as M5R / Task 5R.6.

## M5R / Task 5R.6 Closeout

- [x] Player HP 0 now transitions once from `playing` to terminal `failed`; duplicate damage and repeated failure requests are ignored.
- [x] Failed mode stops Player velocity/input, disables Player attack, suspends EnemyManager/Boss movement and attack hitboxes, and pauses owned enemy state timers.
- [x] Removed the previous 900ms automatic death restart; keyboard or pointer/touch uses one explicit failure restart method and the existing Phaser Scene lifecycle.
- [x] Scene creation restores Title, HP 10, Player x=180, encounter index 0, Boss 0, entry locked, camera locks empty, and completion count 0.
- [x] Desktop and 844×390 browser smoke completed 10 real Boss-hit failure/restart cycles with one Canvas, all input blocked, all actors suspended, and zero runtime errors.
- [x] Boss attack, Boss defeat/arena-release, and two-encounter regressions remained green.
- [x] `pnpm test` 67/67, typecheck, lint 0 errors (8 existing warnings), and both production builds passed.
- [x] Boss defeat and exactly-once `cleared` flow was selected after 5R.6 and is now completed as M5R / Task 5R.7.

## M5R / Task 5R.7 Closeout

- [x] Defeated Boss completes the existing death animation and 500ms fade before idempotent cleanup reports `defeated`.
- [x] MainScene ordering is cleanup → Boss arena release → one `stage-completed` publication → one `playing → cleared` transition.
- [x] Destroyed/non-defeat cleanup and non-playing terminal flow cannot publish completion or enter `cleared`; `failed` and `cleared` remain mutually exclusive.
- [x] Cleared mode stops Player input/velocity/attack hitbox, suspends EnemyManager combat, and returns before encounter, Boss, damage, or camera progression.
- [x] Desktop and 844×390 browser smoke each produced Boss 0, arena release 1, completion 1, cleared entry 1, stopped combat, one Canvas, and zero runtime errors.
- [x] Failure/restart 10-cycle, Boss attack 10/10/9/HP1, and two ordered encounter regressions remained green.
- [x] `pnpm test` 69/69, typecheck, lint 0 errors (8 existing warnings), and both production builds passed.
- [x] End-to-end Vertical Slice acceptance completed as M5R / Task 5R.8 on 2026-07-17.

## M6 / Task 6.3 Closeout

- [x] 新增一次建立、Scene shutdown 銷毀的 Phaser `GameHud`；React、DOM 與 gameplay actor 不擁有 HUD state。
- [x] `GameplaySnapshot` 以 frozen primitive data 提供 flow、Player max HP 與 nullable Boss HP；HUD 不讀取 actor reference。
- [x] Player HP 在 playing、failed、cleared 正確；失敗顯示 0，10 次 retry 後 Title 重設為 10。
- [x] Boss bar 在 active 時顯示 8，受傷更新到 7，Boss cleanup/cleared 後隱藏；Scene reset 無 stale bar。
- [x] HUD 固定 13 個 Phaser GameObjects，update 僅更新 graphics/text/visibility，不建立 listener 或 React tree。
- [x] Desktop、844×390 landscape、390×844 portrait 均為單一 Canvas；觸控移動與攻擊未被 HUD 阻擋，console error 0。
- [x] Production 保留 HUD 且移除 development debug；70/70 tests、typecheck、lint 0 errors（8 existing warnings）、兩種 production build 通過。
- [x] 實玩回報的 encounter-clear camera 瞬間重新對齊已由 M5R / Task 5R.9 修正，不混入 HUD commit。

## M5R / Task 5R.9 Closeout

- [x] 先以 development telemetry 重現 lock release 當幀 `cameraScrollX 261 → 721`，單幀跳動 460px。
- [x] `CameraFollow` 新增 Phaser-free handoff policy；從既有 scroll 以 960px/s、每 update 最多 32px 追向動態 bounded target。
- [x] `MainScene` 在釋放 `encounter` lock 前開始 handoff；新 encounter lock 與 Boss arena lock 會明確結束 handoff ownership。
- [x] 兩場 encounter runtime smoke 均完成；desktop 最大單幀 17px、844×390 landscape 17px、390×844 portrait 16px，最後全部收斂至 `scrollX=1821`。
- [x] Landscape／portrait 的 360° touch joystick 與 attack 在 handoff 後仍可用；Boss entry、Boss clear、failure/retry 與 HUD 回歸通過。
- [x] Production 保留單一 Canvas、移除 development telemetry 且零 console error。
- [x] `pnpm test` 72/72、typecheck、lint 0 errors（8 existing warnings）與兩種 production build 通過。

The next eligible task is M6 / Task 6.4 — Pause/resume. Do not begin it until the next task-runner cycle.

## M5R / Task 5R.8 Closeout

- [x] Desktop 從 Phaser Title 以真實方向與攻擊輸入依序完成 `forest-entry`、`forest-ambush`、Boss arena 與 `cleared`，無 diagnostic shortcut。
- [x] 844×390 landscape 以畫面 360° 搖桿與攻擊鍵完成同一完整流程；單一 693×390 Canvas，零 runtime error。
- [x] 390×844 portrait FIT 以畫面搖桿與攻擊鍵完成同一完整流程；單一 325×183 Canvas，零 runtime error。
- [x] 獨立實玩進入 `failed`，按 Enter 明確 retry 後回到 Title；HP 10、Player x=180、encounter 0、Boss locked、actors/locks/camera 全部重設。
- [x] 實玩定位並修正 Player attack hitbox 高於 feet-based Enemy body 的阻斷；修正後同一招可在合理 Y 對線範圍命中，未更改傷害、動畫或內容。
- [x] 三種 viewport 均保持 encounter 順序、上下走位、Boss HP 8→0、stage completion 1、cleared entry 1、單一 Canvas與零 console error。
- [x] `pnpm test` 69/69 通過；typecheck、lint（0 errors、8 existing warnings）與兩種 production build 於 closeout 重跑。
- [x] Vertical Slice Recovery 完成；下一個唯一 Task 恢復為 M6 / Task 6.3 — Player/Boss HUD。

## M6 / Task 6.4 Closeout — 2026-07-18

- [x] 新增單一 Phaser-owned `PauseController`：鍵盤 `P` 與觸控共用同一 toggle request，忽略 keyboard repeat，並在 Scene shutdown 移除 listener 與五個 GameObjects。
- [x] `ClockState` 新增獨立 `manual` reason；Scene clock `timeScale=0` 凍結 TimerEvent，同時保留 Phaser input 接收 resume，Arcade Physics、animations、tweens 依所有 pause reasons 統一恢復。
- [x] 攻擊中暫停保持 Player state、animation frame、position、hitbox 與 camera；恢復後攻擊完成並立即恢復移動／攻擊輸入。
- [x] Desktop keyboard/touch、844×390 landscape touch、390×844 portrait touch 全部通過，且只有一個 Canvas。
- [x] Camera handoff regression：兩個 encounter 完成，最大 frame delta 18px，收斂到 `scrollX=1821`。
- [x] Boss entry/clear regression：Boss active/locked at `scrollX=2560`；清除後 Boss 0、release 1、completion 1、cleared 1。
- [x] Failure smoke 完成 10 次 failure/restart，回到 Title、HP 10、一個 Canvas、零 runtime errors。
- [x] `pnpm test` 73/73、`pnpm typecheck`、lint 0 errors（8 個既有 warnings）、`pnpm build`、`pnpm build:github-pages` 全部通過。
- [x] Production browser 顯示 Pause overlay、一個 Canvas、零 development datasets、零 runtime errors。

The next eligible task is M6 / Task 6.5 — Failure/continue/restart. Do not begin it until the next task-runner cycle.

## M6 / Task 6.5 Closeout — 2026-07-18

- [x] 新增一次建立、Scene shutdown 銷毀的 Phaser `FailureController`；overlay、keyboard listener 與 pointer handler 不再於每次失敗重建。
- [x] `FailureRestartGate` 在每次 failed state 最多接受一次 keyboard 或 pointer request；MainScene 只由 `restartAfterFailure()` 執行 Scene restart。
- [x] Failure shade、標題與提示固定於 Camera；修正 Boss 最後一幕看得到 overlay 但 pointer hit test 偏移的阻斷。
- [x] HP 0 維持 exactly-once failed、停止 Player/Enemy/Boss/attack/progression；retry 回到 Title、HP 10、encounter 0、Boss locked、零 camera lock。
- [x] Development smoke 連續 10 次 failure/restart：10 次 entry、10 次 restart、單一 Canvas、三個固定 Failure GameObjects、零 runtime error。
- [x] Desktop keyboard、844×390 landscape pointer、390×844 portrait pointer 均由明確 source 完成 retry；沒有 duplicate restart。
- [x] `pnpm test` 74/74、`pnpm typecheck`、lint 0 errors（8 個既有 warnings）、兩種 production build 通過。

The next eligible task is M6 / Task 6.6 — Result/replay. Do not begin it until the next task-runner cycle.

## M6 / Task 6.6 Closeout — 2026-07-18

- [x] 新增一次建立、Scene shutdown 銷毀的 Phaser `ResultController`；Result presentation 與 replay input 不進入 React/DOM。
- [x] `ResultReplayGate` 每次 cleared state 最多接受一次 keyboard 或 pointer request；MainScene 只由 cleared-only `replayAfterClear()` 執行 Scene restart。
- [x] Result 僅在 Boss cleanup、arena release、exactly-once stage completion 後顯示；Failure 與 Result gate 在不相符 terminal state 保持關閉。
- [x] Replay 回到 Title、HP 10、encounter 0、Boss locked/inactive、stage completion 0、Result hidden，沒有 stale actor、camera lock 或 Canvas。
- [x] Desktop keyboard、844×390 landscape pointer、390×844 portrait pointer 全部完成 replay；overlay 保持 camera-fixed 且可讀。
- [x] Development smoke 完成 10 次 clear/replay：10 次 entry、10 次 replay、單一 Canvas、零 runtime error。
- [x] `pnpm test` 76/76、typecheck、lint 0 errors（8 existing warnings）、production build 與 GitHub Pages build 通過。

The next eligible task is M6 / Task 6.7 — UI/mobile acceptance. Do not begin it until the next task-runner cycle.

## M6 / Task 6.7 Closeout — 2026-07-18

- [x] Desktop keyboard 驗收 Title、movement/attack、Pause/resume、Result/replay；encounter、Boss、Failure 與 terminal regressions保持通過。
- [x] 844×390 landscape touch 使用 360° 搖桿、攻擊與觸控 Pause；Canvas 為 693×390、控制可達且只有一個 Canvas。
- [x] 390×844 portrait touch 保持 16:9 FIT 與 safe-area；Canvas 為 325×183、搖桿、攻擊與 Pause 均可達。
- [x] 連續 10 次 failure/restart 與 10 次 clear/replay 均維持一個 Canvas，沒有 stale flow 或 listener accumulation。
- [x] 修正 vinext production 未編譯掉 `process.env.NODE_ENV` 的阻斷；正式 build 不再顯示 Physics debug、診斷文字或 development datasets。
- [x] `pnpm test` 77/77、typecheck、lint 0 errors（8 existing warnings）、`pnpm build`、`pnpm build:github-pages` 全部通過。
- [x] Source 與 production browser 均為一個 Canvas、零 browser error；M6 完成。

The next eligible task is M6A / Task 6A.1 — Visual target, Art Bible, and before/after baseline. Do not begin it until the next task-runner cycle.

## M6A / Task 6A.1 Closeout — 2026-07-18

- [x] `ART_BIBLE.md` 鎖定原創日式寫實三國 Pixel Art 的 silhouette、anatomy、display-height ratio、palette、lighting、pixel density、Stage、Effects 與產品 UI language。
- [x] 明確保留 damage、Combo、AI、Camera、Stage flow、world coordinates、Physics、active frame 與 hitbox timing contracts。
- [x] `docs/visual-baselines/m6a-6a1-before/` 保存同一 gameplay revision `3183f1f` 的 15 張 PNG：三 viewport × Title/combat/Boss/Failure/Result。
- [x] Baseline README 記錄 viewport、fitted Canvas、query、capture condition、命名與 development instrumentation 限制；browser error 0。
- [x] `ASSET_PIPELINE.md` 新增 provenance、shared stem naming、manual reviewer、baseline 與 matching after 規則。
- [x] Gap order 固定為 6A.2 Guan Yu → 6A.3 Enemy/Boss → 6A.4 Stage → 6A.5 Effects/UI → 6A.6 visual freeze。
- [x] 本 Task 未生成或替換任何 production art，未修改 runtime、gameplay 或 balance。

The next eligible task is M6A / Task 6A.2 — Guan Yu animation quality upgrade. Do not begin it until the next task-runner cycle.

## M6A / Task 6A.2 Closeout — 2026-07-18

- [x] Audited 17 legacy Guan Yu frames and recorded source bounds, facing, feet status, and accept/reject decisions.
- [x] Added 43 distinct genuine poses: idle 6, walk 8, attack1 5, attack2 6, attack3 8, hurt 4, dead 6.
- [x] Runtime uses one `guanyu-v2` atlas, 640×448 cells, feet anchor `(320,420)`, origin `(0.5,0.9375)`, display scale `0.64`, and logical idle height `230.4px`.
- [x] Attack phase durations remain startup 125ms / active 125ms / recovery 125ms for all three attacks; Combo, damage, body, hitbox, movement, AI, Stage, camera, and input contracts are unchanged.
- [x] Added reproducible component-isolation pipeline, explicit atlas/metadata, provenance, red-box/feet-line, onion-skin, and 25% silhouette QA sheets.
- [x] Attack preview exposes all 19 attack frames; visual review found no crop, neighbor contamination, duplicate pose, or feet-anchor drift.
- [x] `pnpm test` 78/78, typecheck, lint 0 errors (8 existing warnings), `pnpm build`, and `pnpm build:github-pages` passed.
- [x] Development preview, desktop 1280×720, landscape 844×390, portrait 390×844, and production browser smoke each retained one Canvas with zero runtime errors.

The next eligible task is M6A / Task 6A.3 — Enemy and Boss visual consistency. Do not begin it until the next task-runner cycle.

## M6A / Task 6A.3 Closeout — 2026-07-18

- [x] Audited 45 ordinary-enemy frames and 24 Boss frames with source rects, runtime alpha bounds, facing, feet, acceptance, and provenance metadata.
- [x] Rebuilt Soldier, Mauler, and Duelist into one 384×384 cell contract with feet `(192,354)`; each actor uses one scale across every state.
- [x] Art Bible logical idle heights are Soldier `213.06px`, Duelist `212.44px`, Mauler `239.8px`, and Boss `300.99px`; the lineup uses one shared ground line.
- [x] Source facing remains Soldier/Boss left and Mauler/Duelist right; startup/active/recovery frame names and active index 2 are unchanged.
- [x] Added transparent processed sources, provenance metadata, red-box/feet-line, onion, 25% silhouette, cast lineup QA, and `tools/build_cast_consistency_art.py`.
- [x] Boss retains 24 genuine lifecycle/attack poses, shared `(224,420)` feet anchor, and one `1.27` display scale; walk and active silhouettes are readable without transform tricks.
- [x] Runtime cast preview covers all four actors and every required state through deterministic query checkpoints.
- [x] Desktop, 844×390 landscape, and 390×844 portrait matrices retained one logical 1280×720 Canvas and zero browser errors.
- [x] `pnpm test` 79/79, typecheck, lint 0 errors (8 existing warnings), `pnpm build`, and `pnpm build:github-pages` passed.

The next eligible task is M6A / Task 6A.4 — Three-screen bamboo stage upgrade. Do not begin it until the next task-runner cycle.

## M6A / Task 6A.4 Closeout — 2026-07-23

- [x] Replaced the repeated prototype background with Forest Entry, Forest Ambush, and Boss Arena sections.
- [x] Added nine explicit 1280×720 runtime layers: background `-1000`, ground `-900`, and foreground `640` for each section.
- [x] Preserved the 3840×720 world, walk bounds, spawns, encounter triggers, camera locks, Boss coordinates, physics, combat, UI, and Audio scope.
- [x] Added source provenance, prompt IDs, shared 96-color palette processing, 64px seam normalization, metadata, 3840px/25% overview, seam QA, depth QA, and reproducible tooling.
- [x] Production runtime, desktop, 844×390 landscape, and 390×844 portrait retained aspect ratio and readable combat ground.
- [x] `pnpm test` 80/80, typecheck, lint 0 errors (8 existing warnings), `pnpm build`, and `pnpm build:github-pages` passed.

The next eligible task is M6A / Task 6A.5 — Combat effects and product UI art upgrade. Do not begin it until the next task-runner cycle.

## M6A / Task 6A.5 Closeout — 2026-07-23

- [x] Replaced procedural hit textures with a 5-frame Hit Spark, 4-frame impact dust, and a shared actor ground shadow while preserving accepted hit timing and coordinates.
- [x] Added original Title/HUD/Pause/Failure/Result frames, mobile joystick/attack art, and the `dragon-pixel` bitmap font in one deep-ink, antique-gold, jade, and red visual language.
- [x] Runtime assets are manifest-owned; source images, SHA-256 provenance, atlas/font metadata, debug sheets, and `tools/build_effects_ui_art.py` are committed reproducibly.
- [x] Existing damage, Combo, Hit Stop, flash, shake, knockback, state transitions, safe areas, pointer targets, world coordinates, Camera, Stage, actors, and Audio scope remain unchanged.
- [x] Production desktop Title/gameplay/Pause, 844×390 landscape, and 390×844 portrait FIT retained one Canvas and zero browser errors.
- [x] `pnpm test` 81/81, typecheck, lint 0 errors (8 existing warnings), `pnpm build`, and `pnpm build:github-pages` passed.

The next eligible task is M6A / Task 6A.6 — Visual acceptance and asset freeze. Do not begin it until the next task-runner cycle.

## M6A / Task 6A.6 Closeout — 2026-07-23

- [x] Generated and manually reviewed 15 matching desktop, 844×390 landscape, and 390×844 portrait before/after comparisons for Title, Combat, Boss, Failure, and Result.
- [x] Verified Failure/retry and Result/replay keyboard paths, one Canvas, zero runtime errors, and no production diagnostic leakage.
- [x] Audited 23 manifest entries, 31 requested asset files, hashes, dimensions, provenance, pipeline ownership, atlas/load budget, and all required QA artifacts.
- [x] Recorded 11,421,285 encoded bytes, estimated 136,629,760 decoded RGBA bytes, 24 runtime textures, 60.00 FPS average, and 59.92 FPS 1% low over 300 measured frames.
- [x] Frozen the accepted M6A asset set without changing art, gameplay, balance, animation timing, hitboxes, Camera, Stage flow, or Audio.

The next eligible task is M7 / Task 7.1 — Audio manager/mixer. Do not begin it until the next task-runner cycle.

## M7 / Task 7.1 Closeout — 2026-07-24

- [x] Added one Scene-owned Audio manager with independent SFX/BGM volume and mute state.
- [x] Subscribed once to readonly gameplay events without exposing actor, Scene, sound, or mutable references.
- [x] Added idempotent start, stop, reset, destroy, manual pause, visibility pause, and user-gesture unlock boundaries.
- [x] Scene shutdown removes gameplay, blur/focus, and unlock listeners; ten reset cycles retain one manager, one subscription, and one Canvas.
- [x] Real pointer start changed WebAudio from locked to unlocked; Pause/Resume changed Audio state without affecting gameplay timing.
- [x] No audio asset, placeholder sound, direct actor playback, combat, balance, art, UI, Camera, or Stage behavior was added or changed.

The next eligible task is M7 / Task 7.2 — Combat/UI SFX. Do not begin it until the next task-runner cycle.

## M7 / Task 7.2 Closeout — 2026-07-24

- [x] Added ten deterministic original mono 16-bit PCM WAV cues for attack, confirmed hit, Player hurt, Enemy death, Title, Pause, Resume, Failure, Result, and retry/replay confirmation.
- [x] Added a reproducible Node generator plus per-file duration, encoding, SHA-256, project-owned license, processing, and source metadata; no third-party sample is present.
- [x] Every cue is loaded through the runtime asset manifest and played only by `AudioManager` from immutable gameplay/product-flow events.
- [x] Same-frame multi-target `enemy-hit` events coalesce to one impact cue while each distinct attack, hurt, death, and product-flow event remains one-shot.
- [x] Locked cues queue without reporting playback; SFX volume/mute, manual/visibility pause, Scene shutdown, and ten reset cycles retain one manager, one subscription, and one Canvas.
- [x] Browser acceptance covered Title/start, touch attack, real Enemy hits/death, Boss-to-Player hurt, Pause/Resume, Failure/retry, Result/replay, and production with zero runtime errors.
- [x] Both production outputs contain ten WAV files; every production route returns 200 with `audio/wav`.
- [x] `pnpm test` passed 92/92; typecheck, lint 0 errors (8 existing warnings), `pnpm build`, and `pnpm build:github-pages` passed.

The next eligible task is M7 / Task 7.3 — Stage/Boss music. Do not begin it until the next task-runner cycle.

## M7 / Task 7.3 Closeout — 2026-07-24

- [x] Added deterministic original Stage and Boss compositions as mono 16-bit PCM WAV loops; no third-party samples or recordings.
- [x] Added a reproducible Node generator and metadata for duration, loop points, tempo, bars, encoding, SHA-256, source, processing, author, and license.
- [x] `BgmCatalog` maps only semantic Title start, Boss activation, Player death, and Stage completion events; actors, UI, React, and combat do not receive track keys.
- [x] `AudioManager` owns one looping track, ignores duplicate Stage/Boss requests, transitions Stage→Boss once, updates live BGM volume/mute, and stops once on Failure/Result.
- [x] Locked output keeps only the latest valid BGM intent; the same Scene cannot regress from Boss music to Stage music.
- [x] Browser acceptance covered Stage start, Pause/Resume, actual Stage→Boss transition, Failure, Result, ten Scene resets, fresh development, and production with one Canvas and zero errors.
- [x] Both music routes return 200 `audio/wav`; `pnpm test` passed 97/97, typecheck, lint 0 errors (8 existing warnings), and both builds passed.

The next eligible task is M7 / Task 7.4 — Mobile unlock/recovery. Do not begin it until the next task-runner cycle.

## M7 / Task 7.4 Closeout — 2026-07-24

- [x] `AudioManager` observes the owned WebAudio context in addition to Phaser's initial lock state, including `running`, `suspended`, `interrupted`, and `closed`.
- [x] The first explicit Title gesture coalesces unlock/recovery races and starts exactly one Stage track plus one Title cue.
- [x] Visibility recovery resumes the current Stage/Boss intent without creating a second track; unavailable gameplay SFX are suppressed and queued product cues are discarded on backgrounding.
- [x] Manual Pause and visibility remain independent; returning from background cannot resume output while manual Pause is still active.
- [x] Context listeners, gameplay subscription, BGM ownership, pending cues, and recovery state are cleaned through the existing Scene shutdown/reset path.
- [x] Development browser verified first tap, Pause/background/resume, one manager/subscription/Canvas, zero runtime errors, and ten Scene resets.
- [x] Physical iOS Safari and Android Chrome acceptance was explicitly reported as passed by the user; device, OS, and browser versions were not supplied and are recorded as unavailable rather than inferred.
- [x] `pnpm test` passed 101/101; typecheck, lint 0 errors (8 existing warnings), `pnpm build`, and `pnpm build:github-pages` passed.

The next eligible task is M7 / Task 7.5 — Audio acceptance. Do not begin it until the next task-runner cycle.

## M7 / Task 7.5 Closeout — 2026-07-24

- [x] Recorded complete success and Failure/retry cue matrices covering Title, combat, Pause/Resume, Stage/Boss BGM, terminal stop, retry, and replay.
- [x] Measured source WAV peaks and corrected the objective final-hit clipping risk only through existing catalog gains: hit `0.60`, Enemy death `0.50`, Stage BGM `0.30`, Boss BGM `0.30`.
- [x] Conservative simultaneous peak sums are approximately `0.991` for Stage and `0.980` for Boss; no master gain, audio asset, playback architecture, gameplay, or art changed.
- [x] Development smoke retained one Canvas, one Audio manager, one gameplay subscription, one Stage→Boss transition, and completed ten failure/retry plus ten Result/replay cycles.
- [x] Local production start and deployed GitHub Pages revision `d7b477b` passed; the user explicitly accepted physical iOS Safari and Android Chrome mix behavior.
- [x] Device, OS, and browser versions were not supplied and remain recorded as unavailable rather than inferred.
- [x] `pnpm test` passed 103/103; typecheck, lint 0 errors (8 existing warnings), `pnpm build`, and `pnpm build:github-pages` passed.

## M8 / Task 8.1 Closeout — 2026-07-24

- [x] Defined desktop, 844×390 landscape-fit, and 390×844 portrait-fit budgets.
- [x] Measured Title, Combat, Handoff, Boss, Failure, and Result twice per profile after 60 warm-up and 300 sampled frames (36 runs total).
- [x] Frame-rate, 1% low, worst-frame, two-run stability, heap, texture, requested-runtime asset, decoded-texture, and raw-JavaScript budgets passed.
- [x] Ten reset, ten failure/retry, and ten Result/replay cycles retained one Canvas, one Audio manager, one gameplay subscription, and stable actors/textures.
- [x] Local production retained one Canvas and ignored all performance profiling query flags.
- [x] GitHub Pages artifact measured 125,451,173 bytes against a 30 MiB budget; runtime-requested assets remained 12,891,503 bytes, proving a packaging defect rather than a runtime-load regression.
- [x] `pnpm test` passed 107/107; typecheck, lint 0 errors (8 existing warnings), `pnpm build`, and `pnpm build:github-pages` passed.

## M8 / Task 8.4 Closeout — 2026-07-24

- [x] Inventoried 43 manifest requests plus three unique React/GitHub Pages side-art files.
- [x] Both builds preserve exactly 46 public files and exclude 99 copied source/debug/QA files without deleting repository sources.
- [x] Every preserved file has the same SHA-256 in `public/`, `dist/client`, and `dist-github`.
- [x] GitHub Pages artifact decreased from 125,451,173 to 18,172,139 bytes; runtime requests remain 12,891,503 bytes and decoded RGBA remains 136,629,760 bytes.
- [x] Every required Vinext route returns 200 with the correct JSON/PNG/XML/WAV content type; representative QA routes return 404.
- [x] Desktop, landscape, and portrait Title/Combat/Handoff/Boss/Failure/Result passed with one Canvas, 24 textures, one Audio manager, and one gameplay subscription.
- [x] Ten reset, ten Failure/retry, and ten Result/replay cycles retained stable ownership.
- [x] Vinext production and GitHub Pages preview loaded the packaged build and side art successfully.
- [x] `pnpm test` passed 110/110; typecheck, lint 0 errors (8 existing warnings), and both builds passed.

The next eligible task is M8 / Task 8.2B — Mixed Encounter Decision Prototype.

## M8 / Task 8.2A — Combo Commitment Prototype — 2026-07-25

Status: accepted by reviewer on 2026-07-25.

- [x] Kept attack1 and attack2 at 375 ms, 1 damage, 26 px knockback, and 4-frame hit stop.
- [x] Made attack3 a 650 ms finisher: 2 damage, 60 px knockback, 6-frame hit stop, and 400 ms recovery after reviewer feedback found the 250 ms recovery insufficiently distinct.
- [x] Added focused Combo-commitment contracts and retained hit-confirm, one-input-per-step, hit-once, pause/hit-stop, and Scene-reset coverage.
- [x] Direct deterministic suite passed 113/113; typecheck and production builds passed; ESLint has 0 errors and the existing 8 warnings.
- [x] Desktop, 844x390, and 390x844 production smoke passed with one Canvas and no captured browser errors.
- [x] Reviewer accepted the 650 ms finisher and 400 ms Recovery as having sufficient commitment.

See `docs/combat/m8-2a-combo-commitment.md` for the parameter table and evidence boundary.

## M8 / Task 8.2B — Mixed Encounter Decision Prototype — 2026-07-25

Status: implementation verification complete; reviewer strategy comparison pending.

- [x] Mauler attack now locks weapon direction and Y line at startup.
- [x] Mauler attack cadence is 200ms startup, 200ms active, and 200ms recovery.
- [x] Duelist remains constrained by the existing one-attacker Attack Slot.
- [x] Focused line-lock and vertical-escape tests added; full suite passed 115/115.
- [ ] Record five fixed-target runs and five deliberate-play runs in encounter 2.

## TP-1 — Shield Guard Tactical Prototype — 2026-07-25

Status: implementation verification complete; manual strategy comparison pending.

- [x] Added development-only Test A (`?shieldGuardTest=A`) and Test B (`?shieldGuardTest=B`) without changing formal Stage encounters.
- [x] Added forward-cone guard, 800 ms facing lock, attack line lock, 800–1200 ms recovery, block feedback, and per-attack block de-duplication.
- [x] Preserved Soldier HP and the existing single Attack Slot; block produces neither damage nor Combo hit confirmation.
- [x] 122 automated tests, typecheck, lint (0 errors; four existing image warnings), Vinext build, GitHub Pages build, and desktop browser smoke passed.
- [x] Reviewer accepted the prototype after live Guard, flanking, re-guard, counter, and collision verification on 2026-07-26.

## TP-2 — Crossbow Line-Control Prototype — 2026-07-26

Status: accepted by reviewer on 2026-07-26.

- [x] Added development-only Test A (`?crossbowTest=A`) and Test B (`?crossbowTest=B`) without changing formal Stage encounters.
- [x] Added 550 ms Aim tracking, 350 ms locked line, one straight temporary arrow at 900 ms, and 3000 ms Reload.
- [x] Arrow only checks the Player's locked lane and passes through other enemies; friendly-fire was removed after TP-3 exposed an illogical Shield Guard self-kill loop.
- [x] Crossbow shares the existing single Attack Slot and releases it immediately after Fire or when its Aim is interrupted.
- [x] Reviewer accepted the prototype after local Crossbow line, range, and locked-lane verification on 2026-07-26.

## TP-3 — Shield Guard + Crossbow Composition — 2026-07-26

Status: accepted by reviewer on 2026-07-26.

- [x] Added development-only `?shieldCrossbowTest=1` with one Shield Guard and one Crossbow; formal Stage encounters remain unchanged.
- [x] Composition retains the existing single Attack Slot, Shield Guard facing lock, and Crossbow locked-lane contract.
- [x] Crossbow arrows ignore other enemies so TP-3 tests player pressure, not ally self-damage.
- [x] Reviewer accepted readable vertical evasion, flanking, target switching, and recovery windows on 2026-07-26.
- [x] The friendly-fire experiment was removed before acceptance: arrows pass through allies and only pressure the Player.

The next eligible task is ER.1 — Five-Enemy Production Contract. It is a planning-only production-art contract and must not change runtime assets or gameplay.

## ER.1 — Five-Enemy Production Contract — 2026-07-26

Status: completed.

- [x] Recorded the external color and silhouette references as review-only provenance; no reference image was copied into the repository or runtime build.
- [x] Defined the five role silhouettes, source facing, logical display-height targets, shared anchor policy, measured-frame requirement, and one-scale-per-actor rule.
- [x] Defined the full state/frame budgets, physics ownership boundaries, and Go/Revise/No-Go gates for Soldier, Duelist, Mauler, Shield Guard, and Crossbow.
- [x] Set production decoded-memory, encoded-PNG, runtime texture-count, and GitHub Pages artifact ceilings before any art generation.
- [x] Recorded the Shield Guard and Crossbow temporary-art debt and selected an isolated Soldier pilot as the next task.
- [x] Full suite passed 127/127; typecheck passed; lint has 0 errors and 4 existing image warnings; direct Vinext/Vite production builds and asset packaging retained the 43 request files, 46 production files, and 136,629,760 decoded RGBA bytes.
- [ ] `pnpm build` remains blocked by the repository's ignored dependency-build policy before it reaches Vinext; direct project build commands passed and the blocker is recorded in Technical Debt.

## ER.2 — Soldier Production-Art Pilot — 2026-07-26

Status: completed and accepted by reviewer.

- [x] Replaced only the Soldier runtime presentation with 15 distinct
  project-owned idle, walk, attack, hurt, and dead poses.
- [x] Replaced the rejected `walk-3`, all three attack poses, and all four dead
  poses with independent corrected sources; the reviewer accepted the revised
  animation sheet.
- [x] Packed the final runtime atlas into ER.1-compliant 288×288 cells with
  feet `(144,265)`, origin `(0.5,0.920138...)`, one `1.025` display scale, and
  a 210.12px logical idle height.
- [x] Preserved Soldier animation keys, attack phase order, gameplay body,
  attack hitbox, HP, damage, speed, AI, Stage data, Camera, UI, and other enemy
  assets.
- [x] Added measured source rectangles, runtime alpha bounds, display offsets,
  pixel hashes, provenance, debug sheet, onion sheet, and 25% silhouette QA.
- [x] Runtime requested bytes decreased to 12,880,839 and decoded RGBA to
  132,759,040; the GitHub Pages artifact remains 18,516,446 bytes.
- [x] Direct deterministic suite passed 127/127; typecheck passed; lint has
  zero errors and eight existing image warnings.
- [x] Direct Vinext and Vite builds plus both production-asset packaging passes
  succeeded; all 46 production files preserve source hashes.
- [x] Final production smoke passed at 1280×720, 844×390, and 390×844 with one
  Canvas, no overflow, and zero captured browser errors.
- [ ] Package-manager commands remain blocked before their scripts by TD-M11's
  ignored-build dependency-status check; the equivalent direct project
  commands above passed and the failure is not hidden.

The next eligible task is ER.3 — Duelist Production-Art Replacement. Do not
begin it until the next task-runner cycle.

## ER.3 — Duelist Production-Art Replacement — 2026-07-26

Status: completed.

- [x] Replaced only Duelist presentation with fifteen distinct project-owned
  idle, walk, attack, hurt, and dead poses.
- [x] Measured the non-equal 1619×971 source rectangles instead of slicing an
  assumed equal grid.
- [x] Packed a 5×3 288×288 atlas with feet `(144,265)`, one `1.025` display
  scale, right-authored facing, and exactly 205px logical idle height.
- [x] Preserved Duelist HP, speed, range, attack timing, body, hitbox, AI,
  Attack Slot, encounter, Stage, Camera, UI, Audio, and all other actor art.
- [x] Added source/alpha provenance, runtime metadata, debug, onion, 25%
  silhouette, shared lineup, review baseline, and focused contracts.
- [x] Runtime requests remain 43 files; encoded bytes are 12,771,452, decoded
  RGBA is 128,888,320, and the GitHub Pages artifact is 18,063,334 bytes.
- [x] Direct suite passed 128/128; typecheck passed; lint has zero errors and
  eight existing warnings; direct Vinext/Vite builds and packaging passed.
- [x] Production smoke passed at 1280×720, 844×390, and 390×844 with one
  Canvas, no overflow, and zero browser errors.
- [ ] Package-manager commands remain blocked before project scripts by
  TD-M11; equivalent direct gates passed.

The next eligible task was originally recorded as ER.4 — Mauler Production-Art
Replacement.

## ER.3 approved-prototype correction — 2026-07-26

- [x] Restored the approved five-enemy color and silhouette references as
  repository-owned review assets.
- [x] Recorded immutable visual locks for all five original prototypes.
- [x] Audited the current ER.3 Duelist against those references.
- [ ] ER.3 production visual accepted.

ER.3's atlas, metadata, animation, build, and viewport checks remain valid
technical evidence. Its visual identity is `Revise`: exposed-topknot masked
ninja styling and short hook blades do not match the approved full hood/cowl
and long twin hooks. The only next task is ER.3R — Duelist Approved-Prototype
Correction. Do not begin ER.4.

## ER.3R — Duelist Approved-Prototype Correction — 2026-07-26

Status: completed and accepted.

- [x] Passed a neutral-idle identity gate before full-sheet integration:
  repository-approved full hood/cowl, shadowed face, low stance, and exactly
  two long inward-curved hooks.
- [x] Replaced only Duelist source, transparent derivative, atlas, metadata,
  and QA evidence; no gameplay, animation timing, body, hitbox, Stage, Camera,
  UI, Audio, or other actor asset changed.
- [x] Preserved 15 distinct frames, 5×3 288×288 atlas, feet `(144,265)`,
  `1.025` display scale, right-authored facing, and 206.02px logical idle
  height.
- [x] Debug, onion, 25% silhouette, lineup, measured rectangles, pixel hashes,
  and repository-owned idle review evidence passed.
- [x] Runtime remains 43 requests / 12,788,345 encoded bytes /
  128,888,320 decoded RGBA bytes; GitHub Pages output is 18,080,227 bytes.
- [x] Direct suite passed 129/129; typecheck passed; lint has zero errors and
  eight existing image warnings; direct Vinext/Vite builds and packaging
  passed.
- [x] Production smoke passed at Desktop, 844×390, and 390×844 with one
  1280×720 Canvas, no page overflow, and zero captured browser errors.
- [ ] Package-manager wrappers remain affected by TD-M11; direct project gates
  above are the recorded acceptance evidence.

The only next task is ER.4 — Mauler Production-Art Replacement. GX.1 Duelist
Leap Mobility remains separately planned and must not be mixed into ER.4.

## ER.4 — Mauler Production-Art Replacement — 2026-07-26

Status: completed and accepted.

- [x] Passed the neutral-idle identity gate against both repository-owned
  references: broad red/brown bearded heavy fighter with one long square-headed
  war hammer.
- [x] Replaced the temporary presentation with seventeen genuine poses: idle 2,
  walk 4, attack 5, hurt 2, and dead 4.
- [x] Used measured source rectangles, one 288×288 runtime cell contract,
  common `(144,265)` feet anchor, one `1.05` scale, and 240.45px logical idle
  height.
- [x] Preserved HP, speed, range, damage, AI, body, hitbox, Attack Slot, and
  exact 600ms attack timing.
- [x] Added source/transparent derivatives, atlas, metadata, debug, onion,
  25% silhouette, cast lineup, neutral gate, review baseline, and hashes.
- [x] Direct suite passed 129/129; typecheck passed; lint has zero errors and
  eight existing warnings; both direct builds and packaging passed.
- [x] Desktop, 844×390, and 390×844 production smoke retained one 1280×720
  Canvas, no overflow, and zero captured browser errors.
- [x] Post-review correction expanded only `attack-0` source X range from
  `232..460` to `232..484`; the complete hammer now retains 9 source pixels
  and 41 runtime pixels of right-side padding without neighboring-pose
  contamination.
- [ ] Package-manager wrappers remain affected by TD-M11; equivalent direct
  project gates above are the recorded acceptance evidence.

The only next task is GX.1 — Duelist Leap Mobility Prototype. Do not begin
Shield Guard or Crossbow production art in the same task.

## GX.1 — Duelist Leap Mobility Prototype — 2026-07-26

Status: completed.

- [x] Revalidated ER.4 with the complete 129-test baseline before implementation.
- [x] Used both repository-owned approved lineup references and the accepted
  ER.3R Duelist as mandatory visual inputs.
- [x] Added four genuine poses: takeoff, airborne, descent, and landing.
- [x] Preserved one `1.025` scale, one `(144,265)` feet anchor, full hood/cowl,
  shadowed face, and exactly two long inward-curved hooks.
- [x] Locked the landing destination before takeoff; no airborne homing reads
  current Player position.
- [x] Separated sprite elevation from ground/body position and displayed a
  locked landing shadow.
- [x] Retained the single Attack Slot through leap commitment and released it
  on landing, Hurt, Dead, suspension cleanup, and reset.
- [x] Added a localhost-only `?duelistLeapTest=1` entrance without changing
  formal Stage encounters.
- [x] Direct tests passed 131/131; typecheck passed; lint has zero errors and
  eight existing warnings; both builds and production packaging passed.
- [x] Desktop, 844×390, and 390×844 smoke showed the airborne pose with one
  Canvas, no overflow, and zero captured browser errors.

The only next task is ER.5 — Shield Guard Production-Art Replacement. Do not
begin Crossbow production art or alter TP-1 gameplay in the same task.

## ER.5 — Shield Guard Production-Art Replacement — 2026-07-29

Status: completed.

- [x] Passed a neutral-idle identity gate against both repository-owned
  references before full-sheet integration.
- [x] Replaced the Soldier substitute with 21 genuine poses: idle 2, walk 4,
  attack 3, hurt 2, dead 4, guard 2, block 2, and recovery 2.
- [x] Preserved one 288×288 cell contract, `(144,265)` feet anchor, `1.025`
  scale, 215.25px logical idle height, and 21 distinct pixel hashes.
- [x] Integrated dedicated guard, block, and recovery animations without
  changing TP-1 gameplay constants or formal Stage configuration.
- [x] Added measured atlas metadata, source/transparent derivatives, debug,
  onion, 25% silhouette, identity gate, review sheet, and build tool.
- [x] Runtime inventory is 47 requests / 13,881,969 encoded bytes /
  136,297,984 decoded RGBA bytes; production inventory is 50 files /
  17,658,589 bytes; GitHub Pages output is 19,178,685 bytes.
- [x] Desktop, 844×390, and 390×844 smoke passed with readable Shield Guard
  identity and zero captured browser errors.
- [x] Direct suite passed 132/132; typecheck passed; lint has zero errors and
  four existing `<img>` warnings; Vinext/Vite builds and packaging passed.
- [ ] Package-manager wrappers remain affected by TD-M11; equivalent direct
  project gates are the acceptance evidence.

The only next task is ER.6 — Crossbow Production-Art Replacement. Do not alter
TP-2 gameplay or begin another enemy, Stage, Player, Camera, UI, or Audio task.

## ER.6 — Crossbow Production-Art Replacement — 2026-07-29

Status: completed.

- [x] Passed a neutral-idle identity gate against both repository-owned
  references before full-sheet integration.
- [x] Replaced the Soldier substitute with 20 genuine poses: idle 2, walk 4,
  fire 3, hurt 2, dead 4, aim 2, locked 1, and reload 2.
- [x] Preserved one 288×288 cell contract, `(144,265)` feet anchor, `1.025`
  scale, 210.12px logical idle height, and 20 distinct pixel hashes.
- [x] Added dedicated aim, locked, fire, and reload presentation without
  changing TP-2/TP-3 timing, projectile, targeting, slot, or Stage contracts.
- [x] Added measured metadata, source/transparent derivatives, debug, onion,
  25% silhouette, identity gate, review sheet, and reproducible build tool.
- [x] Runtime inventory is 49 requests / 14,810,812 encoded bytes /
  142,933,504 decoded RGBA bytes; production inventory is 52 files /
  18,587,432 bytes; GitHub Pages output is 20,108,383 bytes.
- [x] Desktop, 844×390, and 390×844 smoke passed with readable aim/locked/
  reload states and zero captured browser errors.
- [x] Direct suite passed 133/133; typecheck passed; lint has zero errors and
  eight existing `<img>` warnings; Vinext/Vite builds and packaging passed.
- [ ] Package-manager wrappers remain affected by TD-M11; equivalent direct
  project gates are the acceptance evidence.

The only next task is M8 / Task 8.3 — Release Visual Defect Pass. Do not reopen
the approved enemy identities or begin accessibility, full QA, or release work
in the same task.

## M8 / Task 8.3 — Release Visual Defect Pass — 2026-07-29

Status: completed.

- [x] Inspected Player, Soldier, Duelist, Mauler, Shield Guard, Crossbow, Boss,
  three Stage sections, camera handoff, HUD, touch controls, Failure, and Result.
- [x] Found no reproducible Critical, High, or Medium visual defect; changed no
  production art, gameplay, Camera, Stage, control, or responsive CSS.
- [x] Added focused bounds, feet-anchor, Boss alignment, Stage continuity,
  pixel-filtering, FIT, safe-area, and production-debug regression checks.
- [x] Development formal encounter, composition, Boss, Failure, Result, and
  cast-preview paths retained one Canvas and zero captured errors.
- [x] Production Desktop, 844×390, and 390×844 retained one Canvas, no overflow,
  no diagnostic dataset/debug overlay, and zero captured errors.
- [x] `pnpm test` passed 138/138; `pnpm typecheck`, `pnpm lint` with zero
  errors/eight existing `<img>` warnings, `pnpm build`, and
  `pnpm build:github-pages` all reached and completed their project scripts;
  both outputs preserve 52 production files.
- [ ] New physical coarse-pointer device evidence was unavailable; retained as
  a Low M8.7 follow-up without invalidating prior reported mobile acceptance.

The only next task is M8 / Task 8.6 — Flash/Shake Accessibility Settings. Do
not begin five-enemy Stage integration, the full QA matrix, release work, new
content, or art generation in the same task.

After M8.6 is accepted, the next planned task is M8 / Task 8.2C — Five-Enemy
Stage Encounter Integration. It will place Soldier, Duelist, Mauler, Shield
Guard, and Crossbow into the formal three-screen Stage before M8.7 full QA.
Shield Guard and Crossbow remain development-only encounter content until that
task is implemented and accepted.

## M8 / Task 8.6 — Flash/Shake Accessibility Settings — 2026-07-30

Status: completed.

- [x] Added one Scene-owned, Phaser-free settings object; no React state,
  backend, local storage, or general settings framework.
- [x] Added independent Pause-menu toggles: keyboard `F` / `K` and two touch
  targets for reduced flash and reduced shake.
- [x] Preserved default flash tint `0xffffff`, flash duration 90ms, shake
  duration 50ms, and shake intensity `0.003`.
- [x] Reduced mode uses flash tint `0x9fb3a0` and shake intensity `0.0008`;
  damage, Hit Stop, spark, animation, knockback, Camera follow/lock/handoff,
  Pause timing, and combat state remain unchanged.
- [x] Pause/resume retained both settings. Scene restart retains the same
  Scene-owned settings object for the current page session.
- [x] `pnpm test` passed 143/143; typecheck passed; lint has zero errors/eight
  existing `<img>` warnings; both production builds retained 52 files.
- [x] Desktop, 844×390, and 390×844 showed the settings surface and accepted
  keyboard/touch changes with one Canvas, no overflow, and zero browser errors.
- [x] Production exposed the settings UI but no development Canvas dataset.

The only next task is M8 / Task 8.2C — Five-Enemy Stage Encounter Integration.
Do not begin M8.7 full QA, release work, a new Stage, enemy art, or new gameplay
systems in the same task.

## M8 / Task 8.2C — Five-Enemy Stage Encounter Integration — 2026-07-30

Status: completed.

- [x] Integrated Soldier, Shield Guard, Mauler, Duelist, and Crossbow into the
  formal three-screen Stage exactly once.
- [x] Kept the deterministic two-encounter sequence: two enemies at
  `forest-entry`, then three enemies at `forest-ambush`.
- [x] Preserved all existing Player, enemy config, HP, damage, AI, Attack Slot,
  Boss, Camera, Audio, animation, and art contracts.
- [x] Added focused tests for role coverage, spawn bounds/spacing, ordered
  cleanup, reset, one EnemyManager, and one Attack Slot.
- [x] Desktop, 844×390, and 390×844 smoke reached Result after both encounters
  and Boss with one Canvas, no overflow, and zero captured errors.
- [x] Full test, typecheck, lint, production build, and GitHub Pages build gates
  passed.

The only next task is M8 / Task 8.7 — Full QA Matrix. Do not add content,
retune combat, or begin release changes in the same task.

## M8 / Task 8.7 — Full QA Matrix — 2026-07-30

Status: completed. Milestone 8 accepted.

- [x] Revalidated Task 8.2C with 102/102 focused tests.
- [x] Passed 147/147 full tests, typecheck, lint with zero errors/eight
  existing warnings, Vinext build, and GitHub Pages build.
- [x] Completed the formal five-enemy Stage and Boss on Desktop, 844×390, and
  390×844 with one Canvas, no overflow, and zero captured runtime errors.
- [x] Completed 10 deterministic Failure/Retry and 10 Result/Replay cycles.
- [x] Verified Pause/resume, reduced flash, reduced shake, Audio ownership,
  Camera/Stage flow, landscape touch movement/attack, and portrait touch
  movement/attack.
- [x] Verified production ignores development query modes and exposes zero
  Canvas dataset keys in all three viewports.
- [x] Verified representative Vinext and GitHub Pages HTML, Player PNG, and
  Stage BGM routes return 200 with correct content types.
- [x] Classified defects: Critical 0, High 0, Medium 0, Low 1.
- [ ] Optional root `/favicon.ico` returns 404 in the GitHub Pages preview;
  carry this route finding into M9.1 without changing M8 code.
- [ ] New physical device versions were unavailable; prior user-accepted iOS
  Safari and Android Chrome evidence remains valid but lacks version metadata.

The only next task is M9 / Task 9.1 — Production route/hosting verification.
Do not start versioning, platform acceptance, rollback, release, or gameplay
work in the same task.

## M9 / Task 9.1 — Production Route and Hosting Verification — 2026-07-30

Status: completed.

- [x] Added a reproducible verifier for generated HTML routes and the 52-file
  runtime/shell inventory.
- [x] Added GitHub Pages HTTP status, MIME, repository base-path, reload,
  excluded-route, and wrong-base regression coverage.
- [x] Verified 54/54 required non-document routes on the public deployment.
- [x] Identified the exact deployed commit
  `b07bd03ae9a4061f6bd1124bee0d5aad3a161c15` and successful workflow run
  `30481481187`.
- [x] Passed Desktop, 844×390, and 390×844 browser smoke on Vinext production,
  Pages preview, and the deployed URL with one Canvas, zero debug dataset keys,
  no overflow, and zero captured errors.
- [x] Verified direct public navigation and reload.
- [x] Explicitly waived optional user-site root `/favicon.ico` 404; repository
  Pages owns `/three-kingdom/`, and every required route passes.
- [x] Passed 148/148 tests, typecheck, lint with zero errors/eight existing
  warnings, Vinext build, and GitHub Pages build.
- [x] Preserved gameplay, art, animation, balance, Stage, Camera, Audio, input,
  UI flow, and production asset bytes.

The only next task is M9 / Task 9.2 — Release Candidate and Versioning. Do not
start platform acceptance, rollback, release, or gameplay work in the same
task.
