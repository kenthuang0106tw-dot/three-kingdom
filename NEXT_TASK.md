# Next Task

## M6A / Task 6A.6 — Visual acceptance and asset freeze

### Why this is next

The visual target, Guan Yu, Enemy/Boss cast, three-screen Stage, combat effects,
and product UI are now implemented. Before Audio begins, the project needs one
objective full-run review and a frozen asset/provenance baseline so later work
does not reopen the entire art direction or hide performance regressions.

### Completion criteria

- Capture matching after images for every accepted M6A.1 before baseline at
  desktop, 844×390 landscape, and 390×844 portrait FIT.
- Complete one Title-to-Boss-clear run plus Failure/retry and Result/replay
  checks without changing gameplay or art.
- Audit all M6A runtime assets for provenance, dimensions, atlas metadata,
  alpha bounds, feet anchors, visual seams, naming, and manifest ownership.
- Record initial load size, texture count, Canvas count, runtime errors, and a
  reproducible 60 FPS/performance baseline.
- Publish a finite defect list; fix only objective clipping, contamination,
  missing-file, alignment, readability, or runtime defects discovered by the
  audit.
- Mark the accepted M6A asset set frozen. Do not redesign, regenerate, add, or
  rebalance content.

### Validation

- Compare all matching before/after captures and record pass/fail per checkpoint.
- Verify animation feet anchors, Stage seams/depth, effect readability, UI safe
  areas, touch targets, and full-flow controls in all three viewports.
- Verify one Canvas, zero console errors, no missing asset requests, and no
  production debug leakage.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Expected files

- `docs/visual-baselines/m6a-6a6-after/`
- M6A visual acceptance/freeze record and asset/load budget evidence
- Focused validation tooling or tests only where reproducibility requires them
- `ASSET_PIPELINE.md`, `CHECKLIST.md`, `SPRINT.md`, `GAME_ROADMAP.md`,
  `TECH_DEBT.md`, `README.md`, and `NEXT_TASK.md`

### Risks

- Subjective review can expand into another art-production cycle; only objective
  defects against `ART_BIBLE.md` and existing contracts may be fixed.
- Full-run capture can vary by timing; use documented deterministic checkpoints
  without altering production behavior.
- Asset-size or frame-time findings may tempt premature optimization; record the
  baseline and only fix a measured acceptance failure.
