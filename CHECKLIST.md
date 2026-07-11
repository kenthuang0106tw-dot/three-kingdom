# Validation Checklist

使用方式：每個 Task 複製 Applicable 項目到 PR／commit notes，標記 Pass/Fail/N/A 並附 command、截圖、log 或測試名稱。沒有 evidence 不算 Pass。

## Latest Task Evidence — M0 / Task 0.2

- [x] 30 個目標文字檔以 strict UTF-8 解碼，0 failure、0 `U+FFFD`。
- [x] 常見 mojibake pattern scan 無結果。
- [x] 舊 Canvas runtime 與兩個孤立 CSS 經全 repository reference scan 後移除。
- [x] `pnpm build` 通過。
- [x] Runtime smoke：Phaser Canvas count = 1；背景、玩家、三名敵人載入。
- [x] Browser console error count = 0。

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

## Task Evidence

| Item | Result | Evidence |
|---|---|---|
| Task ID |  |  |
| Commit |  |  |
| Build |  |  |
| Tests |  |  |
| Desktop smoke |  |  |
| Mobile smoke |  |  |
| Known issues |  |  |
