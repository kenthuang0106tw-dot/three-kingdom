# 三國街機橫向動作遊戲

一款使用 Phaser 3 製作、以三國為題材的 2.5D Pixel Art Beat 'em Up prototype。目標是建立接近 1990 年代 Capcom／IGS 街機的移動、對線、攻防與群戰手感，同時維持原創人物與素材。

## 五分鐘理解專案

- **Runtime:** Phaser 3 + Arcade Physics。
- **Web shell:** React 19 / Next-compatible Vinext。
- **Rendering:** 1280×720、16:9、nearest-neighbor、腳底 Y depth sorting。
- **Current player:** 關羽。
- **Current combat:** 八方向移動、三段 Combo、Hurt、Hit Stop、Flash、Spark、Knockback、Camera Shake。
- **Current enemies:** 三名相同近戰小兵、Formation Slot、單一 Attack Slot、獨立 HP/state/death cleanup。
- **Current stage:** 單張竹林背景；尚未有捲軸 Camera 或正式關卡流程。
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

目前 repository 已完成 Sprint 0：baseline、單一 Phaser runtime、pnpm、browser／worker typecheck、tests 與 production routes 均已建立。第一次接手請先閱讀 [SPRINT.md](SPRINT.md) 與 [NEXT_TASK.md](NEXT_TASK.md)，不要直接新增功能。

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

Mobile Phaser touch controls 尚未完成，排在 Milestone 1。正式 runtime 不包含 DOM gameplay controls。

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

M3 / Task 3.2 World/walk bounds contract is complete. The next single task is M3 / Task 3.3, Camera follow.

Milestone 0、M1 與 M2 已完成；目前進入 M3 Stage 基礎建設。完成下一個 Task 前不要新增 Boss、角色、招式或 Audio。
