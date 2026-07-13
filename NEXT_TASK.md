# Next Task

## M6 / Task 6.1 — Game-flow modes and reset ownership

### Why this is next

Milestone 5 now has an accepted, exactly-once stage-completion path. Product UI
must not be added until one Phaser-free flow contract defines who owns
`title`, `playing`, `paused`, `failed`, and `cleared` transitions and how a new
run resets them. This prevents Title, Pause, Failure, and Result screens from
inventing competing Scene state later.

### Completion criteria

- Add one Phaser-free game-flow state machine for `title`, `playing`, `paused`,
  `failed`, and `cleared`.
- Define and test legal transitions, invalid-transition behavior, and one
  explicit new-run reset path.
- Keep actors, Phaser objects, React state, UI presentation, and persistence out
  of the flow contract.
- Connect existing lifecycle signals only if required to prove ownership; do not
  add Title, Pause, Failure, Result, HUD, audio, or new gameplay.
- Preserve all M0–M5 runtime, combat, Boss, completion, and restart contracts.

### Validation

- Deterministic unit tests cover every legal transition, representative illegal
  transitions, cleared/failed terminal handling, and reset re-arming.
- `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck` pass.
- Browser smoke retains one 1280×720 Canvas, the current playable room, and zero
  page errors; the 10-restart smoke retains one Boss and no stale completion.

### Expected files

- `app/game/flow/**`
- `tests/**`
- `app/game/MainScene.ts` only if a tested ownership connection requires it
- Project status and acceptance documents

### Risks

- Duplicating Phaser Scene lifecycle or React state would create two flow owners.
- Adding UI in this task would mix contract work with M6.2–M6.6 and increase
  rework; keep this task presentation-free.
