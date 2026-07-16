# Next Task

## M6 / Task 6.3 — Player/Boss HUD

### Why this is next

M5R 已以桌機、手機橫向與手機直向的真實輸入完成整個 Vertical Slice，M6.1 的 game-flow contract 與 M6.2 的 Title/start 也已通過。下一個最小可玩增量是讓玩家在戰鬥中讀到 Player HP，並在 Boss arena 顯示 Boss HP；這能直接改善現有完整流程，又不需要先引入 Pause、Result 或新的 gameplay state。

### Completion criteria

- 建立 Phaser-owned HUD；React 仍只負責外框與 Phaser lifecycle，不以 DOM 或 React state 顯示戰鬥數值。
- HUD 只讀既有 readonly gameplay snapshot／event boundary，不持有或直接操作 Player、Enemy、Boss actor。
- Player HP 在 `playing`、`failed` 與 `cleared` 流程中顯示正確；新 run／retry 後恢復為 10。
- Boss HP bar 只在 Boss actor 啟用後出現，傷害時由 8 正確下降，Boss cleanup／新 run 後隱藏並重設。
- HUD 使用 `setScrollFactor(0)` 並建立一次；update 不重建 GameObject、listener 或 React tree。
- Desktop、844×390 landscape 與 390×844 portrait FIT 都可讀，且不遮住 360° 搖桿、攻擊鍵或主要戰鬥區。
- Development debug 可與 HUD 共存；production 不顯示 debug，但保留正式 HUD。
- 不加入 Pause、Failure/Result 美化、replay、audio、scoring、persistence、新內容或 gameplay balance。

### Validation

- 新增 HUD ownership／snapshot consumption 的 deterministic contract test。
- 驗證 Title → playing、普通 encounter、Boss active、Boss damage、failed/retry、Boss defeat/cleared 的顯示與 reset。
- 在 desktop、844×390 landscape、390×844 portrait FIT 做 browser acceptance；每種尺寸保持一個 Canvas、HUD 可讀、touch controls 可用、零 runtime error。
- 重跑 encounter sequencing、Boss combat、failed/retry、cleared 與 Scene reset regressions。
- 執行 `pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm build`、`pnpm build:github-pages`。

### Estimated files

- `app/game/MainScene.ts`
- `app/game/ui/GameHud.ts`（若獨立 Phaser HUD ownership 能降低 MainScene 耦合）
- `tests/app-contracts.test.mjs`
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `NEXT_TASK.md`
- `ARCHITECTURE.md`
- `TECH_DEBT.md`
- `CHECKLIST.md`

### Estimated risk

- 若 HUD 直接查詢 actor，會繞過既有 snapshot boundary 並增加 MainScene 耦合。
- 每幀建立文字、Graphics 或 listener 會造成物件 leak 與手機效能問題。
- Portrait FIT 的 Canvas 很小；固定像素字級或不考慮 touch control 區域可能造成遮擋。
- Boss cleanup、failed retry 與 Scene restart 若未共用同一 reset ownership，可能留下 stale HP bar。
