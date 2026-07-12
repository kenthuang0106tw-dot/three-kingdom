# Next Task

## Task

**M1 / Task 1.2 — Phaser Touch Controls**

這是 Task 1.1 完成後唯一允許開始的 Task；本次 closeout 不執行它。

## 為什麼是它

keyboard action snapshot 已固定，下一個依賴它的最小增量是把 touch input 接到同一 action contract。這能讓手機橫向版本使用既有移動與攻擊，不修改 Player state、Enemy AI、Combo 或美術。

## 完成條件

- Phaser 內建立 development／production 共用的 touch action adapter。
- Touch movement 與 attack 寫入既有 `ActionSnapshot`，不建立第二套 gameplay logic。
- 支援方向移動與攻擊按鈕，多指可同時移動與攻擊。
- `pointerup`、`pointerout`、`pointercancel`、blur 可釋放對應 action。
- React 不保存 gameplay input state；禁止 DOM keyboard listener。
- Desktop keyboard 行為不回歸，玩家／敵人／Combo／美術不變。
- 更新 Architecture、Roadmap、Sprint、Technical Debt、Checklist、README。
- `pnpm test`、`pnpm build`、`pnpm lint`、`pnpm typecheck` 通過。
- 建立單一目的 commit，commit 後 worktree clean。

## 驗收方式

1. Touch contract test 驗證 pointer down/up/cancel、多指與攻擊 edge。
2. Desktop keyboard regression smoke 通過。
3. Mobile landscape browser smoke：可上下左右移動、攻擊；pointercancel 後停止。
4. `pnpm test`、`pnpm build`、`pnpm lint`、`pnpm typecheck` exit code 0。
5. Browser console 無新增 error。
6. Commit 後 `git status --short` 無輸出。

## 預估修改檔案

- `app/game/input/ActionSnapshot.ts`
- 可能新增 `app/game/input/TouchInputController.ts`
- `app/game/PhaserGame.tsx` 或 Scene input wiring
- `tests/**`
- `app/globals.css`（僅必要 touch hit area／safe area）
- `ARCHITECTURE.md`
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `TECH_DEBT.md`
- `CHECKLIST.md`
- `README.md`
- `NEXT_TASK.md`

## 預估風險

- Pointer lifecycle 在 iOS Safari 與 Chromium 行為不同；必須測 `pointercancel`，不能只測正常放開。
- 多指 pointer 必須以 pointerId 分別追蹤，不能用單一 boolean 覆蓋另一根手指。
- 不得把 touch controls 做成 React state 或 CSS 動畫；輸入最後仍由 Phaser update 讀取 snapshot。
