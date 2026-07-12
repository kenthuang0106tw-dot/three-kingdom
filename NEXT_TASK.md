# Next Task

## M1 / Task 1.6 — Deterministic Seed and Test Clock

### Why this is next

Readonly gameplay observations now provide a stable boundary for consumers. The next P0 foundation is deterministic randomness and time injection for reproducible enemy-director and combat tests; the P1 asset manifest can follow without blocking gameplay determinism.

### Completion criteria

- Add a small seeded RNG adapter for gameplay randomness.
- Add a test-clock adapter for code that currently reads gameplay time directly.
- Migrate only the existing random/recovery timing seams needed by EnemyManager and lifecycle tests.
- Existing gameplay behavior remains unchanged in normal runtime.
- Add deterministic tests proving the same seed and clock produce the same results.
- Do not add new gameplay, enemies, UI, audio, or release hosting.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Browser smoke: load the combat room, verify one Canvas and zero console errors.
- Confirm keyboard/touch input, hit-stop, enemy timing, and readonly snapshots still work.

### Expected files

- `app/game/time/` or the smallest RNG/clock contract modules
- `app/game/EnemyManager.ts`
- `app/game/MainScene.ts`
- `tests/**`
- `ARCHITECTURE.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `TECH_DEBT.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- Replacing Phaser runtime time globally could break hit-stop; inject only the required seams.
- Seeded randomness must not leak mutable global state.
- Test-only clock behavior must remain identical to normal Phaser time in production.
