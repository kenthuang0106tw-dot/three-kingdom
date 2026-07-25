# 三國街機橫向動作遊戲 Roadmap

## 1. Project Vision

本專案要打造一款以三國為題材、具有 1990 年代 Capcom／IGS 街機節奏的 2.5D 橫向卷軸動作遊戲。首發目標是 Desktop Web 與手機橫向 Web；第一個 Vertical Slice 只承諾關羽、一個完整關卡、三種近戰小兵與一名 Boss。

核心原則：

- 每個 Milestone 結束時都必須有可玩的 build，不以「架構完成但不能玩」作為成果。
- 先固定 runtime、輸入、時間、事件、測試與資產契約，再增加內容。
- Phaser 管理 gameplay；React 只管理頁面外框與 Phaser instance 生命週期。
- 角色、場景、音效與 UI 原創；只借鑑經典街機的手感與節奏。
- 不建立目前沒有第二個實際使用者的通用框架。

## 2. Current Status

| Area | Status | Notes |
|---|---|---|
| Runtime | Prototype | Phaser 3.90、Arcade Physics、1280×720、pixel rendering |
| React boundary | Correct | `PhaserGame.tsx` 建立／銷毀唯一 instance |
| Player | Playable prototype | 關羽移動、idle、walk、attack1–3、hurt |
| Combat | Playable prototype | Combo、獨立 hitbox、multi-hit、Hit Stop、Flash、Spark、Knockback、Shake |
| Enemy | Playable prototype | 三種近戰小兵、混合 Formation、Attack Slot、hurt/dead/cleanup |
| Boss | Playable prototype | locomotion、對線、attack hitbox、player damage、death cleanup 與 arena lifecycle 已接入 |
| Stage | Playable vertical slice | 3840×720 三畫面世界、兩場 encounter、Boss 進場與 terminal flow 已完成 |
| Camera | Stable vertical slice | bounded integer follow、encounter/Boss locks 與 encounter-clear 連續 handoff 已接入 |
| Mobile | Playable prototype | Phaser 360° touch joystick、attack 與 FIT viewport acceptance 已完成 |
| UI | Accepted product-flow prototype | Phaser Title/start、Player/Boss HUD、Pause、Failure/retry、Result/replay 與三 viewport acceptance 已完成 |
| Visual | M6A completed and frozen | 6A.1–6A.6 已完成視覺目標、全角色、三畫面 Stage、戰鬥特效、產品 UI、三 viewport 驗收與 asset freeze |
| Audio | Accepted vertical slice | 7.1–7.5 已完成 manager、Combat/UI SFX、Stage/Boss BGM、mobile lifecycle 與三平台完整 mix acceptance |
| Tests | Contract baseline | app shell、lifecycle、route 與 multi-enemy source contracts 已建立 |
| Repository | Baseline | baseline、UTF-8、單一 runtime、pnpm、lint/typecheck、tests、production routes 已完成 |

## 3. Technical Lead Review Findings

### Milestone order corrections

1. 原順序在完成真正 Stage 前先擴充 Enemy archetypes，容易讓 AI、spawn 與 encounter interface 重做。修正為：先以現有一種小兵完成可捲動 Stage Skeleton，再新增敵人種類。
2. Input、mobile、pause/time semantics、deterministic tests 必須早於 Player/Enemy 大型重構。
3. Boss 必須在 Stage、Encounter、Camera 與 Combat event contract 穩定後才開始。
4. UI 保留在 Boss 後，因 Boss HUD 與 game-flow interface 需要先有真實使用者；Boss 開發期允許使用 debug HUD。
5. Audio 內容延後，但 Audio event interface 在 Combat contract 階段先定義，避免後續侵入所有 actor。

### Tasks that were too large

- 「抽出 Player actor/controller」拆成 Input boundary、state machine、visual/physics actor、attack controller、combat resolver。
- 「Stage data」拆成最小 stage config、world bounds、camera follow、camera lock、encounter gate、restart。
- 「Enemy archetype」拆成 config contract、第二敵人、第三敵人與混合 encounter。
- 「Game flow」拆成 reset contract、title/start、HUD、pause、failure/continue、result。

### Missing foundations moved earlier

- Deterministic random seed／clock abstraction，讓 Attack Director 與 encounter tests 可重現。
- Scene reset/restart contract，避免關卡完成後才發現 timer、listener、collider 無法清乾淨。
- Gameplay event contract，供 UI、Audio、Debug 消費，不讓它們直接讀寫 actor internals。
- Asset manifest/preload failure policy，避免增加 Stage/Boss 後才處理載入錯誤。
- Mobile focus、pointercancel、visibility lifecycle。
- Performance budget 先定義、後量測；不提前做優化。

### YAGNI / deferred work

- 不在目前建立 ECS、關卡編輯器、通用技能系統、backend、存檔、排行榜。
- 不因只有一個 Scene 就先拆完整 BootScene／UIScene 架構；第二個真實 lifecycle 出現時才拆。
- Object pooling 只在 profiling 證明 GC spike 後實作。
- 通用 Enemy archetype framework 等第二種敵人開始接入時再抽。
- 張飛、趙雲、裝備、成長、多人維持 Post-Vertical-Slice backlog。

### Coupling risks to control

- `MainScene` 目前同時負責 Player、Combat effects、Debug 與 Preview；只能按責任逐步抽離，不全面 rewrite。
- `EnemyManager` 同時負責 render/physics/AI/cleanup；先建立 deterministic tests，再於第二 archetype 出現時抽 config boundary。
- UI／Audio 不得直接操作 Player 或 Enemy；只消費 readonly snapshot／gameplay events。
- Stage 只發布 spawn/gate/clear 事件，不直接切 actor animation。

---

## Milestone 0 — Reproducible Prototype Baseline

**Playable Result:** 目前關羽對三名小兵的戰鬥 room 可以從乾淨 checkout 啟動並重現。

**Goal:** 保全目前成果，建立可信任的 repository 與 quality gate。

**Dependencies:** None。

### Task 0.1 — Freeze Current Prototype Baseline

- **Status:** Completed (`bae05a1`)。
- **Description:** 審核目前未提交 Phase 3／4 diff，記錄已知問題，驗證 build 與最小 combat smoke，建立單一 baseline commit。
- **Priority:** P0
- **Difficulty:** Medium
- **Dependencies:** None
- **Acceptance Criteria:** commit 僅包含目前 prototype；可 checkout；`pnpm build` 通過；三敵人 room 可載入；worktree clean。
- **Expected Files:** 已存在的 `app/game/*`、enemy assets、asset tool；不新增功能。
- **Risk:** 把 prototype 當正式 API；commit message 與 TECH_DEBT 必須明確標記 baseline。

### Task 0.2 — Restore Repository Text and Single Runtime

- **Status:** Completed（2026-07-12；commit 於本 Task closeout 建立）。
- **Description:** 修復 UTF-8；確認無引用後移除／封存舊 Canvas runtime 與其 CSS。
- **Priority:** P0
- **Difficulty:** Medium
- **Dependencies:** 0.1
- **Acceptance Criteria:** 無 mojibake；正式入口只有 Phaser；UI/launch scripts 可讀。
- **Expected Files:** design docs、page/layout、launch scripts、legacy runtime files。
- **Risk:** 無法可靠還原的文字不可猜測。

### Task 0.3 — Package and Type Boundaries

- **Status:** Completed（2026-07-12；commit 於本 Task closeout 建立）。
- **Description:** 統一 pnpm；增加獨立 browser/worker typecheck config；修復 lint/type errors。
- **Priority:** P0
- **Difficulty:** High
- **Dependencies:** 0.2
- **Acceptance Criteria:** clean install 後 build/lint/typecheck 通過；只有一份 lockfile。
- **Expected Files:** package scripts、lockfiles、tsconfig variants、必要 type fixes。
- **Risk:** 不可用 `skipLibCheck` 或排除正式程式掩蓋錯誤。

### Task 0.4 — Replace Invalid Tests and Verify Production Routes

- **Status:** Completed（2026-07-12；commit 於本 Task closeout 建立）。
- **Description:** 移除 starter skeleton tests；加入 app shell、Phaser lifecycle、asset route、EnemyManager 最小測試。
- **Priority:** P0
- **Difficulty:** High
- **Dependencies:** 0.3
- **Acceptance Criteria:** `pnpm test` 通過；production HTML/JS/atlas/PNG 全為 200；console 無 error；重複 mount 20 次只有一個 Phaser instance。
- **Expected Files:** tests、package scripts、最小 test seams。
- **Risk:** 測試不可為了方便而重新實作 production logic。

---

## Milestone 1 — Runtime Contracts and Mobile Input

**Playable Result:** 同一個 combat room 可用鍵盤或手機觸控遊玩，切換分頁／旋轉／暫停後可繼續。

**Goal:** 在任何 gameplay refactor 前固定 input、time、events、assets 與 reset 契約。

**Dependencies:** M0。

### Tasks

Task 1.1 completed in the current sprint; Task 1.2 is next.

| ID | Description | Priority | Difficulty | Dependencies | Acceptance Criteria | Expected Files | Risk |
|---|---|---:|---:|---|---|---|---|
| 1.1 | 定義 action snapshot，鍵盤先接入 | P0 | Medium | M0 | keyup 下一幀停止；連續方向三輪正常；不新增 DOM listener | input module/MainScene | 雙輸入來源漂移 |
| 1.2 | 接入 Phaser touch controls | P0 | High | 1.1 | 多指移動+攻擊；pointercancel 釋放；React 無 gameplay state | input/UI module | Safari pointer lifecycle |
| 1.3 | 定義 pause/hit-stop/visibility clock contract | P0 | High | 1.1 | pause、hit-stop、background resume 不互相鎖死 | time/lifecycle module | 多個 clock source |
| 1.4 | 定義 readonly gameplay events/snapshot | P0 | Medium | 1.3 | UI/Audio/Debug 可訂閱但不能改 actor | event types/minimal emitter | 過度 event bus |
| 1.5 | 建立 asset manifest 與載入失敗畫面 | P1 | Medium | M0 | 缺 asset 顯示可診斷錯誤，不白屏 | preload/manifest | 過早拆 BootScene |
| 1.6 | 定義 deterministic seed/test clock | P0 | Medium | 1.3 | 相同 seed 的 Attack Director 順序一致 | RNG/time adapter/tests | gameplay 偷用 `Math.random` |
| 1.7 | Responsive mobile landscape contract | P0 | Medium | 1.2 | Canvas 不拉伸；safe area/旋轉可用；三個目標 viewport 通過 | Phaser config/CSS | pixel shimmer |
| 1.8 | Scene reset smoke test | P0 | Medium | 1.3–1.6 | restart 10 次無 listener/timer/collider 增長 | lifecycle tests | reset 遺漏 delayed callbacks |

---

## Milestone 2 — Stable Combat Room

**Playable Result:** 關羽可在單一 room 中穩定與三名小兵完成多輪攻防、死亡與 restart。

**Goal:** 固定 Player、Combat、Effect 與 Enemy 的正式 contract，不新增招式或敵人種類。

**Dependencies:** M1。

### Tasks

| ID | Description | Priority | Difficulty | Dependencies | Acceptance Criteria | Expected Files | Risk |
|---|---|---:|---:|---|---|---|---|
| 2.1 | 抽出 PlayerStateMachine | P0 | Medium | M1 | 合法 transition 測試完整；無第二組 attack boolean | player state/tests | transition 行為變更 |
| 2.2 | 抽出 Player actor visual/physics ownership | P0 | High | 2.1 | feet/body/sprite 契約不變；Scene 只 orchestration | player actor/MainScene | 一次搬太多邏輯 |
| 2.3 | 抽出 PlayerAttackController 與 metadata | P0 | High | 2.2 | startup/active/recovery/hitbox/attack ID 可測 | player/combat metadata | frame index regression |
| 2.4 | 建立 CombatResolver | P0 | High | 2.3 | 同刀多目標、單目標一次；resolver 不操作 Camera/UI | combat module/tests | 與 effect 混合 |
| 2.5 | 建立 EffectDirector 最小介面 | P0 | Medium | 2.4 | 同 frame Hit Stop/Shake 去重；各 target flash/spark | effects module | 全域 time ownership |
| 2.6 | Player hurt/dead/restart | P0 | High | 2.1, M1 reset | HP 0 後停止輸入，完成 restart；無 Game Over UI 美化 | player/flow tests | continue scope 膨脹 |
| 2.7 | 固定 EnemyManager cleanup/director tests | P0 | High | 2.4, M1 seed | attack slot、hurt cancel、death cleanup deterministic | EnemyManager/tests | 非決定性測試 |
| 2.8 | Combat-room acceptance | P0 | Medium | 2.1–2.7 | 10 分鐘壓力測試、10 次 restart、console 無 error | checklist/e2e | 只做 happy path |

---

## Milestone 3 — Playable Scrolling Stage Skeleton

**Status correction (2026-07-14):** 3.1–3.7 的資料、bounds、camera、encounter、exit 與 reset contracts 保留為完成；原本宣稱的 Playable Result 未實現，因此 Milestone 3 的「可玩關卡完成」驗收撤銷並移入 Vertical Slice Recovery。

**Playable Result:** 玩家可在至少三個畫面寬的竹林中前進，完成兩場使用現有小兵的 encounter，抵達終點並 restart。

**Goal:** 在增加敵人內容前固定 Stage、Camera、Encounter 與 actor-world interface。

**Dependencies:** M2。

### Tasks

| ID | Description | Priority | Difficulty | Dependencies | Acceptance Criteria | Expected Files | Risk |
|---|---|---:|---:|---|---|---|---|
| 3.1 | 最小 StageConfig | P0 | Medium | M2 events | 只描述 bounds、spawns、encounters、exit；不做 editor | stage config | 過度 schema |
| 3.2 | World/walk bounds contract | P0 | Medium | 3.1 | player/enemy/knockback 都不出界 | stage/physics | local/world 座標混用 |
| 3.3 | Camera follow | P0 | Medium | 3.2 | 玩家前進時平滑跟隨、整數化、不 shimmer | camera controller | 與 CSS scaling 混淆 |
| 3.4 | Encounter camera lock/unlock | P0 | High | 3.3 | 進區鎖定、清敵解除、無 soft lock | camera/stage director | Camera 與 AI 循環依賴 |
| 3.5 | Spawn and all-clear flow | P0 | Medium | 3.1, M2 enemy events | spawn 不重疊；死亡後正確 clear | StageDirector | manager ownership 不清 |
| 3.6 | Stage exit and restart | P0 | Medium | 3.4, 3.5 | 抵達 exit 可完成並重新開始 | stage flow | reset 漏資源 |
| 3.7 | Current-room contract acceptance（contract only） | P0 | High | 3.1–3.6 | 單一 room contract 連續 reset 無 soft lock／leak；不代表三畫面關卡完成 | e2e/checklist | contract 被誤當 playable result |

Parallax、foreground props、breakables 暫不在本 Milestone。

---

## Milestone 4 — Enemy Variety and Encounter Rhythm

**Playable Result:** 同一關卡出現三種可辨識近戰小兵與混合 encounter，戰鬥節奏不同但仍遵守同一 Attack Director。

**Goal:** 依真實 Stage 需求擴充 enemy content，不先做通用 framework。

**Dependencies:** M3。

### Tasks

| ID | Description | Priority | Difficulty | Dependencies | Acceptance Criteria | Expected Files | Risk |
|---|---|---:|---:|---|---|---|---|
| 4.1 | 從第二種敵人需求抽 EnemyConfig boundary | P0 | Medium | M3 | 只涵蓋兩個已知 archetype 差異 | enemy config | speculative abstraction |
| 4.2 | 第二種近戰小兵 | P0 | High | 4.1/assets | 攻擊距離／節奏明顯不同；完整動畫與 metadata | enemy/assets | 素材不足 |
| 4.3 | 第三種近戰小兵 | P1 | High | 4.2 | 新增真實行為差異，不只換色 | enemy/assets | scope 膨脹 |
| 4.4 | Mixed encounter composition | P0 | Medium | 4.2, 4.3 | Attack Slot 公平、Y 對線、站位穩定 | stage data/director | 組合造成死鎖 |
| 4.5 | Encounter tuning pass | P0 | Medium | 4.4 | 每場 30–90 秒、玩家可走位避免攻擊 | configs/checklist | 過早追求最終平衡 |
| 4.6 | Multi-archetype regression | P0 | High | 4.1–4.5 | 死亡/cleanup 不影響其他 archetype | tests | config 分支漏測 |
| 4.7 | Enemy facing and hit reachability regression | P0 | Medium | 4.2–4.6 | three archetypes face, walk, attack, and hit in the same direction | enemy config/manager/tests | global flip breaks soldier |

---

## Milestone 5 — First Boss and Stage Completion

**Status correction (2026-07-14):** Boss lifecycle、attack art、decision rhythm、hurt/phase/death、arena lock 與 completion event contracts 保留；Boss 尚不會移動、對線或以 hitbox 傷害玩家，且不存在從關卡起點抵達 Boss 的流程，因此 Milestone 5 的「完整 Boss 戰／完整關卡」驗收撤銷並移入 Vertical Slice Recovery。

**Playable Result:** 玩家可從關卡起點一路打到 Boss，擊敗 Boss 後完成關卡。

**Goal:** 建立一名專屬 Boss，不做通用 Boss framework。

**Dependencies:** M4。

### Tasks

| ID | Description | Priority | Difficulty | Dependencies | Acceptance Criteria | Expected Files | Risk |
|---|---|---:|---:|---|---|---|---|
| 5.1 | Boss state/ownership contract | P0 | High | M4 | Boss 不塞入 EnemyManager；cleanup/restart 可測 | boss actor/tests | 過度共用普通敵人 |
| 5.2 | Boss attack 1–3 | P0 | High | 5.1/assets | 每招 startup/active/recovery/telegraph 清楚 | boss metadata/assets | 中間幀不足 |
| 5.3 | Boss decision rhythm | P0 | Medium | 5.2, M1 seed | deterministic 測試；不連續無縫攻擊 | boss controller | AI 過度複雜 |
| 5.4 | Boss hurt/phase/death | P0 | High | 5.2 | 一次 phase change、完整 death/cleanup | boss actor | phase transition 重入 |
| 5.5 | Arena bounds/camera lock | P0 | Medium | M3 camera, 5.1 | 玩家/Boss 不出界，死亡後解除 | stage/camera config | 邊界夾死 |
| 5.6 | Stage-complete event | P0 | Low | 5.4 | Boss 死亡只發布一次 clear event | gameplay events | UI 直接依賴 Boss internals |
| 5.7 | Integrated contract acceptance（playable acceptance revoked） | P0 | High | 5.1–5.6 | lifecycle／cleanup／completion ordering contracts 通過；不代表可玩 Boss 戰或完整關卡 | e2e/checklist | contract 被誤當 playable result |

---

## Milestone 5R — Vertical Slice Recovery

**Status:** Completed 2026-07-17。5R.1–5R.9 全部通過；下一個唯一 Task 回到 M6 / 6.4。

**Playable Result:** 玩家從 Title 開始，在至少三個畫面寬的竹林中前進，完成兩場分段 encounter，進入 Boss arena，與會移動且能傷害玩家的 Boss 互相攻防，最後進入 `cleared` 或 `failed`。

**Goal:** 將已驗證的 Stage／Boss contracts 接成真正可玩的 Vertical Slice，不重寫 Player、Combat、Enemy 或 React 架構。

**Dependencies:** M2 combat contracts、M3 stage contracts、M4 mixed enemies、M5 Boss contracts、M6.1–6.2 Title/flow foundation。

### Tasks

| ID | Description | Priority | Difficulty | Dependencies | Acceptance Criteria | Expected Files | Risk |
|---|---|---:|---:|---|---|---|---|
| 5R.1 | Three-screen world and visible camera scrolling（Completed 2026-07-14） | P0 | High | M3 contracts | world width ≥3840；三段背景無空白；玩家可離開首屏；camera `scrollX` 實際變化且不越界 | StageConfig/MainScene/camera tests | camera lock 阻止捲動、重複背景接縫 |
| 5R.2 | Two encounter triggers and gates（Completed 2026-07-15） | P0 | High | 5R.1, M4 | 進區才生成；戰鬥時鎖定；清敵後解除；兩場依序完成 | stage director/config/tests | spawn ownership、soft lock |
| 5R.3 | Boss arena entry sequencing（Completed 2026-07-16） | P0 | Medium | 5R.2, M5 arena | 普通 encounter 完成後才啟用 Boss 與 Boss lock；Boss 不在起點同時出現 | stage/Boss orchestration | premature activation |
| 5R.4 | Boss locomotion, facing, and Y alignment（Completed 2026-07-16） | P0 | High | 5R.3, Boss walk assets | Boss 會接近、停止、面向與對線；不倒走、不瞬移、不出界 | BossActor/metadata/assets/tests | 缺 walk frames、腳底漂移 |
| 5R.5 | Boss attack hitbox and player damage（Completed 2026-07-16） | P0 | High | 5R.4, M2 combat | startup/active/recovery；active frame 每招只命中一次；Player flash/hit-stop/knockback/HP 正常 | boss/combat/tests | 動畫 frame 與 hitbox 時序錯位 |
| 5R.6 | Player failure and deterministic restart（Completed 2026-07-16） | P0 | High | 5R.5, M6 flow | HP 0 → `failed`；輸入停止；restart 完整重置關卡且 10 次無 leak | flow/MainScene/tests | stale timer/listener/lock |
| 5R.7 | Boss defeat and cleared flow（Completed 2026-07-16） | P0 | Medium | 5R.5, M5 completion, M6 flow | Boss defeat cleanup 後一次進入 `cleared`；arena release 與 event ordering 正確 | flow/events/MainScene/tests | duplicate completion |
| 5R.8 | End-to-end Vertical Slice acceptance（Completed 2026-07-17） | P0 | High | 5R.1–5R.7 | Desktop、landscape touch、portrait fitted 各從 Title 完成整關；可失敗重試；零 soft lock/error | browser/checklist/docs | 只測捷徑而非真實流程 |
| 5R.9 | Encounter-clear camera handoff stability（Completed 2026-07-17） | P0 | Medium | 5R.8 | 每個 encounter 最後一敵死亡時 camera 不瞬移；lock release 後連續銜接 follow；三 viewport 通關無回歸 | camera/MainScene/tests | 平滑跟隨造成延遲或改變 gate ownership |

### Recovery exclusions

- 5R 不加入 HUD、Pause、Result 美化、Audio、新角色、新招式、新敵人、掉寶、成長或第二關。
- Stage foreground/parallax/props 只在 5R.8 之後進行內容 polish；5R.1 先建立可驗證的三段連續竹林畫面。

---

## Milestone 6 — Product Flow and UI

**Status:** Completed 2026-07-18；6.1–6.7 全部完成。

**Playable Result:** 玩家可從 Title 開始、查看 HUD、暫停、失敗、重試、擊敗 Boss 並看到 Result。

**Goal:** 以已穩定的 gameplay events 建立完整流程，不讓 UI 控制 actor。

**Dependencies:** 6.1–6.2 使用既有 M5 contracts；6.3–6.7 必須等待 M5R。

### Tasks

| ID | Description | Priority | Difficulty | Dependencies | Acceptance Criteria | Expected Files | Risk |
|---|---|---:|---:|---|---|---|---|
| 6.1 | 定義 game-flow modes/reset ownership（Completed 2026-07-14） | P0 | Medium | M5 | title/playing/paused/failed/cleared transition 可測 | flow controller | 與 Scene state 重複 |
| 6.2 | Title/start（Completed 2026-07-14） | P0 | Low | 6.1 | keyboard/touch 可開始；無重複 Scene | UI/flow | React/Phaser 混用 |
| 6.3 | Player/Boss HUD（Completed 2026-07-17） | P0 | Medium | M1 snapshot, M5 | UI 只讀 snapshot；不同 viewport 可讀 | UI layer | 每幀重建物件 |
| 6.4 | Pause/resume（Completed 2026-07-18） | P0 | Medium | M1 clock, 6.1 | input/time/audio interface 同步 | UI/flow | 與 Hit Stop 衝突 |
| 6.5 | Failure/continue/restart（Completed 2026-07-18） | P0 | Medium | M2 reset, 6.1 | 連續失敗重試 10 次無 leak | UI/flow tests | continue 規則膨脹 |
| 6.6 | Result/replay（Completed 2026-07-18） | P0 | Low | M5 clear | clear 後可 replay；事件只觸發一次 | UI/flow | stale state |
| 6.7 | UI/mobile acceptance（Completed 2026-07-18） | P0 | High | 6.1–6.6 | desktop/mobile 完整流程、safe area 正常 | checklist/e2e | 手機遮擋戰鬥 |

正式多 Scene 拆分只在這裡依實際 lifecycle 決定；不要在 M1 預建空 Scene。

---

## Milestone 6A — Visual Upgrade

**Status:** Completed 2026-07-23；6A.1–6A.6 全部完成，accepted asset set 已 frozen。

**Playable Result:** 同一個完整 Vertical Slice 保持既有玩法與數值，但關羽、三種小兵、Boss、三畫面竹林、戰鬥特效與產品 UI 形成一致、可辨識的原創三國日式寫實 Pixel Art 品質。

**Goal:** 在 Audio 前完成一次有明確視覺目標、可逐項驗收的美術升級；不藉美術工作改寫 combat、AI、camera、stage flow 或 physics contracts。

**Dependencies:** M6 全部完成；M6.7 先固定 desktop/mobile UI 與 safe-area contract。

### Tasks

| ID | Description | Priority | Difficulty | Dependencies | Acceptance Criteria | Expected Files | Risk |
|---|---|---:|---:|---|---|---|---|
| 6A.1 | Visual target、Art Bible 與 before/after baseline（Completed 2026-07-18） | P0 | Medium | M6.7 | 鎖定比例、輪廓、色盤、光源、pixel density、UI language；三 viewport baseline 可比較 | ART_BIBLE/visual references/checklist | 沒有 target 就反覆重做 |
| 6A.2 | Guan Yu animation quality upgrade（Completed 2026-07-18） | P0 | High | 6A.1 | idle/walk/attack1–3/hurt/dead 動作完整；統一 scale/feet anchor；不以 transform 補幀 | player source/sheets/atlas/metadata/debug | 角色 identity 或 hit timing 漂移 |
| 6A.3 | Enemy and Boss visual consistency（Completed 2026-07-18） | P0 | High | 6A.1, 6A.2 | 三小兵與 Boss 比例、面向、腳底、輪廓、色盤一致；既有 active frames 與 body contract 不變 | enemy/boss source/sheets/atlas/metadata | 批次重製造成 frame 污染 |
| 6A.4 | Three-screen bamboo stage upgrade（Completed 2026-07-23） | P0 | High | 6A.1 | 三畫面可一眼區分；背景、前景遮擋、地面與 arena 層次完整；無接縫、空白或 depth 錯誤 | stage layers/section config/metadata | 視覺層影響 camera/碰撞 |
| 6A.5 | Combat effects and product UI art upgrade（Completed 2026-07-23） | P0 | High | 6A.2–6A.4 | Spark/impact/dust/shadow 與 Title/HUD/Pause/Failure/Result/custom font 同風格；不改傷害與流程 | effects/UI/font assets/manifest | 特效遮擋可讀性、UI scope 膨脹 |
| 6A.6 | Visual acceptance and asset freeze (Completed 2026-07-23) | P0 | High | 6A.1–6A.5 | desktop、844×390、390×844 全關 before/after 驗收；動畫無跳位；60 FPS/load budget 基線；素材來源完整 | checklist/screenshots/asset docs | 主觀驗收無結束條件 |

M6A 不加入新角色、新敵人、新招式、第二關、Audio、技能、掉寶、劇情或平衡改動。任何 frame timing、hitbox、body 或世界座標變動都必須先以既有 contract 證明是必要的 visual alignment 修正。

---

## Milestone 7 — Audio Integration

**Status:** Completed 2026-07-24；Tasks 7.1–7.5 全部通過。

**Playable Result:** 完整關卡具有原創／授權的攻擊、命中、受傷、死亡、UI、Stage 與 Boss 聲音。

**Goal:** 消費 M1/M2 已定義事件，不修改 combat rules。

**Dependencies:** M6A。

### Tasks

| ID | Description | Priority | Difficulty | Dependencies | Acceptance Criteria | Expected Files | Risk |
|---|---|---:|---:|---|---|---|---|
| 7.1 | Audio manager/mixer (Completed 2026-07-24) | P0 | Medium | M1 events/clock | SFX/BGM 分軌；pause/resume 正確 | audio module | autoplay policy |
| 7.2 | Combat/UI SFX (Completed 2026-07-24) | P0 | Medium | 7.1 | 每事件一次；多目標音量不爆 | audio assets/mapping | 疊音過強 |
| 7.3 | Stage/Boss music (Completed 2026-07-24) | P0 | Medium | 7.1 | 場景切換不重播／斷裂 | music assets | 檔案體積 |
| 7.4 | Mobile unlock/recovery (Completed 2026-07-24) | P0 | Medium | 7.1 | 首次手勢解鎖，背景恢復正常 | audio/lifecycle | iOS Safari 差異 |
| 7.5 | Audio acceptance (Completed 2026-07-24) | P0 | Medium | 7.1–7.4 | 三平台完整關卡無重複/漏播 | checklist | 主觀 mix 調整 |

---

## Milestone 8 — Content Polish and Performance

**Playable Result:** 同一 Vertical Slice 內容完成視覺、手感與效能收斂，達到 Release Candidate 品質。

**Goal:** 不增加新系統，只改善既有內容。

**Dependencies:** M7。

### Tasks

| ID | Description | Priority | Difficulty | Dependencies | Acceptance Criteria | Expected Files | Risk |
|---|---|---:|---:|---|---|---|---|
| 8.1 | 設定並量測 performance budget (Completed 2026-07-24) | P0 | Medium | M7 | FPS、memory、load size 有基準 | profiling docs/tests | 無目標裝置 |
| 8.2 | Game-feel timing pass | P0 | High | Complete gameplay | 參數變更有 before/after evidence | configs | 無止境微調 |
| 8.3 | Release visual defect pass | P1 | Medium | M6A accepted | 只修 clipping、seam、readability 與平台差異；不新增整套 art scope | existing assets/checklist | 重開已 freeze 的美術方向 |
| 8.4 | Production asset packaging and memory optimization (Completed 2026-07-24) | P0 | High | 8.1 | production 只包含 runtime 必要資源且符合 delivery budget；decoded memory 未超標時不重製 atlas | build/assets/tests | 漏包間接引用素材 |
| 8.5 | Conditional pooling (Not required by 8.1 evidence) | P2 | Medium | 8.1 | 只有 profiling 證明 GC spike 才實作 | effects/pools | YAGNI |
| 8.6 | Flash/shake/accessibility settings | P1 | Medium | M6 UI | 可降低強度；預設手感不變 | settings/UI | 設定 scope 膨脹 |
| 8.7 | Full QA matrix | P0 | High | 8.1–8.6 | CHECKLIST 全部有 evidence，無 Critical/High defect | tests/docs | 測試時間不足 |

---

## Milestone 9 — Web + Mobile Release

**Playable Result:** 可公開存取、可回退、可在三個目標瀏覽器完整通關的 Vertical Slice。

**Goal:** 發布，不新增 gameplay。

**Dependencies:** M8。

### Tasks

| ID | Description | Priority | Difficulty | Dependencies | Acceptance Criteria | Expected Files | Risk |
|---|---|---:|---:|---|---|---|---|
| 9.1 | Production route/hosting verification | P0 | High | M8 | HTML/JS/atlas/PNG/audio 全為 200 | hosting tests/config | Vinext asset path |
| 9.2 | Release candidate/versioning | P0 | Medium | 9.1 | immutable build、version、changelog | release files | build 不可重現 |
| 9.3 | Platform acceptance | P0 | High | 9.2 | Desktop Chrome/Edge、Android Chrome、iOS Safari 各完整通關三次 | checklist | 裝置差異 |
| 9.4 | Rollback drill | P0 | Low | 9.2 | 可在 15 分鐘內回退上一版 | release docs | artifact retention |
| 9.5 | Release and defect triage | P0 | Medium | 9.3, 9.4 | 無 Critical/High defect；問題進 Backlog | release/backlog | 發布後 scope 膨脹 |

## Task Status Update — 2026-07-12

- M1 / Task 1.2 (Phaser Touch Controls) completed in commit `5746f97`.
- Evidence: touch adapter contract test, pointer release paths (`pointerupoutside`, `pointerout`, `pointercancel`, `gameout`), `pnpm test`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, and local browser smoke with one Canvas and zero console errors.
- M1 / Task 1.3 (Pause, Hit-Stop, and Visibility Clock Contract) completed in commit `5dc85b7`.
- M1 / Task 1.4 (Readonly Gameplay Events and Snapshot) completed in commit `476f9fd`.
- M1 / Task 1.6 (Deterministic Seed and Test Clock) completed in commit `9bf6119`.
- Evidence: seeded RNG and test clock reproducibility tests, EnemyManager injection seams, `pnpm test`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, and browser smoke with one Canvas and zero console errors.
- M1 / Task 1.7 (Responsive Mobile Landscape Contract) completed in this closeout commit.
- M1 / Task 1.8 (Scene Reset Smoke Test) completed in this closeout commit.
- M1 / Task 1.5 (Asset Manifest and Preload Failure Policy) completed in this closeout commit.
- M2 / Task 2.1 (Player State Machine) completed in this closeout commit.
- M2 / Task 2.2 (Player Actor Visual and Physics Ownership) completed in this closeout commit.
- M2 / Task 2.3 (Player Attack Controller and Metadata) completed in this closeout commit.
- M2 / Task 2.4 (Combat Resolver) completed in this closeout commit.
- M2 / Task 2.5 (Effect Director) completed in this closeout commit.
- M2 / Task 2.6 (Player Hurt, Dead, and Restart) completed in this closeout commit.
- M2 / Task 2.7 (EnemyManager Cleanup and Director Tests) completed in this closeout commit.
- M2 / Task 2.8 (Combat-Room Acceptance) completed in this closeout commit.
- M3 / Task 3.1 (StageConfig) completed in the current sprint.
- M3 / Task 3.2 (World/walk bounds contract) completed in the current sprint.
- M3 / Task 3.3 (Camera follow) completed in the current sprint.
- M3 / Task 3.4 (Encounter camera lock/unlock) completed in the current sprint.
- M3 / Task 3.5 (Spawn and all-clear flow) completed in the current sprint.
- M3 / Task 3.6 (Stage exit and restart) completed in the current sprint.
- M3 / Task 3.7 (Stage traversal acceptance) completed in the current sprint.
- M4 / Task 4.1 (EnemyConfig boundary) completed in the current sprint.
- M4 / Task 4.2 (Second melee soldier) completed in the current sprint.
- M4 / Task 4.3 (Third melee soldier) completed in the current sprint.
- M4 / Task 4.4 (Mixed encounter composition) completed in the current sprint.
- M4 / Task 4.5 (Encounter tuning pass) completed in the current sprint.
- M4 / Task 4.6 (Multi-archetype regression) completed in the current sprint.
- M4 / Task 4.7 (Enemy facing and hit reachability regression) completed in the current sprint.
- M5 / Task 5.1 (Boss state/ownership contract) completed in the current sprint.
- M5 / Task 5.2 (Boss attack 1–3) completed in the current sprint.
- M5 / Task 5.3 (Boss decision rhythm) completed in the current sprint.
- M5 / Task 5.4 (Boss hurt/phase/death) completed in the current sprint.
- M5 / Task 5.5 (Arena bounds/camera lock) completed in the current sprint.
- M5 / Task 5.6 (Stage-complete event) completed in the current sprint.
- M5 / Task 5.7 (Full-stage acceptance) completed in the current sprint.
- Milestone 5 is complete.
- M6 / Task 6.1 (game-flow modes/reset ownership) completed on 2026-07-14.
- M6 / Task 6.2 (Title/start) completed on 2026-07-14.
- M3 and M5 playable-result acceptance corrected on 2026-07-14; their contract foundations remain accepted.
- M6 / Task 6.3 (Player/Boss HUD) completed on 2026-07-17.
- M5R / Task 5R.1 (three-screen world and visible camera scrolling) completed on 2026-07-14.
- M5R / Task 5R.2 (two encounter triggers and gates) completed on 2026-07-15.
- M5R / Task 5R.3 (Boss arena entry sequencing) completed on 2026-07-16.
- M5R / Task 5R.4 (Boss locomotion, facing, and Y alignment) completed on 2026-07-16.
- M5R / Task 5R.5 (Boss attack hitbox and player damage) completed on 2026-07-16.
- M5R / Task 5R.6 (Player failure and deterministic restart) completed on 2026-07-16.
- M5R / Task 5R.7 (Boss defeat and cleared flow) completed on 2026-07-16.
- M5R / Task 5R.8 (End-to-end Vertical Slice acceptance) completed on 2026-07-17.
- M5R / Task 5R.9 (Encounter-clear camera handoff stability) completed on 2026-07-17.
- M6 / Task 6.4 (Pause/resume) completed on 2026-07-18.
- Evidence: one Phaser-owned keyboard/touch Pause path; independent manual/Hit Stop/visibility clock reasons; desktop, landscape, portrait, camera handoff, Boss entry/clear, ten-cycle failure/restart, and production browser acceptance passed with one Canvas and zero runtime errors.
- M6 / Task 6.5 (Failure/continue/restart) completed on 2026-07-18.
- Evidence: one persistent Phaser-owned Failure controller, an exactly-once restart request gate, keyboard and touch retry, fixed camera-space pointer alignment, ten-cycle reset smoke, one Canvas, and zero runtime errors.
- M6 / Task 6.6 (Result/replay) completed on 2026-07-18.
- Evidence: one persistent Phaser-owned Result controller, an exactly-once replay request gate, keyboard and touch replay, desktop/landscape/portrait acceptance, ten-cycle new-run smoke, one Canvas, and zero runtime errors.
- M6 / Task 6.7 (UI/mobile acceptance) completed on 2026-07-18.
- Evidence: desktop keyboard, 844×390 landscape touch, 390×844 portrait touch, encounter/Boss/terminal regressions, ten-cycle restart/replay, safe-area FIT, one Canvas, production without development presentation, and zero browser errors.
- Milestone 6 is complete.
- M6A / Task 6A.1 (Visual target, Art Bible, and before/after baseline) completed on 2026-07-18.
- Evidence: objective actor ratios, palette/lighting/pixel-density/UI gates, provenance and naming rules, prioritized 6A.2–6A.6 gap order, and 15 reproducible desktop/landscape/portrait before captures at revision `3183f1f`.
- M6A / Task 6A.2 (Guan Yu animation quality upgrade) completed on 2026-07-18.
- Evidence: 43 original distinct frames (6/8/5/6/8/4/6), one 640×448 cell and `(320,420)` feet contract, display scale `0.64`, reproducible atlas/metadata/debug pipeline, preserved 125/125/125ms attack phases, 78 tests, both production builds, and three-viewport browser acceptance with one Canvas and zero errors.
- M6A / Task 6A.3 (Enemy and Boss visual consistency) completed on 2026-07-18.
- Evidence: 69 audited cast frames, one scale/feet contract per actor, Art Bible lineup ratios, reproducible atlas/provenance/onion/silhouette QA, 79 tests, both production builds, and three-viewport state-matrix acceptance with one Canvas and zero errors.
- M6A / Task 6A.4 (Three-screen bamboo stage upgrade) completed on 2026-07-23.
- Evidence: three original 1280×720 sections, nine explicit background/ground/foreground runtime layers, fixed 3840×720 gameplay geometry, shared palette and 64px seam normalization, source provenance, overview/seam/depth QA, 80 tests, production runtime, and desktop/844×390/390×844 acceptance.
- M6A / Task 6A.5 (Combat effects and product UI art upgrade) completed on 2026-07-23.
- Evidence: 5-frame Hit Spark, 4-frame impact dust, shared ground shadow, product Title/HUD/Pause/Failure/Result/mobile-control art, custom bitmap font, source provenance, reproducible tooling, 81 tests, three viewport production acceptance, and unchanged combat/flow contracts.
- M6A / Task 6A.6 (Visual acceptance and asset freeze) completed on 2026-07-23.
- Evidence: 15 matching before/after comparisons, accepted provenance and pipeline audit, 11,421,285 encoded asset bytes, 24 runtime textures, one Canvas, zero runtime errors, no production debug leakage, and a 300-frame 60.00 FPS / 59.92 FPS 1% low baseline.
- M7 / Task 7.1 (Audio manager/mixer) completed on 2026-07-24.
- Evidence: one Scene-owned manager, separate SFX/BGM channel state, gameplay-event subscription, idempotent pause/resume/reset/destroy, user-gesture unlock, visibility handling, ten-reset cleanup, and no audio assets or gameplay changes.
- M7 / Task 7.2 (Combat/UI SFX) completed on 2026-07-24.
- Evidence: ten deterministic original PCM WAV cues, reproducible generator and SHA-256 provenance, manifest-only loading, immutable event mapping, same-frame multi-target hit coalescing, locked-output queueing, complete Title/combat/terminal browser smoke, 92 tests, and both production builds.
- M7 / Task 7.3 (Stage/Boss music) completed on 2026-07-24.
- M7 / Task 7.4 (Mobile unlock/recovery) completed on 2026-07-24.
- Evidence: AudioContext running/suspended/interrupted observation, coalesced resume, stale-SFX rejection, independent manual/visibility pause ownership, one-track recovery, 101 tests, both builds, browser lifecycle/reset smoke, and user-confirmed physical iOS Safari/Android Chrome acceptance (device and browser versions not supplied).
- M7 / Task 7.5 (Audio acceptance) completed on 2026-07-24.
- Evidence: complete success/failure cue matrix, deterministic final-hit peak headroom, catalog-only mix tuning, 103 tests, both builds, development/production browser smoke, ten retry/replay cycles, and user-confirmed physical iOS Safari/Android Chrome mix acceptance (device and browser versions not supplied).
- Milestone 7 is complete.
- M8 / Task 8.1 (Performance budget and baseline) completed on 2026-07-24.
- Evidence: 36 reproducible checkpoint runs across desktop, 844×390 landscape fit, and 390×844 portrait fit; 10 reset, failure/retry, and Result/replay cycles; one production Canvas with no profiling leakage; 107 tests and both builds.
- Runtime frame, stability, heap, texture, requested-asset, decoded-texture, and raw-JavaScript budgets passed. The GitHub Pages artifact measured 125,451,173 bytes against a 30 MiB budget because non-runtime source/debug/QA files are copied from `public/`.
- M8 / Task 8.4 (Production asset packaging and memory optimization) completed on 2026-07-24.
- Evidence: one 46-file production public inventory, 99 copied source/QA files excluded from both outputs, exact SHA-256 preservation, 18,172,139-byte GitHub Pages artifact, 110 tests, both builds, three-viewport/six-checkpoint browser matrix, and three ten-cycle reset paths.
- M8 / Task 8.2A Combo Commitment Prototype was accepted by the reviewer on 2026-07-25. M8 / Task 8.5 remains not required because Task 8.1 found no sustained GameObject, listener, texture, Canvas, Audio-owner, or heap growth attributable to effects.
- Next eligible task: M8 / Task 8.2B Mixed Encounter Decision Prototype.

## 4. Global Acceptance Rules

每個 Milestone 必須同時滿足：

1. 有一個可玩的成果與明確起點／終點。
2. `build`, `lint`, `typecheck`, `test` 全通過。
3. Applicable `CHECKLIST.md` 項目有 evidence。
4. 連續 restart／replay 不增加 listener、timer、collider、GameObject。
5. Desktop 與當期適用 mobile smoke test 通過。
6. 無新增 console error。
7. Roadmap、Sprint、Technical Debt、Asset Pipeline 已更新。
8. 一個 Task 一個清楚 commit；不得把下一個 Task 混入。

## 5. Required Development Order

`M0 Baseline → M1 Runtime Contracts → M2 Combat Room → M3 Stage Contracts → M4 Enemy Variety → M5 Boss Contracts → M5R Vertical Slice Recovery → M6 Product Flow (complete) → M6A Visual Upgrade (complete/frozen) → M7 Audio → M8 Polish → M9 Release`

不得跳過 M3 先擴敵人內容；不得跳過 M1/M2 直接加入 Stage 或 Boss。
