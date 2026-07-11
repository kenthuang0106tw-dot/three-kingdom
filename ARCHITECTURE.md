# Architecture

## 1. Current Runtime

```text
Next/Vinext page
  └─ React arcade shell
      └─ PhaserGame lifecycle component
          └─ Phaser.Game (1280×720)
              └─ MainScene
                  ├─ Player input/state/animation/physics
                  ├─ Combat effects and combo flow
                  ├─ EnemyManager
                  │   └─ EnemyCombatant × 3
                  ├─ Debug overlays
                  └─ Animation preview modes
```

React 不參與 gameplay update。`PhaserGame.tsx` 動態載入 Phaser 和 `MainScene`，確保 Fast Refresh／React remount 前銷毀舊 instance。正式頁面入口是 `app/page.tsx`；`app/game.tsx` 是未引用的舊 Canvas runtime。

## 2. Current Data Flow

### Player input

1. `PlayerInputController` 在 Scene `create()` 建立 keyboard keys。
2. `MainScene.update()` 每幀讀取 `isDown`／`JustDown`。
3. Player body velocity 由當前輸入重算。
4. Sprite 跟隨 body zone，腳底 Y 同時決定 depth。

### Player attack

1. `JustDown(J)` 進入 attack state。
2. Phaser animation frame event 控制獨立 attack zone。
3. `playerAttackId` 與 Enemy 的 `lastPlayerAttackId` 防止同段重複命中。
4. MainScene 套用傷害、Flash、Spark、Knockback。
5. 同 frame 多目標只由第一個命中觸發全域 Hit Stop／Camera Shake。

### Enemy flow

1. `EnemyManager` 擁有 EnemyCombatant collection、colliders、Formation 與 Attack Slot。
2. 每隻 EnemyCombatant 擁有獨立 state、HP、sprite、body、attack zone、hit record。
3. Manager 每幀重算站位或攻擊接近方向。
4. 單一 Attack Slot 控制同時出手數量。
5. Hurt／Dead 立即釋放 Attack Slot；死亡動畫完成後移除 collider、listener 與 GameObjects。

## 3. Module Responsibilities

| Module | Owns | Must Not Own |
|---|---|---|
| React shell | Page layout、arcade side art、Phaser host | Actor state、input snapshot、physics、animations |
| `PhaserGame` | Phaser config、instance create/destroy、host focus | Combat rules、enemy AI |
| Scene | Lifecycle、orchestration、world services | 長期堆積所有 actor 細節 |
| Player actor/controller | Input interpretation、state、body、sprite、player attack zone | Enemy collection、stage progression |
| EnemyCombatant | 單一敵人物件與本地 state | 全域 Attack Slot、Camera、Hit Stop |
| EnemyManager | Enemy collection、formation、director、cleanup | Player state、global time scale |
| Combat resolver | Hit eligibility、damage event、attack-local records | Rendering、DOM、Scene navigation |
| Effect director | Hit Stop／Shake 去重與 hit effects 排程 | Damage 判定、AI state |
| Stage director | World bounds、encounters、gates、spawn | Player animation、Enemy attack logic |
| Camera controller | Follow、lock、shake policy | Combat damage |
| Debug overlay | Runtime snapshot visualization | 修改 gameplay state |
| Asset pipeline | Source processing、atlas、metadata、validation | Runtime combat tuning |

## 4. Target Scene Shape

Vertical Slice 建議採最少必要 Scene：

- `BootScene`: preload manifest、全域 animation registration。
- `StageScene`: world、player、enemy、combat、camera、stage progression。
- `UIScene`: HUD、pause、mobile controls；以事件讀取 Stage snapshot。

不要為每個功能建立 Scene。Title／Result 可先由 UIScene 的明確 mode 管理，直到流程複雜度需要獨立 Scene。

## 5. State Machines

### Player

目前：`idle | walk | attack1 | attack2 | attack3 | hurt`。

未來加入 `dead` 前，必須先定義合法 transition。不得使用第二組 `isAttacking` 等 boolean 重複表達 state。

### Enemy

`idle | walk | attack | hurt | dead`。所有 transition 經過單一方法；Attack Slot 是 Manager 資源，不是 Enemy state。

### Stage

規劃為 `entering | traversal | encounter | boss | cleared | failed | paused`。Stage state 不直接設定 actor animation。

## 6. Physics and Coordinate Contract

- 世界位置以腳底座標為基準。
- 地面 body 只覆蓋腳底占位範圍。
- Attack hitbox 永遠是獨立 Arcade Zone。
- Sprite 跟隨 body；禁止只 tween sprite。
- Knockback 修改 physics owner，第一階段只做水平位移。
- Actor depth = rounded feet world Y。
- Walk bounds、attack X/Y range 與 body sizes 必須資料化並集中管理。

## 7. Animation Contract

- Animation key 全域唯一。
- 每個 animation 定義 frame order、FPS、repeat、startup、active、recovery。
- Frame-specific feet anchor 放在 atlas／metadata，不用不同 scale 補償。
- Animation listener 在 create/constructor 註冊一次，destroy 時移除。
- `animationcomplete` 必須檢查 animation key。

## 8. Debug Contract

Development-only：Arcade Physics debug、input diagnostic、attack preview、enemy alignment preview、formation target slots。Production 不顯示 debug body、文字或 target markers。

Debug 只能觀察狀態；不得透過 Debug UI 修正或覆寫正式狀態。

## 9. Asset Pipeline

```text
source image
  → chroma/alpha cleanup
  → frame boundary analysis
  → feet-anchor normalization
  → atlas + metadata
  → debug sheet
  → automated bounds validation
  → runtime load
```

Runtime 不猜測等寬切圖。任何 atlas 改動都必須重新產生 debug sheet 並人工確認。

## 10. External and Optional Infrastructure

Cloudflare Worker、D1、Drizzle、ChatGPT auth 與 examples 是 starter infrastructure，目前不在 gameplay data flow。除非 Sprint 明確需要存檔、排行榜或身份功能，禁止讓 gameplay 依賴這些服務。
