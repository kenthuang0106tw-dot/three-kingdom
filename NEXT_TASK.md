# NEXT_TASK

## M8 / Task 8.7 — Full QA Matrix

### Why this is next

The formal three-screen Stage now includes all five production enemy roles and
all planned M8 implementation tasks are complete. Before release work, the
project needs one evidence-driven regression pass across the complete playable
slice. This task verifies existing contracts; it does not add or retune
features.

### Completion conditions

- Execute every applicable item in `CHECKLIST.md` across Title, formal
  five-enemy Stage, Boss, Failure/Retry, Result/Replay, Pause, mobile controls,
  accessibility settings, Audio, Camera, combat, and reset ownership.
- Record Desktop, 844×390, and 390×844 evidence with one Canvas, no document
  overflow, no missing asset, and zero runtime error.
- Confirm all five enemy roles visibly enter formal combat and cannot block
  encounter clear, Boss entry, Failure, Result, Retry, or Replay.
- Confirm production excludes physics/debug overlays, diagnostic datasets, and
  development-only entrances.
- Classify every discovered defect by severity. Fix no unrelated issue inside
  this task; any required fix must become one explicit follow-up task.
- Produce a final QA matrix and a release-readiness recommendation backed by
  reproducible evidence.

### Acceptance and validation

- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `pnpm build:github-pages`
- Development and production browser matrix on Desktop, 844×390, and 390×844.
- At least one deterministic full-stage success path, Failure/Retry path,
  Result/Replay path, Pause/resume path, and accessibility-toggle path.
- No Critical or High defect may remain open for a release-readiness pass.

### Expected files

- Focused regression tests only if an acceptance contract lacks coverage.
- `docs/quality/m8-7-full-qa-matrix.md`.
- `GAME_ROADMAP.md`, `SPRINT.md`, `CHECKLIST.md`, `TECH_DEBT.md`, and
  `NEXT_TASK.md` closeout updates.

### Risks

- The matrix can become unbounded if testing is mixed with feature work.
- Automated smoke paths may hide physical touch or audio-unlock defects.
- A late Critical/High defect may require stopping QA and creating one separate
  corrective task rather than claiming release readiness.
