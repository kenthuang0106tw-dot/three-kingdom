# Next Task

## M1 / Task 1.8 — Scene Reset Smoke Test

### Why this is next

Reset/restart is the remaining P0 runtime contract before gameplay ownership is expanded. Proving repeated Scene resets do not leak listeners, timers, colliders, or Phaser instances prevents later combat and stage work from accumulating state.

### Completion criteria

- Add a development-only reset/restart smoke path without adding gameplay features.
- Repeatedly reset the Scene and prove one active Phaser instance, one input set, and no stale timers, colliders, or event listeners.
- Preserve current player, enemy, touch, mobile, and event behavior.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Browser smoke performs at least 10 resets with one Canvas and zero console errors.

### Expected files

- `app/game/MainScene.ts`
- `app/game/phaserLifecycle.ts`
- `app/game/time/LifecycleClock.ts`
- `tests/**`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- Phaser Scene restart can retain delayed callbacks or input listeners if shutdown cleanup is incomplete.
- Reset assertions must observe lifecycle boundaries without coupling tests to private actor implementation details.
