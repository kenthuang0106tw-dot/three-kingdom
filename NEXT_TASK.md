# Next Task

## M6 / Task 6.6 — Result/replay

### Why this is next

Failure/retry now has one accepted product path. The remaining terminal mode is
`cleared`, which already publishes exactly once but has no Result presentation
or explicit replay action. Formalizing that existing boundary completes the
smallest playable product-flow step before UI/mobile acceptance and Audio.

### Completion criteria

- Entering `cleared` presents one Phaser-owned Result overlay after the existing
  Boss cleanup, arena release, and exactly-once stage-complete publication.
- Keyboard and pointer/touch request replay through one exactly-once method;
  neither React nor DOM owns gameplay state.
- Replay performs the documented new-run Scene lifecycle and returns to Title
  with HP 10, encounter 0, Boss locked/inactive, no actors, locks, stale Pause,
  Failure, completion, or Result state.
- `failed` cannot show Result or request replay; `cleared` cannot request Failure
  retry. Title, playing, paused, failed, and cleared remain mutually consistent.
- Scene shutdown removes every Result listener, pointer handler, overlay and
  owned reference.
- Ten clear/replay cycles retain one Phaser instance and one Canvas without
  listener, GameObject, timer, actor, completion, or camera-state accumulation.
- Production keeps Result/replay UI and exposes no development telemetry.

### Validation

- Contract tests for exactly-once Result entry, one replay request, terminal
  exclusivity, reset state, and shutdown cleanup.
- Browser acceptance for Boss clear and replay on desktop keyboard, 844×390
  landscape touch, and 390×844 portrait touch.
- Development ten-cycle clear/replay smoke with one Canvas and zero errors.
- Regression smoke for Title/start, Pause, Failure/retry, two encounters, camera
  handoff, Boss entry/combat, HUD, and completion ordering.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Expected files

- `app/game/MainScene.ts`
- `app/game/flow/`
- `app/game/ui/`
- `tests/app-contracts.test.mjs`
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `NEXT_TASK.md`
- `ARCHITECTURE.md`
- `TECH_DEBT.md`
- `CHECKLIST.md`

### Risks

- Result replay could duplicate the existing stage-completion callback or skip
  Title if it invents a second reset path.
- Failure and Result input listeners can conflict unless each terminal overlay
  owns a closed request gate outside its matching state.
- Boss fade/cleanup callbacks must finish before Result becomes interactive.
- Do not add scoring, persistence, Audio, new content, post-stage progression,
  custom Result art, or M6.7 mobile acceptance work.
