# Next Task

## Task

**M0 / Task 0.3 — Package and Type Boundaries**

這是 Task 0.2 完成後唯一允許開始的 Task；本次 closeout 不執行它。

## 為什麼是它

正式 gameplay runtime 已只剩 Phaser，文件與啟動腳本也具備可信 UTF-8 基準。現在最大的開發阻力是 npm／pnpm lockfile 並存、缺少正式 `typecheck` command，以及 browser app、Cloudflare worker 與範例程式共用同一型別邊界。若先寫 tests 或新功能，品質信號仍會混入不相關環境錯誤。

## 完成條件

- package manager 明確固定為 pnpm，repository 只保留 `pnpm-lock.yaml`。
- `package.json` 的 commands 與 README 一致，新增正式 `pnpm typecheck`。
- browser app 與 worker／範例型別邊界明確，不互相污染。
- 修復正式 source 的 lint 與 type errors，不以 `skipLibCheck` 或排除正式程式掩蓋問題。
- 從乾淨 dependency install 驗證 lockfile 可重現。
- `pnpm build`、`pnpm lint`、`pnpm typecheck` 全部 exit code 0。
- 不修改 gameplay 行為。
- 更新 Sprint、Roadmap、README 與 Technical Debt。
- 建立單一目的 commit，commit 後 worktree clean。

## 驗收方式

1. `git status --short` 確認 Task scope。
2. `pnpm install --frozen-lockfile` 通過且不改 lockfile。
3. `pnpm build` exit code 0。
4. `pnpm lint` exit code 0。
5. `pnpm typecheck` exit code 0。
6. Reference scan 證明正式 app source 沒有被 typecheck 排除。
7. 最小 Phaser runtime smoke，browser console 無新增 error。
8. Commit 後 `git status --short` 無輸出。

## 預估修改檔案

- `package.json`
- `package-lock.json`（刪除）
- `pnpm-lock.yaml`（只在必要的 lockfile 正規化時更新）
- `tsconfig.json`
- 可能新增 browser／worker 專用 tsconfig
- 正式 source 中實際 lint/type errors 對應檔案
- `README.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `TECH_DEBT.md`
- `NEXT_TASK.md`

## 預估風險

- Vinext、Cloudflare 與 Next ambient types 可能互相衝突，必須用清楚 project boundary 解決。
- 不可為了讓 typecheck 綠燈而排除 `app/game/**` 或關閉 strict 檢查。
- clean install 可能需要網路與較長時間；不得在未驗證 frozen lockfile 的情況下宣告完成。
