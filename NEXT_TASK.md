# Next Task

## M4 / Task 4.1 — EnemyConfig boundary

### Why this is next

Milestone 3 now has a validated single-room traversal path. The next smallest
content foundation is to separate enemy tuning data from EnemyManager before
adding additional archetypes or encounter compositions.

### Completion criteria

- Define a minimal Phaser-free EnemyConfig for the existing soldier.
- Move only stable tuning values: HP, movement speed, detection, attack ranges, and timing.
- Keep EnemyManager behavior and current enemy visuals unchanged.
- Do not add a second enemy type, new AI, new assets, or encounter content.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Add deterministic config validation and current-soldier parity tests.
- Browser smoke verifies one Canvas, no runtime errors, and unchanged combat-room behavior.

### Expected files

- `app/game/enemy/**`
- `app/game/EnemyManager.ts`
- `tests/**`
- `ARCHITECTURE.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- Over-generalizing EnemyConfig could force premature archetype abstractions.
- Keep the schema data-only and limited to values already used by the soldier.
