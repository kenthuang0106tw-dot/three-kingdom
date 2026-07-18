# 《龍焰戰紀》Visual Target 與 Art Bible

## 1. Visual North Star

本作的畫面目標是「原創三國題材、日式寫實、1990 年代街機點陣感」的
2.5D Beat 'em Up。借鑑的是清楚剪影、厚重動勢、有限色階與群戰可讀性，
不複製任何既有遊戲的角色設計、sprite frame、盔甲紋樣、Logo 或場景配置。

最終畫面在 1280×720 邏輯解析度評估；desktop 與 844×390 landscape 是主要
產品視角，390×844 portrait 只驗證 FIT、safe area 與控制可達性。所有判斷以
實際顯示尺寸為準，不以放大的 source 圖細節代替遊戲內可讀性。

## 2. Non-negotiable Runtime Contracts

- 不改 damage、AI、Combo、Camera、Stage flow、world coordinates 或 Physics。
- 不用 rotate、scale、translate 單張圖偽造逐幀動作。
- 同一 actor 的所有 animation 使用一個 display scale；frame 以 metadata offset
  對齊，不用 animation-specific scale 補償。
- 每格以 feet anchor 對齊同一 world Y；倒地姿勢仍保留地面契約。
- 新增中間幀時，既有 startup／active／recovery 總時長與 hitbox window 不位移；
  新 frame 只細分原本 phase，除非另立 gameplay Task。
- Runtime 保持 nearest-neighbor、antialias off；非整數 scale 可用，但必須在三個
  viewport 目視確認沒有持續 shimmer。

## 3. Shared Character Language

### Anatomy and silhouette

- 成年男性 7.5–8 頭身；禁止 Q 版、大頭或現代萌系比例。
- 肩、髖、膝、腳掌與武器方向必須在最終顯示尺寸可辨識。
- 站姿先讀出重心，再讀出服裝細節；鬍鬚、衣襬、飄帶不可取代主動作。
- 每個 archetype 的黑色剪影在 25% zoom 仍可分辨，不依賴換色辨識。

### Logical display-height targets

高度量測為 neutral idle 的「feet line 到最高實色 pixel」，不含武器揮擊延伸。

| Actor | Target height | Ratio to Guan Yu | Manual silhouette cue |
|---|---:|---:|---|
| Guan Yu | 230±10 px | 1.00 | 長鬍鬚、寬肩、長袍下擺 |
| Soldier | 210±10 px | 0.87–0.96 | 標準長刀與直立步兵輪廓 |
| Duelist | 205±10 px | 0.85–0.94 | 輕甲、雙刃、前傾低重心 |
| Mauler | 240±12 px | 1.00–1.09 | 厚胸腹、重武器、寬站姿 |
| Boss warlord | 300±15 px | 1.24–1.36 | 高大重甲、長武器、壓迫性肩線 |

驗收方式：輸出 neutral-idle lineup debug sheet，畫共同 feet line 與每 10px 高度
刻度；任何 animation state 切換不得使角色視覺身高無理由跳動超過 4px。

### Outline, value, and pixel density

- 外輪廓使用帶色深墨，不用純黑均勻描邊；最終顯示約 1–2 logical px。
- 每材質使用 3–5 個明度階；最暗與最亮區必須形成大色塊，不做 airbrush 漸層。
- 臉、手、甲片與布料使用連續 pixel clusters；禁止單 pixel 雜點與高頻抖色。
- 25% zoom 時 active limb、weapon tip、face direction 仍可讀；100% zoom 時不出現
  鄰格污染、半透明 chroma residue 或被裁切的武器。

## 4. Palette and Lighting

全場共享左上方偏暖主光、右下方偏冷環境陰影。角色受竹林綠色環境光影響，
但 skin、weapon edge 與敵人 telegraph 必須從背景分離。

| Role | Anchor color | Use |
|---|---|---|
| Deep ink | `#10140F` | 最深輪廓、接觸陰影 |
| Cool shadow | `#1B2A24` | 甲片／布料共用陰影 |
| Forest dark | `#243A24` | 背景深層竹林 |
| Forest mid | `#3F5B30` | 中景植被與地面 |
| Jade cloth | `#2F5C47` | Guan Yu 主色 |
| Antique gold | `#B98A39` | 甲片與 UI 金邊 |
| Warm highlight | `#E0B86B` | 金屬、皮膚受光 |
| Skin shadow | `#7A3F2E` | 膚色暗部 |
| Skin mid | `#B96B45` | 膚色中間值 |
| Skin light | `#E2A06A` | 臉與手重點 |
| Signal red | `#8B2E27` | 腰帶、危險／Failure accent |
| Steel blue | `#31566F` | Soldier／冷金屬差異 |
| Bone white | `#D8D3BD` | 文字與高光，不作大片純白 |
| Impact white | `#FFF4D6` | 只用於極短命中效果 |

每名 actor 建議 24–40 個不透明 runtime 色；同材質共用 ramp。人工驗收使用
palette histogram 與 25% zoom side-by-side；不得只憑 prompt 描述判定一致。

## 5. Character Direction

### Guan Yu

- 成熟東亞男性，高大健壯、丹鳳眼、濃眉、長黑鬍鬚。
- 墨綠戰袍、青黑札甲、舊金護肩護腕、暗紅腰帶、黑布靴。
- 徒手 Combo 要靠肩髖轉動與前後腳承重，不是只移動手臂。
- Idle／walk／attack1–3／hurt／dead 必須共享 identity、scale 與 feet anchor。

### Enemy trio

- Soldier：藍白中量甲、長刀，姿勢中正，是比例與動畫節奏基準。
- Duelist：青綠輕甲、雙刃、窄肩低姿；輪廓和速度感都要比 Soldier 輕。
- Mauler：赤褐重裝、厚軀幹與大武器；不能只把 Soldier 放大或換色。
- 三者共用光源與皮膚 ramp，但主色占比、肩寬、武器負空間必須不同。

### Boss

- 靛藍與古金重甲軍閥；高度約 Guan Yu 1.3 倍，武器與肩線形成壓迫感。
- 三招 startup silhouette 必須互異，玩家在 active 前可只看姿勢判斷招式。
- Phase、hurt、dead 不得改變角色 identity、feet baseline 或盔甲色溫。

## 6. Animation Quality Gates

| State | Minimum visual requirement | Acceptance |
|---|---|---|
| Idle | 呼吸、肩甲／衣襬次動作 | loop 接點無跳格；feet delta 0px |
| Walk | 清楚接觸、下沉、通過、抬起 phase | world movement 與步伐方向一致 |
| Attack | 明確 anticipation、contact、follow-through | startup/active/recovery 肉眼可分 |
| Hurt | 胸頭受力、腳底失衡但不升空 | feet world Y 不變；無假 knock-up |
| Dead | 失衡、落地、短暫停留 | body/hitbox contract 不因圖片改變 |

Guan Yu 的 attack1–3 至少各 5／6／8 個可辨識姿勢；新增幀只改善動作弧線，
不得自動接段或改變目前 Combo input。任何 sheet 都要提供 2 FPS onion-skin 人工
檢查與正常 FPS runtime capture。

## 7. Stage Language

三個 1280px section 必須共享同一竹林氣候與地面透視，但各有一個主 landmark：

1. **Forest Entry:** 疏竹、道路入口、較亮天空，建立方向。
2. **Forest Ambush:** 密竹、斷木／拒馬、較窄視線，強化包圍感。
3. **Boss Arena:** 軍寨門、旗幟與開闊地面，形成終點與戰鬥空間。

地面 feet plane 必須在約 `y=390–635` 持續可讀。背景、中景、前景的 value band
分離；前景可遮腳但不可遮 active pose、attack telegraph、HP 或 mobile controls。
Section 接縫以並排 3840px capture 檢查，不允許空白、突變 horizon 或重複 landmark。

## 8. Combat Effects

- Hit spark 的中心落在碰撞點，主要亮塊 4–12 logical px，總壽命不超過既有時序。
- 輕擊不使用大 camera flash；重擊可增加形狀，不改 Hit Stop／Shake 數值。
- Dust、shadow、impact 不可形成不透明大圓，不能遮住敵人 startup 或 mobile controls。
- 同 frame 多目標可各有 spark，但全域視覺強度不疊成全白畫面。

## 9. Product UI Language

- 方向：深墨半透明面板、古金雙線框、骨白文字、紅色只用於危險／Failure。
- 字型：原創或可商用 pixel／display font；英數大寫、窄字寬、至少 1px 深色 shadow。
- HUD 不超過上方 90 logical px；Pause button 保留右上 safe margin ≥24px。
- Title、Pause、Failure、Result 的主標題層級一致；功能文案和操作提示分成兩級。
- Joystick base 直徑 124–148 logical px、knob 56–72px；attack touch target
  ≥96×96px。透明度須讓場景可見，但輪廓在最亮地面仍清楚。
- 844×390 必須可讀；390×844 保持可達與不裁切，但不要求與 landscape 同等字體
  實體尺寸，正式發布仍以 landscape 為主要手機方向。

## 10. Before Baseline Contract

基準目錄：`docs/visual-baselines/m6a-6a1-before/`。Gameplay revision 固定為
`3183f1f`；15 張 PNG 涵蓋 desktop、844×390 landscape、390×844 portrait 的
Title、combat、Boss、Failure、Result。檔名、checkpoint query、Canvas 尺寸與
已知 development overlay 限制記錄在該目錄的 `README.md`。

後續 after capture 必須使用相同 viewport、同 checkpoint、同 arcade shell 與同一
命名後綴。比較項目：silhouette、feet line、palette、stage landmark、UI hierarchy、
control reachability；debug text/body 不列入美術差異。

## 11. Prioritized Gap List and Approved Order

| Priority | Gap | Why it blocks quality | Planned task |
|---:|---|---|---|
| P0 | Guan Yu idle/walk/attack 使用不同 scale，幀數與 transition 不足 | 主角每秒可見，動作與比例不穩定 | 6A.2 |
| P0 | 三小兵與 Boss 的比例、色盤、source facing 與 cluster 密度不一致 | 群戰像不同素材包拼接 | 6A.3 |
| P0 | 三畫面重複同一 `forest-camp.png` | 捲軸前進缺少視覺進程 | 6A.4 |
| P1 | Graphics spark、系統字體與功能性 UI 缺少產品語言 | 命中與流程仍像技術 prototype | 6A.5 |
| P1 | 全關 after、load／texture baseline 與 provenance 尚未 freeze | 無法客觀結束美術升級 | 6A.6 |

執行順序固定為 `6A.2 Guan Yu → 6A.3 Enemy/Boss → 6A.4 Stage → 6A.5 Effects/UI → 6A.6 Acceptance`。
不得因某張圖容易生成而跳序，也不得在 6A.2 同時改 Stage 或 UI。

## 12. Review Method

每個 visual Task 都必須同時提供：native-size runtime screenshot、25% silhouette
sheet、feet-line／red-box debug sheet、2 FPS onion-skin（動畫時）、atlas metadata
validation、三 viewport smoke，以及與本 baseline 的人工 side-by-side 結論。
Technical Lead 只有在客觀檢查與人工可讀性都通過時才接受素材。
