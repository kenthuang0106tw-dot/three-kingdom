# Next Task

## M6 / Task 6.4 — Pause/resume

### Why this is next

Vertical Slice、Title、HUD 與 encounter-clear camera handoff 已完成。Pause/resume 是下一個最小產品流程缺口，也必須在 Failure/continue、Result 與 Audio 前固定 input、clock、physics、animation、tween 和 Hit Stop 的所有權，避免後續各系統自行暫停造成互相衝突。

### Completion criteria

- 只允許從 `playing` 進入 `paused`，並可回到同一個 `playing` runtime；不得重建 Phaser Game 或 Scene。
- Keyboard 與 touch 都可明確 pause/resume；單次輸入只觸發一次 transition，不累積 listener。
- 暫停時 Player、Enemy、Boss、Physics、animation、tween、encounter progression 與 combat timing 全部停止，attack hitbox 不產生新命中。
- Resume 後保留原有 HP、位置、state、encounter、Boss 與 camera ownership，方向輸入必須重新讀取當前狀態且不得黏鍵。
- Pause 與 Hit Stop 使用明確且可測的不同 ownership；在攻擊、受傷或 Hit Stop 邊界暫停／恢復不得永久凍結或提前恢復。
- 顯示最小 Phaser-owned Pause overlay；React/DOM 不保存 gameplay 或 pause state。
- Scene shutdown/restart 後不殘留 keyboard、pointer、timer、overlay 或 pause ownership。
- Desktop、844×390 landscape、390×844 portrait 各完成 pause/resume；HUD、兩場 encounter、Boss、failure/retry 與 camera handoff 無回歸。
- Production build 不顯示 development debug，單一 Canvas 且零 runtime error。

### Validation

- 純 game-flow／pause ownership 測試覆蓋 `playing → paused → playing`、非法 transition、Hit Stop 交錯與 restart reset。
- Browser 在 idle、walk、attack／hurt 或 Hit Stop 邊界各驗證一次暫停與恢復；暫停期間位置、HP、動畫 frame 與 camera 不前進。
- 重跑 keyboard、landscape touch、portrait touch；resume 後 movement/attack 可立即再次使用且無 stuck input。
- 重跑兩場 encounter、Boss entry/clear、failure/retry、HUD 與 camera-handoff regression。
- 執行 `pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm build`、`pnpm build:github-pages`。

### Estimated files

- `app/game/flow/GameFlowStateMachine.ts`
- `app/game/MainScene.ts`
- `app/game/ui/` 下最小 Pause overlay／touch control integration
- `tests/app-contracts.test.mjs`
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `NEXT_TASK.md`
- `ARCHITECTURE.md`
- `TECH_DEBT.md`
- `CHECKLIST.md`

### Estimated risk

- Phaser Clock、Arcade Physics、animation 與 tween 若由不同路徑恢復，可能造成部分系統永久凍結或在 pause 中繼續。
- Hit Stop 與 Pause 若共用單一 boolean，resume 可能錯誤解除仍有效的另一種 freeze ownership。
- Touch pointer 在 Pause overlay 開啟時若未正確消費／釋放，可能造成 resume 後黏住 movement 或 attack。
- Scene restart 若未清除 pause listener／overlay，可能重複觸發或增加 GameObject。
