# Next Task

## M6A / Task 6A.5 — Combat effects and product UI art upgrade

### Why this is next

The cast and all three Stage sections now share the accepted Art Bible. The
remaining visible prototype mismatch is the procedural combat effects and
product-flow UI. They must be judged against the final Stage before the visual
freeze, while gameplay timing, damage, flow, and mobile input remain unchanged.

### Completion criteria

- Replace prototype Hit Spark, impact, dust, and ground-shadow presentation with
  original pixel-art assets that follow `ART_BIBLE.md`.
- Upgrade Title, Player/Boss HUD, Pause, Failure, and Result presentation plus
  the runtime pixel font into one coherent visual language.
- Preserve every animation timing, active frame, hitbox, damage value, state
  transition, camera behavior, safe area, pointer target, and world coordinate.
- Effects must remain readable on all three Stage sections without obscuring
  actors, telegraphs, HUD, or mobile controls.
- Commit source/runtime assets, metadata, provenance, comparison QA, and focused
  reproducible tooling.
- Do not modify actors, Stage art, AI, balance, Audio, encounter flow, or add
  content.

### Validation

- Capture matching effect and UI states at desktop, 844×390 landscape, and
  390×844 portrait FIT.
- Verify hit effects play once per accepted hit and preserve current Hit Stop,
  camera shake, flash, knockback, damage, and combo contracts.
- Verify Title/start, Pause/resume, Failure/retry, Result/replay, Player HUD, and
  Boss HUD remain operable with keyboard and touch.
- One Canvas, no console errors, no clipping, and existing gameplay contracts
  remain green.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Expected files

- `public/art/effects/` source/runtime effect assets and metadata
- Product UI/font assets and manifest entries
- Minimal Phaser effect/UI rendering integration and focused tests
- Reproducible effect/UI asset tooling and comparison QA
- `ASSET_PIPELINE.md`, `CHECKLIST.md`, `SPRINT.md`, `GAME_ROADMAP.md`,
  `TECH_DEBT.md`, `README.md`, and `NEXT_TASK.md`

### Risks

- Effect sprites may change perceived hit timing even when gameplay values do
  not change; compare frame-by-frame against current contracts.
- UI art can reduce mobile safe-area or pointer usability; retain fixed
  camera-space ownership and test all three viewports.
- Scope can expand into redesigning gameplay or Stage art; reject any change
  not required for Effects/UI visual consistency.
