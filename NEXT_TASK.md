# Next Task

## Task

**M0 / Task 0.4 — Replace Invalid Tests and Verify Production Routes**

這是 Task 0.3 完成後唯一允許開始的 Task；本次 closeout 不執行它。

## 為什麼是它

pnpm、lint 與 browser／worker typecheck 已成為可信 quality gate，但目前 `pnpm test` 仍驗證已刪除的 starter skeleton，且 `vinext start` 的 `/assets/*.js` 曾回傳 404。若不先修復 tests 與 production serving，build 成功仍無法證明使用者能載入遊戲。

## 完成條件

- 移除不再適用的 starter skeleton assertions。
- 建立最小 app shell、Phaser lifecycle 與 EnemyManager／combat contract tests；不得複製 production logic 來測自己。
- production server 直接提供 HTML、JS、CSS、atlas 與 PNG，無需臨時 proxy。
- 重複 mount／destroy 不產生第二個 Phaser instance 或殘留 keyboard listener。
- `pnpm test`、`pnpm build`、`pnpm lint`、`pnpm typecheck` 全部 exit code 0。
- production browser smoke 顯示背景、玩家、三名敵人，console 無 error。
- 更新 Sprint、Roadmap、README、Technical Debt 與 Checklist。
- 建立單一目的 commit，commit 後 worktree clean。

## 驗收方式

1. `pnpm test` exit code 0，測試名稱與目前 Phaser app 相符。
2. `pnpm build`、`pnpm lint`、`pnpm typecheck` exit code 0。
3. 啟動 `pnpm start` 後，首頁及其引用的 JS／CSS route 為 HTTP 200。
4. Guanyu／Enemy atlas JSON 與 runtime PNG route 為 HTTP 200。
5. 不使用 proxy 的瀏覽器 smoke：Canvas count = 1，背景、玩家、三敵人可見。
6. Browser console error count = 0。
7. Lifecycle test 重複 mount／destroy 20 次仍只有一個 Phaser instance。
8. Commit 後 `git status --short` 無輸出。

## 預估修改檔案

- `tests/**`
- `package.json`
- production serving／hosting config 的最小必要檔案
- 可能新增不含 gameplay 重製邏輯的 test seam
- `README.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `TECH_DEBT.md`
- `CHECKLIST.md`
- `NEXT_TASK.md`

## 預估風險

- Vinext production route 問題可能位於 framework／hosting adapter 邊界，修正必須保持最小且不可改 gameplay。
- Phaser 依賴 Canvas/WebGL，Node unit test 不應假裝完整 renderer；可測 contract 的部分與真實 browser smoke 必須分工。
- 不可為了讓 tests 通過而保留臨時 proxy、硬編 build hash，或重新實作 EnemyManager 邏輯。
