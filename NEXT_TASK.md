# Next Task

## M2 / Task 2.5 — Effect Director

### Why this is next

Combat resolution is now Phaser-free and isolated. The next smallest seam is
to move hit presentation and timing orchestration out of MainScene without
changing combat rules or adding new effects.

### Completion criteria

- Add an EffectDirector that owns existing hit flash, hit spark, knockback, camera shake, and hit-stop orchestration.
- Keep damage, target selection, enemy state transitions, and Combo rules outside the director.
- Preserve current effect parameters and multi-target behavior; coalesce one hit-stop and camera shake per attack update.
- Add focused effect timing tests without adding new visual effects, enemies, UI, or audio.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Browser smoke verifies the existing hit flash, spark, knockback, camera shake, and hit-stop with one Canvas and zero visible runtime errors.

### Expected files

- `app/game/combat/**`
- `app/game/MainScene.ts`
- `tests/**`
- `ARCHITECTURE.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- Phaser tween, timer, camera, and lifecycle-clock ownership is currently coupled to MainScene.
- Keep the extraction behavior-preserving and do not let the director calculate damage or own actor state.
