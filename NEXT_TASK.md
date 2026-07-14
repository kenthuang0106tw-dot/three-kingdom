# Next Task

## M6 / Task 6.3 — Player/Boss HUD

### Why this is next

Title/start now provides the first product-flow entry point. The next smallest
playable increment is a readable Player/Boss HUD driven only by the existing
readonly gameplay observation boundary. Pause, Failure, Result, audio, and
gameplay changes remain later tasks.

### Completion criteria

- Display Player HP and Boss HP/state in a Phaser-owned HUD while playing.
- Extend the readonly gameplay snapshot with only the primitive Boss fields the
  HUD needs; do not expose BossActor, sprites, physics, timers, or managers.
- The HUD consumes readonly snapshot data and never mutates Player, Boss,
  combat, Scene flow, or React state.
- Create HUD objects once and update their text/graphics without rebuilding
  GameObjects every frame.
- Keep the HUD readable at 1280×720, 844×390 landscape, and 390×844 fitted
  portrait without covering the touch controls.
- Hide the HUD during Title mode; do not add Pause, Failure, Result, scoring,
  audio, persistence, gameplay, or visual polish.

### Validation

- Deterministic tests cover immutable Boss snapshot data, HUD ownership, and
  absence of actor references or React gameplay state.
- `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck` pass.
- Browser smoke verifies correct Player/Boss values, one Canvas, HUD visibility
  only after start, three target viewports, zero console errors, and ten Scene
  restarts without duplicate HUD objects.

### Expected files

- `app/game/events/GameplayEvents.ts`
- `app/game/ui/**`
- `app/game/MainScene.ts`
- `tests/app-contracts.test.mjs`
- Project status/evidence documents

### Risks

- Reading BossActor directly from UI would bypass the readonly observation
  boundary and force later refactoring.
- Recreating text or bars every update would leak GameObjects and hurt mobile
  performance.
- HUD placement can obscure touch controls or become unreadable after FIT
  scaling; validate all three target viewports.
