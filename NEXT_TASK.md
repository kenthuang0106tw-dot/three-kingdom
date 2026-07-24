# Next Task

## M8 / Task 8.1 — Performance Budget and Baseline

### Why this is next

The playable Vertical Slice, frozen visual set, and accepted Audio milestone are
complete. Before timing polish, atlas optimization, pooling, or release QA, the
project needs one reproducible performance baseline so later work responds to
measured bottlenecks instead of assumptions.

### Completion criteria

- Define explicit desktop, 844×390 landscape, and 390×844 portrait budgets for
  average FPS, 1% low FPS, worst frame time, encoded load size, decoded texture
  estimate, runtime texture count, and memory when the browser exposes it.
- Measure Title, normal combat, encounter handoff, Boss combat, Failure/retry,
  and Result/replay checkpoints from the production-equivalent Vertical Slice.
- Use a fixed warm-up, sample count, viewport, route, revision, and checkpoint
  procedure so another developer can reproduce every measurement.
- Reuse the accepted M6A profiling seam where possible. Any new instrumentation
  must be development-only, readonly, lifecycle-clean, and absent from
  production presentation.
- Record unsupported browser metrics as unavailable rather than estimating or
  substituting a different metric.
- Produce a baseline report identifying any budget failure and its measured
  source, but do not implement optimization, pooling, atlas changes, gameplay
  tuning, content, art, UI, or Audio changes in this task.

### Validation

- Capture at least 60 warm-up frames followed by 300 measured frames at each
  required gameplay checkpoint and viewport.
- Verify measurements are stable across two runs within a documented tolerance.
- Verify one Canvas and no listener, timer, texture, actor, or Audio ownership
  growth across ten retry/replay Scene resets.
- Run development and local production browser smoke; production must not expose
  profiling overlays or development datasets.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Expected files

- `docs/performance/m8-performance-baseline.md`
- Focused profiling utility or development-only Scene seam only if existing
  M6A instrumentation cannot produce the required evidence
- Focused tests for metric calculation and production stripping
- `CHECKLIST.md`, `SPRINT.md`, `GAME_ROADMAP.md`, `TECH_DEBT.md`, `README.md`,
  and `NEXT_TASK.md`

### Risks

- Device-specific memory APIs may be unavailable or non-comparable.
- Debug overlays and browser automation can distort frame-time measurements.
- A single idle checkpoint can hide combat, transition, or cleanup spikes.
- Premature optimization would mix Task 8.1 measurement with later Tasks 8.4
  or 8.5 and invalidate the baseline.
