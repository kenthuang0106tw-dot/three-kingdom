# Next Task

## M3 / Task 3.4 — Encounter camera lock/unlock

### Why this is next

Camera follow and bounded world scrolling are now isolated and validated. The
next Stage step is to pause camera movement during a combat encounter without
coupling camera code to EnemyManager or actor internals.

### Completion criteria

- Define a minimal camera lock contract with explicit lock and unlock reasons.
- Keep the camera bounded by StageConfig world bounds in both modes.
- Integrate only the existing combat-room encounter; do not add new gates or content.
- Preserve player, enemy, combat, and camera-shake behavior.
- Do not add parallax, stage exits, or new UI.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Add deterministic lock/unlock transition tests without Phaser imports.
- Browser smoke verifies combat-room rendering, one Canvas, no runtime errors,
  and camera lock release after the encounter clears.

### Expected files

- `app/game/camera/**`
- `app/game/MainScene.ts`
- `app/game/stage/StageConfig.ts`
- `tests/**`
- `ARCHITECTURE.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- A lock tied directly to enemy internals could make restart and cleanup brittle.
- Keep the contract event-driven and minimal; defer full encounter gates to the
  later Stage flow tasks.
