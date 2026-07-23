# Next Task

## M7 / Task 7.1 — Audio manager/mixer

### Why this is next

M6 Product Flow and M6A Visual Upgrade are complete and the accepted visual set
is frozen. The Vertical Slice has typed gameplay events and lifecycle clocks
but no runtime Audio boundary. Establishing one manager before adding sound
content prevents combat, UI, Stage, and Boss code from acquiring direct sound
ownership.

### Completion criteria

- Add one Phaser-owned Audio manager/mixer with separate SFX and BGM channels.
- Consume existing readonly gameplay events; actors and React must not play or
  control sounds directly.
- Define idempotent start, pause, resume, stop, reset, and destroy behavior.
- Integrate Scene shutdown/restart without duplicate listeners or Audio manager
  instances.
- Respect current game-flow pause/resume and browser visibility lifecycle.
- Provide an explicit user-gesture unlock boundary without adding audio assets.
- Keep all accepted gameplay, timing, balance, art, UI, Camera, and Stage
  behavior unchanged.

### Validation

- Unit-test channel volume/mute state, idempotent lifecycle, event subscription
  cleanup, pause/resume, reset, destroy, and unlock state.
- Browser-smoke Title/start/pause/resume/restart and verify one Canvas, one
  manager, no duplicate subscriptions, and zero console errors.
- Confirm production contains no development diagnostics and does not request
  missing audio files.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Expected files

- `app/game/audio/AudioManager.ts`
- Focused Audio manager unit tests
- Minimal `MainScene` lifecycle wiring
- `ARCHITECTURE.md`, `CHECKLIST.md`, `SPRINT.md`, `GAME_ROADMAP.md`,
  `TECH_DEBT.md`, `README.md`, and `NEXT_TASK.md`

### Risks

- Browser autoplay policies differ; the manager must model locked/unlocked
  state without pretending audio played.
- Scene restart can accumulate gameplay-event or visibility listeners.
- Pause semantics can drift if Audio uses independent timers instead of the
  existing flow/lifecycle contracts.
- Adding placeholder sound files would expand Task 7.1 into Task 7.2; no audio
  content belongs in this task.
