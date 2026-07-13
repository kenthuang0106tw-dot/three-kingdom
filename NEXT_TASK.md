# Next Task

## M5 / Task 5.6 — Stage-complete event

### Why this is next

Boss lifecycle, cleanup, and arena release now have deterministic ownership.
The smallest remaining dependency before full-stage acceptance is one readonly
stage-complete signal that future game flow can consume without reading Boss
internals.

### Completion criteria

- Add one typed readonly stage-complete gameplay event using the existing
  `GameplayEventHub`; do not introduce a second event system.
- Publish it exactly once after terminal Boss cleanup and arena release.
- Include only the minimum stable stage identifier and event timestamp; do not
  expose Boss, Scene, sprite, physics, or mutable state references.
- Reset publication ownership on Scene restart so each run can complete once.
- Preserve Boss lifecycle, arena/camera locks, normal enemies, player combat,
  existing snapshots, and presentation.
- Do not add Result UI, HUD, audio, scoring, save data, another stage, new art,
  Boss attack damage, or game-flow modes.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Add deterministic tests proving one event after Boss cleanup, no event before
  cleanup, no duplicate event, immutable payload, and restart re-arming.
- Browser smoke verifies one stage-complete publication, one 1280×720 Canvas,
  ten Scene restarts without duplicate ownership, and zero page errors.

### Expected files

- `app/game/events/**`
- `app/game/MainScene.ts`
- `tests/**`
- Project status and acceptance documents

### Risks

- Publishing from animation completion instead of terminal cleanup can fire
  before fade/arena release or fire twice.
- A UI-specific payload would couple the next product-flow milestone to Boss
  internals; keep the event primitive and readonly.
