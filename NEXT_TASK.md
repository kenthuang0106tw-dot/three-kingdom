# Next Task

## M2 / Task 2.3 — Player Attack Controller and Metadata

### Why this is next

Player state transitions and actor visual/physics ownership are now isolated. The next P0 extraction can move startup, active, recovery, attack IDs, and hitbox timing into a dedicated attack controller without mixing actor ownership with combat resolution.

### Completion criteria

- Define attack metadata for attack1, attack2, and attack3: frame sequence, startup, active, recovery, and hitbox timing.
- Add a PlayerAttackController that owns attack progression and active-frame decisions.
- Preserve current Combo input rules, hit effects, enemy hit records, and animation visuals.
- Add focused metadata/timing tests without adding new attacks, enemies, UI, or damage rules.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Browser smoke verifies each existing attack stage and active hitbox timing with one Canvas and zero console errors.

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

- Moving frame timing can desynchronize Phaser animation events and existing Combo buffering.
- Keep combat resolution and hit effects in MainScene until a later dedicated task.
