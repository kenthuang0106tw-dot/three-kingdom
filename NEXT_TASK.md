# Next Task

## M6A / Task 6A.4 — Three-screen bamboo stage upgrade

### Why this is next

The Player, three enemy archetypes, and Boss now share the accepted visual
contract. The largest remaining mismatch is the 3840×720 world repeating the
same prototype `forest-camp.png` three times. Stage art must become readable
before Effects or product UI can be judged against the final combat backdrop.

### Completion criteria

- Preserve the existing 3840×720 world, two encounter triggers, Boss entry,
  walk bounds, camera locks, handoff policy, physics, and all world coordinates.
- Create three visually distinct but seamless sections: Forest Entry, Forest
  Ambush, and Boss Arena, following `ART_BIBLE.md` landmarks and value bands.
- Separate background, ground, and foreground-occlusion layers with explicit
  depth metadata; no layer may hide active poses, telegraphs, HUD, or controls.
- Keep the ground feet plane readable across every seam and viewport.
- Commit source, processed runtime assets, metadata, provenance, seam/depth QA,
  three-section overview, and reproducible tooling.
- Do not modify actors, animation, combat, AI, balance, Effects, UI, Audio, or
  add encounters/content.

### Validation

- Native-size and 25% review distinguishes all three sections immediately.
- A 3840px overview and seam crops show no gap, repeat, stretch, or color break.
- Runtime traversal verifies background/foreground depth, camera handoff, both
  encounters, Boss arena, Failure, and Result at desktop, 844×390 landscape,
  and 390×844 portrait FIT.
- One Canvas, no console errors, and existing gameplay contracts remain green.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Expected files

- `public/scene/` source/runtime section and layer assets
- Stage asset metadata, provenance, overview/seam/depth QA
- Focused reproducible Stage art build tooling
- Minimal Stage rendering/manifest integration and focused tests
- `ASSET_PIPELINE.md`, `CHECKLIST.md`, `SPRINT.md`, `GAME_ROADMAP.md`,
  `TECH_DEBT.md`, `README.md`, and `NEXT_TASK.md`

### Risks

- New layers can accidentally alter collision or camera ownership; geometry and
  Stage flow are frozen.
- Foreground art can obscure combat or mobile controls; depth and occlusion need
  explicit runtime review.
- Three independently generated sections may drift in horizon, light, palette,
  or seam continuity; reject inconsistent art rather than hiding seams with
  camera or gameplay changes.
