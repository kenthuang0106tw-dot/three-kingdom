# Development Rules

## 1. Work Discipline

1. 先閱讀 `GAME_ROADMAP.md`、`ARCHITECTURE.md`、本文件與 `SPRINT.md`。
2. 一次只實作一個已排入 Sprint 的 Task。
3. 寫程式前先寫成功條件與可重現步驟。
4. 每一行修改都必須能追溯到 Task；不順手重構相鄰程式。
5. 若有兩種合理解釋，先提出差異，不可默默選擇。
6. 優先最少程式碼；禁止為單次需求建立過度抽象。
7. 完成測試、文件更新與 commit 後，才能開始下一個 Task。

## 2. Coding Style

- TypeScript strict；禁止新增 `any` 規避型別。
- Class／type 使用 `PascalCase`；variable／function 使用 `camelCase`；常數使用 `UPPER_SNAKE_CASE`。
- Boolean 命名以 `is/has/can/should` 開頭，但不可用多個 boolean 重複表達 state。
- Magic number 必須屬於單一 subsystem config；不要散落於 update loop。
- Match existing formatting；不要在功能修改中格式化整份檔案。
- 公開 interface 必須描述 ownership 與 lifecycle。

## 3. Folder Structure

```text
app/game/
  scenes/       Scene orchestration
  player/       Player actor, state, input adapter
  enemy/        Enemy actor, manager, AI director
  combat/       Hit resolution, attack metadata, effects policy
  stage/        Stage data, encounters, bounds
  camera/       Camera policy
  ui/           Phaser HUD and touch controls
  debug/        Development-only overlays/previews
  config/       Tunable gameplay constants
public/art/     Runtime-ready assets and metadata
tools/          Reproducible asset/build helpers
tests/game/     Gameplay contract tests
```

只有實際拆出第二個模組時才建立新資料夾；不預先建立空架構。

## 4. React and Phaser Boundary

- React 只建立外框、host container 與 Phaser instance。
- 禁止用 React state 保存 actor、HP、enemy、input 或 stage state。
- 禁止 DOM/CSS animation、transform 或 transition 模擬 gameplay。
- 禁止 `window`／`document` keyboard listener 控制角色。
- React remount 前必須銷毀 Phaser instance。
- Phaser Scene 外不得直接操作 Sprite、Physics Body、Animation 或 Clock。

## 5. Input Rules

- Key／Cursor／Pointer objects 只在 Scene create 或 controller constructor 建立一次。
- Movement 每幀先將 velocity 歸零，再讀取目前 `isDown`。
- Attack 使用 edge-trigger action；長按不得自動重播，除非招式規格明確允許。
- 斜向輸入 normalize。
- blur、visibility change、pointer cancel 必須釋放輸入。
- Keyboard 與 touch 使用同一 action snapshot，不保留兩套 gameplay logic。

## 6. State Machine Rules

- 每個 actor 只有一個主要 state 欄位。
- 合法 transition 以明確表格或 switch 管理。
- State entry 負責停止 velocity、啟動動畫與初始化 local data。
- State exit 負責關閉 hitbox、釋放 slot、移除暫態效果。
- Update 不得每幀重播相同 animation。
- Timer callback 必須驗證 actor 仍 active 且 state 仍匹配。

## 7. Animation Rules

- 禁止 rotate、scale、translate 單張圖片偽造逐幀攻擊。
- 不得假設 sprite sheet 等寬；先分析 frame rectangle。
- 所有 frame 以腳底為共同 anchor。
- 同一 actor 的動畫使用統一 display scale。
- Attack animation 必須有 startup、active、recovery。
- `repeat: 0` 用於一次性動作；loop 只用於 idle/walk。
- Listener 只註冊一次，destroy/shutdown 正確移除。

## 8. Combat Rules

- 地面 body 與 attack hitbox 分離。
- Hitbox 只在 active frame 啟用。
- 每次攻擊有唯一 attack ID；每個 target 保存該攻擊的 hit record。
- 同一段可各命中多個 target，但同一 target 只命中一次。
- Damage resolution 與視覺效果分離。
- 同 frame 多目標的 Hit Stop／Camera Shake 只能觸發一次。
- Hit Stop 不使用 `setTimeout`、`setInterval` 或 CSS。
- Knockback 修改 physics owner，不得只移動 sprite。

## 9. Enemy and AI Rules

- 每隻 Enemy 獨立擁有 state、HP、body、hitbox、animation 與 hit record。
- EnemyManager 管理 collection、Attack Slot、Formation 與 cleanup。
- Enemy 不得直接控制 Camera、Scene time scale 或玩家 state。
- 攻擊前必須滿足 X range、Y alignment、cooldown 與 Attack Slot。
- Hurt／Dead 立即釋放 Attack Slot。
- Destroy 必須清除 collider、listener、timer ownership 與 collection reference。

## 10. Debug Rules

- Debug 功能只能在 development 啟用。
- Production build 不顯示 physics body、target slot 或 debug text。
- Debug overlay 讀取 snapshot，不修改 gameplay。
- 每個新 state／hitbox／manager 都要提供最低限度可視化。
- Console 不作為唯一驗收面；重要 runtime state 必須可在畫面或測試讀取。

## 11. Asset Rules

- 保留 source、runtime asset、atlas、metadata 與 debug sheet。
- Atlas 必須記錄 x、y、width、height、origin、offset、feet anchor。
- Chroma cleanup 後要清除低 alpha 殘點。
- 禁止用不同 scale 修補 frame alignment。
- Runtime asset 使用 nearest-neighbor；非整數 scale 可用，但必須目視驗證。
- 每個產生工具必須可重跑且不依賴未提交暫存檔。
- 所有素材必須原創或具有明確授權。

### Enemy Redesign visual lock

- Five-enemy work must follow
  `docs/character-production/enemy-cast-v2-approved-prototypes.md`.
- Before generation, open both approved repository reference PNGs and copy the
  selected actor's immutable locks into the prompt or art brief.
- Conversation memory, temporary runtime sprites, and a generic “same style”
  prompt are not valid references.
- Review a neutral idle pose first; do not generate the complete animation set
  until identity, weapon class, body mass, head treatment, and silhouette pass.
- Missing references or a visual mismatch means stop and mark `Revise`; do not
  improvise. Passing technical tests or builds does not override this gate.

## 12. Phaser Best Practices

- 使用 Scene lifecycle 與 Phaser Clock。
- 不在 `update()` 建立 GameObject、Key、listener 或永久 timer。
- Physics movement 使用 velocity/body；Sprite 只同步視覺。
- Global animation key 不重複註冊。
- 頻繁效果在 profiling 證明需要後才 pooling。
- Depth 以 feet Y 決定，Camera 與 sprite 位置盡量整數化。

## 13. Prohibited

- DOM gameplay loop、CSS gameplay animation、React gameplay state。
- `setInterval` 控制 AI／input／combo。
- 全域可變 gameplay variable。
- 同一狀態的多組互相不同步 boolean。
- 每次攻擊累積永久 listener。
- Scene shutdown 後仍存活的 callback 或 collider。
- 未完成當前 Task 就跨 Milestone加功能。
- 未測試、未更新文件、未 commit 就開始下一個 Task。

## 14. Definition of Done

- Acceptance Criteria 全部通過。
- `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test` 通過。
- Applicable checklist 有 evidence。
- Desktop 與 mobile smoke test 完成。
- 無新增 console error、listener leak、duplicate instance。
- Roadmap、Sprint、Debt、Asset 文件已更新。
- 一個 Task 對應一個清楚 commit。
