# Validation Checklist

使用方式：每個 Task 複製 Applicable 項目到 PR／commit notes，標記 Pass/Fail/N/A 並附 command、截圖、log 或測試名稱。沒有 evidence 不算 Pass。

## Latest Task Evidence — M1 / Task 1.1

- [x] Action snapshot contract test：keyup zero vector、diagonal normalize、attack edge。
- [x] Source scan：無 DOM keyboard listener；`JustDown` 只在 input boundary 讀取。
- [x] `pnpm test` 6/6、`pnpm build`、`pnpm lint`、`pnpm typecheck` 通過。
- [x] Browser keyboard smoke：右移、四方向三輪、J 輸入完成；console error count = 0。

## Repository and Build

- [ ] Worktree 只包含本 Task 相關變更。
- [ ] 無意外 lockfile、generated file 或 formatting churn。
- [ ] `pnpm build` 通過。
- [ ] `pnpm lint` 通過。
- [ ] `pnpm typecheck` 通過。
- [ ] `pnpm test` 通過。
- [ ] Production asset routes 無 404。
- [ ] Browser console 無 error/warning regression。

## Player

- [ ] WASD 與方向鍵可重複移動／停止。
- [ ] 放開按鍵下一幀 velocity 歸零。
- [ ] 斜向速度已 normalize。
- [ ] Player 不超出 walk bounds。
- [ ] idle/walk/attack/hurt state transition 合法。
- [ ] Attack 期間移動鎖定，完成後立即恢復輸入。
- [ ] 長按攻擊不會意外自動重播。
- [ ] Sprite、body、feet world position 同步。

## Enemy

- [ ] 每名 Enemy 有獨立 state、HP、body、hitbox、hit record。
- [ ] Walk animation 伴隨真實 world movement。
- [ ] Stop/attack/hurt/dead velocity 為零。
- [ ] Y 未對線時不攻擊。
- [ ] 同時最多一名 Enemy 攻擊。
- [ ] Attacker Hurt/Dead 立即釋放 Attack Slot。
- [ ] Attack Slot 可公平輪替。
- [ ] Enemy 不完全重疊、不高速抖動。
- [ ] Destroy 後無 collider/listener/timer reference。

## Combat

- [ ] Body 與 attack hitbox 分離。
- [ ] Hitbox 只在 active frames 啟用。
- [ ] 同一攻擊不重複命中同一 target。
- [ ] 同一攻擊可命中多 target。
- [ ] 多目標各自 Damage／Flash／Spark／Knockback。
- [ ] 同 frame Hit Stop／Camera Shake 只觸發一次。
- [ ] Hurt/invulnerability 防止無限連打。
- [ ] Knockback 不將 actor 推出 walk bounds。
- [ ] Hit Stop 後 Physics、animations、tweens 全部恢復。

## Animation

- [ ] Frame order、FPS、repeat 與 metadata 一致。
- [ ] Startup／active／recovery 可清楚辨識。
- [ ] Idle/walk loop 不每幀重啟。
- [ ] One-shot animation 完成後回到合法 state。
- [ ] 所有 frame 腳底 anchor 一致。
- [ ] 切換動畫不改變角色尺寸或 world feet Y。
- [ ] Listener 不重複註冊且 shutdown 後移除。

## M6A Visual Upgrade

- [x] 6A.1 已保存 desktop、844×390、390×844 的 before baseline 與 visual target。
- [ ] 關羽、三種小兵與 Boss 的身高比例、輪廓、色盤、光源與 pixel density 一致。
- [ ] 每個 actor 的所有站立 frame 使用單一 display scale 與共同 feet anchor。
- [ ] Idle、walk、attack、hurt、dead 沒有裁切、鄰格污染、跳位或 transform 偽造中間動作。
- [ ] 三個竹林畫面可一眼區分，且沒有接縫、空白、錯誤前景 depth 或 Boss arena 風格斷裂。
- [ ] Spark、impact、dust、shadow 不遮蔽 active pose、敵人 telegraph、HP 或 mobile controls。
- [ ] Title、HUD、Pause、Failure、Result、字體與 mobile controls 使用同一產品 UI language。
- [ ] 美術替換前後的 hitbox、body、active frame、damage、AI、camera 與 stage flow contract 相同。
- [x] Desktop、landscape、portrait after captures 已與 baseline 並排人工驗收。
- [x] Source、runtime sheet、atlas、metadata、debug sheet、rebuild tool 與授權／原創紀錄齊全。
- [x] 完整關卡維持一個 Canvas、無 runtime error，並記錄 60 FPS、texture memory 與 initial load baseline。
- [x] 6A.6 visual freeze 後，後續 M8 只修具體 defect，不重新開啟整套美術方向。

## Physics

- [ ] Ground body 只覆蓋腳底占位。
- [ ] Sprite 跟隨 body，不以 sprite tween 代替 physics。
- [ ] Player/Enemy 不完全穿透。
- [ ] Enemy/Enemy 不完全重疊。
- [ ] 所有 actor 不超出 walk bounds。
- [ ] Depth 依腳底 Y 更新。
- [ ] Physics debug 與實際 body 一致。

## Stage

- [ ] Stage bounds 與 camera bounds 一致。
- [ ] Encounter gate 只在指定條件解除。
- [ ] Spawn 不重疊或出界。
- [ ] 清敵後可繼續前進。
- [ ] Stage complete／failed 不重複觸發。
- [ ] Foreground/actor depth 正確。

## Camera

- [ ] Follow 平滑且不造成 pixel shimmer。
- [ ] Encounter/Boss lock 不 soft-lock 玩家。
- [ ] Shake 不改變永久 camera position。
- [ ] 多目標命中不疊加過強 shake。
- [ ] 不同 viewport 不拉伸 Canvas。

## UI

- [ ] HUD 只顯示 state，不控制 gameplay。
- [ ] HP、Boss HP、pause、result 正確更新。
- [ ] 中文與數字可讀。
- [ ] UI 不遮住必要戰鬥區域。
- [ ] Production 無 debug text/body/slot marker。

## Mobile and Input

- [ ] 手機橫向可完成所有必要操作。
- [ ] Touch buttons 支援多指。
- [ ] pointerup/pointercancel 會釋放動作。
- [ ] Safe area 不遮住按鈕。
- [ ] 裝置旋轉後 Canvas 不變形。
- [ ] 切到背景再回來沒有 stuck input/timer drift。
- [ ] 首次 touch 可解鎖 audio。

## Audio

- [x] Attack/Hit/Hurt/Death event 各播放一次。
- [x] 多目標命中不造成不可接受的音量疊加。
- [x] Pause/resume audio 正確。
- [ ] BGM transition 不重複或斷裂。
- [ ] 音量設定可持續於本機。

## Debug

- [ ] Development 顯示必要 state/body/hitbox。
- [ ] Preview modes 可逐格檢查。
- [ ] Debug overlay 不修改 gameplay。
- [ ] Query mode 與正式流程互斥。
- [ ] Production 完全關閉 debug。

## Performance

- [ ] Desktop 目標 60 FPS。
- [ ] 目標手機長戰鬥無持續掉幀。
- [ ] 無持續增長的 GameObject、listener、timer、collider。
- [ ] Texture/memory 符合當期 budget。
- [ ] Hit Spark／damage effects 不造成明顯 GC spike。
- [ ] Initial load size 與時間已記錄。

## M1 / Task 1.2 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M1 / Task 1.2 — Phaser Touch Controls |
| Commit | Pending | Closeout commit created after final diff review |
| Build | Pass | `pnpm build` (sandbox escalation required for Vite child process) |
| Tests | Pass | `pnpm test` 7/7 |
| Lint | Pass | `pnpm lint` 0 errors, existing `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | One 1280×720 Canvas, touch attack interaction, zero console errors |
| Mobile smoke | Pending | Physical mobile device not available in harness |
| Known issues | None blocking | Physical-device pointer lifecycle still needs M1.7 validation |

## M1 / Task 1.3 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M1 / Task 1.3 — Pause, Hit-Stop, and Visibility Clock Contract |
| Commit | Pending | Closeout commit created after final diff review |
| Build | Pass | `pnpm build` |
| Tests | Pass | `pnpm test` 9/9 |
| Lint | Pass | `pnpm lint` 0 errors, existing `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | Focus-change navigation, one Canvas, zero console errors |
| Mobile smoke | Pending | Physical mobile visibility lifecycle not available in harness |
| Known issues | Non-blocking | Physical Safari/Android lifecycle validation deferred to M1.7 |

## Task Evidence

## M1 / Task 1.6 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M1 / Task 1.6 — Deterministic Seed and Test Clock |
| Commit | Pending | Closeout commit created after final diff review |
| Build | Pass | `pnpm build` |
| Tests | Pass | `pnpm test` 13/13 |
| Lint | Pass | `pnpm lint` 0 errors, existing `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | One 1280×720 Canvas, touch attack interaction, zero console errors |
| Mobile smoke | Pending | Physical mobile deterministic timing not available in harness |
| Known issues | Non-blocking | Full deterministic combat simulation deferred |

## M1 / Task 1.7 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M1 / Task 1.7 — Responsive Mobile Landscape Contract |
| Build | Pass | `pnpm build` |
| Tests | Pass | `pnpm test` 14/14 |
| Lint | Pass | `pnpm lint` 0 errors, existing `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser viewport smoke | Pass | 844×390 and 390×844, one 1280×720 Canvas, fitted 16:9 style |
| Physical mobile smoke | Pending | No physical iOS/Android device available in harness |
| Known issues | Non-blocking | Device-specific orientation and visibility lifecycle remain release QA |

## M1 / Task 1.8 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M1 / Task 1.8 — Scene Reset Smoke Test |
| Build | Pass | `pnpm build` |
| Tests | Pass | `pnpm test` 15/15 |
| Lint | Pass | `pnpm lint` 0 errors, existing `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser reset smoke | Pass | `?resetSmoke=1`, 10 restarts, one 1280×720 Canvas, reset count 10 |
| Known issues | Non-blocking | Physical mobile validation remains pending |

## M1 / Task 1.5 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M1 / Task 1.5 — Asset Manifest and Preload Failure Policy |
| Build | Pass | `pnpm build` |
| Tests | Pass | `pnpm test` 16/16 |
| Lint | Pass | `pnpm lint` 0 errors, existing `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | Manifest-backed route, one 1280×720 Canvas, no visible runtime error |
| Missing asset fixture | Pass | Reporter emits deterministic required-key message |
| Known issues | Non-blocking | Full asset content/metadata expansion remains future work |

## M2 / Task 2.1 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M2 / Task 2.1 — Player State Machine |
| Build | Pass | `pnpm build` |
| Tests | Pass | `pnpm test` 17/17 |
| Lint | Pass | `pnpm lint` 0 errors, existing `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | Updated route, one 1280×720 Canvas, no visible runtime error |
| Transition coverage | Pass | Valid idle/walk/attack/hurt paths and invalid transition rejection |
| Known issues | Non-blocking | Actor visual/physics ownership remains in MainScene for Task 2.2 |

## M2 / Task 2.8 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M2 / Task 2.8 — Combat-Room Acceptance |
| Build | Pass | `pnpm build` |
| Tests | Pass | `pnpm test` 24/24 |
| Lint | Pass | `pnpm lint` 0 errors, existing `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | `?resetSmoke=1`, one 1280x720 Canvas, reset count 10 |
| Combat-room contracts | Pass | Formation, director, alignment, spacing, multi-target, cleanup and survivor coverage |
| Known issues | Non-blocking | Physical device and long-session QA remain deferred |

## M2 / Task 2.7 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M2 / Task 2.7 — EnemyManager Cleanup and Director Tests |
| Build | Pass | `pnpm build` |
| Tests | Pass | `pnpm test` 23/23 |
| Lint | Pass | `pnpm lint` 0 errors, existing `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | `?resetSmoke=1`, one 1280x720 Canvas, reset count 10 |
| Cleanup contract | Pass | Timer cancellation, body/hitbox/listener cleanup, attack-slot release tests |
| Known issues | Non-blocking | Full combat-room acceptance remains for Task 2.8 |

## M2 / Task 2.6 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M2 / Task 2.6 — Player Hurt, Dead, and Restart |
| Build | Pass | `pnpm build` |
| Tests | Pass | `pnpm test` 22/22 |
| Lint | Pass | `pnpm lint` 0 errors, existing `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | `?resetSmoke=1`, one 1280x720 Canvas, reset count 10 |
| Lifecycle contract | Pass | HP floor, dead lockout, reset, and state transition tests |
| Known issues | Non-blocking | EnemyManager cleanup/director tests remain for Task 2.7 |

## M2 / Task 2.5 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M2 / Task 2.5 — Effect Director |
| Build | Pass | `pnpm build` |
| Tests | Pass | `pnpm test` 21/21 |
| Lint | Pass | `pnpm lint` 0 errors, existing `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | Updated route, one 1280x720 Canvas, no visible runtime error |
| Effect ownership | Pass | Flash, spark, knockback, shake, and hit-stop use EffectDirector |
| Known issues | Non-blocking | Player hurt/dead/restart flow remains for Task 2.6 |

## M2 / Task 2.4 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M2 / Task 2.4 — Combat Resolver |
| Build | Pass | `pnpm build` |
| Tests | Pass | `pnpm test` 20/20 |
| Lint | Pass | `pnpm lint` 0 errors, existing `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | Updated route, one 1280x720 Canvas, no visible runtime error |
| Resolver behavior | Pass | Pure resolver returns one hit per target and preserves multi-target resolution |
| Known issues | Non-blocking | Hit effects remain in MainScene for Task 2.5 |

## M2 / Task 2.3 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M2 / Task 2.3 — Player Attack Controller and Metadata |
| Build | Pass | `pnpm build` |
| Tests | Pass | `pnpm test` 19/19 |
| Lint | Pass | `pnpm lint` 0 errors, existing `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | Updated route, one 1280x720 Canvas, no visible runtime error |
| Attack metadata | Pass | Three independent animation keys and timing metadata consumed by MainScene |
| Known issues | Non-blocking | Combat resolution remains in MainScene for Task 2.4 |

## M2 / Task 2.2 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M2 / Task 2.2 — Player Actor Visual and Physics Ownership |
| Build | Pass | `pnpm build` |
| Tests | Pass | `pnpm test` 18/18 |
| Lint | Pass | `pnpm lint` 0 errors, existing `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | Updated route, one 1280×720 Canvas, no visible runtime error |
| Actor ownership | Pass | Sprite/body/feet synchronization contract test |
| Known issues | Non-blocking | Attack controller and metadata remain for Task 2.3 |

## M1 / Task 1.4 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M1 / Task 1.4 — Readonly Gameplay Events and Snapshot |
| Commit | Pending | Closeout commit created after final diff review |
| Build | Pass | `pnpm build` |
| Tests | Pass | `pnpm test` 11/11 |
| Lint | Pass | `pnpm lint` 0 errors, existing `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | One 1280×720 Canvas, touch attack interaction, zero console errors |
| Mobile smoke | Pending | Physical mobile consumer validation not available in harness |
| Known issues | Non-blocking | MainScene still owns publication; extraction deferred to M2 |

| Item | Result | Evidence |
|---|---|---|
| Task ID |  |  |
| Commit |  |  |
| Build |  |  |
| Tests |  |  |
| Desktop smoke |  |  |
| Mobile smoke |  |  |
| Known issues |  |  |

## M3 / Task 3.1 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M3 / Task 3.1 StageConfig |
| Tests | Pass | `pnpm test` 25/25 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | One 1280x720 Canvas, reset count 10, page errors 0 |
| Schema validation | Pass | Bounds containment, unique IDs, and encounter references |
| Known issues | Non-blocking | Stage camera, gates, and physical mobile QA remain deferred |

## M3 / Task 3.2 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M3 / Task 3.2 World/walk bounds contract |
| Tests | Pass | `pnpm test` 26/26 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | One 1280x720 Canvas, reset count 10, page errors 0 |
| Edge clamping | Pass | Deterministic X/Y/point boundary tests |
| Known issues | Non-blocking | Camera follow and physical mobile QA remain deferred |

## M3 / Task 3.3 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M3 / Task 3.3 Camera follow |
| Tests | Pass | `pnpm test` 27/27 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | One 1280x720 Canvas, reset count 10, page errors 0 |
| Camera bounds | Pass | Pure helper clamps target scroll to world limits |
| Known issues | Non-blocking | Encounter camera lock and physical mobile QA remain deferred |

## M3 / Task 3.4 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M3 / Task 3.4 Encounter camera lock/unlock |
| Tests | Pass | `pnpm test` 29/29 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | One 1280x720 Canvas, reset count 10, page errors 0 |
| Lock lifecycle | Pass | Explicit encounter lock, all-clear unlock, restart reset |
| Known issues | Non-blocking | Full encounter gates and physical mobile QA remain deferred |

## M3 / Task 3.5 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M3 / Task 3.5 Spawn and all-clear flow |
| Tests | Pass | `pnpm test` 31/31 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | One 1280x720 Canvas, reset count 10, page errors 0 |
| Spawn/clear contract | Pass | Spawn count, duplicate guards, all-clear, and reset tests |
| Known issues | Non-blocking | Stage exits, respawn, and physical mobile QA remain deferred |

## M3 / Task 3.6 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M3 / Task 3.6 Stage exit and restart |
| Tests | Pass | `pnpm test` 33/33 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | One 1280x720 Canvas, reset count 10, page errors 0 |
| Exit/restart contract | Pass | Locked → available → requested and reset tests |
| Known issues | Non-blocking | Traversal acceptance, second stage, and physical mobile QA remain deferred |

## M3 / Task 3.7 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M3 / Task 3.7 Stage traversal acceptance |
| Tests | Pass | `pnpm test` 34/34 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | One 1280x720 Canvas, reset count 10, page errors 0 |
| Traversal path | Pass | Spawn → clear → camera unlock → exit request → reset |
| Known issues | Non-blocking | M4 enemy variety and physical mobile QA remain deferred |

## M4 / Task 4.1 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M4 / Task 4.1 EnemyConfig boundary |
| Tests | Pass | `pnpm test` 36/36 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | One 1280x720 Canvas, page errors 0 |
| Config parity | Pass | Current soldier HP, movement, ranges, spacing, timing, and anchors |
| Known issues | Non-blocking | Second soldier art/behavior and physical mobile QA remain deferred |

## M4 / Task 4.2 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M4 / Task 4.2 Second melee soldier |
| Tests | Pass | `pnpm test` 37/37 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | One 1280x720 Canvas, page errors 0 |
| Art/metadata | Pass | 15-frame mauler sheet, atlas, debug sheet, asset route |
| Behavior config | Pass | Distinct attack range, walk speed, HP, and recovery |
| Known issues | Non-blocking | Third soldier and mixed encounter wiring remain deferred |

## M4 / Task 4.3 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M4 / Task 4.3 Third melee soldier |
| Tests | Pass | `pnpm test` 38/38 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | One 1280x720 Canvas, page errors 0 |
| Art/metadata | Pass | 15-frame duelist sheet, atlas, debug sheet, asset route |
| Behavior config | Pass | Faster movement/recovery and shorter attack range |
| Known issues | Non-blocking | Mixed encounter wiring and physical mobile QA remain deferred |

## M4 / Task 4.4 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M4 / Task 4.4 — Mixed encounter composition |
| Tests | Pass | `pnpm test` 39/39 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | One 1280x720 Canvas and zero page errors |
| Composition | Pass | Deterministic soldier / mauler / duelist spawn assignment |
| Combat contracts | Pass | Single attack slot, Y alignment, pairwise spacing, per-archetype animation and cleanup tests |
| Known issues | Non-blocking | Encounter tuning and physical mobile QA remain deferred |

## M4 / Task 4.5 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M4 / Task 4.5 — Encounter tuning pass |
| Tests | Pass | `pnpm test` 40/40 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Browser smoke | Pass | Keyboard movement/attack sequence, one 1280x720 Canvas, zero page errors |
| Duration budget | Pass | 12 total HP × 3000ms reference hit interval = 36 seconds |
| Movement/spacing | Pass | Attack Y range ≤48px; minimum spacing ≥68px; distinct walk speeds retained |
| Attack slot | Pass | Existing single `currentAttacker` guard remains covered |
| Known issues | Non-blocking | Physical-player duration sampling and mobile QA remain deferred |

## M4 / Task 4.6 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M4 / Task 4.6 — Multi-archetype regression |
| Tests | Pass | `pnpm test` 41/41 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Removal permutations | Pass | All six archetype death orders preserve survivors and clear only after three removals |
| Slot/cleanup contract | Pass | Shared damage/removal paths release slot, clean ownership, splice collection, and record removal |
| Browser combat/reset | Pass | Keyboard combat followed by 10 Scene restarts; one 1280x720 Canvas, zero page errors |
| Known issues | Non-blocking | Physical mobile and long-session QA remain deferred |

## M5 / Task 5.1 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M5 / Task 5.1 — Boss state/ownership contract |
| Tests | Pass | `pnpm test` 42/42 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| State/lifecycle | Pass | Legal transitions, damage, death, cleanup, reset, and reactivation covered |
| Ownership | Pass | Phaser-free source; `EnemyManager` has no Boss reference |
| Browser smoke | Pass | Existing room unchanged; one 1280x720 Canvas, zero page errors |
| Known issues | Non-blocking | Boss art, attacks, AI, arena, HUD, and audio remain deferred |

## M5 / Task 5.2 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M5 / Task 5.2 — Boss attack 1–3 |
| Tests | Pass | `pnpm test` 43/43 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Attack frames | Pass | Three attacks × startup / active / recovery; nine unique frames |
| Atlas/alignment | Pass | 1344×1344 sheet, 448×448 cells, shared `(224,420)` feet anchor |
| Asset routes | Pass | Boss PNG and atlas HTTP 200; zero request failures |
| Browser smoke | Pass | Existing room unchanged; one 1280x720 Canvas, zero page errors |
| Known issues | Non-blocking | Boss actor/AI and remaining animation states are deferred |

## M5 / Task 5.3 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M5 / Task 5.3 — Boss decision rhythm |
| Tests | Pass | `pnpm test` 45/45 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Determinism | Pass | Identical seeds produce identical legal attack sequences |
| Recovery | Pass | One pending attack; completion starts 900–1300ms lockout |
| State safety | Pass | Non-idle selection and non-attack completion are rejected; reset clears lockout |
| Browser smoke | Pass | Existing room retained one 1280x720 Canvas and zero page errors |
| Known issues | Non-blocking | Policy is intentionally not connected until the Boss actor exists |

## M5 / Task 5.4 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M5 / Task 5.4 — Boss hurt/phase/death |
| Tests | Pass | `pnpm test` 47/47 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Lifecycle presentation | Pass | Feet-aligned idle, hurt, one phase transition, death, fade, and cleanup |
| Ownership | Pass | Scene-owned actor remains separate from `EnemyManager`; cleanup is idempotent |
| Browser lifecycle smoke | Pass | Phase 2 → dead → cleaned; one 1280×720 Canvas; zero page errors |
| Browser restart smoke | Pass | 10 Scene restarts; `bossActorCount=1`; one Canvas; zero page errors |
| Known issues | Non-blocking | Arena lock, Boss attack damage, walk, stage completion, HUD, and audio remain deferred |

## M5 / Task 5.5 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M5 / Task 5.5 — Arena bounds/camera lock |
| Tests | Pass | `pnpm test` 48/48 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Lock ownership | Pass | `encounter,boss` coexist; Boss cleanup removes only `boss` |
| Bounds | Pass | Player spawn, Boss spawn, world physics, and knockback share the walk boundary |
| Browser lifecycle smoke | Pass | Locked → released; release count 1; one Canvas; zero page errors |
| Browser restart smoke | Pass | 10 Scene restarts; one Boss; arena locked; release count reset to 0 |
| Known issues | Non-blocking | Single-room arena only; stage-complete event, HUD, audio, and Boss damage remain deferred |

## M5 / Task 5.6 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M5 / Task 5.6 — Stage-complete event |
| Tests | Pass | `pnpm test` 50/50 |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Event contract | Pass | Frozen primitive `stage-completed` payload through existing event hub |
| Ordering | Pass | Arena release precedes one completion publication after defeated cleanup |
| Restart ownership | Pass | Ordinary destruction publishes nothing; reset re-arms the one-shot gate |
| Browser lifecycle smoke | Pass | Count 0 → 1; correct stage id; released arena; one Canvas; zero errors |
| Browser restart smoke | Pass | 10 Scene restarts; completion count 0; one Boss/Canvas; zero errors |
| Known issues | Non-blocking | No Result consumer, game-flow mode, audio, scoring, or Boss attack damage yet |

## M5 / Task 5.7 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M5 / Task 5.7 — Full-stage acceptance |
| Tests | Pass | `pnpm test` 51/51, including integrated ordering, exactly-once completion, cleanup, and restart ownership |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Desktop Boss smoke | Pass | 1280×720 viewport; one logical 1280×720 Canvas; one completion; released arena; Boss cleaned |
| Landscape touch smoke | Pass | 844×390 viewport; fitted Canvas; one completion; released arena; Boss cleaned |
| Portrait fitted smoke | Pass | 390×844 viewport; fitted Canvas; one completion; released arena; Boss cleaned |
| Restart smoke | Pass | 10 Scene restarts; one Canvas; one Boss; completion count 0; lock reasons `encounter,boss` |
| Browser errors | Pass | Zero page errors |
| Known issues | Non-blocking | Physical-device feel, Boss attack damage/walk, Result UI, audio, scoring, and additional stages remain deferred |

## M4 / Task 4.7 Regression Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M4 / Task 4.7 — Enemy facing and hit reachability regression |
| Tests | Pass | `pnpm test` 53/53, including source-facing, flip, active-pose, slot-release, and non-starvation contracts |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Facing | Pass | Soldier left-facing source and mauler/duelist right-facing sources resolve through one config-aware rule |
| Attack timing | Pass | All three archetypes use Phaser active-frame index 2, the actual `attack-1` pose |
| Slot recovery | Pass | A holder unable to reach attack range releases the slot after 1500 ms |
| Browser combat | Pass | Separate real touch-movement lane smokes recorded player damage from `mauler`, `duelist`, and `soldier`; duelist walk and attack visuals faced travel/attack direction |
| Attack Slot fairness | Pass | Lowest grant count wins among eligible enemies; ID rotation deterministically resolves ties |
| Restart smoke | Pass | 10 Scene restarts; one 1280×720 Canvas; one Boss; no stale completion; zero browser errors |
| Deferred | Non-blocking | Boss movement remains planned work and was intentionally not changed |

## M6 / Task 6.1 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M6 / Task 6.1 — Game-flow modes and reset ownership |
| Tests | Pass | `pnpm test` 54/54; every legal transition, terminal handling, invalid transition, and reset re-arming covered |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Runtime ownership | Pass | No MainScene, React, actor, asset, UI, or gameplay file changed |
| Browser revalidation | Tool-limited | In-app browser blocked the local URL by policy; prior task automated reset contracts and all quality gates passed |
| Deferred | Non-blocking | Title/start UI and runtime connection remain M6 / Task 6.2 |

## M6 / Task 6.2 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M6 / Task 6.2 — Title/start |
| Tests | Pass | `pnpm test` 56/56; keyboard/pointer single-start, reset re-arm, ownership, and no-React-state contracts covered |
| Build | Pass | `pnpm build` |
| Lint | Pass | 0 errors, existing 4 `<img>` warnings only |
| Typecheck | Pass | `pnpm typecheck` |
| Pointer start | Pass | Visible Title → `playing`; start count 1; one Canvas |
| Keyboard start | Pass | J starts once; player remains idle; no attack-input leak |
| Restart ownership | Pass | 10 Scene restarts; one 1280×720 Canvas; one Boss; completion count 0; Title re-armed |
| Browser errors | Pass | Zero errors across Title, keyboard, pointer, and restart smoke tabs |
| Deferred | Non-blocking | Player/Boss HUD remains M6 / Task 6.3 |

## Vertical Slice Planning Correction — 2026-07-14

| Item | Result | Evidence |
|---|---|---|
| M3 contract foundation | Retained | Bounds, camera calculation, encounter state, exit, reset, and cleanup evidence remains valid |
| M3 playable result | Reopened | Runtime world is still 1280×720; no visible horizontal scroll or two sequential encounters |
| M5 contract foundation | Retained | Boss lifecycle, art, decision rhythm, hurt/phase/death, arena lock, cleanup, and completion ordering remain valid |
| M5 playable result | Reopened | Boss has no movement/Y alignment, player-damaging attack hitbox, or real stage-entry sequence |
| M6 status | Paused after 6.2 | Game-flow contract and Title/start remain accepted; HUD and later UI wait for M5R.8 |
| Recovery gate | Required | 5R.1–5R.8 must pass before the project again claims a complete playable Vertical Slice |
| Planning next task | Superseded | M5R / Task 5R.1 was selected here and is now completed below |

## M5R / Task 5R.1 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M5R / Task 5R.1 — Three-screen world and visible camera scrolling |
| Stage data | Pass | 3840×720 world; three contiguous 1280×720 sections; gap/coverage validation |
| Shared bounds | Pass | 3700px walk bounds used by Arcade Physics, actors, formation, and knockback |
| Desktop traversal | Pass | `scrollX 0 → 355 → 2560`; Player reached `x=3727`; one Canvas; zero browser errors |
| Landscape touch | Pass | 844×390 viewport; logical Canvas 1280×720; touch traversal reached `scrollX=758` |
| Portrait FIT | Pass | 390×844 viewport; 325×182.8125 fitted Canvas; touch traversal reached `scrollX=586` |
| Restart ownership | Pass | 10 Scene restarts; one Canvas; one Boss; Player `x=180`; scroll 0; completion count 0 |
| Boss regression | Pass | Boss cleanup released arena once, then published one stage-complete event; zero browser errors |
| Quality gates | Pass | `pnpm test` 56/56; build/typecheck; lint 0 errors with 4 existing warnings |
| Temporary content | Accepted | Existing forest art repeats for all three sections; encounter/Boss sequencing remains 5R.2/5R.3 |
| Next task | Selected | M5R / Task 5R.2 — Two encounter triggers and gates |

## M5R / Task 5R.2 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M5R / Task 5R.2 — Two encounter triggers and gates |
| Ordered Stage data | Pass | Exactly two trigger rectangles at X 900 and 2000 with group sizes 1 and 2; validation rejects unordered triggers |
| Initial ownership | Pass | Scene starts with zero ordinary enemies; no eager all-spawn path remains |
| Trigger safety | Pass | Pure tests cover forward-only entry, active-encounter blocking, duplicate crossing, ordered clear, completion, and reset |
| Camera gate | Pass | Encounter 1 locked at `scrollX=261`; encounter 2 at `scrollX=1361`; all-clear releases only `encounter` ownership |
| Browser sequence | Pass | Initial 0 enemies → `forest-entry` 1 → clear → `forest-ambush` 2 → clear → 0; one logical 1280×720 Canvas throughout |
| Existing combat | Pass | Existing soldier, mauler, duelist configs and EnemyManager combat/death/cleanup paths reused without rebalance |
| Restart contract | Pass | Scene create resets sequence, previous player position, gate scroll, locks, and manager ownership |
| Quality gates | Pass | `pnpm test` 60/60; app and GitHub Pages builds; typecheck; lint 0 errors with 8 existing warnings |
| Scope | Pass | No Boss entry/behavior, player move, art, UI, audio, or enemy rebalance added |
| Next task | Selected | M5R / Task 5R.3 — Boss arena entry sequencing |

## M5R / Task 5R.3 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M5R / Task 5R.3 — Boss arena entry sequencing |
| Stage entry data | Pass | Arena entry trigger is `{ x:2630, y:390, width:120, height:245 }` in `StageConfig` |
| Pure entry state | Pass | Tests cover locked, eligible, forward/Y-aligned activation, duplicate rejection, and reset |
| Initial ownership | Pass | Normal Title starts with Boss actor 0, Boss lock false, entry `locked` |
| Encounter boundary | Pass | Ordinary all-clear only marks entry eligible; it does not construct or activate Boss internals |
| Arena activation | Pass | Forward entry creates one Boss, locks at `scrollX=2560`, and constrains player to arena bounds |
| Desktop browser | Pass | Boss 0 during encounter 1; after both clears and entry: Boss 1, ordinary enemies 0, only `boss` lock, zero errors |
| Landscape mobile | Pass | 844×390; logical Canvas 1280×720; entry active with one Boss/Canvas |
| Portrait FIT | Pass | 390×844; fitted Canvas 325×182.8125; entry active with one Boss/Canvas |
| Boss regression | Pass | Defeat releases arena once and publishes one completion event after release; zero errors |
| Restart ownership | Pass | 10 restarts: one Canvas, Boss 0, entry locked, no camera lock or stale completion |
| Quality gates | Pass | `pnpm test` 62/62; app and GitHub Pages builds; typecheck; lint 0 errors with 8 existing warnings |
| Scope | Pass | No Boss locomotion/damage, player changes, art, HUD, audio, or balance changes |
| Next task | Selected | M5R / Task 5R.4 — Boss locomotion, facing, and Y alignment |

## M5R / Task 5R.4 Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID | Pass | M5R / Task 5R.4 — Boss locomotion, facing, and Y alignment |
| Walk art | Pass | Four distinct runtime frames, 8 FPS loop, common `(224, 420)` feet anchor, source-facing left |
| Arcade movement | Pass | Idle Boss aligns Y first, then approaches/separates with `86px/s` X and `68px/s` Y velocity |
| Facing | Pass | Desktop smoke checkpoints: left `-1`, right `+1`; no reverse-walk transform or sprite-only movement |
| Attack gate | Pass | Eligible only at X `112–170px` and Y tolerance `30px`; no hitbox/player damage added |
| Lifecycle stop | Pass | Attack, hurt, phase, dead, and cleaned policy decisions always return zero velocity |
| Bounds | Pass | Feet/body clamp to Stage-owned Boss arena; Arcade custom bounds prevent escape |
| Desktop browser | Pass | Y `560 → 478.4 → 591.7`; walk/idle state and nonzero/zero velocities observed; one Canvas, zero errors |
| Mobile landscape | Pass | 844×390 FIT completed the same movement smoke with correct facing and Y alignment |
| Boss defeat regression | Pass | One arena release followed by one stage completion; Boss actor cleaned |
| Restart regression | Pass | 10 resets: Boss 0, entry locked, no camera lock/stale completion, one Canvas, zero errors |
| Quality gates | Pass | `pnpm test` 64/64; typecheck; lint 0 errors with 8 existing warnings; both production builds |

## M5R / Task 5R.5 Acceptance — 2026-07-16

| Check | Result | Evidence |
|---|---|---|
| Task ID | Pass | M5R / Task 5R.5 — Boss attack hitbox and player damage |
| Frame timing | Pass | All three attacks use metadata startup/active/recovery; only active source frame enables the zone |
| Independent hitbox | Pass | One Boss-owned Arcade Zone, separate from the feet/body collider and mirrored by facing |
| Once per swing | Pass | Per-attack hit record resets at `beginAttack`; 10 starts/completes produced nine intentional hits and one Y-lane miss |
| Player damage reuse | Pass | Boss hit uses existing HP -1, flash, 4-frame hit stop, 26px horizontal knockback, and 300ms hurt path |
| Wrong-lane rejection | Pass | Feet-Y difference above 30px rejected the tenth active-frame overlap; Player remained HP 1 |
| Desktop browser | Pass | 10 starts, 10 completes, 9 hits, HP 1, hitbox disabled, Boss velocity 0, zero runtime errors |
| Landscape mobile | Pass | 844×390 viewport, fitted 693×390 Canvas, same 10/10/9/HP1 result |
| Boss defeat regression | Pass | Boss 0 after cleanup, arena release 1, stage completion 1 |
| Restart regression | Pass | 10 restarts: Boss 0, entry locked, camera locks empty, completion 0 |
| Automated checks | Pass | 66/66 tests, typecheck, lint 0 errors (8 existing warnings), both production builds |
| Scope | Pass | No failure screen, HUD, audio, new attack/art, Boss rebalance, or 5R.6 behavior added |
| Next task | Selected | M5R / Task 5R.6 — Player failure and deterministic restart |

## M5R / Task 5R.6 Acceptance — 2026-07-16

| Check | Result | Evidence |
|---|---|---|
| Task ID | Pass | M5R / Task 5R.6 — Player failure and deterministic restart |
| Exactly-once failure | Pass | HP 0 changes Player to dead and flow `playing → failed` once; duplicate damage/transition are rejected |
| Failed input gate | Pass | Scene update returns before input/gameplay; Player velocity and attack hitbox remain zero/disabled |
| Combat suspension | Pass | Enemy/Boss bodies stop, attack zones disable, animations pause, enemy timers pause, Attack Slot clears |
| Explicit restart | Pass | Keyboard and pointer/touch share one failed-only `restartAfterFailure()` and Phaser `scene.restart()` path |
| Automatic restart removal | Pass | Previous 900ms death restart timer/path removed; no `setTimeout`, page reload, DOM, or parallel reset path |
| Desktop browser | Pass | 10 real Boss-hit fail/restart cycles; all input blocked, all actors suspended, one Canvas, zero runtime errors |
| Landscape mobile | Pass | 844×390 viewport, fitted 693×390 Canvas, same ten-cycle result and zero runtime errors |
| Initial state restored | Pass | Title, HP 10, Player x=180, encounter index 0, Boss 0, entry locked, no camera locks, completion 0 |
| Combat regressions | Pass | Boss attack 10/10/9/HP1, Boss defeat release/completion 1/1, two encounters clear in order |
| Automated checks | Pass | 67/67 tests, typecheck, lint 0 errors (8 existing warnings), both production builds |
| Scope | Pass | No cleared flow, HUD, audio, combat balance, new content, or 5R.7 behavior added |
| Next task | Selected | M5R / Task 5R.7 — Boss defeat and cleared flow |

## M5R / Task 5R.7 Acceptance — 2026-07-16

| Check | Result | Evidence |
|---|---|---|
| Task ID | Pass | M5R / Task 5R.7 — Boss defeat and cleared flow |
| Terminal ordering | Pass | Boss cleanup → arena release 1 → completion publication 1 → `playing → cleared` entry 1 |
| Cleanup rejection | Pass | `destroyed`, duplicate gate, Title, and `failed` paths cannot publish or clear |
| Cleared suspension | Pass | Player velocity/input/hitbox stopped; EnemyManager suspended; update returns before gameplay progression |
| Terminal exclusivity | Pass | Pure contract rejects `cleared → failed` and `failed → cleared`; same-state requests are ignored |
| Desktop browser | Pass | Boss 0, release 1, completion 1, cleared 1, input/actors stopped, values stable after 1 second, one Canvas, zero errors |
| Landscape mobile | Pass | 844×390 viewport, fitted 693×390 Canvas, same cleared result and zero errors |
| Failure regression | Pass | 10 real Boss-hit failure/restart cycles; Title and HP 10 restored; one Canvas |
| Combat regressions | Pass | Boss attack 10 starts/10 completes/9 hits/HP1; two encounters clear in order and Boss entry becomes eligible |
| Automated checks | Pass | 69/69 tests, typecheck, lint 0 errors (8 existing warnings), both production builds |
| Scope | Pass | No Result UI, replay, HUD, audio, scoring, content, art, balance, or 5R.8 implementation added |
| Next task | Selected | M5R / Task 5R.8 — End-to-end Vertical Slice acceptance |

## M6 / Task 6.3 Acceptance — 2026-07-17

| Check | Result | Evidence |
|---|---|---|
| Task ID | Pass | M6 / Task 6.3 — Player/Boss HUD |
| Ownership | Pass | One Phaser `GameHud`; React/DOM/actors do not own HUD state |
| Snapshot boundary | Pass | Frozen primitive flow, Player max HP, nullable Boss HP; no actor references |
| Player lifecycle | Pass | playing 10, failed 0, cleared correct, 10 retries restore Title/10 |
| Boss lifecycle | Pass | active 8, damaged 7, cleanup hides bar, no stale reset state |
| Object stability | Pass | 13 HUD GameObjects remain constant through update and 10 Scene restarts |
| Desktop | Pass | Readable fixed HUD, debug below HUD, one Canvas, zero errors |
| Landscape touch | Pass | 844×390 / 693×390 Canvas; joystick and attack remain usable |
| Portrait touch | Pass | 390×844 / 325×183 Canvas; joystick and attack remain usable |
| Production | Pass | HUD remains; debug text/dataset absent; zero runtime errors |
| Automated checks | Pass | 70/70 tests, typecheck, lint 0 errors (8 existing warnings), both builds |
| Deferred defect | Open | Encounter-clear camera handoff snap promoted to M5R / Task 5R.9 |

## M5R / Task 5R.8 Acceptance — 2026-07-17

| Check | Result | Evidence |
|---|---|---|
| Task ID | Pass | M5R / Task 5R.8 — End-to-end Vertical Slice acceptance |
| Desktop full run | Pass | Real input from Title cleared `forest-entry`, then `forest-ambush`, then Boss HP 8→0; flow `cleared`, completion 1, cleared entry 1, one Canvas, zero errors |
| Landscape touch | Pass | 844×390 viewport used the visible 360° joystick and attack button for the same full run; fitted 693×390 Canvas, HP 2 at clear, zero errors |
| Portrait touch | Pass | 390×844 viewport used the visible joystick and attack button for the same full run; fitted 325×183 Canvas, HP 7 at clear, zero errors |
| Failure and retry | Pass | A real enemy defeat entered `failed`; Enter retry restored Title, HP 10, Player x=180, encounter index 0, Boss locked, zero actors/locks, and one Canvas |
| Encounter ordering | Pass | `forest-entry` cleared before `forest-ambush`; next index reached 2 and Boss entry changed `locked → eligible → active` without skip or duplicate |
| Movement and dodge | Pass | Horizontal traversal and vertical Y alignment remained usable in all three viewport runs |
| Combat blocker | Fixed | Player attack zone Y changed from above the feet body to feet-body overlap; aligned enemy HP now decreases without changing damage, animation, art, or body ownership |
| Boss terminal ordering | Pass | Boss actor 1→0, arena lock true→false, stage completion 1, cleared entry 1 |
| Runtime stability | Pass | One Canvas in every viewport and zero console errors during all full runs |
| Automated checks | Pass | 69/69 tests, typecheck, lint 0 errors (8 existing warnings), both production builds |
| Scope | Pass | No HUD, Pause, Result, replay, audio, scoring, new content, art, or balance pass added |
| Next task | Selected | M6 / Task 6.3 — Player/Boss HUD |

## M5R / Task 5R.9 Acceptance — 2026-07-17

| Check | Result | Evidence |
|---|---|---|
| Task ID | Pass | M5R / Task 5R.9 — Encounter-clear camera handoff stability |
| Reproduction | Pass | Development telemetry measured the original lock-release frame at `261 → 721`, a 460px jump |
| Pure policy | Pass | Handoff convergence and 32px/update stalled-frame cap covered by deterministic tests |
| Ownership order | Pass | Handoff begins at current scroll before `encounter` unlock; encounter/Boss authoritative locks cancel it explicitly |
| Two encounters | Pass | `forest-entry` and `forest-ambush` both cleared through runtime flow; each handoff converged to `scrollX=1821` without soft lock |
| Desktop | Pass | Maximum observed handoff frame delta 17px; one Canvas and zero console errors |
| Landscape touch | Pass | 844×390 / 693×390 Canvas; maximum delta 17px; joystick movement and attack worked after handoff |
| Portrait touch | Pass | 390×844 / 325×183 Canvas; maximum delta 16px; joystick movement and attack worked after handoff |
| Boss regressions | Pass | Boss entry retained arena lock at `scrollX=2560`; Boss clear released once and entered `cleared` once |
| Failure regression | Pass | 10 failure/restart cycles restored Title, HP 10, zero locks and camera scroll 0 |
| HUD regression | Pass | Player HUD remained visible; Boss HUD appeared only for active Boss and cleared without stale state |
| Production | Pass | One Canvas, development telemetry absent, zero runtime errors |
| Automated checks | Pass | 72/72 tests, typecheck, lint 0 errors (8 existing warnings), both production builds |
| Scope | Pass | No Pause, Result, Audio, gameplay, combat, content, art, or balance feature added |
| Next task | Selected | M6 / Task 6.4 — Pause/resume |

## M6 / Task 6.4 Acceptance — 2026-07-18

| Check | Result | Evidence |
|---|---|---|
| Task ID | Pass | M6 / Task 6.4 — Pause/resume |
| Flow ownership | Pass | One `GameFlowStateMachine` path performs repeatable `playing → paused → playing`; no React/DOM gameplay state or second Scene |
| Keyboard | Pass | One Phaser `keydown-P` listener; repeat ignored; repeated pause/resume succeeded; listener removed on shutdown |
| Touch | Pass | Fixed Phaser pause button and overlay resume share the same toggle request; no duplicate object or listener path |
| Freeze semantics | Pass | Manual pause freezes Scene TimerEvents, Arcade Physics, animations, tweens, AI, encounter progression, combat, and camera follow |
| Hit Stop isolation | Pass | `manual`, `hitStop`, and `visibility` are independent reasons; clearing manual cannot prematurely resume active Hit Stop |
| Attack boundary | Pass | Attack1 remained at the same state/frame/position/hitbox/camera during pause and completed normally after resume |
| Input recovery | Pass | Transient joystick/attack edges clear on transition; movement and attack both worked immediately after resume |
| Desktop | Pass | Keyboard and pointer/touch pause/resume; one Canvas; no runtime errors |
| Landscape touch | Pass | 844×390 viewport, fitted 693×390 Canvas; pause/resume then attack succeeded |
| Portrait touch | Pass | 390×844 viewport, fitted 325×183 Canvas; pause/resume then movement succeeded |
| Camera regression | Pass | Both encounters cleared; handoff maximum frame delta 18px; converged to `scrollX=1821` |
| Boss regression | Pass | Entry active/locked at `scrollX=2560`; clear produced Boss 0, release 1, completion 1, cleared 1 |
| Failure/restart regression | Pass | 10 failures and 10 Scene restarts restored Title/HP 10, one Canvas, zero errors |
| Production | Pass | Pause overlay visible; one Canvas; zero development datasets; zero runtime errors |
| Automated checks | Pass | 73/73 tests, typecheck, lint 0 errors (8 existing warnings), both production builds |
| Scope | Pass | No Result, replay, audio, combat, content, art, balance, or unrelated refactor added |
| Next task | Selected | M6 / Task 6.5 — Failure/continue/restart |

## M6 / Task 6.5 Acceptance — 2026-07-18

| Check | Result | Evidence |
|---|---|---|
| Task ID | Pass | M6 / Task 6.5 — Failure/continue/restart |
| Ownership | Pass | One persistent Phaser `FailureController`; React/DOM own no failure state or input |
| Exactly-once request | Pass | Pure gate rejects closed, duplicate, consumed, and cross-source requests until reopened |
| Keyboard retry | Pass | Real failed state accepted `keyboard`; one Scene restart and one Canvas |
| Touch retry | Pass | Landscape and portrait runs accepted `pointer`; Boss-arena hit area remained camera-aligned |
| Terminal suspension | Pass | HP 0 entered failed once; Player, Enemy, Boss, attacks, timers, encounter and camera progression stayed stopped |
| Deterministic reset | Pass | Title, HP 10, encounter 0, Boss 0/locked, no camera locks or stale completion/pause |
| Ten-cycle smoke | Pass | 10 entries, 10 restarts, one Canvas, three stable Failure objects, zero runtime errors |
| Cleanup | Pass | Shutdown removes keyboard/pointer handlers, overlay, smoke timer and owned references |
| Automated checks | Pass | 74/74 tests, typecheck, lint 0 errors (8 existing warnings), both production builds |
| Scope | Pass | No Result, replay, Audio, scoring, persistence, combat, content, art or balance changes |
| Next task | Selected | M6 / Task 6.6 — Result/replay |

## M6 / Task 6.6 Acceptance — 2026-07-18

| Check | Result | Evidence |
|---|---|---|
| Task ID | Pass | M6 / Task 6.6 — Result/replay |
| Ordering | Pass | Boss cleanup → arena release → one stage completion → one cleared entry → Result |
| Ownership | Pass | One persistent Phaser `ResultController`; React/DOM own no Result state or input |
| Exactly-once request | Pass | Pure gate rejects closed, duplicate, consumed, and cross-source replay requests until reopened |
| Desktop keyboard | Pass | Cleared overlay accepted Enter and returned to Title through one Scene restart |
| Landscape touch | Pass | 844×390 viewport, 693×390 Canvas, pointer replay returned to Title |
| Portrait touch | Pass | 390×844 viewport, 325×183 Canvas, pointer replay returned to Title |
| Terminal exclusivity | Pass | Failed cannot open Result; cleared cannot consume Failure retry |
| Deterministic new run | Pass | Title, HP 10, encounter 0, Boss locked/inactive, completion 0, Result hidden |
| Ten-cycle smoke | Pass | 10 entries, 10 replays, one Canvas, zero runtime errors |
| Cleanup | Pass | Shutdown removes keyboard/pointer handlers, overlay, smoke timer and owned references |
| Automated checks | Pass | 76/76 tests, typecheck, lint 0 errors (8 existing warnings), both production builds |
| Scope | Pass | No Audio, scoring, persistence, content, custom art, balance, M6A or M6.7 work added |
| Next task | Selected | M6 / Task 6.7 — UI/mobile acceptance |

## M6 / Task 6.7 Acceptance — 2026-07-18

| Check | Result | Evidence |
|---|---|---|
| Task ID | Pass | M6 / Task 6.7 — UI/mobile acceptance |
| Desktop keyboard | Pass | Enter start、movement/attack、P pause/resume、Result Enter replay；one Canvas |
| Landscape touch | Pass | 844×390 viewport、693×390 fitted Canvas、360° joystick、attack、touch Pause reachable |
| Portrait touch | Pass | 390×844 viewport、325×183 fitted Canvas、safe-area/FIT preserved、terminal controls reachable |
| Phaser ownership | Pass | Title、HUD、Pause、Failure、Result、touch controls remain Phaser-owned and camera-fixed |
| Terminal exclusivity | Pass | Pause、Failure、Result remain state-gated; failed and cleared requests cannot cross-consume |
| Encounter/Boss regression | Pass | Two ordered encounters, Boss clear ordering, arena release, completion and replay remained green |
| Lifecycle regression | Pass | 10 failure/restart and 10 clear/replay cycles retained one Canvas and deterministic new-run state |
| Production | Pass | One Canvas; no Physics debug, diagnostic text, development datasets, or browser errors |
| Automated checks | Pass | 77/77 tests, typecheck, lint 0 errors (8 existing warnings), both production builds |
| Scope | Pass | Only the production environment define blocker was fixed; no art, Audio, gameplay, balance, or M6A implementation |
| Next task | Selected | M6A / Task 6A.1 — Visual target, Art Bible, and before/after baseline |

## M6A / Task 6A.1 Acceptance — 2026-07-18

| Check | Result | Evidence |
|---|---|---|
| Task ID | Pass | M6A / Task 6A.1 — Visual target, Art Bible, and before/after baseline |
| Original visual target | Pass | Art Bible specifies non-derivative Three Kingdoms Japanese-realistic pixel-art direction |
| Objective actor scale | Pass | Logical idle-height targets and Guan Yu-relative ratios defined for Player, three enemies, and Boss |
| Palette/light/pixel density | Pass | Shared anchor palette, warm-left/cool-right lighting, value bands, cluster and zoom gates documented |
| Animation protection | Pass | One scale/actor, shared feet anchor, no transform fakes, preserved phase duration and hitbox windows |
| Stage/effects/UI | Pass | Three landmarks, effect occlusion limits, UI hierarchy and mobile touch-size gates documented |
| Baseline matrix | Pass | 15 PNG: desktop, 844×390, 390×844 × Title, combat, Boss, Failure, Result |
| Reproducibility | Pass | Revision `3183f1f`, URLs, actions, dataset conditions, Canvas sizes and filenames recorded |
| Asset governance | Pass | Provenance, shared-stem naming, metadata, debug sheet, reviewer and matching-after rules recorded |
| Gap order | Pass | 6A.2 Guan Yu → 6A.3 Enemy/Boss → 6A.4 Stage → 6A.5 Effects/UI → 6A.6 freeze |
| Browser capture | Pass | Three viewport matrix captured with one Canvas and zero browser errors |
| Scope | Pass | No runtime code, gameplay, balance, Audio, or production art changed |
| Next task | Selected | M6A / Task 6A.2 — Guan Yu animation quality upgrade |

## M6A / Task 6A.2 Acceptance — 2026-07-18

| Check | Result | Evidence |
|---|---|---|
| Task ID | Pass | M6A / Task 6A.2 — Guan Yu animation quality upgrade |
| Legacy audit | Pass | 17 legacy idle/walk/attack/air-hit records include source rect, alpha bounds, facing, feet status, and decision |
| Genuine frame counts | Pass | 43 unique poses: idle 6, walk 8, attack1 5, attack2 6, attack3 8, hurt 4, dead 6 |
| Unified runtime contract | Pass | One `guanyu-v2` atlas; 640×448 cells; feet `(320,420)`; origin `(0.5,0.9375)`; scale `0.64`; idle height `230.4px` |
| Crop/contamination | Pass | Component isolation, alpha-bound validation, red-box/feet-line sheet, onion sheet, and silhouette sheet show no overflow or duplicate hash |
| Attack timing | Pass | All attacks preserve startup/active/recovery at 125/125/125ms; existing Combo/hitbox/damage contracts unchanged |
| Preview | Pass | `?previewAttack=1` loaded all 19 attack frames with frame name, phase, cell, origin, feet, scale, 2–10 FPS, loop, and onion controls |
| Desktop | Pass | 1280×720 development gameplay and production title each rendered one Canvas with zero errors |
| Mobile landscape | Pass | 844×390 FIT retained one Canvas, readable Guan Yu, controls, and zero errors |
| Mobile portrait | Pass | 390×844 FIT retained one centered 16:9 Canvas and zero errors |
| Automated tests | Pass | `pnpm test` 78/78; metadata asserts image/atlas dimensions, counts, bounds, provenance, common feet/scale, and attack timing |
| Quality gates | Pass | typecheck; lint 0 errors/8 existing warnings; Vinext production build; GitHub Pages build |
| Scope | Pass | No Enemy, Boss, Stage, Effects, UI, Audio, content, balance, AI, camera, or combat-rule changes |
| Next task | Selected | M6A / Task 6A.3 — Enemy and Boss visual consistency |

## M6A / Task 6A.3 Acceptance — 2026-07-18

| Check | Result | Evidence |
|---|---|---|
| Task ID | Pass | M6A / Task 6A.3 — Enemy and Boss visual consistency |
| Frame audit | Pass | 45 enemy + 24 Boss frames record source rect, alpha bounds, facing, feet, acceptance, and provenance |
| Logical proportions | Pass | Soldier 213.06px, Duelist 212.44px, Mauler 239.8px, Boss 300.99px against Guan Yu 230.4px |
| Enemy alignment | Pass | All three enemy atlases use 384×384 cells, feet `(192,354)`, one display scale per actor, and alpha bottom 354 |
| Boss alignment | Pass | Attack/lifecycle frames share 448×448 cells, feet `(224,420)`, scale `1.27`, and source-facing left |
| Facing/readability | Pass | Soldier/Boss left source; Mauler/Duelist right source; walk and attack silhouettes remain direction-readable |
| Gameplay freeze | Pass | Active index, attack timing, body, hitbox, movement, AI, Attack Slot, encounters, Boss decisions, and camera unchanged |
| QA assets | Pass | Processed sources, metadata, red-box/feet-line, onion, 25% silhouette, and shared lineup generated reproducibly |
| Desktop matrix | Pass | All actors and idle/walk/attack/hurt/dead plus Boss phase; one 1280×720 Canvas; zero errors |
| Landscape matrix | Pass | 844×390 viewport, 693×390 Canvas; all 21 actor/state checkpoints; zero errors |
| Portrait matrix | Pass | 390×844 viewport, 325×182.8125 Canvas; all 21 actor/state checkpoints; zero errors |
| Automated checks | Pass | 79/79 tests, typecheck, lint 0 errors (8 existing warnings), both production builds |
| Scope | Pass | No Guan Yu, Stage, Effects, UI, Audio, content, balance, AI, or camera changes |
| Next task | Selected | M6A / Task 6A.4 — Three-screen bamboo stage upgrade |

## M6A / Task 6A.4 Acceptance — 2026-07-23

| Check | Result | Evidence |
|---|---|---|
| Task ID | Pass | M6A / Task 6A.4 — Three-screen bamboo stage upgrade |
| Section identity | Pass | Forest Entry, Forest Ambush, and Boss Arena have distinct landmarks and silhouettes |
| Runtime layers | Pass | Nine 1280×720 PNGs; each section declares background `-1000`, ground `-900`, foreground `640` |
| World freeze | Pass | 3840×720 world, walk bounds, spawn, encounter, camera-lock, Boss, physics, and combat coordinates unchanged |
| Seam/readability QA | Pass | 3840px overview, 25% overview, 64px seam debug, depth debug, shared 96-color palette, clear central feet plane |
| Provenance | Pass | Three preserved 1672×941 sources, source SHA-256, imagegen prompt IDs, prompt summary, processing tool, reviewer acceptance |
| Desktop runtime | Pass | Production 1280×720 presentation rendered the layered Forest Entry with one undistorted Canvas |
| Landscape runtime | Pass | 844×390 FIT retained readable ground, controls, frame, and one Canvas |
| Portrait runtime | Pass | 390×844 FIT retained centered 16:9 Canvas, readable ground, controls, and frame |
| Automated checks | Pass | 80/80 tests; metadata, dimensions, layer kinds/depths, manifest, geometry freeze, and tooling asserted |
| Quality gates | Pass | typecheck; lint 0 errors/8 existing warnings; production build; GitHub Pages build |
| Scope | Pass | No actor, animation, combat, AI, balance, Effects, UI, Audio, encounter, or camera behavior changed |
| Next task | Selected | M6A / Task 6A.5 — Combat effects and product UI art upgrade |

## M6A / Task 6A.5 Acceptance — 2026-07-23

| Check | Result | Evidence |
|---|---|---|
| Task ID | Pass | M6A / Task 6A.5 — Combat effects and product UI art upgrade |
| Effects | Pass | 5-frame Hit Spark, 4-frame impact dust, and actor shadow use an explicit atlas; no procedural Graphics texture generation remains |
| Product UI | Pass | Title, HUD, Pause, Failure, Result, buttons, joystick, knob, and attack control share one original visual language |
| Font | Pass | `dragon-pixel` bitmap font covers required uppercase, numeric, punctuation, and product-flow strings |
| Gameplay freeze | Pass | Damage, Combo, Hit Stop, flash, shake, knockback, active frames, body/hitbox, camera, world coordinates, and flow unchanged |
| Asset pipeline | Pass | Two preserved sources, SHA-256 provenance, extraction metadata, atlas/font metadata, debug previews, and reproducible tool |
| Desktop runtime | Pass | Production Title, gameplay, and Pause/resume rendered with one Canvas and zero browser errors |
| Landscape runtime | Pass | 844×390 FIT retained readable HUD, gameplay, joystick, attack, and Pause controls |
| Portrait runtime | Pass | 390×844 FIT retained centered 16:9 Canvas, safe controls, and no clipping |
| Flow contracts | Pass | Existing automated contracts cover Title/start, Failure/retry, Result/replay, hit-once behavior, and listener/object cleanup |
| Automated checks | Pass | 81/81 tests including manifest, atlas order, dimensions, font glyphs, shadows, and no procedural effect textures |
| Quality gates | Pass | typecheck; lint 0 errors/8 existing warnings; production build; GitHub Pages build |
| Scope | Pass | No actors, Stage, AI, balance, Audio, encounter, camera, damage, timing, or gameplay behavior changed |
| Next task | Selected | M6A / Task 6A.6 — Visual acceptance and asset freeze |

## M6A / Task 6A.6 Acceptance — 2026-07-23

| Check | Result | Evidence |
| --- | --- | --- |
| Task ID | Pass | M6A / Task 6A.6 — Visual acceptance and asset freeze |
| Capture matrix | Pass | 15 matching desktop / 844×390 / 390×844 Title, Combat, Boss, Failure, Result before/after pairs |
| Manual visual review | Pass | No clipping, frame contamination, feet-anchor drift, Stage seams, safe-area or touch-target defect |
| Flow controls | Pass | Failure/retry and Result/replay accepted by keyboard; deterministic Title/Combat/Boss/Failure/Result checkpoints passed |
| Asset audit | Pass | 23 manifest entries, 31 request files, 23 PNG requests, complete provenance and zero missing pipeline files |
| Runtime budget | Pass | 11,421,285 encoded bytes; estimated 136,629,760 decoded RGBA bytes; 24 runtime textures |
| Performance | Pass | 60 warm-up + 300 sampled frames; 60.00 FPS average; 59.92 FPS 1% low |
| Runtime isolation | Pass | One Canvas, zero runtime errors, no production visual-freeze dataset leakage |
| Scope | Pass | No art, animation timing, hitbox, balance, AI, Camera, Stage flow or Audio feature changed |
| Next task | Selected | M7 / Task 7.1 — Audio manager/mixer |

## M7 / Task 7.1 Acceptance — 2026-07-24

| Check | Result | Evidence |
| --- | --- | --- |
| Task ID | Pass | M7 / Task 7.1 — Audio manager/mixer |
| Ownership | Pass | One `MainScene`-owned manager; React, actors, combat and UI do not control sound |
| Channels | Pass | Independent clamped SFX/BGM volume and mute state |
| Observation | Pass | Exactly one readonly gameplay-event subscription |
| Lifecycle | Pass | Idempotent start/stop/reset/destroy; manual and visibility pause reasons do not resume early |
| Unlock | Pass | Real pointer Title start changed WebAudio locked → unlocked without pretending playback |
| Reset | Pass | Ten Scene resets retained one manager, one subscription, one Canvas and zero browser errors |
| Assets | Pass | No audio file or placeholder playback added; production requests no missing audio |
| Scope | Pass | No gameplay, timing, balance, art, UI, Camera or Stage behavior changed |
| Next task | Selected | M7 / Task 7.2 — Combat/UI SFX |

## M7 / Task 7.2 Acceptance — 2026-07-24

| Check | Result | Evidence |
| --- | --- | --- |
| Task ID | Pass | M7 / Task 7.2 — Combat/UI SFX |
| Original assets | Pass | Ten deterministic project-owned PCM WAV cues; no third-party sample |
| Provenance | Pass | Generator, duration, encoding, SHA-256, license and processing metadata committed |
| Ownership | Pass | Runtime manifest loads every cue; only `AudioManager` calls Phaser sound |
| Event coverage | Pass | Title, attack, hit, hurt, death, Pause/Resume, Failure, Result, retry and replay mapped |
| One-shot/coalescing | Pass | Same cue + same event timestamp plays once; multi-target impacts do not stack |
| Lock/channel/lifecycle | Pass | Locked queue, SFX volume/mute, pause/visibility and reset cleanup covered |
| Browser | Pass | Real flow cues, one Canvas/manager/subscription and zero runtime errors |
| Routes | Pass | Ten WAV files in both builds; production returns 200 and `audio/wav` |
| Automated gates | Pass | 92/92 tests, typecheck, lint 0 errors, both builds |
| Scope | Pass | No BGM, combat balance, animation, art, Camera or Stage timing change |
| Next task | Selected | M7 / Task 7.3 — Stage/Boss music |

## M7 / Task 7.3 Acceptance — 2026-07-24

| Check | Result | Evidence |
| --- | --- | --- |
| Task ID | Pass | M7 / Task 7.3 — Stage/Boss music |
| Original assets | Pass | Deterministic project-owned Stage 17.143s and Boss 13.333s PCM WAV loops; no third-party samples |
| Provenance | Pass | Generator, duration, loop points, tempo, bars, encoding, SHA-256, source, processing, author and license committed |
| Ownership | Pass | Manifest loads both tracks; one `AudioManager`-owned Phaser sound instance; no actor/UI/React playback |
| Stage start | Pass | Real Title pointer start unlocked WebAudio and started Stage BGM once |
| Boss transition | Pass | Stage→Boss runtime flow produced start 2, transition 1, stop 1 with no duplicate track |
| Pause/channel | Pass | Pause/Resume retained the same track and start count; live BGM volume/mute does not restart |
| Terminal flow | Pass | Failure and Result each stopped the owned track once; retry/replay rebuild through a new Scene owner |
| Locked/reset | Pass | Latest locked intent wins; ten Scene resets retained one manager, one subscription, one Canvas and no track |
| Routes | Pass | Both development/production routes return 200 `audio/wav`; both build outputs contain both WAV files |
| Browser | Pass | Fresh development and production flows had one Canvas and zero browser errors |
| Automated gates | Pass | 97/97 tests, typecheck, lint 0 errors (8 existing warnings), both builds |
| Scope | Pass | No gameplay, balance, art, Combat/UI SFX, Camera or Stage timing change |
| Next task | Selected | M7 / Task 7.4 — Mobile unlock/recovery |

## M7 / Task 7.4 Acceptance — 2026-07-24

| Check | Result | Evidence |
| --- | --- | --- |
| Task ID | Pass | M7 / Task 7.4 — Mobile unlock/recovery |
| First gesture | Pass | One Title gesture produced one Stage track and one Title cue after unlock/recovery coalescing |
| Context recovery | Pass | Suspended/interrupted context recovery preserved the latest Stage/Boss intent without layering |
| Stale SFX | Pass | Gameplay cues are suppressed while unavailable; backgrounding clears queued product cues |
| Pause ownership | Pass | Manual and visibility reasons remain independent; background return does not clear manual Pause |
| Lifecycle | Pass | Context, unlock, focus and gameplay listeners clean up through one Scene-owned manager |
| Reset | Pass | Ten Scene resets retained one Canvas, one manager and one subscription |
| Browser | Pass | First tap and Pause/background/resume smoke retained one BGM start and zero runtime errors |
| Physical mobile | Pass (user reported) | iOS Safari and Android Chrome accepted; device/OS/browser versions were not supplied |
| Automated gates | Pass | 101/101 tests, typecheck, lint 0 errors (8 existing warnings), both builds |
| Scope | Pass | No new audio content, settings UI, gameplay, balance, art, Camera or Stage timing |
| Next task | Selected | M7 / Task 7.5 — Audio acceptance |

## M7 / Task 7.5 Acceptance — 2026-07-24

| Check | Result | Evidence |
| --- | --- | --- |
| Task ID | Pass | M7 / Task 7.5 — Audio acceptance |
| Cue matrix | Pass | Success and Failure/retry flows cover Title, attack, hit, hurt, death, Pause/Resume, retry/replay, Stage/Boss BGM and terminal stop |
| Multi-target | Pass | Same-frame Enemy hits remain one audible impact while distinct attacks and deaths remain individually mapped |
| Peak headroom | Pass | Catalog-only tuning reduced conservative Stage/Boss final-hit sums to approximately `0.991` / `0.980` |
| Ownership | Pass | One Canvas, one Audio manager, one gameplay subscription and one owned BGM persist through lifecycle smoke |
| Reset | Pass | Ten failure/retry and ten Result/replay cycles completed without stale or layered ownership |
| Browser | Pass | Development Stage→Boss and terminal flow plus local production Title/start passed |
| Physical mobile | Pass (user reported) | Deployed revision `d7b477b` accepted on iOS Safari and Android Chrome; device/OS/browser versions were not supplied |
| Automated gates | Pass | 103/103 tests, typecheck, lint 0 errors (8 existing warnings), both builds |
| Scope | Pass | Only evidence-backed catalog gains, tests, and documentation changed; no gameplay, art, assets, settings, or architecture expansion |
| Next task | Selected | M8 / Task 8.1 — 設定並量測 performance budget |

## M8 / Task 8.1 Acceptance — 2026-07-24

| Check | Result | Evidence |
| --- | --- | --- |
| Task ID | Pass | M8 / Task 8.1 — Performance Budget and Baseline |
| Measurement matrix | Pass | Six checkpoints × three profiles × two runs; each used 60 warm-up and 300 sampled frames |
| Runtime performance | Pass | Average FPS, 1% low, worst frame, run variance, heap, texture, decoded-memory, and raw-JavaScript budgets passed |
| Ownership | Pass | Stable GameObject counts; one Canvas, Audio manager, and gameplay subscription |
| Reset | Pass | Ten reset, ten Failure/retry, and ten Result/replay cycles without growth or stale actors |
| Runtime delivery | Pass | 43 requested files; 12,891,503 encoded bytes; 136,629,760 estimated decoded RGBA bytes |
| Deployment artifact | Fail recorded | 125,451,173 bytes exceeds 30 MiB because non-runtime `public/` files are copied; assigned to Task 8.4 |
| Production isolation | Pass | One 1066.67×600 Canvas; performance query exposed no datasets or viewport override |
| Automated gates | Pass | 107/107 tests, typecheck, lint 0 errors (8 existing warnings), both builds |
| Scope | Pass | Measurement only; no optimization, gameplay, art, animation, Audio, Camera, or Stage behavior changed |
| Next task | Selected | M8 / Task 8.4 — Production asset packaging and memory optimization |

## M8 / Task 8.4 Acceptance — 2026-07-24

| Check | Result | Evidence |
| --- | --- | --- |
| Task ID | Pass | M8 / Task 8.4 — Production Asset Packaging and Memory Optimization |
| Inventory | Pass | 43 manifest requests + 3 unique shell images = 46 production public files |
| Source preservation | Pass | 99 source/debug/QA files remain in `public/` and are excluded only from both build outputs |
| Byte preservation | Pass | All 46 packaged files match source SHA-256 in `dist/client` and `dist-github` |
| Delivery budget | Pass | GitHub Pages artifact 18,172,139 bytes ≤ 30 MiB; runtime requests 12,891,503 bytes ≤ 15 MiB |
| Memory/art freeze | Pass | Decoded RGBA remains 136,629,760 bytes; no atlas, image, audio, metadata, animation, or gameplay change |
| Route coverage | Pass | Every required JSON/PNG/XML/WAV route returns 200 with correct content type; QA routes return 404 |
| Viewport matrix | Pass | Desktop, 844×390, 390×844 × Title/Combat/Handoff/Boss/Failure/Result; one Canvas, 24 textures, one manager/subscription |
| Reset ownership | Pass | Ten reset, ten Failure/retry, and ten Result/replay cycles retain one Canvas and no stale actors |
| Production browser | Pass | Vinext and GitHub Pages previews start successfully; all side-art instances load |
| Automated gates | Pass | 110/110 tests, typecheck, lint 0 errors (8 existing warnings), both builds |
| Scope | Pass | Packaging and route MIME only; no gameplay, art, Audio, animation, balance, Camera, or Stage change |
| Next task | Selected | M8 / Task 8.2 — Game-feel timing pass |

## ER.2 — Soldier Production-Art Pilot — 2026-07-26

| Check | Result | Evidence |
| --- | --- | --- |
| Frame contract | Pass | 15 distinct hashes: idle 2, walk 4, attack 3, hurt 2, dead 4 |
| Corrections | Pass | Eight reviewer-rejected frames replaced by eight independent source poses |
| Atlas | Pass | 5×3 288×288 cells, feet `(144,265)`, one `1.025` scale, 210.12px idle height |
| Attack | Pass | Existing keys and startup/active/recovery order retained; gameplay timing and hitbox unchanged |
| QA/provenance | Pass | Source, transparent derivatives, measured metadata, debug, onion, silhouette, and reviewer baseline present |
| Delivery | Pass | 12,880,839 requested bytes; 132,759,040 decoded RGBA; 18,516,446-byte GitHub Pages artifact |
| Automated gates | Pass with TD-M11 noted | 127/127 direct tests, typecheck, lint 0 errors/8 warnings, direct Vinext/Vite builds and packaging passed; pnpm wrapper stops before scripts |
| Browser | Pass | Final 1280×720, 844×390, and 390×844 production smoke: one Canvas, no overflow, zero errors |
| Scope | Pass | No other actor art, gameplay, Stage, Camera, UI, Audio, or combat behavior changed |
| Next task | Selected | ER.3 — Duelist Production-Art Replacement |

## ER.3 — Duelist Production-Art Replacement — 2026-07-26

| Check | Result | Evidence |
| --- | --- | --- |
| Frame contract | Pass | 15 distinct hashes: idle 2, walk 4, attack 3, hurt 2, dead 4 |
| Source rectangles | Pass | 15 measured, non-equal rectangles from the 1619×971 source |
| Atlas | Pass | 5×3 288×288 cells, feet `(144,265)`, one `1.025` scale, 205px idle height |
| Attack | Pass | Existing keys and startup/active/recovery order retained; timing and hitbox unchanged |
| Facing | Pass | Right-authored source and existing runtime flip contract preserved |
| QA/provenance | Pass | Source, alpha derivative, metadata, debug, onion, silhouette, lineup, and review baseline |
| Delivery | Pass | 12,771,452 requested bytes; 128,888,320 decoded RGBA; 18,063,334-byte GitHub Pages artifact |
| Automated gates | Pass with TD-M11 noted | 128/128 direct tests, typecheck, lint 0 errors/8 warnings, direct builds and packaging |
| Browser | Pass | Development Duelist attack/walk/dead preview plus production 1280×720, 844×390, 390×844: one Canvas, no overflow, zero errors |
| Scope | Pass | No gameplay, other actor, Stage, Camera, UI, Audio, or combat-rule change |
| Approved-prototype conformance | Revise | Current exposed-topknot masked ninja and short hook blades do not match the approved full hood/cowl and two long inward-curved hooks |
| Technical gates | Pass | Existing ER.3 atlas, animation, build, and viewport evidence remains valid; it does not override the visual decision |
| Next task | Selected | ER.3R — Duelist Approved-Prototype Correction |

## ER.3R — Duelist Approved-Prototype Correction — 2026-07-26

| Check | Result | Evidence |
| --- | --- | --- |
| Identity gate | Pass | Neutral idle matches both repository-approved references: full hood/cowl, shadowed face, low narrow stance, exactly two long inward-curved hooks |
| Frame contract | Pass | 15 distinct hashes: idle 2, walk 4, attack 3, hurt 2, dead 4 |
| Atlas/alignment | Pass | 5×3 288×288 cells, feet `(144,265)`, one `1.025` scale, 206.02px logical idle height; every runtime alpha bound ends at Y=265 |
| Attack/facing | Pass | Existing startup/active/recovery order, right-authored facing, runtime flip, timing, body, and hitbox remain unchanged |
| QA/provenance | Pass | Repository-owned idle gate, source/transparent derivatives, measured metadata, debug, onion, 25% silhouette, lineup, hashes, and correction report |
| Delivery | Pass | 43 requests; 12,788,345 encoded bytes; 128,888,320 decoded RGBA; 18,080,227-byte GitHub Pages artifact |
| Automated gates | Pass with TD-M11 noted | 129/129 direct tests, typecheck, lint 0 errors/8 existing warnings, direct Vinext/Vite builds and packaging |
| Browser | Pass | Desktop, 844×390, and 390×844 production smoke: one 1280×720 Canvas, no overflow, zero captured errors |
| Scope | Pass | Duelist presentation only; no gameplay, animation timing, other actor art, Stage, Camera, UI, or Audio change |
| Approved-prototype conformance | Go | Full-hooded long twin-hook identity accepted for runtime integration |
| Next task | Selected | ER.4 — Mauler Production-Art Replacement |

## ER.4 — Mauler Production-Art Replacement — 2026-07-26

| Check | Result | Evidence |
| --- | --- | --- |
| Identity gate | Pass | Broad red/brown bearded heavy fighter, square torso, wide stance, and exactly one long square-headed war hammer match both approved references |
| Frame contract | Pass | 17 distinct hashes: idle 2, walk 4, attack 5, hurt 2, dead 4 |
| Atlas/alignment | Pass | Measured 288×288 cells, feet `(144,265)`, one `1.05` scale, 240.45px logical idle height |
| Attack contract | Pass | Two startup, one active, two recovery frames; exact 600ms timing and existing body/hitbox/gameplay unchanged |
| QA/provenance | Pass | Repository-owned idle gate, source/transparent derivatives, measured metadata, debug, onion, 25% silhouette, lineup, hashes, and review report |
| Delivery | Pass | 43 requests; 12,621,623 encoded bytes; 126,676,480 decoded RGBA; 17,913,999-byte GitHub Pages artifact |
| Automated gates | Pass with TD-M11 noted | 129/129 direct tests, typecheck, lint 0 errors/8 existing warnings, direct Vinext/Vite builds and packaging |
| Browser | Pass | Desktop, 844×390, and 390×844: one logical 1280×720 Canvas, no overflow, zero captured errors |
| Scope | Pass | Mauler presentation and minimum per-frame metadata only; no balance, AI, Stage, Camera, UI, Audio, or unrelated gameplay change |
| Approved-prototype conformance | Go | Largest normal enemy, smaller than Boss; square-headed long hammer and broad heavy silhouette preserved |
| Post-review crop correction | Pass | `attack-0` source rect is `(232,350,252,280)`; complete connected hammer retains 9px source and 41px runtime right padding with no adjacent pose |
| Next task | Selected | GX.1 — Duelist Leap Mobility Prototype |

## GX.1 — Duelist Leap Mobility Prototype — 2026-07-26

| Check | Result | Evidence |
| --- | --- | --- |
| Identity | Pass | Approved full hood/cowl, shadowed face, low narrow silhouette, and exactly two long inward-curved hooks retained |
| Genuine poses | Pass | Four distinct pixel hashes: takeoff, airborne, descent, landing; no transform-faked frame |
| Atlas/alignment | Pass | 288×288 cells, shared feet `(144,265)`, one `1.025` display scale |
| Commitment | Pass | Destination captured once; policy samples only the frozen plan and never current Player position |
| 2.5D elevation | Pass | Ground/body X/Y owns depth while sprite Y subtracts independent visual elevation; locked landing shadow remains on ground |
| Attack Slot | Pass | One slot retained through leap and released on landing, Hurt, Dead, suspension cleanup, or reset |
| Scope | Pass | Duelist-only reposition; no leap damage, Player jump, generic aerial framework, Stage/Camera/UI/Audio change |
| Delivery | Pass | 45 requests; 12,836,324 encoded bytes; 128,003,584 decoded RGBA; 18,132,212-byte GitHub Pages artifact |
| Automated gates | Pass with TD-M11 noted | 131/131 direct tests, typecheck, lint 0 errors/8 existing warnings, both direct builds and packaging |
| Browser | Pass | Desktop, 844×390, 390×844: readable airborne pose, one Canvas, no overflow, zero captured errors |
| Next task | Selected | ER.5 — Shield Guard Production-Art Replacement |

## ER.5 — Shield Guard Production-Art Replacement — 2026-07-29

| Check | Result | Evidence |
| --- | --- | --- |
| Identity gate | Pass | Olive/brown standard build, left-authored facing, dominant round woven rattan shield, readable rim/weave/boss, small secondary weapon |
| Frame contract | Pass | 21 distinct hashes: idle 2, walk 4, attack 3, hurt 2, dead 4, guard 2, block 2, recovery 2 |
| Atlas/alignment | Pass | 288×288 cells, feet `(144,265)` in every frame, one `1.025` scale, 215.25px logical idle height |
| Gameplay freeze | Pass | HP, speed, damage, ranges, guard cone/lock, recovery, body, hitbox, Attack Slot, and Stage isolation unchanged |
| QA/provenance | Pass | Source/transparent derivatives, measured metadata, debug, onion, 25% silhouette, idle gate, review sheet, hashes, reproducible tool |
| Delivery | Pass | 47 requests; 13,881,969 encoded bytes; 136,297,984 decoded RGBA; 50 production files; 19,178,685-byte GitHub Pages artifact |
| Automated gates | Pass with TD-M11 noted | 132/132 direct tests, typecheck, lint 0 errors/4 existing warnings, direct Vinext/Vite builds and packaging |
| Browser | Pass | Desktop, 844×390, 390×844: readable runtime guard pose, one logical Canvas, zero captured errors |
| Scope | Pass | Shield Guard presentation only; no TP-1 retuning, Player, Stage, Camera, UI, Audio, or other enemy art change |
| Next task | Selected | ER.6 — Crossbow Production-Art Replacement |

## ER.6 — Crossbow Production-Art Replacement — 2026-07-29

| Check | Result | Evidence |
| --- | --- | --- |
| Identity gate | Pass | Light blue-grey armor, tied cloth headwear, large horizontal repeating crossbow, and rear bolt pack |
| Frame contract | Pass | 20 distinct hashes: idle 2, walk 4, fire 3, hurt 2, dead 4, aim 2, locked 1, reload 2 |
| Atlas/alignment | Pass | 288×288 cells, feet `(144,265)` in every frame, one `1.025` scale, 210.12px logical idle height |
| Gameplay freeze | Pass | 550ms tracking, 350ms lock, 900ms aim, 3000ms reload, projectile, Player-only target, slot, HP, speed, body, and Stage isolation unchanged |
| QA/provenance | Pass | Built-in image generation source, transparent derivatives, measured metadata, debug, onion, 25% silhouette, idle gate, review sheet, hashes, reproducible tool |
| Delivery | Pass | 49 requests; 14,810,812 encoded bytes; 142,933,504 decoded RGBA; 52 production files; 20,108,383-byte GitHub Pages artifact |
| Automated gates | Pass with TD-M11 noted | 133/133 direct tests, typecheck, lint 0 errors/8 existing warnings, direct Vinext/Vite builds and packaging |
| Browser | Pass | Desktop, 844×390, 390×844: readable runtime aim/locked/reload states, one logical Canvas, zero captured errors |
| Scope | Pass | Crossbow presentation only; no TP-2/TP-3 retuning, friendly fire, Player, Stage, Camera, UI, Audio, or other enemy art change |
| Next task | Selected | M8 / Task 8.3 — Release Visual Defect Pass |

## M8 / Task 8.3 — Release Visual Defect Pass — 2026-07-29

| Check | Result | Evidence |
| --- | --- | --- |
| Player and five enemies | Pass | Runtime bounds remain inside cells; all frames retain one feet anchor and display scale |
| Boss | Pass | Lifecycle and weapon poses remain inside 448px cells and end at feet Y 420 |
| Stage and Camera | Pass | Three contiguous 1280px sections; handoff smoke crossed entry/ambush without visible seam or snap |
| HUD and overlays | Pass | Player/Boss HUD, Failure, Victory, touch controls, and hit feedback remain readable |
| Responsive layout | Pass locally | Desktop, 844×390, and 390×844: one Canvas, no document overflow |
| Production debug | Pass | Empty production Canvas dataset; no physics lines, debug text, duplicate Canvas, or browser error |
| Automated gates | Pass | `pnpm test` 138/138, typecheck, lint 0 errors/8 existing warnings, both pnpm builds and 52-file packaging passes |
| Physical mobile | Deferred — Low | No new device/OS/browser evidence in this cycle; recheck in M8.7 |
| Scope | Pass | No art, gameplay, animation timing, Camera, Stage, control, or CSS change |
| Next task | Selected | M8 / Task 8.6 — Flash/Shake Accessibility Settings |

## M8 / Task 8.6 — Flash/Shake Accessibility Settings — 2026-07-30

| Check | Result | Evidence |
| --- | --- | --- |
| Default parity | Pass | Flash `0xffffff` / 90ms; shake 50ms / `0.003`; existing combat parameters unchanged |
| Reduced flash | Pass | Independent setting changes tint to `0x9fb3a0` without changing flash duration or hit timing |
| Reduced shake | Pass | Independent setting changes intensity to `0.0008` without changing Camera duration or ownership |
| Input | Pass | Pause overlay supports keyboard `F` / `K` and separate touch targets |
| Pause/resume | Pass | Both setting values remain selected after resume and re-pause |
| Scene reset | Pass | One Scene-owned settings instance is not reset by create/retry/replay |
| Automated gates | Pass | 143/143 tests, typecheck, lint 0 errors/8 existing warnings, both builds, 52-file packaging |
| Viewports | Pass | Desktop, 844×390, 390×844 UI and touch/keyboard interaction smoke |
| Production | Pass | One Canvas, empty development dataset, no overflow, zero captured browser errors |
| Scope | Pass | No art, damage, Hit Stop, animation, AI, Stage, Camera flow, Audio, or React-state change |
| Next task | Selected | M8 / Task 8.2C — Five-Enemy Stage Encounter Integration |

## M8 / Task 8.2C — Five-Enemy Stage Encounter Integration — 2026-07-30

| Check | Result | Evidence |
| --- | --- | --- |
| Five-role coverage | Pass | Soldier, Shield Guard, Mauler, Duelist, and Crossbow each appear exactly once |
| Encounter cadence | Pass | `forest-entry` has 2 roles; `forest-ambush` has 3 roles; both clear in order |
| Spawn safety | Pass | Every spawn is in walk bounds and starts at least 72px from encounter peers |
| Attack Slot | Pass | One `EnemyManager` and one `currentAttacker` owner remain |
| Cleanup/reset | Pass | Each removal releases ownership; a fresh sequence has no retained encounter state |
| Boss/terminal flow | Pass | Both encounters clear, Boss becomes available, Result enters exactly once |
| Automated gates | Pass | 147/147 tests before closeout, typecheck, lint, and both builds |
| Desktop | Pass | One Canvas, full Stage completion, no overflow, zero captured errors |
| 844×390 | Pass | Intrinsic 1280×720 Canvas, full Stage completion, no overflow, zero captured errors |
| 390×844 | Pass | Intrinsic 1280×720 Canvas, full Stage completion, no overflow, zero captured errors |
| Scope | Pass | No enemy tuning, Player, Boss, Camera, Audio, art, animation, or new director |
| Next task | Selected | M8 / Task 8.7 — Full QA Matrix |

## M8 / Task 8.7 — Full QA Matrix — 2026-07-30

| Check | Result | Evidence |
| --- | --- | --- |
| Previous task | Pass | Task 8.2C focused revalidation passed 102/102 |
| Full automated suite | Pass | 147/147 |
| Type/lint/build | Pass | Typecheck; lint 0 errors/8 existing warnings; both builds; 52 packaged files |
| Formal Stage | Pass | Five roles across two ordered encounters; Boss clear reaches Result once |
| Desktop | Pass | 1067×600 fitted Canvas, no overflow, zero captured errors |
| Landscape | Pass | 693×390 fitted Canvas, touch move/attack, full clear, zero captured errors |
| Portrait | Pass | 325×183 fitted Canvas, diagonal touch move/attack, full clear, zero captured errors |
| Failure/Retry | Pass | 10 entries/restarts; blocked/suspended terminal state; deterministic Title reset |
| Result/Replay | Pass | 10 entries/replays; deterministic Title reset and completion re-arm |
| Pause | Pass | Velocity 0, hitbox off, actor state retained, resume exactly once |
| Accessibility | Pass | Reduced flash and reduced shake independently toggle and survive resume |
| Audio | Pass | One manager and one gameplay subscription through full success path |
| Production isolation | Pass | Three viewports; one Canvas; zero dataset keys; no overflow/error |
| GitHub Pages | Pass with Low finding | Base-prefixed runtime assets load; optional root favicon is 404 |
| Defect severity | Pass | Critical 0, High 0, Medium 0, Low 1 |
| Physical device metadata | Deferred — Low evidence gap | Prior iOS/Android user acceptance exists; versions unavailable |
| Scope | Pass | QA/tests/docs only; no gameplay, art, balance, Stage, Camera, Audio, or UI change |
| Next task | Selected | M9 / Task 9.1 — Production route/hosting verification |

## M9 / Task 9.1 — Production Route and Hosting Verification — 2026-07-30

| Check | Result | Evidence |
| --- | --- | --- |
| Previous task | Pass | M8.7 baseline revalidated: 147/147, typecheck, lint, both builds |
| Vinext routes | Pass | Generated routes and 52/52 runtime/shell files return 200 with accepted MIME |
| Pages preview routes | Pass | `/three-kingdom/`, 2 generated routes, and 52/52 public files pass |
| Public routes | Pass | 54/54 deployed non-document routes return 200 with accepted MIME |
| Automated gates | Pass | 148/148, typecheck, lint 0 errors/8 existing warnings, both builds |
| Deployment identity | Pass | Workflow `30481481187`; commit `b07bd03ae9a4061f6bd1124bee0d5aad3a161c15` |
| Direct navigation/reload | Pass | Public base path recreates one Canvas with zero errors |
| Desktop | Pass | All three hosts: 1067×600 fitted Canvas, no overflow, no debug dataset, 0 errors |
| 844×390 | Pass | All three hosts: 693×390 fitted Canvas, no overflow, no debug dataset, 0 errors |
| 390×844 | Pass | All three hosts: 325×183 fitted Canvas, no overflow, no debug dataset, 0 errors |
| Favicon | Waived — Low | Optional user-site root is outside repository base and required inventory |
| Scope | Pass | Tests/tooling/docs only; no runtime asset or gameplay change |
| Next task | Selected | M9 / Task 9.2 — Release Candidate and Versioning |

## M9 / Task 9.2 — Release Candidate and Versioning — 2026-07-30

| Check | Result | Evidence |
| --- | --- | --- |
| Previous task | Pass | M9.1 focused route tests 2/2; public routes 54/54 |
| Immutable identity | Pass | `0.1.0-rc.1`, `v0.1.0-rc.1`, source `b16c7398f37f78d1493cebbb1fbaf38a4e43a805` |
| Runtime inventory | Pass | Both outputs preserve the same 52 required files |
| Rebuild | Pass | Two consecutive builds match reproducible hashes |
| Vinext generated entropy | Declared | Raw artifact retained; only UUIDs and prerender secret normalized for comparison |
| GitHub Pages reproducibility | Pass | Raw and reproducible hash `6d2f37d2cffd7bc1f4e2373190a1cde278392090714a330ed2b66589a2a4096a` |
| Automated gates | Pass | 149/149, typecheck, lint 0 errors/8 existing warnings, both builds |
| Production smoke | Pass | One 1280×720 Canvas, no overflow/debug dataset/runtime error |
| Known issue | Waived — Low | Optional root `/favicon.ico`; required routes pass |
| Scope | Pass | Release tooling/tests/docs only; production inputs unchanged |
| Next task | Selected | M9 / Task 9.3 — Platform Acceptance |

### M9.2 RC2 correction — 2026-07-30

| Check | Result | Evidence |
| --- | --- | --- |
| RC1 cross-platform raw identity | Fail, superseded | 46/57 raw matches; 11 JSON/XML CRLF/LF-only mismatches |
| Canonical text packaging | Pass | Runtime JSON/XML output is LF on Windows and CI |
| Focused regression | Pass | Packaging/routes 5/5 |
| Public byte comparison | Pass | Corrected GitHub Pages output matches 57/57 deployed files |
| RC2 identity | Pass | `v0.1.0-rc.2` at `72bb680932f8ce95057e06f8e207f4ad4665e7bb` |
| Scope | Pass | No gameplay, tuning, art content, Audio, Camera, Stage, input, or UI change |
| Next task | Selected | M9 / Task 9.3 — Platform Acceptance against RC2 |

## M9 / Task 9.3 — Platform Acceptance — 2026-07-30

| Check | Result | Evidence |
| --- | --- | --- |
| Candidate identity | Pass | `v0.1.0-rc.2` at `72bb680932f8ce95057e06f8e207f4ad4665e7bb` |
| Owner acceptance | Pass | Project owner reported acceptance completed successfully |
| Critical/High defects | Pass | 0 Critical; 0 High reported |
| Automated support | Pass | 149/149, typecheck, lint, both builds, route checks, public-byte comparison, production smoke |
| Three-viewport support | Pass | M8.7 completed the formal Stage/Boss flow at desktop, 844×390, and 390×844 |
| Device metadata | Owner waiver | Exact model/OS/browser versions and individual nine-run records were not supplied and were not inferred |
| Scope | Pass | Documentation only; no production or gameplay change |
| Next task | Selected | M9 / Task 9.4 — Rollback Drill |

## M9 / Task 9.4 — Rollback Drill — 2026-07-30

| Check | Result | Evidence |
| --- | --- | --- |
| Previous version | Pass | RC1 source `b16c7398f37f78d1493cebbb1fbaf38a4e43a805` |
| Tag dispatch safety | Pass with finding | Build passed; Pages environment safely rejected non-main deploy |
| Actual rollback | Pass | Lease-checked main rollback; workflow `30512239021` |
| Rollback public routes | Pass | Document 200; 2 generated + 52 public routes |
| Rollback budget | Pass | Effective 1m50s; 3m12s including tag-policy discovery; budget 15m |
| Restore | Pass | Workflow `30512329569`; remote main restored to `db0d77b` |
| Restored public routes | Pass | Document 200; 2 generated + 52 public routes |
| Scope | Pass | Operations/docs only; no production source or asset change |
| Next task | Selected | M9 / Task 9.5 — Release and Defect Triage |

## M9 / Task 9.5 — Release and Defect Triage — 2026-07-30

| Check | Result | Evidence |
| --- | --- | --- |
| Dependencies | Pass | M9.3 accepted; M9.4 rollback/restore passed |
| Final identity | Pass | `0.1.0`, `v0.1.0`, runtime source `72bb680932f8ce95057e06f8e207f4ad4665e7bb` |
| Automated suite | Pass | 149/149 |
| Type/lint/build | Pass | Typecheck; lint 0 errors/8 existing warnings; both builds |
| Manifest | Pass | 52 runtime files; Pages hash `a8a1c63666bd7fd16c77d8ef6f50948d0d8ba705e1e8112091524d8be45ded75` |
| Public routes | Pass | Document plus 2 generated + 52 public routes |
| Production smoke | Pass | One intrinsic 1280×720 Canvas; no debug dataset, overflow, or captured error |
| Defects | Pass | Critical 0; High 0; Low findings documented |
| Release | Pass | GitHub Release and final Pages deployment published |
| Scope | Pass | Release/tests/docs only; production behavior unchanged |
| Next task | Selected | M10 / Task 10.1 — Second Vertical Slice Scope Lock |

## M10 / Task 10.1 — Second Vertical Slice Scope Lock — 2026-07-30

| Check | Result | Evidence |
| --- | --- | --- |
| Previous release | Pass | 149/149, typecheck, lint 0 errors/8 warnings, both builds, manifest, 54 routes |
| Production smoke | Pass | One 1280×720 Canvas, no debug dataset, overflow, or captured error |
| Single goal | Pass | Zhang Fei becomes the second playable general in the existing Stage |
| Visible difference | Pass | Heavy serpent-spear identity and distinct commitment/reward are mandatory |
| Strict exclusions | Pass | No Zhao Yun, Stage, enemy, Boss, skill/input, progression, Audio, backend, or multiplayer expansion |
| Dependency order | Pass | Player seam → gameplay/identity contract → art preview → prototype → integration → QA |
| Guan Yu freeze | Pass | Existing runtime is the regression oracle; 10.2 may not change accepted behavior |
| Architecture | Pass | Phaser owns selection/gameplay; React remains lifecycle-only |
| Acceptance matrix | Pass | Desktop/mobile/reset/performance/packaging/production gates defined |
| Runtime scope | Pass | Planning docs and contract test only; no production behavior or asset change |
| Next task | Selected | M10 / Task 10.2 — Player Definition Boundary and Guan Yu Freeze |

## M10 / Task 10.2 — Player Definition Boundary and Guan Yu Freeze — 2026-07-30

| Check | Result | Evidence |
| --- | --- | --- |
| Previous task | Pass | M10.1 revalidated: 149/149, typecheck, lint, both builds |
| Definition seam | Pass | Typed `PlayerDefinition`; one immutable Guan Yu definition |
| Actor composition | Pass | Actor body/sprite/shadow/animation consume the definition |
| Attack composition | Pass | Controller and Scene consume definition-owned timing, phases, impact, and hitbox |
| Guan Yu presentation | Pass | Texture, 43 frames, feet `(320,420)`, origin, `0.64` scale unchanged |
| Guan Yu gameplay | Pass | Speed 235, HP 10, hurt 300ms, attack durations 375/375/650ms unchanged |
| Combat | Pass | Damage 1/1/2, knockback 26/26/60px, Hit Stop 4/4/6 frames unchanged |
| Runtime scope | Pass | Guan Yu only; no Zhang Fei asset, animation, selection, tuning, or branch |
| Automated gates | Pass | 152/152, typecheck, lint 0 errors/8 existing warnings, both builds |
| Packaging | Pass | Both outputs preserve the existing 52-file runtime inventory |
| Desktop | Pass | One 1280×720 Canvas; movement, attack, Pause; no overflow/error |
| 844×390 | Pass | One intrinsic 1280×720 Canvas, fitted 693×390; no overflow/error |
| 390×844 | Pass | One intrinsic 1280×720 Canvas, fitted 325×183; no overflow/error |
| Production isolation | Pass | Empty Canvas dataset and zero captured browser errors |
| Release record | Pass | Published `0.1.0` manifest remains immutable after development resumes |
| Next task | Selected | M10 / Task 10.3 — Zhang Fei Gameplay and Production Contract |

## M10 / Task 10.3 — Zhang Fei Gameplay and Production Contract — 2026-07-30

| Check | Result | Evidence |
| --- | --- | --- |
| Previous task | Pass | 152/152, typecheck, lint, both builds, Desktop/844×390/390×844 one-Canvas smoke |
| Legacy audit | Pass | Six files recorded by size, format, content, and SHA-256; none promoted to runtime |
| Identity | Pass | Heavy planted warrior, thick dark beard, oxblood/charcoal/bronze, serpent spear |
| Drift rejection | Pass | No Guan Yu recolor, bare-hand brawler, Mauler/Boss, Q-version, copied established design, or fake transform |
| Tactical hypothesis | Pass | 200 px/s, 96×58 body, longer spear reach, explicit phase/impact values, HP held at 10 |
| Combat contracts | Pass | One-button hit-confirm, one stage per input, hit-once, independent hitbox, hurt/dead/Pause/Hit Stop/reset preserved |
| Frame budget | Pass | 47 genuine poses: 6/8/6/7/10/4/6 with all attack phases classified |
| Atlas | Pass | 672×448, 6×8, feet `(336,420)`, origin `(0.5,0.9375)`, scale `0.64` |
| QA plan | Pass | Alpha bounds, provenance, red-box, feet-line, onion, silhouette, palette, preview, three viewports |
| Comparison | Pass | Guan Yu control; five paired runs across both encounters and Boss; raw and median metrics |
| Decision gate | Pass | Accept/adjust/reject rules explicitly reject dominance, waiting, unreadable recovery, identity drift, and scope expansion |
| Automated gates | Pass | 155/155 tests, typecheck, lint 0 errors/8 existing warnings |
| Runtime scope | Pass | Documentation/tests only; no generated/edited art, runtime asset, animation, selection, or gameplay change |
| Next task | Selected | M10 / Task 10.4 — Zhang Fei Atlas and Animation Preview |

## M10 / Task 10.4 — Zhang Fei Atlas and Animation Preview — 2026-07-30

| Check | Result | Evidence |
| --- | --- | --- |
| Frame budget | Pass | 47 unique frames: 6/8/6/7/10/4/6 |
| Weapon | Pass | Zhangba serpent spear (丈八蛇矛), complete long shaft and sinuous spearhead |
| Geometry | Pass | 672×448, feet `(336,420)`, origin `(0.5,0.9375)`, display scale `0.64` |
| Metadata | Pass | Source rectangles, alpha bounds, offsets, phases, facing, hashes, provenance |
| QA | Pass | Red-box/feet-line, onion, lineup, silhouette, palette, identity outputs |
| Preview | Pass | Dev-only state/frame/FPS/loop/onion controls and metadata readout |
| Production isolation | Pass | No v2 manifest, formal selection, Stage actor, or packaged runtime asset |
| Automated gates | Pass | 159/159, typecheck, lint 0 errors/8 existing warnings, both builds |
| Packaging | Pass | Existing 52-file runtime inventory; Zhang Fei v2 source/QA excluded |
| Browser | Pass | Desktop one Canvas/no overflow/no error; mobile FIT contract unchanged |
| Next task | Selected | M10 / Task 10.5 — Zhang Fei Combat Prototype |

## M10 / Task 10.5 — Zhang Fei Combat Prototype — 2026-08-01 final

| Check | Result | Evidence |
| --- | --- | --- |
| Weapon identity | Pass | All runtime frames retain the Zhangba serpent spear (丈八蛇矛) |
| Definition | Adjusted | 200 speed, 10 HP, 96×58 body, 176×88 hitbox; Attack 3 damage 2 and recovery 600ms |
| Animation | Pass | 47 genuine frames; unique keys; no transform, duplication, per-state scale, or feet correction |
| Guan Yu freeze | Pass | 235 speed, 86×54 body, 142×86 hitbox, 375/375/650ms and 1/1/2 damage unchanged |
| Development entrance | Pass | `playerPrototype` + `prototypeScenario=entry/ambush/boss`; formal Title unchanged |
| Desktop smoke | Pass | One 1280×720 Canvas, fixed scenarios, real movement/attack, no overflow |
| Production isolation | Pass | No manifest registration or formal selection; v2 assets remain excluded |
| Paired trials | Pass | 30/30 final runs completed with raw attacks, damage, duration, stops, displacement, and commitment data |
| Mobile interaction | Pass | 844×390 fitted 693×390 and 390×844 fitted 325×182.81; joystick and touch Attack 1 succeeded |
| Non-dominance | Pass | Entry: Zhang Fei faster but more damage; Ambush: slower and more damage; Boss: slower with equal damage |
| Intentional stop | Pass | Both generals stopped after Attack 2 twice in Entry and twice in Ambush |
| Recovery punishment | Fail | Zhang Fei exceeded Guan Yu only in Ambush (5 vs 0); Entry/Boss both 0 vs 0 |
| Automated gates | Pass | 164/164 tests, typecheck, lint 0 errors/8 existing warnings, both builds, 52-file packaging |
| Production runtime | Pass | Prototype query ignored; one 1280×720 Canvas, empty dataset, no overflow or captured error |
| Decision | Reject | Task 10.6 remains blocked; next is planning-only Task 10.5R |

## M10 / Task 10.5R — Zhang Fei Tactical Hypothesis Revision — 2026-08-01

| Check | Result | Evidence |
| --- | --- | --- |
| Previous task | Pass | Revalidated 164/164, typecheck, lint 0 errors/8 existing warnings, and both builds |
| Diagnosis | Pass | Entry/Boss produced 0 recovery hits for both actors; Ambush separation evidence was retained |
| Revised role | Pass | Formation breaker: grouped Attack 2 separates, then reposition or isolated Attack 3 |
| Identity | Pass | Approved 47 frames and Zhangba serpent spear (丈八蛇矛) remain authoritative |
| Allowed values | Pass | Starting hypothesis changes Attack 2 knockback and restores pre-rescue Attack 3 recovery only |
| Direct metrics | Pass | Grouped confirms, repositioning, isolated/unsafe Attack 3, multi-hit and displacement defined |
| Comparison | Pass | Five paired runs per player in unchanged Entry/Ambush/Boss contexts |
| Decision gate | Pass | Numeric thresholds, non-dominance, anti-waiting, one-adjustment maximum, explicit Reject |
| Runtime scope | Pass | Planning/tests only; no gameplay, metadata, art, manifest, selection, or production change |
| Formal integration | Blocked | Only an accepted Task 10.5P may unblock Task 10.6 |
| Next task | Selected | M10 / Task 10.5P — Zhang Fei Formation Breaker Combat Prototype |

## M10 / Task 10.5P — Zhang Fei Formation Breaker Combat Prototype — 2026-08-01

| Check | Result | Evidence |
| --- | --- | --- |
| Parameters | Pass | Attack 2 56px; Attack 3 225/150/425ms and damage 2; other values frozen |
| Boundaries | Pass | 230px threat radius, 1000ms window, 64px real-input reposition fixed before trials |
| Paired trials | Pass | 30/30 Entry/Ambush/Boss runs completed and recorded |
| Reposition | Pass | Zhang Fei aware Ambush 5/5 grouped confirms repositioned in each run |
| Attack 3 choice | Pass | Two isolated starts per aware Ambush run; zero unsafe starts |
| Multi-target ratio | Fail | Zhang Fei 22 / Guan Yu 20 = 1.10×; required 1.5× |
| Displacement advantage | Fail | Approx. +0.06 median advantage; required +0.20 |
| Anti-waiting | Pass | Zhang Fei Ambush +0.8%, Boss +5.3%; both below 20% budget |
| Boss conversion | Pass | Both generals converted two Attack 3 hits in every Boss run |
| Adjustment | Not used | Permitted numeric changes did not directly address failed target-count distinction |
| Viewports | Pass | Desktop plus real joystick/attack at 844×390 and 390×844; no overflow |
| Automated gates | Pass | 166/166, typecheck, lint 0 errors/8 existing warnings, both builds |
| Production isolation | Pass | One 1280×720 Canvas, empty dataset, no overflow/error, 52 packaged files |
| Decision | Reject | Thresholds unchanged; production integration remains blocked |
| Next task | Selected | M10 / Task 10.5D — Zhang Fei Second-Player Direction Decision |

## M10 / Task 10.5D — Zhang Fei Second-Player Direction Decision — 2026-08-01

| Check | Result | Evidence |
| --- | --- | --- |
| Previous task | Pass | 166/166, typecheck, lint, both production builds |
| Evidence integrity | Pass | Task 10.5 and 10.5P thresholds/results remain unchanged |
| Direction | Selected | Revise Player/art contract before another prototype |
| Mechanic candidate | Selected | Attack-specific Attack 2 profile with broader front-facing Y-lane coverage |
| Explicit cost | Pass | Existing 525ms commitment, startup facing lock, front-only exposure, no armor/damage/HP/cancel benefit |
| Defer alternative | Rejected | Accepted art plus two datasets identify one bounded geometry question |
| Owner-stop alternative | Rejected | Discovery requires no new product authority and authorizes no integration |
| Architecture safety | Pass | Current single `attackHitbox` runtime and M10 boundary remain unchanged |
| Runtime scope | Pass | Planning documents and focused contract test only |
| Formal integration | Blocked | Requires an accepted prototype after the 10.5H contract gate |
| Next task | Selected | M10 / Task 10.5H — Zhang Fei Attack-Specific Hitbox Contract |

## M10 / Task 10.5H — Zhang Fei Attack-Specific Hitbox Contract — 2026-08-01

| Check | Result | Evidence |
| --- | --- | --- |
| Previous task | Pass | 167/167, typecheck, lint 0 errors/8 existing warnings |
| Ownership audit | Pass | Definition/controller/actor/Scene/Resolver/block/effects/lifecycle paths documented |
| Schema | Accepted | One required immutable `hitbox` per attack; legacy actor field removed in future migration |
| Physics owner | Preserved | One Scene-owned disabled Arcade Zone; no extra body/collider/listener/timer |
| Identity isolation | Pass | Generic selected metadata; no Guan Yu/Zhang Fei branch in Scene or resolver |
| Control geometry | Frozen | Guan Yu all `142×86 @ (104,-48)`; Zhang Fei Attack 1/3 `176×88 @ (132,-48)` |
| Prototype geometry | Frozen | Zhang Fei Attack 2 only: `176×128 @ (132,-48)`; no tuning pass |
| Explicit cost | Pass | 525ms, 175/125/225ms phases, locked facing, damage 1, no armor/cancel benefit |
| Direct probes | Defined | Same-lane plus target foot deltas `+60` and `-100`, both facing directions |
| Evidence protocol | Defined | 30 paired runs; unchanged 1.5× and +0.20 gates; non-dominance and rollback |
| Runtime scope | Pass | Documentation/architecture/tests only; no runtime or asset change |
| Formal integration | Blocked | Requires explicit acceptance of Task 10.5HP |
| Next task | Selected | M10 / Task 10.5HP — Zhang Fei Attack 2 Lane-Coverage Prototype |

## M10 / Task 10.5HP — Zhang Fei Attack 2 Lane-Coverage Prototype — 2026-08-01

| Check | Result | Evidence |
| --- | --- | --- |
| Fixed geometry | Pass | Guan Yu 142×86; Zhang Fei A1/A3 176×88; only A2 176×128 |
| Physics ownership | Pass | One Scene Arcade Zone; no extra collider/listener/timer or identity branch |
| Focused probes | Pass | Same lane, +60/-100 foot deltas, both facings, narrow controls and lifecycle |
| Paired trials | Pass | 30/30 Entry/Ambush/Boss runs completed and recorded |
| Reposition and choice | Pass | 10/10 aware grouped A2 repositions; 12 stops; 8 isolated and 0 unsafe A3 starts |
| Multi-target ratio | Fail | Zhang Fei 19 / Guan Yu 18 = 1.06×; required 1.5× |
| Displacement advantage | Fail | 1.405 - 1.39 = +0.015; required +0.20 |
| Adjustment | Not used | Frozen geometry and Enemy/Boss values were not tuned |
| Rollback | Pass | Runtime metadata, Scene resize, and prototype geometry tests removed after rejection |
| Automated gates | Pass | 168/168, typecheck, lint 0 errors/8 existing warnings, both builds |
| Viewports | Pass | Desktop, 844×390, 390×844 real joystick/attack; no overflow |
| Production isolation | Pass | Final runtime remains actor-hitbox/Guan-Yu production contract |
| Decision | Reject | Task 10.6 remains blocked |
| Next task | Selected | Planning-only M10 / Task 10.5F — Zhang Fei Second-Player Feasibility Closeout |

## M10 / Task 10.5F — Zhang Fei Second-Player Feasibility Closeout — 2026-08-01

| Check | Result | Evidence |
|---|---|---|
| Previous rollback | Pass | 168/168 tests, typecheck, lint, both builds, three viewports, and production isolation revalidated |
| Historical thresholds | Pass | 10.5, 10.5P, and 10.5HP gates retained without reinterpretation |
| Evidence coverage | Pass | 90 paired Entry/Ambush/Boss runs compared |
| Three outcomes | Pass | Defer, explicitly authorized contract revision, and permanent close evaluated |
| Decision | Defer | Zhang Fei moves to a later milestone; M10 closes without a second playable |
| Preserved work | Pass | Player seam, 47-frame atlas, preview, QA, provenance, telemetry, and reports retained |
| Retired assumptions | Pass | Commitment-only, knockback/reposition-only, and lane-coverage-only differentiation rejected |
| Production isolation | Pass | Guan Yu-only manifest/runtime and actor-level hitbox unchanged |
| Active sequence | Pass | Tasks 10.6 and 10.7 deferred; no fourth rescue prototype |
| Reopen authority | Frozen | Explicit product-owner approval of a revised gameplay / identity / art contract required |
| Final quality gates | Pass | 169/169 tests, typecheck, lint 0 errors/8 existing warnings, both 52-file production builds |

## M10 / Task 10.6T — Zhang Fei Trial Character Select — 2026-08-01

| Check | Result | Evidence |
|---|---|---|
| Explicit authority | Pass | Product owner requested “先加入我看看” after the documented 10.5F deferral |
| Fighter options | Pass | Exactly Guan Yu and Zhang Fei on the Phaser Title |
| Desktop input | Pass | Left/Right or A/D selection; Enter/Space/J confirmation |
| Touch input | Pass | Two large one-tap Phaser card targets |
| Zhang Fei runtime | Pass | Approved 47-frame atlas lazy-loads into the unchanged Stage |
| Guan Yu regression | Pass | Guan Yu selection and Attack 1 remain unchanged |
| Lifecycle | Pass | One Canvas; selected definition survives retry and replay restarts |
| React boundary | Pass | No React state or DOM gameplay control added |
| Packaging | Pass | Zhang Fei runtime PNG/atlas included; source and QA remain excluded |
| Viewports | Pass | Desktop, 844×390, and 390×844; no page overflow |
| Product status | Trial | `TRIAL BALANCE` is shown; tactical identity remains unaccepted |
| Next task | Selected | M10 / Task 10.6R — Zhang Fei Trial Play Review |
| Next task | Selected | Planning-only M11 / Task 11.1 — Post-M10 Product Direction Selection |
