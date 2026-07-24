# 三國街機橫向動作遊戲

一款使用 Phaser 3 製作、以三國為題材的 2.5D Pixel Art Beat 'em Up prototype。目標是建立接近 1990 年代 Capcom／IGS 街機的移動、對線、攻防與群戰手感，同時維持原創人物與素材。

## 五分鐘理解專案

- **Runtime:** Phaser 3 + Arcade Physics。
- **Web shell:** React 19 / Next-compatible Vinext。
- **Rendering:** 1280×720、16:9、nearest-neighbor、腳底 Y depth sorting。
- **Current player:** 關羽。
- **Current combat:** 八方向移動、三段 Combo、Hurt、Hit Stop、Flash、Spark、Knockback、Camera Shake。
- **Current enemies:** 三種近戰小兵、Formation Slot、單一 Attack Slot、獨立 HP/state/death cleanup。
- **Current stage:** 3840×720 三畫面竹林、兩場依序 encounter、Boss arena、failed/retry 與 cleared/replay。
- **Release target:** Desktop Web + Mobile landscape Web。
- **First Vertical Slice:** 關羽、一完整關卡、2–3 種近戰小兵、一名 Boss。

## Architecture

```text
React page shell
  → PhaserGame instance lifecycle
    → MainScene orchestration
      → Player input/state/combat
      → EnemyManager
        → EnemyCombatant × 3
      → Arcade Physics / Animations / Debug
```

React 不管理 gameplay state。所有角色、輸入、動畫、碰撞、AI、Camera 與 update loop 必須位於 Phaser。

詳細說明：[ARCHITECTURE.md](ARCHITECTURE.md)

## Requirements

- Node.js `>=22.13.0`
- pnpm
- Windows 可使用 repository 根目錄的 `啟動遊戲.cmd`

目前 repository 已完成 M6 Product Flow and UI 與 M6A Visual Upgrade/freeze：可從 Title 完成整個 Vertical Slice，並通過 desktop、landscape touch、portrait FIT、production 與 60 FPS 視覺驗收。第一次接手請先閱讀 [SPRINT.md](SPRINT.md) 與 [NEXT_TASK.md](NEXT_TASK.md)，不要直接新增功能。

## Run

```powershell
pnpm install
pnpm dev
```

或 Windows：

```powershell
.\啟動遊戲.cmd
```

開啟終端顯示的 Local URL。

## Commands

```powershell
pnpm dev        # Local development
pnpm build      # Production build
pnpm lint       # ESLint
pnpm typecheck  # Browser app + Cloudflare worker TypeScript
pnpm test       # Current test command
```

`pnpm typecheck` 已同時驗證正式 `app/**` 與獨立 Cloudflare Worker boundary。`pnpm test` 現在驗證 app shell、Phaser lifecycle、production routes 與目前敵人／戰鬥 contracts。

## Controls

| Action | Keyboard |
|---|---|
| Move | WASD / Arrow keys |
| Attack / Combo input | J |
| Pause / Resume | P |

Mobile 使用 Phaser 360° 搖桿、攻擊鍵與 Pause 按鈕；正式 runtime 不包含 DOM gameplay controls。

## Debug Modes

Development only：

- `?debugInput=1` — input、state、enemy/attack diagnostics。
- `?previewAttack=1` — 關羽攻擊逐格預覽。
- `?previewEnemy=1` — Enemy feet-anchor 對齊預覽。
- Arcade Physics debug — Player/Enemy bodies 與 attack zones。

Production build 必須關閉全部 debug 顯示。

## Current Files

```text
app/page.tsx                 React arcade shell
app/game/PhaserGame.tsx      Phaser instance lifecycle
app/game/MainScene.ts        Current Scene/player/combat orchestration
app/game/EnemyManager.ts     Multi-enemy manager and combatants
public/art/                  Runtime/source art and metadata
public/scene/                Stage/reference images
tools/build_enemy_art.py     Enemy sheet/atlas rebuild pipeline
```

舊 React Canvas prototype 已在 M0 / Task 0.2 移除；正式 gameplay runtime 只有 Phaser。

## Development Workflow

每次開發必須依序：

1. 閱讀 [GAME_ROADMAP.md](GAME_ROADMAP.md)。
2. 確認 [SPRINT.md](SPRINT.md)。
3. 只選一個未完成 Task。
4. 定義重現方式與驗收條件。
5. 實作最小必要修改。
6. 執行 build、lint、typecheck、tests 與 [CHECKLIST.md](CHECKLIST.md)。
7. 更新 Roadmap、Sprint、Debt、Asset 文件。
8. 建立單一目的 commit。
9. 再開始下一個 Task。

禁止同時修改多個 Milestone，禁止未完成驗收就開始新功能。

## Project Documents

- [GAME_ROADMAP.md](GAME_ROADMAP.md) — Vision、Current Status、Milestones、Tasks。
- [ARCHITECTURE.md](ARCHITECTURE.md) — Runtime、資料流、ownership 與模組邊界。
- [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md) — Coding、Phaser、State、Combat、Asset 規則。
- [TECH_DEBT.md](TECH_DEBT.md) — Critical/High/Medium/Low 技術債。
- [ASSET_PIPELINE.md](ASSET_PIPELINE.md) — 現有素材、metadata 與生成流程。
- [BACKLOG.md](BACKLOG.md) — P0/P1/P2/Future 產品需求。
- [SPRINT.md](SPRINT.md) — 當前兩週 Sprint。
- [CHECKLIST.md](CHECKLIST.md) — 每個 Task 的驗收矩陣。

## Current Priority

M6 已完成：Title、HUD、Pause、Failure/retry、Result/replay 與 mobile controls 均由 Phaser 擁有，desktop、844×390 橫向觸控、390×844 直向 FIT 及 production 驗收通過。

M6A.1 已鎖定 [ART_BIBLE.md](ART_BIBLE.md) 與 15 張 reproducible before baselines；M6A.2 已接入關羽 43-frame 動畫；M6A.3 已統一 Soldier、Mauler、Duelist 與 Boss 的視覺契約；M6A.4 已接入 Forest Entry、Forest Ambush、Boss Arena 共 9 張分層 Stage assets；M6A.5 已接入正式 Combat Effects、角色地影、產品 UI、mobile controls 與 custom bitmap font；M6A.6 已完成 15 組 before/after、asset/provenance audit 與 60 FPS freeze。

M7 / Tasks 7.1–7.5 已完成：單一 Phaser Audio manager、十個原創 Combat/UI SFX、兩首原創 Stage/Boss 循環 BGM、mobile lifecycle、完整 cue matrix、peak headroom 與三平台實機 mix acceptance 均已通過。

The next single task is M8 / Task 8.1: define and measure the reproducible performance budget.

下一個 Task 只建立完整 Vertical Slice 的 FPS、frame-time、memory、texture 與載入大小基線；不先進行 pooling、atlas 重製、內容、玩法、美術或音訊調整。
