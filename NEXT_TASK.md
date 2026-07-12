# Next Task

## M2 / Task 2.6 — Player Hurt, Dead, and Restart

### Why this is next

Player attack timing, hit resolution, and hit presentation now have explicit
boundaries. The next dependency-ready task is to isolate the player damage,
hurt lockout, death, and reset flow without adding Game Over UI or new combat
rules.

### Completion criteria

- Define a focused player hurt/dead/restart contract for the existing HP flow.
- Preserve the current 300ms hurt lockout, flash, knockback, and hit-stop behavior.
- Keep Game Over UI, continue screens, and new player abilities out of scope.
- Add deterministic tests for HP floor, hurt lockout, death transition, and reset.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Browser smoke verifies player hurt recovery and Scene reset with one Canvas and zero visible runtime errors.

### Expected files

- `app/game/player/**`
- `app/game/MainScene.ts`
- `tests/**`
- `ARCHITECTURE.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- Existing EnemyManager callbacks and lifecycle reset currently touch player HP and state directly.
- Preserve current behavior and avoid introducing Game Over UI or broad game-flow refactors.
