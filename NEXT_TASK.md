# Next Task

## M2 / Task 2.7 — EnemyManager Cleanup and Director Tests

### Why this is next

Player lifecycle, combat resolution, and hit effects now have explicit seams.
The remaining M2 risk is EnemyManager ownership of cleanup, attack-slot release,
and deterministic director timing before the combat-room acceptance task.

### Completion criteria

- Add focused deterministic tests for EnemyManager cleanup, attack-slot release, hurt cancellation, death removal, and director delay.
- Preserve the existing three-enemy formation, AI distances, attack behavior, and effect callbacks.
- Ensure destroyed enemies remove bodies, hitboxes, listeners, colliders, timers, and manager references.
- Do not add enemy types, new attacks, UI, or stage behavior.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Browser smoke verifies enemy hurt/death cleanup and continued operation of surviving enemies with one Canvas and zero visible runtime errors.

### Expected files

- `app/game/EnemyManager.ts`
- `app/game/time/**`
- `tests/**`
- `ARCHITECTURE.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- Phaser object destruction and delayed callbacks are tightly coupled to manager cleanup.
- Keep the task test-focused and behavior-preserving; do not begin the full combat-room acceptance task.
