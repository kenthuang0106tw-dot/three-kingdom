# Next Task

## M4 / Task 4.5 — Encounter tuning pass

### Why this is next

The deterministic mixed encounter now proves that three distinct melee
archetypes can coexist without breaking Attack Slot ownership, Y alignment,
spacing, or cleanup. The next smallest step is to tune the existing values so
the room has a readable 30–90 second rhythm without adding content.

### Completion criteria

- Tune only existing soldier, mauler, duelist, and encounter values.
- Preserve one Attack Director slot, per-enemy cleanup, Y alignment, and bounds.
- Keep the room deterministic and playable with no new archetype, ranged attack,
  Boss, stage, UI, or audio feature.
- Add or update contract tests for the chosen timing and spacing limits.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Browser smoke verifies one 1280×720 Canvas with zero page errors.
- Record deterministic encounter duration, movement/spacing behavior, and attack
  slot exclusivity in the task evidence.

### Expected files

- `app/game/enemy/EnemyConfig.ts`
- `app/game/stage/StageConfig.ts`
- `app/game/EnemyManager.ts` (only if contract evidence requires it)
- `tests/**`
- `SPRINT.md`, `GAME_ROADMAP.md`, `CHECKLIST.md`, `TECH_DEBT.md`, `README.md`

### Risks

- Tuning can create a soft lock, excessive simultaneous pressure, or an encounter
  that ends too quickly. Use deterministic tests and browser observation before
  committing any value changes.
