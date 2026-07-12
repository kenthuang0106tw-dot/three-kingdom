# Next Task

## M3 / Task 3.3 — Camera follow

### Why this is next

The room geometry and actor movement now use a shared bounds contract. The next
smallest playable Stage step is to follow the player within the existing room
without adding encounter locks, scrolling content, or stage flow.

### Completion criteria

- Add a Phaser camera controller for the current MainScene.
- Follow the player only within the configured world bounds.
- Preserve the existing 1280×720 logical canvas and pixel-art rounding.
- Keep camera ownership separate from Player, EnemyManager, and Combat effects.
- Do not add encounter camera locks, parallax, new stage content, or UI.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Add deterministic camera-bound tests without importing Phaser into pure helpers.
- Browser smoke verifies one Canvas, no visible runtime errors, and stable
  rendering after player movement.

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

- Camera movement can introduce pixel shimmer or alter the fixed combat-room feel.
- Keep the first controller bounded and minimal; defer encounter locks and
  visual parallax until later Stage tasks.
