# Next Task

## M3 / Task 3.6 — Stage exit and restart

### Why this is next

The current room now has explicit StageConfig, bounds, camera lock, spawn, and
all-clear contracts. The next smallest playable Stage step is to define a
single exit/restart transition without adding a second level or content.

### Completion criteria

- Define a minimal Phaser-free stage exit and restart contract.
- Trigger the existing room's exit only after its encounter is clear.
- Reset player, enemies, camera lock, timers, and listeners through the existing Scene lifecycle.
- Preserve the current combat room and avoid adding a second stage.
- Do not add title flow, save data, respawn waves, or new UI.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Add deterministic tests for exit eligibility, restart transition, and reset.
- Browser smoke verifies one Canvas, no runtime errors, and a clean restart path.

### Expected files

- `app/game/stage/**`
- `app/game/MainScene.ts`
- `app/game/EnemyManager.ts`
- `tests/**`
- `ARCHITECTURE.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- Exit eligibility could become coupled to presentation text or camera state.
- Keep the contract data-driven and limited to one room; defer full game-flow UI.
