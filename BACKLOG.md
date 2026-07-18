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

- 第二與第三種近戰小兵。
- Boss phase 與 arena lock。
- Continue flow。
- 音量設定、flash/shake intensity 設定。
- Object pooling（需 profiling 證明）。
- Loading progress 與 asset failure handling。

## P2 — Post Vertical Slice

- 張飛 playable integration。
- 趙雲 playable integration。
- Character select。
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

## Promoted to M6A Visual Upgrade

- Guan Yu hurt/dead 與 combo transition/recovery 中間幀。
- 三種小兵與 Boss 的比例、色盤、腳底與動畫一致性。
- 三畫面竹林 foreground、parallax、地面、props 與 Boss arena 視覺層。
- 正式 combat effects、角色陰影、產品 UI、mobile controls 與 pixel font。
- 本清單已移出一般 P1，必須依 6A.1 → 6A.6 順序執行，不可零散開工。
