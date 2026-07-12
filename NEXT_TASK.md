# Next Task

## M4 / Task 4.2 — Second melee soldier

### Why this is next

The existing soldier tuning now has a clean boundary. The next content task is
to add one genuinely different melee opponent, proving the config seam with
real behavior rather than speculative framework code.

### Completion criteria

- Add exactly one second melee soldier archetype with distinct attack distance or rhythm.
- Provide real sprite/animation assets and metadata before wiring the archetype.
- Reuse only stable shared contracts; keep per-archetype tuning in config.
- Preserve the current soldier, combat effects, attack director, and cleanup behavior.
- Do not add a third enemy, ranged attacks, Boss, or new stage content.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Add deterministic config, animation metadata, and mixed-soldier behavior tests.
- Browser smoke verifies the current room still renders without runtime errors.

### Expected files

- `app/game/enemy/**`
- `public/art/enemy/**`
- `app/game/EnemyManager.ts`
- `app/game/assets/AssetManifest.ts`
- `tests/**`
- `ARCHITECTURE.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- Missing or weak art may make the behavioral difference unverifiable.
- Stop and report asset gaps instead of recoloring or faking animation with transforms.
