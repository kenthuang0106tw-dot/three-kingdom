# Next Task

## M5R / Task 5R.9 — Encounter-clear camera handoff stability

### Why this is next

實玩確認每個 encounter 的最後一名敵人死亡時，`encounter` camera lock 釋放到一般 follow 的交接會產生可見瞬移。這是既有 Vertical Slice 每個關卡節點都會遇到的體驗缺陷，應在加入 Pause 等新 UI 前獨立修正，避免後續流程建立在不穩定的 camera transition 上。

### Completion criteria

- 先以 deterministic test 與 browser smoke 重現每個 encounter clear 的 camera snap，再修改。
- 最後一名敵人死亡、camera lock 釋放的當幀，scroll 不得瞬間跳到新的 follow target。
- lock release 後 camera 必須從現有 scroll 連續銜接到正常 bounded follow；不得永久落後玩家。
- 保留 integer/round-pixel policy、world bounds、encounter gate、Boss lock、camera shake 與 restart ownership。
- 個別敵人死亡但 encounter 尚未 cleared 時不得釋放 lock 或觸發 handoff。
- 不得使用 `setTimeout`、`setInterval`、傳送玩家、延遲敵人死亡或修改戰鬥資料來遮掩跳動。
- Desktop、844×390 landscape、390×844 portrait 各完整走過兩個 encounter，clear 前後可控制且無 visible snap、soft lock 或 runtime error。
- Boss entry/arena、failed/retry、cleared、HUD 與 production build 全部保持通過。

### Validation

- 純 camera contract 測試覆蓋 locked scroll → release frame → follow convergence，以及 bounds/rounding。
- Browser 記錄兩個 encounter clear 前後連續數幀的 `cameraScrollX`，確認沒有單幀不連續跳動且最後收斂。
- 重跑 desktop、landscape touch、portrait touch traversal；每個 viewport 一個 Canvas、controls 可用、console error 0。
- 重跑 Boss arena lock/release、failure/retry、HUD reset regression。
- 執行 `pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm build`、`pnpm build:github-pages`。

### Estimated files

- `app/game/camera/CameraFollow.ts` 或一個最小 camera handoff policy module
- `app/game/MainScene.ts`
- `tests/app-contracts.test.mjs`
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `NEXT_TASK.md`
- `ARCHITECTURE.md`
- `TECH_DEBT.md`
- `CHECKLIST.md`

### Estimated risk

- 平滑 handoff 若與 encounter/Boss lock ownership混合，可能造成 camera 永久落後或 soft lock。
- 浮點 easing 可能破壞 pixel-art 整數 scroll，必須在最終輸出保持 round pixels。
- camera shake 與 follow handoff 若共用同一位置來源，可能互相覆蓋。
- 手機 FIT 不改 logical camera，但較小顯示面積更容易暴露一幀跳動，三 viewport 都必須實測。
