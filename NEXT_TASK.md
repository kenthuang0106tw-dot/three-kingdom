# Next Task

## M3 / Task 3.2 — World/walk bounds contract

### Why this is next

StageConfig now provides one validated source for the current room geometry.
The next smallest step is to make gameplay actors and knockback use that
contract consistently, before adding camera movement or encounter flow.

### Completion criteria

- Define a Phaser-free bounds helper for world and walkable rectangles.
- Make MainScene and EnemyManager consume the shared bounds contract.
- Preserve the current 1280×720 bamboo room and actor positions.
- Clamp player and enemy movement plus horizontal knockback to walk bounds.
- Do not add camera follow, scrolling, encounter gates, or new content.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Add deterministic tests for containment and edge clamping.
- Browser smoke verifies one Canvas, current combat room rendering, and no
  visible runtime errors.

### Expected files

- `app/game/stage/StageConfig.ts`
- `app/game/MainScene.ts`
- `app/game/EnemyManager.ts`
- `tests/**`
- `ARCHITECTURE.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- Duplicated Phaser rectangles could drift from StageConfig.
- Keep the helper small and data-driven; defer camera and stage-flow policy.
