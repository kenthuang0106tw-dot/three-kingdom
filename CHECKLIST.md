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

- [ ] Attack/Hit/Hurt/Death event 各播放一次。
- [ ] 多目標命中不造成不可接受的音量疊加。
- [ ] Pause/resume audio 正確。
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
