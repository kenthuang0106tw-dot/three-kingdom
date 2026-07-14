# Next Task

## M6 / Task 6.2 — Title/start

### Why this is next

Task 6.1 now provides one tested owner for `title` and `playing`. The smallest
playable product-flow increment is a Title presentation that starts exactly one
existing run through that contract. Pause, Failure, Result, HUD, audio, and
gameplay changes remain separate later tasks.

### Completion criteria

- Present a minimal Title mode without replacing the arcade shell or creating a
  second Phaser instance.
- Keyboard and Phaser touch/pointer input can each transition `title` to
  `playing` exactly once.
- Starting reveals/enables the existing accepted game runtime; it does not
  recreate actors, register duplicate listeners, or restart an already-playing
  run.
- The game-flow state remains the sole product-mode owner; React may host Phaser
  but must not duplicate the mode in React state.
- Do not add Pause, Failure, Result, HUD, audio, persistence, new gameplay, or
  visual polish.

### Validation

- Deterministic tests cover one keyboard start, one pointer/touch start, repeated
  start input, and reset-to-title re-arming without duplicate ownership.
- `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck` pass.
- Browser smoke verifies one 1280×720 Canvas, visible Title mode, one start
  transition, unchanged playable room after start, zero console errors, and ten
  restart cycles without a second Phaser instance.

### Estimated files

- `app/game/flow/**`
- `app/game/MainScene.ts` or one narrowly scoped Phaser presentation module
- `tests/app-contracts.test.mjs`
- Project status/evidence documents

### Risks

- React and Phaser must not both own Title state.
- Starting by restarting the Scene could duplicate lifecycle resources; prefer
  one explicit transition over a second runtime path.
- Touch start input must not leak into the first gameplay attack or movement
  frame.
