# Next Task

## M5 / Task 5.5 — Arena bounds/camera lock

### Why this is next

The first Boss now has deterministic combat and terminal cleanup, but it still
shares the ordinary room without an explicit arena boundary. Locking and
releasing the existing camera/bounds contract is the smallest next playable
step and is required before stage-complete flow can be trusted.

### Completion criteria

- Add one Boss-arena bounds configuration using the existing Stage and camera
  contracts; do not create a general arena framework.
- Activate the arena lock while the Boss is active and release it exactly once
  after Boss cleanup.
- Keep player and Boss feet bodies inside walkable bounds without teleporting,
  oscillation, or edge trapping.
- Reset arena and camera ownership correctly across ten Scene restarts.
- Preserve current Boss lifecycle, attacks, normal enemies, player combat,
  camera behavior outside the arena, and all presentation assets.
- Do not add stage-complete events, HUD, audio, Boss attack damage, new art,
  another phase, or another Boss.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Add deterministic tests for arena lock entry, boundary clamping, Boss cleanup
  release, and reset ownership.
- Browser smoke verifies lock/release presentation, one 1280×720 Canvas, one
  Boss after ten restarts, and zero page errors.

### Expected files

- `app/game/stage/**`
- `app/game/camera/**`
- `app/game/boss/**` only if a read-only boundary is required
- `app/game/MainScene.ts`
- `tests/**`
- Project status and acceptance documents

### Risks

- Reusing the encounter camera lock without a distinct Boss ownership reason
  could unlock the camera too early.
- Overlapping physics and arena clamps can trap actors at an edge; keep one
  authoritative bounds calculation and verify reset cleanup.
