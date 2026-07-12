# Next Task

## Task

**M1 / Task 1.1 — Define Action Snapshot and Keyboard Input Boundary**

這是 M0 完成後唯一允許開始的 Task；本次 closeout 不執行它。

## 為什麼是它

M0 已建立可信的 build、typecheck、tests、production routes 與 lifecycle baseline。下一個高風險基礎是把 keyboard input 正式收斂成可觀察的 action snapshot，讓後續 touch、pause、visibility 與 deterministic clock 不必再直接依賴 Scene 內散落的 Key 物件。

## 完成條件

- Phaser keyboard keys 只在 Scene `create()` 或 input controller 建立一次。
- 每幀由目前 `isDown` 重算 movement，放開方向鍵下一幀 velocity 歸零。
- WASD 與方向鍵均可重複移動、停止、斜向 normalize。
- J 使用 edge-trigger，不因長按重播攻擊。
- 不新增 DOM keyboard listener，不使用 React state 保存 gameplay input。
- Player／Enemy gameplay 行為與美術不變。
- 建立可讀的 action snapshot contract，供後續 touch input 共用。
- 更新 Architecture、Roadmap、Sprint、Technical Debt、Checklist、README。
- `pnpm test`、`pnpm build`、`pnpm lint`、`pnpm typecheck` 通過。
- 建立單一目的 commit，commit 後 worktree clean。

## 驗收方式

1. source scan 確認沒有新增 window/document keyboard listener。
2. input contract test 驗證 keyup、WASD／方向鍵、斜向 normalize、JustDown attack。
3. browser smoke：右移後放開立即停止，上下左右三輪可重複，J 長按不連續觸發。
4. `pnpm test`、`pnpm build`、`pnpm lint`、`pnpm typecheck` exit code 0。
5. Browser console 無新增 error。
6. Commit 後 `git status --short` 無輸出。

## 預估修改檔案

- `app/game/MainScene.ts` 或新增最小 `app/game/input/**` contract
- `tests/**`
- `ARCHITECTURE.md`
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `TECH_DEBT.md`
- `CHECKLIST.md`
- `README.md`
- `NEXT_TASK.md`

## 預估風險

- 現有 input 已在 MainScene 運作，抽離時容易改變攻擊 timing；必須先固定行為測試再移動責任。
- Phaser `JustDown` 與瀏覽器 focus／visibility 可能造成 stuck state；不能用強制清除 key 狀態繞過。
- 不得在此 Task 順手加入 touch controls、pause 或 visibility clock；那些是後續獨立 Task。
