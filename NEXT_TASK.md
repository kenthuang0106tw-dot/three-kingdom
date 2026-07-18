# Next Task

## M6 / Task 6.5 — Failure/continue/restart

### Why this is next

Pause/resume is now accepted, and the Vertical Slice already has a deterministic
`failed` state plus explicit Scene restart contract. The next smallest playable
product-flow improvement is to turn that existing development-grade failure path
into the one formal continue/restart experience before Result/replay and Audio.

### Completion criteria

- Player HP reaching zero enters `failed` exactly once and suspends Player,
  ordinary enemies, Boss, attacks, timers, encounter progression, and camera
  progression without changing combat balance.
- One Phaser-owned Failure overlay presents a clear retry/continue action on
  desktop and touch layouts; React and DOM own no gameplay state.
- Keyboard and pointer/touch each request restart through one method and cannot
  trigger duplicate Scene restarts.
- Restart rebuilds the documented new-run state: Title, Player HP 10 and start
  position, encounter index 0, no actors or attack slots, Boss locked/inactive,
  no camera locks, no stage completion, and no stale Pause state.
- Failure, Pause, Title, and Cleared modes remain mutually consistent; failed and
  cleared stay terminal until the explicit restart lifecycle.
- Scene shutdown removes every Failure listener, pointer handler, overlay,
  timer, collider, and owned reference.
- Ten consecutive failure/restart cycles retain one Phaser instance and one
  Canvas with no listener, GameObject, timer, actor, or camera-state accumulation.
- Production keeps the Failure UI but exposes no development debug telemetry.

### Validation

- Contract tests for exactly-once failure, one restart request, legal flow
  transitions, reset state, Pause isolation, and shutdown cleanup.
- Browser acceptance for one real Player defeat and retry on desktop keyboard,
  844×390 landscape touch, and 390×844 portrait touch.
- Development smoke for ten failure/restart cycles, one Canvas, restored initial
  state, and zero runtime errors.
- Regression smoke for Title/start, Pause/resume, two encounters, camera handoff,
  Boss entry/clear, HUD, and terminal `cleared` flow.
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

- Failure currently shares Scene restart ownership with development smoke paths;
  a second restart listener could cause duplicate instances or skipped Title.
- Retrying while a hit-stop, Pause, tween, or attack callback is active can leave
  global managers paused unless shutdown ordering remains guarded.
- Touch input that began before failure may leak into the next run unless all
  transient pointer ownership is released during transition and shutdown.
- Failure UI must not pre-implement Result/replay, persistence, scoring, Audio,
  new content, or unrelated gameplay changes.
