# Current Sprint — Sprint 0: Trusted Development Baseline

## Sprint Goal

在不增加 gameplay 的前提下，將目前 prototype 整理成可安全繼續開發的 baseline：可提交、可啟動、可 typecheck、可測試、文件可讀。

## Cadence

- Duration：2 weeks
- Capacity：1 developer + AI，約 40–55 hours
- Milestone：M0 only
- Scope rule：禁止加入 Stage、Boss、新角色、新招式、Audio 或 Mobile controls

## Task List

| Order | Task | Estimate | Deliverable | Verification |
|---:|---|---:|---|---|
| 1 | ✅ Audit and commit Phase 3/4 baseline | 3–5h | `bae05a1` baseline commit | build + desktop combat smoke passed |
| 2 | ✅ M0 / Task 0.2 — Restore repository text and single runtime | 9–14h | UTF-8 evidence、可讀 launch scripts、單一 Phaser runtime | 30-file UTF-8 scan + reference scan + build + runtime smoke passed |
| 3 | ▶ M0 / Task 0.3 — Package and Type Boundaries | 8–13h | 單一 pnpm lockfile、browser/worker type boundaries | clean install + build + lint + typecheck |
| 6 | Replace starter tests | 10–14h | shell/lifecycle/combat minimum tests | `pnpm test` exit 0 |
| 7 | Validate dev/start asset routes | 4–6h | 無 module/asset 404 | HTTP smoke + browser console |
| 8 | Desktop/mobile smoke matrix | 4–6h | evidence-filled checklist | Chrome desktop + Android/iOS landscape |
| 9 | Close sprint documentation | 2–3h | Roadmap/Debt/Assets/Checklist updated | review + single-purpose commits |

## Detailed Acceptance

### Baseline

- [x] Current Phaser multi-enemy prototype 有清楚 commit：`bae05a1`。
- [x] Worktree clean。
- [x] Checkout 後依 README 可重建並通過 desktop combat smoke。

### Toolchain

- [ ] Node requirement 與 package manager 明確。
- [ ] 只保留 pnpm lockfile。
- [ ] `pnpm dev` 可啟動。
- [ ] `pnpm build` 通過。
- [ ] `pnpm lint` 通過。
- [ ] `pnpm typecheck` 通過。
- [ ] `pnpm test` 通過。

### Repository

- [x] 正式 runtime 只有 Phaser。
- [x] 文件與 UI 沒有 mojibake；30 個目標文字檔嚴格 UTF-8 解碼通過。
- [ ] Starter tests、starter README、未使用 preview contract 已移除或重寫。
- [ ] Cloudflare/browser TypeScript surface 正確隔離。

### Runtime Smoke

- [x] Phaser instance 只建立一次；Task 0.2 smoke 的 Canvas count = 1。
- [ ] Keyboard keyup 正常。
- [ ] 三名 Enemy 可生成、移動、輪流攻擊、受擊、死亡。
- [ ] Scene shutdown 無 listener/collider error。
- [ ] Production HTML、JS、atlas、PNG route 都是 200。
- [x] Browser console 無 error（Task 0.2 runtime smoke）。

## Risks

| Risk | Mitigation |
|---|---|
| 編碼原文無法還原 | 只重建可確認內容；產品文案另行確認，不猜測 |
| 清除 legacy code 誤刪素材引用 | 先做引用圖與 baseline screenshot |
| Typecheck 被 Cloudflare ambient types 阻擋 | 分離 app/worker tsconfig，不關閉 strict |
| Tests 過度依賴 Phaser renderer | 優先測 state/config/manager contracts；renderer 用 smoke test |
| Production asset route 只在特定 server 失敗 | 對實際 `start`/hosting route 建 HTTP integration test |

## Sprint Exit

全部 Acceptance 完成、`CHECKLIST.md` 有 evidence、Technical Debt 更新並建立 Sprint close commit。未完成項目留在本 Sprint，不得提前開始 M1。
