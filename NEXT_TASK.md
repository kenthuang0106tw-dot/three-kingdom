# Next Task

## M3 / Task 3.1 — StageConfig

### Why this is next

The M2 combat room is accepted and stable. StageConfig is the smallest M3
foundation for moving from a static room to data-driven bounds, spawns,
encounters, and exits without changing current combat behavior.

### Completion criteria

- Define a Phaser-free StageConfig schema for world bounds, walk bounds, spawn points, encounter definitions, and exit metadata.
- Add a configuration for the current bamboo combat room with no visual or gameplay changes.
- Validate the schema deterministically and keep MainScene as the current consumer until later Stage tasks.
- Do not add camera follow, encounter gates, scrolling, new enemies, or stage flow.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Browser smoke verifies the current combat room still renders one Canvas with no visible runtime errors.

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

- An over-specified schema could force rework when encounter gates and camera rules arrive.
- Keep the first contract minimal, data-only, and behavior-preserving.
