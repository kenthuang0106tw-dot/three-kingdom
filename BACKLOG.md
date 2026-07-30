# Product Backlog

只有移入 `SPRINT.md` 的 Task 才能實作。本文件不是同時開工清單。

## P0 — Vertical Slice Blockers

| Item | Target | Notes |
|---|---|---|
| Repository baseline / quality gates | M0 | build、lint、typecheck、test 必須可信 |
| UTF-8 recovery | M0 | 文件、UI、啟動檔 |
| Production asset route | M0/M9 | 防止 build 成功但白屏 |
| Unified keyboard/touch input | M1 | Web + Mobile 首發 blocker |
| Mobile landscape runtime | M1 | safe area、orientation、DPR |
| Player combat contract tests | M2 | 防止輸入／attack regression |
| EnemyManager cleanup/director tests | M3 | 多敵人長時間穩定 |
| Two encounter gates | M5R.2 | 關卡戰鬥循環 |
| Playable Boss combat | M5R.3–5R.7 | locomotion、alignment、hitbox、damage、clear/fail |
| HUD/pause/result | M6.3–6.7 | M5R.8 通過後恢復；Title 已完成 |
| Visual target and original art upgrade | M6A | 關羽、三小兵、Boss、三畫面竹林、特效與產品 UI；不得改 gameplay contracts |
| Core combat audio | M7 | 街機手感必要 |
| Mobile performance / release QA | M8/M9 | 發布 blocker |

## P1 — Vertical Slice Quality

- M10 / Tasks 10.2–10.7 — Zhang Fei second playable Vertical Slice in the
  existing released Stage; scope is locked by Task 10.1.
- Release operations follow-up: decide whether signed release tags should be
  permitted by the GitHub Pages environment.
- Capture exact physical device/OS/browser metadata for the next release
  candidate.
- 第二與第三種近戰小兵。
- `GX.1 Duelist Leap Mobility Prototype`：讓兜帽雙鉤刺客以可讀的起跳、
  空中、落地與 recovery 改變站位；必須使用真正逐幀動畫，禁止單張
  sprite 上下位移假裝跳躍。
- Boss phase 與 arena lock。
- Continue flow。
- 音量設定、flash/shake intensity 設定。
- Object pooling（需 profiling 證明）。
- Loading progress 與 asset failure handling。

## P2 — Post Vertical Slice

- 趙雲 playable integration。
- 第二關與新場景主題。
- 更多近戰敵人。
- 第二名 Boss。
- 武器拾取與耐久。
- 食物／補血道具。
- 場景可破壞物。
- NPC、對話與簡短劇情。
- Gamepad support。
- PWA/offline cache。

## Future — Full Game Exploration

- 多關卡 Campaign。
- 玩家成長與技能樹。
- 裝備、商店與貨幣。
- 存檔與雲端同步。
- 排行榜與成就。
- 雙人合作／多人連線。
- 多結局與劇情分支。
- 更多 playable generals。
- 騎馬、空中攻擊、必殺技。
- 遠程敵人與大型兵器。
- 桌面包裝版。

## Explicitly Not Planned for Vertical Slice

- Boss 以外的第二套大型系統。
- 經驗值、裝備、商店、存檔。
- Multiplayer。
- Backend gameplay dependency。
- 關卡編輯器。
- 通用 ECS 或自製 physics engine。

## Planned Gameplay Expansion — GX.1

### Duelist Leap Mobility Prototype

**Purpose:** Verify that one selected agile enemy can use a committed leap to
change lane or flank without becoming an unreadable teleport or an always-safe
attack.

**Dependencies:** ER.3R visual correction is accepted. The task must not be
mixed into ER.3R or another enemy's production-art commit.

**Prototype boundaries:**

- Duelist only; no shared aerial framework and no Player jump.
- Explicit `takeoff → airborne → landing/recovery` state flow.
- Genuine animation frames for takeoff, air, descent, and landing.
- Ground feet/body position and visual elevation remain separate; a shadow
  keeps the destination lane readable.
- Destination and facing lock at takeoff; no midair homing or instant Y-axis
  correction.
- The leap cannot bypass Stage bounds, Camera locks, Attack Slot ownership, or
  cleanup/reset contracts.
- Invulnerability, damage, and whether the leap itself attacks remain prototype
  questions; do not assume them before playtesting.

**Acceptance criteria:**

- Desktop, 844×390, and 390×844 players can read takeoff and landing position.
- Vertical movement can avoid or punish the leap reliably.
- The Duelist uses it as an occasional reposition decision, not constant spam.
- Landing has a punishable recovery and cannot immediately chain an unreadable
  attack.
- Hurt, death, pause, hit stop, and Scene reset leave no airborne state, timer,
  shadow, collider, or Attack Slot behind.

## Promoted to M6A Visual Upgrade

- Guan Yu hurt/dead 與 combo transition/recovery 中間幀。
- 三種小兵與 Boss 的比例、色盤、腳底與動畫一致性。
- 三畫面竹林 foreground、parallax、地面、props 與 Boss arena 視覺層。
- 正式 combat effects、角色陰影、產品 UI、mobile controls 與 pixel font。
- 本清單已移出一般 P1，必須依 6A.1 → 6A.6 順序執行，不可零散開工。
