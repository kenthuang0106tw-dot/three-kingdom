# Next Task

## M2 / Task 2.1 — Player State Machine

### Why this is next

Milestone 1 runtime contracts are complete: input, touch, lifecycle, events, deterministic time, mobile scaling, reset cleanup, and asset loading now have explicit boundaries. The highest-priority next step is to isolate player state transitions before extracting visual, physics, and attack ownership.

### Completion criteria

- Define a pure, explicit Player State Machine for the current idle, walk, attack1, attack2, attack3, and hurt states.
- Encode allowed transitions and reject invalid transitions deterministically.
- Preserve current controls, combo timing, hit effects, animations, and scene behavior.
- Add focused transition tests without introducing new gameplay states or UI.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Browser smoke verifies idle/walk/attack/hurt transitions with one Canvas and zero console errors.

### Expected files

- `app/game/player/**`
- `app/game/MainScene.ts`
- `tests/**`
- `ARCHITECTURE.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- Extracting transitions can desynchronize combo completion and animation listeners if ownership is moved too broadly.
- The first extraction must remain pure and avoid rewriting actor, physics, or combat behavior in the same task.
