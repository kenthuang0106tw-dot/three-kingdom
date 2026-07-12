# Next Task

## M3 / Task 3.7 — Stage traversal acceptance

### Why this is next

The current room now has explicit geometry, camera, encounter, clear, exit,
and restart contracts. The final M3 task is to validate the complete single-room
traversal path without adding a second stage or new gameplay content.

### Completion criteria

- Add one deterministic acceptance path from room start through combat clear to exit eligibility and restart.
- Verify camera lock/unlock, bounds, spawn count, all-clear, exit state, and Scene cleanup together.
- Preserve the existing 1280×720 bamboo room and combat behavior.
- Do not add a second stage, new enemies, parallax, or product UI.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Add deterministic traversal acceptance tests with no Phaser imports in pure contracts.
- Browser smoke verifies one Canvas, no runtime errors, ten restart cycles, and no stale exit/encounter state.

### Expected files

- `app/game/stage/**`
- `app/game/MainScene.ts`
- `tests/**`
- `ARCHITECTURE.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- An end-to-end contract could accidentally duplicate actor ownership or timers.
- Keep it acceptance-focused and data-driven; defer M4 content and full game flow.
