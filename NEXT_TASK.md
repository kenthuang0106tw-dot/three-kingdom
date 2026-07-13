# Next Task

## M4 / Task 4.6 — Multi-archetype regression

### Why this is next

The three melee archetypes are now mixed and tuned. The final M4 task must prove
that hurt, death, cleanup, attack-slot release, and surviving enemies continue
correctly for every archetype before Boss work can begin.

### Completion criteria

- Add deterministic regression coverage for soldier, mauler, and duelist death
  and cleanup paths.
- Verify one archetype's removal does not stop or corrupt the surviving enemies.
- Verify hurt/death releases the Attack Director slot for every archetype.
- Preserve existing gameplay and assets; do not add Boss, enemy types, attacks,
  stage content, UI, or audio.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Browser smoke verifies one 1280×720 Canvas with zero page errors.
- Exercise a mixed-room combat/reset path and record cleanup evidence.

### Expected files

- `tests/**`
- `app/game/EnemyManager.ts` only if a regression exposes a real defect
- `SPRINT.md`, `GAME_ROADMAP.md`, `CHECKLIST.md`, `TECH_DEBT.md`, `README.md`

### Risks

- Source-only assertions can miss lifecycle bugs. Prefer pure contract coverage
  plus a real browser combat/reset smoke, without creating a parallel simulator.
