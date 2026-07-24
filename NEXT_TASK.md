# Next Task

## M8 / Task 8.2 — Game-Feel Timing Pass

### Why this is next

The complete Vertical Slice, frozen visual/audio set, product flow, and
performance/delivery budgets are now accepted. The next highest-priority M8
work is to tune the timing of existing combat so attacks, hit reactions, Enemy
pressure, and Boss rhythm feel deliberate across the whole stage. This is a
bounded polish pass over existing parameters, not a feature or content task.

### Completion criteria

- Record a reproducible before baseline for Player attack1–3, ordinary-Enemy
  attack/recovery, Player/Enemy hurt recovery, and all three Boss attacks.
- Centralize only the timing values that must change; do not refactor unrelated
  state machines or create a general balance system.
- Tune existing startup, active, recovery, hit-stop, hurt, and decision/recovery
  timing only where before evidence identifies a readability or responsiveness
  defect.
- Preserve every animation frame sequence, atlas, hitbox geometry, damage,
  health, movement speed, Stage coordinate, Camera rule, Audio cue, UI flow, and
  production asset hash.
- Keep each Player Combo input intentional: one press advances at most one
  stage, missed attacks cannot chain, and active-frame hit records stay once per
  target.
- Keep ordinary enemies vertically dodgeable and limited to one Attack Slot.
- Keep Boss startup telegraphs readable and prevent back-to-back attacks from
  losing their recovery gap.
- Produce matching before/after evidence and a concise table of every changed
  parameter with its reason.
- Preserve the accepted performance and 30 MiB delivery budgets.

### Acceptance method

- Run focused deterministic tests for Player attack phases, Combo gates,
  ordinary-Enemy Attack Slot/recovery, hurt lockouts, Boss decision recovery,
  and pause/hit-stop interaction.
- Browser-test complete combat at normal encounters and Boss on desktop,
  844×390 landscape touch, and 390×844 portrait fit.
- Verify Failure/retry, Result/replay, ten Scene resets, one Canvas, one Audio
  manager, and one gameplay subscription.
- Compare before/after captures or timestamped frame traces at the same
  checkpoints and document the reviewer decision.
- Run `node tools/report_performance_assets.mjs`, `pnpm test`,
  `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Expected files

- Existing Player/Enemy/Boss timing config or metadata files only where evidence
  requires a change
- Focused timing/interaction tests
- A Task 8.2 before/after timing report
- `CHECKLIST.md`, `SPRINT.md`, `GAME_ROADMAP.md`, `TECH_DEBT.md`, `README.md`,
  and `NEXT_TASK.md`

### Risks

- Subjective tuning can become open-ended without a fixed before/after matrix.
- Changing animation FPS can accidentally move active hitbox windows or Combo
  input timing.
- Faster enemies or shorter recovery can remove vertical dodge space.
- Hit-stop and hurt timing share lifecycle ownership; changing one can break
  Pause/resume or input recovery.
- Art, Audio, damage, movement, and content changes would exceed this task.
