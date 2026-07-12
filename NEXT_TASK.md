# Next Task

## M1 / Task 1.3 — Pause, Hit-Stop, and Visibility Clock Contract

### Why this is next

Touch input now shares the action snapshot boundary. The next P0 foundation is a single clock/lifecycle contract so pause, hit-stop, tab visibility, timers, and animation state cannot drift apart.

### Completion criteria

- Define one Phaser-facing time/lifecycle contract for pause, hit-stop, and document visibility.
- Background/hidden state pauses gameplay updates without leaving stuck input or timers.
- Resuming restores input and timers exactly once.
- Existing hit-stop behavior remains intact.
- No DOM gameplay listeners, intervals, or React gameplay state are introduced.

### Validation

- Add deterministic contract tests for pause/resume and visibility transitions.
- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Browser smoke: hide/show or pause/resume once, then verify movement, attack, and console errors.

### Expected files

- `app/game/time/` or the smallest existing lifecycle module
- `app/game/MainScene.ts`
- `tests/**`
- `ARCHITECTURE.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `TECH_DEBT.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- Phaser clocks and global animation/tween managers may pause at different times.
- Browser visibility events can fire more than once during focus changes.
- Existing hit-stop delayed callbacks must not be frozen by the new contract.
