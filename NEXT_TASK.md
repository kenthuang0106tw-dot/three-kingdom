# NEXT_TASK

## M10 / Task 10.4 — Zhang Fei Atlas and Animation Preview

### Why this is next

Task 10.3 accepted Zhang Fei's gameplay hypothesis, immutable visual identity,
47-frame production budget, and atlas/feet/scale contract. The next risk is
whether genuine serpent-spear poses can meet that contract without crop,
identity, continuity, or mobile-readability failure. This must be proven in an
isolated preview before any gameplay comparison or formal character selection.

### Completion conditions

- Follow `docs/planning/m10-zhang-fei-production-contract.md` exactly; open the
  approved concept reference and written identity lock before production.
- Produce 47 genuine poses only: idle 6, walk 8, attack1 6, attack2 7,
  attack3 10, hurt 4, and dead 6.
- Give every attack its contracted startup/active/recovery pose count and a
  continuous serpent-spear arc, hand placement, weight transfer, and facing.
- Build a reproducible 672×448-cell atlas with 6 columns, feet `(336,420)`,
  origin `(0.5,0.9375)`, single scale target `0.64`, measured alpha bounds,
  source rectangles, offsets, phase/facing data, provenance, and unique frame
  hashes.
- Produce red-box, common feet-line, 2 FPS onion-skin, native-size lineup,
  25% silhouette, palette/identity, and atlas metadata QA outputs.
- Add a development-only Zhang Fei animation preview with previous/next frame,
  play/pause, 2/4/6/8/10 FPS, once/loop, onion skin, state selection, fixed
  feet line, and the required metadata readout.
- Verify the preview at Desktop, 844×390, and 390×844.
- Keep the existing Guan Yu runtime and production manifest unchanged.
- Update Asset Pipeline, Roadmap, Sprint, Checklist, Technical Debt, and
  focused tests only as required by the accepted output.
- Do not implement Zhang Fei gameplay values, character selection, formal
  Stage integration, Enemy/Boss changes, or any new system.

### Acceptance and validation

- All 47 frames are distinct genuine poses and preserve one approved identity.
- No body, beard, cloth, spear shaft, or spear tip is clipped or contaminated
  by a neighboring frame.
- Feet stay on the contracted ground line; dead remains grounded; hurt has no
  fake launch; adjacent idle/walk body-top variation stays within tolerance.
- At 25% zoom, Zhang Fei is distinguishable from Guan Yu, Mauler, and Boss by
  silhouette rather than color alone.
- Every attack reads startup, active, and recovery and has a continuous weapon
  path at 2 FPS without transform interpolation.
- Preview metadata matches the generated atlas exactly and survives all three
  viewport checks without overflow or unreadable controls.
- Contract tests prove no Zhang Fei production registration, actor
  instantiation, selection, or gameplay tuning was added.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages` pass.

### Expected files

- `public/art/zhangfei-v2/` source, atlas, metadata, and QA outputs.
- One reproducible Zhang Fei art/atlas build tool.
- Development-only preview wiring in the existing Phaser preview surface.
- `ASSET_PIPELINE.md`
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `CHECKLIST.md`
- `TECH_DEBT.md`
- Focused asset/preview contract tests.

### Risks

- Generated poses drift from the approved heavy-warrior identity.
- The serpent spear is cropped, changes length, or jumps between frames.
- Feet alignment is achieved by state-specific scale instead of metadata.
- Sparse source motion is disguised with transforms or duplicated frames.
- The 4032×3584 atlas or preview is unreadable on mobile.
- Preview work leaks into formal runtime registration or Task 10.5 balance.
