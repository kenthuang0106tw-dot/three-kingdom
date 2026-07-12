# Next Task

## M2 / Task 2.4 — Combat Resolver

### Why this is next

Attack timing and active-frame metadata are now isolated from actor ownership.
The next smallest seam is to isolate hit resolution before adding more combat
content or another enemy type.

### Completion criteria

- Add a pure CombatResolver for attack hit targets, damage, and per-attack hit records.
- Keep camera shake, hit stop, flash, spark, and knockback effects outside the resolver.
- Preserve current player Combo behavior and multi-enemy hit behavior.
- Add focused resolver tests without adding attacks, enemies, UI, or damage rules.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Browser smoke verifies the existing three-stage attack and hit effects with one Canvas and zero visible runtime errors.

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

- Existing multi-enemy hit records and effects are coupled to MainScene.
- Keep the extraction behavior-preserving; do not introduce new combat rules.
