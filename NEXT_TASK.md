# Next Task

## M4 / Task 4.4 — Mixed encounter composition

### Why this is next

Three melee archetypes now have real assets, metadata, and distinct tuning.
The next task is to place them into a controlled mixed encounter and verify
Attack Slot fairness, Y alignment, spacing, and cleanup together.

### Completion criteria

- Add one deterministic mixed encounter using the existing soldier, mauler, and duelist.
- Keep at most one attacker through the existing Attack Director.
- Preserve per-enemy config, hit records, hurt/death cleanup, and camera lock lifecycle.
- Do not add a fourth enemy, ranged attacks, Boss, or new stage content.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Add deterministic composition, attack-slot, Y-alignment, spacing, and cleanup tests.
- Browser smoke verifies the current room still renders without runtime errors.

### Expected files

- `app/game/stage/**`
- `app/game/enemy/**`
- `app/game/EnemyManager.ts`
- `app/game/MainScene.ts`
- `tests/**`
- `ARCHITECTURE.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- Mixed archetypes can expose manager assumptions about shared frame sizes or timing.
- Keep composition deterministic and fix only contract-level issues discovered by tests.
