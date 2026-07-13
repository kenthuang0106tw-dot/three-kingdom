# Next Task

## M5 / Task 5.7 — Full-stage acceptance

### Why this is next

All planned Milestone 5 contracts now exist: Boss ownership, attacks, decision
rhythm, hurt/phase/death, arena lock, cleanup, and stage completion. Before
starting Product Flow, the current playable path needs one integrated acceptance
task that finds and fixes only M5 regressions.

### Completion criteria

- Add deterministic acceptance coverage for the existing run: Scene create,
  mixed encounter ownership, Boss lifecycle, arena release, one stage-complete
  event, and restart re-arming.
- Verify the current desktop and responsive touch viewports can reach the
  existing completion path without duplicate Boss, Canvas, event, timer,
  listener, or camera-lock ownership.
- Record known gameplay/content limitations honestly; fix only defects that
  violate an existing M0–M5 contract.
- Preserve current art, combat timing, AI tuning, Stage data, event payloads,
  and React/Phaser boundaries.
- Do not add Result UI, game-flow modes, HUD, audio, scoring, save data, another
  stage, new attacks, new enemies, new art, or unrelated refactors.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Add one integrated deterministic M5 acceptance test covering ordering,
  exactly-once completion, cleanup, and restart ownership.
- Browser smoke completes the development Boss path three times at desktop,
  landscape-touch, and portrait-fitted viewports; each run must have one
  1280×720 Canvas, one completion event, and zero page errors.
- Run the 10-restart smoke after completion and confirm one Boss, zero stale
  completion count, and no duplicate lock ownership.

### Expected files

- `tests/**`
- Existing M5 implementation files only when an acceptance failure proves a defect
- Project status and acceptance documents

### Risks

- Automated smoke can verify ownership and ordering but not final game balance
  or physical-device feel; record those as release QA instead of claiming them.
- Do not turn acceptance work into new gameplay or broad refactoring.
