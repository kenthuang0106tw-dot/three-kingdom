# Asset Pipeline

## 1. Principles

- Source、processed、runtime、atlas、metadata、debug sheet 必須可追蹤。
- 不假設 sprite sheet 等寬；先分析 alpha bounds 與角色完整邊界。
- 所有 actor frame 以腳底為共同 anchor，同一 actor 使用統一 display scale。
- 禁止用 rotate／scale／translate 偽造中間動作。
- Runtime 使用 nearest-neighbor；非整數 scale 可以使用，但要人工檢查 pixel shimmer。
- 素材必須原創或具有可記錄授權。
- 每次 M6A 替換必須保留對應 before/after capture；沒有 provenance 與
  reproducible checkpoint 的圖片不得進 runtime manifest。

### M6A visual target

Authoritative style、比例、palette、lighting、pixel-density、UI language 與
review gates 定義於 `ART_BIBLE.md`。Asset pipeline 負責忠實產出該規格，不能在
個別 sprite Task 中自行改變視覺方向。

## 2. Current Inventory

### Player — Guan Yu

| Asset | Runtime Status | Metadata | Known Gap |
|---|---|---|---|
| `guanyu-v2.png` | 43-frame runtime atlas 已接入 | `guanyu-v2.atlas.json`、`guanyu-v2.metadata.json` | M6A.2 無阻斷 gap |
| `guanyu-idle-v2-source.png` | 6-frame original source | provenance in metadata | 保留 chroma source 與 transparent derivative |
| `guanyu-actions-v2-source.png` | walk/attack1–3/hurt/dead source | per-component source rects | source layout 非等寬，必須由 component isolation 重建 |
| `guanyu-dead-final-v2-source.png` | final grounded dead pose source | per-component source rect | 單獨來源用於 dead-5 |
| legacy Guan Yu sheets | runtime 已停用、保留 audit/reference | 17-frame `legacyAudit` | 不再回退為正式 runtime |

M6A.2 runtime contract：idle 6、walk 8、attack1 5、attack2 6、attack3 8、hurt 4、dead 6；每格 640×448、feet anchor `(320,420)`、origin `(0.5,0.9375)`、display scale `0.64`、logical idle height `230.4px`。所有 state 共用同一 texture/scale/origin；`tools/build_guanyu_v2_art.py` 以 connected-component isolation 避免非等寬 source 相鄰 frame 污染，並產生 atlas、metadata、red-box/feet-line、onion-skin 與 25% silhouette QA。

三段攻擊保留原本每段 375ms：startup 125ms、active 125ms、recovery 125ms。新增 frames 只細分既有 phase，不改 Combo、damage、hitbox window、body 或世界座標。

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
| Display scale | `1.34` |
| Metadata | `enemy-soldier.atlas.json`, `soldier.metadata.json` |
| QA | `enemy-soldier-debug.png`, `soldier-onion.png`, `soldier-silhouette-25.png` |
| Rebuild tool | `tools/build_enemy_art.py` |

Mauler 與 Duelist 也使用 5×3、384×384、feet `(192,354)` runtime contract，display scale 分別為 `1.10` 與 `0.94`。三者 source-facing 分別為 Soldier left、Mauler right、Duelist right；attack frame 順序仍為 startup／active／recovery，active index 與 gameplay timing 未更動。`tools/build_cast_consistency_art.py` 會從 source 重建 processed transparent、atlas、metadata、red-box/feet-line、onion、25% silhouette 與共同 lineup。

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
| Display scale | `1.27` |
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
| Frames | 15; idle 2, hurt 2, phase 3, death 4, walk 4 |
| Runtime layout | 4×4, 448×448 cells |
| Feet anchor | `(224, 420)` for every frame |
| Display scale | `1.27`, shared with attack frames |
| Metadata | `warlord-lifecycle.atlas.json`, `warlord-lifecycle.metadata.json` |
| QA | `warlord-lifecycle-debug.png` |
| Rebuild tool | `tools/build_boss_lifecycle_art.py` |

The lifecycle strips were generated from the same indigo-and-antique-gold
warlord reference. Explicit strip boundaries, chroma removal, and a common
feet anchor prevent neighboring-frame contamination and animation jump. The
four walk frames are distinct consecutive poses, share the same source-facing
and feet anchor, and are rebuilt from `warlord-walk-transparent.png`; arena-
specific art remains deferred.

M6A.3 adds `warlord-consistency.metadata.json`, `warlord-onion.png`,
`warlord-silhouette-25.png`, and the shared `cast-lineup-debug.png`. Boss idle
height is `300.99px` at runtime scale; all 24 attack/lifecycle frames retain the
existing `(224,420)` feet anchor, frame names, timing, body, and hitbox contract.

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

目前 3840×720 world 將同一張 `forest-camp.png` 重複用於三個 section；沒有
獨立 landmark、parallax layers、foreground mask 或 visual seam metadata。

### UI / Font / Audio

- UI：React side cabinet／CRT overlay 保留外框；Phaser 已有 Title、Player/Boss HUD、Pause、Failure、Result。全部仍是功能性 prototype art。
- Font：使用系統 Consolas/Impact/Arial，沒有正式 pixel font。
- Audio：沒有 runtime asset。
- Mobile controls：Phaser 360° joystick、attack、pause 已可用，但沒有正式 UI assets。

## 3. Required File Set

每個角色或敵人 animation set 至少包含：

```text
character-action-source.png
character-action.png
character-action.atlas.json
character-action.metadata.json
character-action-debug.png
```

正式命名使用小寫 kebab-case：`{actor}-{action}-{variant}`。同一內容的 source、
processed、runtime、atlas、metadata、debug 必須共享 stem；禁止使用 `final2`、
`new`、`fixed` 等不可追蹤名稱。每次 visual Task 在 metadata 記錄：

- author/tool and generation date
- original／licensed provenance or prompt/reference record
- source revision and processing tool revision
- runtime texture key and consuming animation keys
- logical target height、feet anchor、display scale
- manual reviewer and accepted baseline filename

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
- [ ] 與 `ART_BIBLE.md` 的 silhouette、palette、lighting、pixel-density gate 相符。
- [ ] Matching before/after checkpoint 可重現且沒有改變 gameplay contract。

## 5A. M6A Before Baseline

- Revision: `3183f1f`
- Directory: `docs/visual-baselines/m6a-6a1-before/`
- Matrix: desktop、844×390 landscape、390×844 portrait × Title、combat、Boss、
  Failure、Result，共 15 張 PNG。
- Capture contract、Canvas 尺寸、query 與 development instrumentation 限制記錄
  在 baseline 目錄的 `README.md`。
- 6A.2–6A.5 不得覆寫 before；6A.6 使用 matching filename 建立 sibling after。

## 6. Missing Assets by Milestone

- **M1:** Mobile controls、orientation prompt。
- **M2:** Guan Yu hurt、dead、完整 combo transitions。
- **M3:** 第二／第三種近戰小兵全套動畫。
- **M4:** Stage layers、foreground、props、collision/encounter metadata。
- **M5:** Boss attack 1–3、idle、walk、hurt、phase、dead 已完成；仍缺 arena-specific assets。
- **M5R:** 三段連續竹林 Stage layout、Boss walk frames 與可驗證 arena entry presentation。
- **M5R.1 runtime:** 已用現有 `forest-camp.png` 建立三段明確、無 uncovered area 的暫時 section；三段獨特場景美術仍屬後續 content polish，不阻擋 encounter work。
- **M6:** 功能性 Title/HUD/Pause/Failure/Result 已完成；本 Milestone 不製作 custom art。
- **M6A.1 (Completed):** Visual target、比例、色盤、光源、pixel density、UI language 與 15 張 before baseline 已保存。
- **M6A.2 (Completed):** Guan Yu 43-frame source/runtime atlas、metadata/provenance、legacy audit、debug/onion/silhouette QA 與 reproducible component-isolation pipeline 已接入。
- **M6A.3 (Completed):** 69 個 Enemy/Boss frames 的比例、面向、feet、atlas、provenance、onion/silhouette 與三 viewport runtime matrix 已驗收。
- **M6A.4:** 三個可辨識竹林 section、前景遮擋、地面層、Boss arena 與無接縫 layer assets。
- **M6A.5:** 正式 Hit Spark/impact/dust/shadow、Title/HUD/Pause/Failure/Result、custom pixel font 與 mobile control assets。
- **M6A.6:** 三 viewport before/after captures、完整 asset provenance、atlas/load baseline 與 visual freeze record。
- **M7:** Combat SFX、BGM。
- **M8:** Optimized atlases、loading/social/release assets。
