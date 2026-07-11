# Technical Debt Register

更新規則：每項債務必須有 Evidence、Impact、Resolution、Target。修復後移至文末 Resolved，不直接刪除紀錄。

## Critical

### TD-C02 — Test suite validates deleted starter content

- **Evidence:** `tests/rendered-html.test.mjs` 要求 `_sites-preview`、starter title 與 `react-loading-skeleton`，repository 已無這些檔案。
- **Impact:** `pnpm test` 無法反映遊戲品質；CI 信號失真。
- **Recommended Resolution:** 替換為 app shell、Phaser lifecycle、asset route 與 gameplay contract tests。
- **Target:** M0 / Task 0.4。

### TD-C04 — Production asset routing is unreliable

- **Evidence:** 本機 `vinext start` 曾回傳 HTML，但 `/assets/*.js` 為 404；需代理才能完成 runtime smoke。
- **Impact:** Production build 成功但實際頁面可能白屏。
- **Recommended Resolution:** 建立 production route smoke test，修復 Vinext/Sites asset serving config。
- **Target:** M0 / Task 0.4；M9 再次驗證。

## High

### TD-H02 — Typecheck is not part of build and currently fails

- **Evidence:** `vinext build` 通過；`tsc --noEmit` 在 legacy game、MainScene graphics options、Cloudflare ambient types 失敗。
- **Impact:** Production build 可接受不安全型別。
- **Resolution:** 新增獨立 `typecheck` script；隔離 worker/browser tsconfig；修正真實 errors。
- **Target:** M0 / Task 0.4。

### TD-H03 — MainScene owns too many responsibilities

- **Evidence:** 約 571 行，同時處理 input、player state、combo、effects、debug 與 previews。
- **Impact:** 任一新功能容易破壞玩家輸入或戰鬥時序。
- **Resolution:** 依 M1/M2逐步抽出 Input、Player、Combat Effect、Debug；禁止一次性 rewrite。
- **Target:** M1–M2。

### TD-H04 — No gameplay regression tests

- **Evidence:** 沒有 Player state、Attack Slot、multi-hit、cleanup、Scene lifecycle tests。
- **Impact:** 既有四類阻斷性 bug 容易復發。
- **Resolution:** 先固定 contracts，再建立 deterministic tests。
- **Target:** M0、M2、M3。

### TD-H05 — Mobile is a release target but has no Phaser touch input

- **Evidence:** 正式 Phaser input 只有 keyboard；舊 mobile DOM controls 屬未使用 legacy runtime。
- **Impact:** 手機使用者無法操作。
- **Resolution:** Phaser UI/input action layer；不得復用 DOM gameplay controls。
- **Target:** M1。

## Medium

### TD-M01 — Dual package manager lockfiles

- **Evidence:** `package-lock.json` 與 `pnpm-lock.yaml` 並存；啟動腳本實際使用 bundled Node/Vinext。
- **Impact:** dependency resolution 不一致。
- **Resolution:** 選定 pnpm，更新 scripts/README/CI，移除 npm lockfile。
- **Target:** M0。

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

## Resolved

### TD-C01 — Core prototype changes were uncommitted

- **Resolved:** 2026-07-12，M0 / Task 0.1。
- **Evidence:** `bae05a1` 保存 Phase 3／4 prototype；build、desktop combat smoke 與 clean worktree 通過。

### TD-C03 — Suspected mojibake in product and design documents

- **Resolved:** 2026-07-12，M0 / Task 0.2。
- **Evidence:** 以 UTF-8 明確解碼 repository 文字檔，無 `U+FFFD` 或常見 mojibake；`GAME_SPEC.md`、`ART_BIBLE.md`、UI 與 launch scripts 可讀。先前異常來自 Windows PowerShell 5 `Get-Content` 的預設編碼。

### TD-H01 — Legacy Canvas runtime remained in active TypeScript scope

- **Resolved:** 2026-07-12，M0 / Task 0.2。
- **Evidence:** 全 repository reference scan 證明 `app/game.tsx`、`game-extra.css`、`scene-overrides.css` 未被引用後移除；正式入口維持 `app/page.tsx → PhaserGame.tsx → MainScene.ts`。
