# Next Task

## M4 / Task 4.3 — Third melee soldier

### Why this is next

The second melee archetype now proves that real assets and per-archetype tuning
can coexist without changing the current room. The next bounded content task is
one more genuinely different close-range opponent before composition work.

### Completion criteria

- Add exactly one third melee soldier archetype with real distinct behavior.
- Provide real sprite/animation assets and atlas metadata before wiring it.
- Keep the existing soldier and mauler assets/configs unchanged.
- Do not add mixed encounters, ranged attacks, Boss, or new stage content.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Add deterministic config, metadata, and asset-route tests.
- Browser smoke verifies the current room still renders without runtime errors.

### Expected files

- `app/game/enemy/**`
- `public/art/enemy/**`
- `app/game/assets/AssetManifest.ts`
- `tests/**`
- `ARCHITECTURE.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- Third-archetype art may not have enough distinct poses or consistent feet anchors.
- Stop and report asset gaps instead of reusing or faking existing animations.
