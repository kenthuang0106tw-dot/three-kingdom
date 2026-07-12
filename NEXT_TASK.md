# Next Task

## M2 / Task 2.2 — Player Actor Visual and Physics Ownership

### Why this is next

The player transition rules are now pure and tested. The next P0 extraction should give the player actor explicit ownership of its sprite, feet anchor, and Arcade body before attack metadata and combat resolution are separated.

### Completion criteria

- Define a player actor boundary that owns the current sprite, feet alignment, display scale, and physics body.
- Keep `MainScene` as orchestration only; do not move input, combo rules, or combat resolution yet.
- Preserve current idle/walk/attack/hurt visuals, movement, depth sorting, hit effects, and reset cleanup.
- Add focused actor alignment/ownership tests without new gameplay features.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Browser smoke verifies player movement, feet alignment, attack, and hurt with one Canvas and zero console errors.

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

- Moving sprite/body ownership can change feet anchoring or depth ordering if coordinate synchronization is duplicated.
- Do not extract attack metadata, combat effects, or input in the same task.
