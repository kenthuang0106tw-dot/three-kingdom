# Asset Pipeline

## 1. Principles

- Source、processed、runtime、atlas、metadata、debug sheet 必須可追蹤。
- 不假設 sprite sheet 等寬；先分析 alpha bounds 與角色完整邊界。
- 所有 actor frame 以腳底為共同 anchor，同一 actor 使用統一 display scale。
- 禁止用 rotate／scale／translate 偽造中間動作。
- Runtime 使用 nearest-neighbor；非整數 scale 可以使用，但要人工檢查 pixel shimmer。
- 素材必須原創或具有可記錄授權。

## 2. Current Inventory

### Player — Guan Yu

| Asset | Runtime Status | Metadata | Known Gap |
|---|---|---|---|
| `guanyu-master.png` | idle 已接入 | idle atlas | 只有單幀 idle |
| `guanyu-walk.png` | 4-frame walk 已接入 | walk atlas | 產生工具未保留 |
| `guanyu-combo-frames.png` | 6 attack frames 已接入 | attack atlas、debug sheet | 每段缺少完整 transition/recovery 中間幀 |
| `guanyu-air-hit.png` | 未接入 Phaser | 無正式 atlas | Hurt/death/airborne flow 未完成 |
| `*-source.png` | 保存 | N/A | 需記錄來源與生成參數 |

現有 Player scale 依 animation 類型仍由 MainScene 設定；M2 必須將 frame metadata 與顯示契約集中，不可再以 scale 修 alignment。

### Player — Zhang Fei / Zhao Yun

兩者都有 master、walk、combo 與 source 圖，但尚未：

- 完成 frame boundary 分析。
- 建立 atlas／feet-anchor metadata／debug sheet。
- 驗證 idle/walk/attack 動作連續性。
- 接入 Phaser state machine。

Vertical Slice 不接入兩名角色，維持 Backlog P2。

### Enemy — Blue/White Soldier

| Item | Value |
|---|---|
| Runtime sheet | `enemy-soldier.png` |
| Frames | 15 |
| Layout | 5×3，每格 384×384 |
| Animations | idle 2、walk 4、attack 3、hurt 2、dead 4 |
| Feet anchor | `(192, 354)` |
| Origin | `(0.5, 0.921875)` |
| Display scale | `1.4` |
| Metadata | `enemy-soldier.atlas.json`, `enemy-frame-metadata.json` |
| QA | `enemy-soldier-debug.png` |
| Rebuild tool | `tools/build_enemy_art.py` |

目前所有 frame alpha bottom 為 354。工具會清除低 alpha chroma residue，避免 Hurt frame 因隱形像素跳位。

### Effects

- Hit Spark：Phaser Graphics runtime 產生 5 frames，24 FPS。
- Hit Flash：TintFill。
- Camera Shake／Hit Stop：程式效果。
- 尚缺正式 hit spark、slash trail、dust、death impact、environment break effects。

### Boss — Indigo Warlord Attacks (M5 / Task 5.2)

| Item | Value |
|---|---|
| Source strips | `warlord-attack1/2/3-source.png` |
| Processed strips | `warlord-attack1/2/3-transparent.png` |
| Runtime sheet | `warlord-attacks.png` |
| Frames | 9; three attacks × startup / active / recovery |
| Runtime layout | 3×3, 448×448 cells |
| Feet anchor | `(224, 420)` for every frame |
| Display scale | `0.9` |
| Metadata | `warlord-attacks.atlas.json`, `warlord-attacks.metadata.json` |
| QA | `warlord-attacks-debug.png` |
| Rebuild tool | `tools/build_boss_art.py` |

The original indigo-and-antique-gold heavy warlord was generated with the
built-in image generator on flat magenta chroma-key strips, one strip per
attack. The prompt set preserves one mature East Asian warlord identity and
requests overhead smash, horizontal sweep, and forward lunge sequences. Local
chroma removal and explicit non-equal source rectangles prevent neighboring
weapon pixels from contaminating frames.

### Boss — Indigo Warlord Lifecycle (M5 / Task 5.4)

| Item | Value |
|---|---|
| Source strips | `warlord-idle-hurt-source.png`, `warlord-phase-source.png`, `warlord-death-source.png` |
| Processed strips | Matching `*-transparent.png` files |
| Runtime sheet | `warlord-lifecycle.png` |
| Frames | 11; idle 2, hurt 2, phase 3, death 4 |
| Runtime layout | 4×3, 448×448 cells |
| Feet anchor | `(224, 420)` for every frame |
| Display scale | `0.9`, shared with attack frames |
| Metadata | `warlord-lifecycle.atlas.json`, `warlord-lifecycle.metadata.json` |
| QA | `warlord-lifecycle-debug.png` |
| Rebuild tool | `tools/build_boss_lifecycle_art.py` |

The lifecycle strips were generated from the same indigo-and-antique-gold
warlord reference. Explicit strip boundaries, chroma removal, and a common
feet anchor prevent neighboring-frame contamination and animation jump. Walk
and arena-specific art remain missing.

### Runtime manifest (M1 / Task 1.5)

`app/game/assets/AssetManifest.ts` owns the current stage, player, three enemy,
and two Boss atlas runtime entries, including `boss-warlord-attacks` and
`boss-warlord-lifecycle`.
The manifest records whether an entry is an image or atlas and its exact public
URLs. `MainScene.preload()` queues it without changing existing keys or frame
metadata. Development loader failures report the required key deterministically;
the listener is removed on Scene shutdown.

### Stage

| Asset | Status |
|---|---|
| `forest-camp.png` | 正式 prototype 背景 |
| `mounted.png` | 未使用／reference |
| `enemies.png` | 舊 enemy reference，正式 runtime 未使用 |
| `*-source.png` | Source/reference |

目前背景是單張圖片，沒有 parallax layers、collision map、foreground mask、tile seam 或 stage metadata。

### UI / Font / Audio

- UI：只有 React side cabinet、CRT overlay、Phaser debug text。
- Font：使用系統 Consolas/Impact/Arial，沒有正式 pixel font。
- Audio：沒有 runtime asset。
- Mobile controls：沒有正式 Phaser UI assets。

## 3. Required File Set

每個角色或敵人 animation set 至少包含：

```text
character-action-source.png
character-action.png
character-action.atlas.json
character-action.metadata.json
character-action-debug.png
```

Metadata 最少欄位：

- frame name
- source x/y/width/height
- alpha bounds
- originX/originY
- display offset X/Y
- feet anchor X/Y
- display scale
- animation classification
- startup/active/recovery tag（攻擊時）

## 4. Processing Workflow

1. **Reference review:** 確認角色設計、面向、比例、武器與 cell order。
2. **Source preservation:** 原始輸出以 `-source` 保存，不覆寫。
3. **Background removal:** 使用 chroma-key 或 alpha；低 alpha residue 歸零。
4. **Boundary analysis:** 逐格找完整人物與武器，禁止切到鄰格。
5. **Feet normalization:** 站立 frame 對齊同一 feet anchor；倒地 frame 保留同一 world ground contract。
6. **Atlas generation:** 建立明確 rectangle，不由 runtime 猜測。
7. **Debug sheet:** 紅框、frame name、ground/feet line。
8. **Automated validation:** 尺寸、frame count、bounds、anchor、duplicate name。
9. **Animation preview:** 2–10 FPS、逐格、onion skin。
10. **Runtime acceptance:** nearest filtering、統一 scale、切 state 不跳位。

## 5. Asset Acceptance Checklist

- [ ] 人物、武器、影子沒有被裁切。
- [ ] Frame 沒有鄰格污染。
- [ ] 所有站立 frame 腳底一致。
- [ ] 同一 actor scale 一致。
- [ ] Attack 有可辨識 startup/active/recovery。
- [ ] Hurt 不改變 feet world Y。
- [ ] Atlas 與圖片尺寸一致。
- [ ] Debug sheet 已人工確認。
- [ ] Preview mode 沒有跳位或錯序。
- [ ] Source、metadata、tool 都已提交。
- [ ] 素材授權／原創來源已記錄。

## 6. Missing Assets by Milestone

- **M1:** Mobile controls、orientation prompt。
- **M2:** Guan Yu hurt、dead、完整 combo transitions。
- **M3:** 第二／第三種近戰小兵全套動畫。
- **M4:** Stage layers、foreground、props、collision/encounter metadata。
- **M5:** Boss attack 1–3、idle、hurt、phase、dead 已完成；仍缺 walk 與 arena assets。
- **M6:** HUD、font、title/result UI。
- **M7:** Combat SFX、BGM。
- **M8:** Optimized atlases、loading/social/release assets。
