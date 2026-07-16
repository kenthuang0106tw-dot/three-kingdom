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
