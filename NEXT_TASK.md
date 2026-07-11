# Next Task

## Task

**M0 / Task 0.1 — Freeze Current Prototype Baseline**

只能執行這一個 Task。不要修 bug、重構、改編碼、移除 legacy code 或新增功能。

## 為什麼是它

目前 Phase 3／4 的 `MainScene`、`EnemyManager`、enemy assets 與 asset tool 尚未提交。若先進行任何清理或架構修改，將無法可靠區分「既有 prototype 行為」與「後續修改造成的 regression」，也沒有可回退基準。

這個 Task 的價值是保存現況並建立可重現起點，不是宣告現有 API 已經穩定。

## 完成條件

- 審核所有未提交檔案，確認每一項都屬於目前 Phase 3／4 prototype。
- 記錄已知 build、lint、typecheck、test、runtime 與 asset-route 問題，但不在本 Task 修復。
- `pnpm build` 通過。
- Desktop combat room 可載入：關羽、三名小兵、背景與動畫資產正常。
- 最小 smoke：玩家可移動／停止／攻擊；Enemy 可移動並受擊；browser console 無新增 runtime error。
- 建立一個明確標記為 prototype baseline 的 commit。
- Commit 後 worktree clean。

## 驗收方式

1. `git diff --check` 無錯誤。
2. `pnpm build` exit code 0。
3. 從 commit checkout 後依 README 啟動，不依賴未追蹤檔案。
4. 瀏覽器確認 Canvas、關羽、三名小兵與竹林背景載入。
5. 執行一次移動、停止、攻擊與 Enemy 受擊 smoke。
6. 檢查 browser console，記錄任何既有 warning/error。
7. `git status --short` 無輸出。

lint、typecheck、test 的既有失敗不阻擋 baseline commit，但必須逐項記錄於 `TECH_DEBT.md`；不得在本 Task 順手修復。

## 預估修改檔案

預期不新增 gameplay 修改。Commit scope 應只包含目前已存在的未提交 prototype：

- `app/game/MainScene.ts`
- `app/game/EnemyManager.ts`
- `public/art/enemy/*`
- `tools/build_enemy_art.py`

若審核發現其他檔案與 Phase 3／4 無直接關係，排除在 commit 外並停止確認來源。

## 預估風險

- 未追蹤素材可能缺少來源或重建依賴，導致 checkout 後不可重現。
- Production server asset-route 問題可能讓 build 成功但頁面白屏；必須實際 smoke，不可只看 build。
- 將已知 bug 一起提交可能被誤認為正式完成；commit message 與 Technical Debt 必須明確標註 prototype baseline。
- 現有文件變更若尚未 commit，不能混入此 gameplay baseline commit；文件應獨立 commit。
