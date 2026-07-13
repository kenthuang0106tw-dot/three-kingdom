# Next Task

## M5 / Task 5.4 — Boss hurt/phase/death

### Why this is next

The Boss lifecycle, three attack definitions, and deterministic decision rhythm
are now testable. The smallest next playable step is a Scene-owned Boss actor
that can enter hurt, change phase once, die, and clean up without being folded
into `EnemyManager`.

### Completion criteria

- Inspect the current Boss attack assets and create only the real idle, hurt,
  phase-transition, and death frames required by this task, with one shared
  scale and feet anchor; do not fake animation with transforms.
- Add one Scene-owned Boss actor consuming `BossLifecycle`, `BOSS_ATTACKS`, and
  `BossDecisionPolicy`; keep it separate from `EnemyManager`.
- Implement one explicit phase change and deterministic hurt/death/cleanup
  transitions without re-entry or duplicate listeners/timers.
- Preserve the current player, normal-enemy combat, camera, stage, and UI
  behavior outside the Boss actor integration.
- Do not add arena bounds, camera lock, stage-complete flow, HUD, audio, a second
  Boss phase, new player moves, or a reusable Boss framework.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Add lifecycle integration tests for one phase transition, hurt recovery,
  terminal death, cleanup idempotence, and restart ownership.
- Browser smoke verifies Boss hurt/phase/death presentation, one 1280×720
  Canvas, no duplicate Boss instance after restart, and zero page errors.

### Expected files

- `app/game/boss/**`
- `app/game/MainScene.ts`
- `public/art/boss/**`
- `tools/**`
- `tests/**`
- Project status and acceptance documents

### Risks

- Attack-only art is not a complete actor sheet. Stop and report if real
  feet-aligned hurt/death transitions cannot be produced reliably; do not reuse
  unrelated attack poses or compensate with per-animation scale changes.
- Keep this actor-specific implementation small so Task 5.5 can add arena and
  camera ownership without undoing combat lifecycle work.
