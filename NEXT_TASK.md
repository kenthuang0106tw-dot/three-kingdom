# Next Task

## M5R / Task 5R.8 — End-to-end Vertical Slice acceptance

### Why this is next

Tasks 5R.1–5R.7 now provide the complete three-screen traversal, two ordered
encounters, gated Boss arena, reciprocal Boss combat, deterministic failure and
restart, and exactly-once cleared terminal flow. The remaining recovery gate is
to prove these pieces work together through real player input without diagnostic
shortcuts before product UI work resumes.

### Completion criteria

- Starting from the Phaser Title, a player can traverse the full three-screen
  Stage, trigger and clear both encounters in order, enter the Boss arena,
  defeat the Boss, and reach `cleared` without a smoke shortcut.
- A separate real run can reach `failed`, use the existing explicit retry, and
  restart at Title with Player HP, Stage progression, actors, locks, timers,
  hitboxes, and camera state reset.
- Desktop, 844×390 landscape touch, and 390×844 portrait FIT each complete the
  required run with one Canvas, no soft lock, and zero runtime errors.
- Encounter and Boss gates cannot be skipped, duplicated, or entered backward;
  normal movement and vertical dodging remain usable throughout the run.
- Acceptance may fix only defects that block this existing Vertical Slice. No
  HUD, Pause, Result/replay, audio, scoring, persistence, new content, art,
  attacks, enemies, balance pass, or next Milestone work is added.

### Validation

- Add or update deterministic integration coverage only where a discovered
  end-to-end ownership defect requires it.
- Perform real browser runs from Title through `cleared` at desktop, 844×390
  landscape touch, and 390×844 portrait FIT; diagnostic query shortcuts do not
  count as the main acceptance evidence.
- Perform one real Player failure and explicit retry path, then verify the
  documented initial state and one Canvas.
- Re-run Boss attack, Boss clear ordering, encounter sequencing, and Scene reset
  regressions with zero browser errors.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Estimated files

- `tests/app-contracts.test.mjs` only if a missing deterministic seam is found
- Existing Stage/MainScene/input modules only if a real acceptance blocker is found
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `NEXT_TASK.md`
- `ARCHITECTURE.md`
- `TECH_DEBT.md`
- `CHECKLIST.md`

### Estimated risk

- Diagnostic smokes can hide a real traversal, input, gate, or combat soft lock;
  they cannot substitute for full player-input runs.
- Mobile touch runs may expose pointer ownership or viewport-fit defects not
  visible in desktop keyboard play.
- Fixing an acceptance blocker can easily expand into balance, UI, or content;
  any change must remain the smallest correction to the existing Vertical Slice.
