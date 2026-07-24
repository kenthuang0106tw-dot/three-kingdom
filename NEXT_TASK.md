# Next Task

## M8 / Task 8.4 — Production Asset Packaging and Memory Optimization

### Why this is next

Task 8.1 found one objective budget failure: the GitHub Pages artifact is
125,451,173 bytes (119.64 MiB) against a 30 MiB budget, while the assets the
game actually requests are only 12,891,503 bytes (12.29 MiB). Vite currently
copies source, debug, onion-skin, silhouette, overview, and other QA files from
`public/` into production. Correcting that packaging boundary is the smallest
evidence-backed performance task and avoids speculative pooling or frozen-art
changes.

### Completion criteria

- Inventory every production runtime asset reference, including manifest
  entries, atlas image requests, React shell side art, fonts, effects, and audio.
- Preserve all source/debug/QA files in the repository while excluding files
  that no production route can request from `dist` and `dist-github`.
- Keep all frozen runtime asset bytes and visual hashes unchanged.
- Reduce the GitHub Pages artifact to at most 30 MiB.
- Keep requested runtime asset bytes at or below the accepted 15 MiB budget.
- Keep estimated decoded RGBA textures at or below 140 MiB; because the current
  value already passes, do not rebuild atlases or alter runtime art in this task.
- Verify every required production asset route returns 200 with the correct
  content type and no missing requests.
- Verify Title, Combat, Handoff, Boss, Failure, and Result on desktop,
  844×390 landscape fit, and 390×844 portrait fit without a visual or gameplay
  regression.
- Preserve one Canvas, one Audio manager, one gameplay subscription, and stable
  reset ownership.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Acceptance method

- Run `node tools/report_performance_assets.mjs` after both production builds
  and record the artifact/runtime/decoded/JavaScript totals.
- Compare the frozen runtime asset hash inventory before and after packaging.
- Run route coverage tests against both local production outputs.
- Run local production browser smoke at the six accepted checkpoints and three
  viewport profiles; confirm zero console/runtime errors.
- Re-run the ten-cycle reset, Failure/retry, and Result/replay ownership smokes.

### Expected files

- Production/GitHub Pages build configuration or a focused packaging utility
- Focused packaging, route, and frozen-hash tests
- `docs/performance/m8-performance-baseline.md` or a Task 8.4 result addendum
- `ASSET_PIPELINE.md`, `CHECKLIST.md`, `SPRINT.md`, `GAME_ROADMAP.md`,
  `TECH_DEBT.md`, `README.md`, and `NEXT_TASK.md`

### Risks

- React shell side art and atlas images are indirect references outside the
  manifest and can be omitted by an incomplete inventory.
- Filtering `public/` too broadly can cause production-only 404s.
- Moving or regenerating frozen assets would create unnecessary visual risk;
  this task must change packaging, not source art.
- The decoded texture budget is close to its limit, but optimizing it now would
  mix a passing metric into the confirmed packaging failure.
