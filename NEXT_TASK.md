# Next Task

## M3 / Task 3.5 — Spawn and all-clear flow

### Why this is next

The current combat room has a validated camera lock lifecycle, but its spawn
and all-clear behavior is still embedded in MainScene and EnemyManager. The
next smallest Stage step is to make the existing room's spawn/clear contract
explicit without adding a new level or respawn behavior.

### Completion criteria

- Define a minimal Phaser-free spawn/all-clear contract for the current room.
- Preserve the existing three enemy spawn points and single-room behavior.
- Publish clear only after all living enemies are removed.
- Keep EnemyManager responsible for enemy cleanup and MainScene responsible for presentation.
- Do not add stage exits, encounter gates, respawns, or new content.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Add deterministic tests for spawn counts, all-clear transition, and reset.
- Browser smoke verifies one Canvas, no runtime errors, and the existing clear text path.

### Expected files

- `app/game/stage/**`
- `app/game/EnemyManager.ts`
- `app/game/MainScene.ts`
- `tests/**`
- `ARCHITECTURE.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- Moving clear ownership could regress enemy cleanup or camera unlock timing.
- Keep the contract limited to the existing room; defer full StageDirector flow.
