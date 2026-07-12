# Next Task

## M1 / Task 1.5 — Asset Manifest and Preload Failure Policy

### Why this is next

The runtime, input, lifecycle, events, deterministic time, mobile viewport, and reset contracts are now validated. The remaining M1 foundation task is to make asset ownership and preload failures explicit before further gameplay content is added.

### Completion criteria

- Define a typed runtime asset manifest for the current background, player, enemy, and atlas metadata assets.
- Load runtime assets through the manifest without changing gameplay visuals or animation frame data.
- Surface a deterministic development error when a required asset fails to load.
- Preserve the single Phaser instance, Scene reset cleanup, touch input, and mobile scaling behavior.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Browser smoke loads the manifest-backed game with one Canvas and zero console errors.
- Test a missing required asset through a development-only fixture or source contract without changing production assets.

### Expected files

- `app/game/assets/**`
- `app/game/MainScene.ts`
- `tests/**`
- `ARCHITECTURE.md`
- `ASSET_PIPELINE.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- Moving preload ownership can accidentally change atlas keys or frame metadata.
- Failure reporting must remain development-only and must not add a new production UI system.
