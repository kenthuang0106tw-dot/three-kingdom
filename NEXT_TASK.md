# Next Task

## M6A / Task 6A.1 — Visual target, Art Bible, and before/after baseline

### Why this is next

M6 now provides a complete, accepted playable flow across desktop, landscape
touch, portrait FIT, production, Failure/retry, and Result/replay. The approved
post-M6 art upgrade must begin by freezing a measurable visual target before any
production asset is replaced; otherwise character, enemy, stage, effect, and UI
work will drift independently and create avoidable rework.

### Completion criteria

- Update `ART_BIBLE.md` with one coherent original Three Kingdoms Japanese
  realistic pixel-art target: silhouette, anatomy, scale, feet anchor, palette,
  lighting, pixel density, outline/shading, weapon readability, and UI language.
- Record current before baselines for desktop default, 844×390 landscape, and
  390×844 portrait FIT at the same reproducible checkpoints: Title, representative
  combat, Boss arena, Failure, and Result.
- Define explicit visual acceptance criteria for Guan Yu, three melee enemies,
  Boss, the three bamboo sections, combat effects, font, HUD, terminal overlays,
  joystick, and attack control.
- Define asset provenance, source/master/export naming, atlas metadata, feet
  alignment, and debug-sheet requirements without modifying runtime contracts.
- Produce a prioritized gap list and the approved order for 6A.2–6A.6.
- Do not generate, edit, or replace production art in this task.

### Validation

- Every visual rule has an objective comparison method or a named manual review.
- All three viewport baselines use the same gameplay revision and reproducible
  checkpoints; filenames and locations are documented.
- The Art Bible preserves animation timing, hitbox/body geometry, world
  coordinates, camera, combat, AI, flow, and mobile input contracts.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages` remain green after documentation-only work.

### Expected files

- `ART_BIBLE.md`
- `ASSET_PIPELINE.md`
- `CHECKLIST.md`
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `NEXT_TASK.md`
- A documented baseline capture directory only; no production asset or runtime
  source file.

### Risks

- A subjective style description without measurable references will cause every
  later sprite task to reopen the target.
- Captures from different game states or revisions will make before/after
  comparisons invalid.
- Starting image generation or atlas edits during 6A.1 would mix planning with
  6A.2–6A.5 and violate the one-task workflow.
- Copyright-sensitive imitation must be translated into original visual rules,
  not copied characters, frames, logos, or stage art.
