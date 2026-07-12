# Next Task

## M2 / Task 2.8 — Combat-Room Acceptance

### Why this is next

The player lifecycle, attack timing, combat resolution, hit effects, and
EnemyManager cleanup seams are now in place. The next task is a behavior-only
acceptance pass that verifies the complete three-enemy combat room before Stage
work begins.

### Completion criteria

- Add deterministic acceptance coverage for three-enemy formation, attack-slot exclusivity, Y alignment, multi-target hit records, hurt lockout, death cleanup, and surviving-enemy continuity.
- Preserve all current gameplay parameters and visuals; do not add new content.
- Add a development-only combat-room smoke path if needed, without adding production UI or stage flow.
- Document any remaining non-blocking issues with evidence.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Browser smoke verifies the full combat-room loop with one Canvas, no visible runtime errors, and no duplicate Phaser instances after reset.

### Expected files

- `app/game/EnemyManager.ts`
- `app/game/MainScene.ts`
- `tests/**`
- `CHECKLIST.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `README.md`

### Risks

- Browser input and Phaser timing make full combat interaction difficult to automate reliably.
- Keep this as an acceptance/test task; do not begin StageConfig, camera follow, or new gameplay content.
