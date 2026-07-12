# Technical Debt Register

更新規則：每項債務必須有 Evidence、Impact、Resolution、Target。修復後移至文末 Resolved，不直接刪除紀錄。

## Critical

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
