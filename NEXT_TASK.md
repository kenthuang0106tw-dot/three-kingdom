# Next Task

## M6 / Task 6.7 — UI/mobile acceptance

### Why this is next

All M6 product-flow features now exist: Title/start, HUD, Pause/resume,
Failure/retry, and Result/replay. Before the approved M6A Visual Upgrade can
begin, the complete flow needs one acceptance pass across the three supported
viewport contracts. This freezes behavior, safe-area placement, input ownership,
and functional UI layout so M6A can replace art without reopening gameplay flow.

### Completion criteria

- One complete desktop keyboard run covers Title → playing → Pause/resume → two
  encounters → Boss → Result → replay → Title without a soft lock or duplicate
  Phaser instance/Canvas.
- One 844×390 landscape touch run covers the same product flow using the 360°
  joystick, attack, Pause, Failure retry or Result replay, with no clipped or
  unreachable control.
- One 390×844 portrait touch run confirms FIT scaling, safe-area behavior,
  readable functional UI, and reachable terminal actions without changing the
  1280×720 Phaser world contract.
- Title, HUD, Pause, Failure, and Result remain Phaser-owned; React remains only
  the shell and Phaser lifecycle owner.
- Pause, Failure, and Result overlays are mutually exclusive and camera-fixed.
- The HUD remains readable and does not intercept movement, attack, pause,
  retry, or replay input.
- Repeated start, pause/resume, failure/retry, and clear/replay cycles retain one
  Phaser instance, one Canvas, and no listener, GameObject, timer, actor, camera
  lock, completion, or input-state accumulation.
- Production contains the same functional UI and mobile controls without any
  development telemetry or physics/debug presentation.
- Any defect found is fixed only when it blocks this acceptance; no custom art,
  Audio, scoring, content, combat, balance, or M6A work is added.

### Validation

- Contract tests for React/Phaser ownership, terminal exclusivity, fixed overlay
  coordinates, listener cleanup, safe-area CSS, and single-instance lifecycle.
- Full browser acceptance at desktop default viewport, 844×390 landscape, and
  390×844 portrait using the matching real input surface.
- Regression smoke for two encounters, camera handoff, Boss entry/combat,
  stage-completion ordering, Failure reset, Result replay, HUD, and Pause.
- Ten-cycle lifecycle smoke for restart/replay with one Canvas and zero browser
  errors.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Expected files

- `tests/app-contracts.test.mjs`
- `CHECKLIST.md`
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `NEXT_TASK.md`
- Only the smallest existing `app/game/` or responsive CSS file needed for an
  acceptance-blocking defect discovered during validation.

### Risks

- A full manual run is long enough to hide viewport-specific input or lifecycle
  accumulation unless each checkpoint is recorded explicitly.
- Touch controls and fixed overlays can be visually present but have misaligned
  pointer hit areas after camera movement or FIT scaling.
- Fixing acceptance defects can drift into redesign; preserve current functional
  presentation and defer all visual replacement to M6A.
- Do not begin M6A, Audio, scoring, persistence, post-stage progression, new
  content, custom UI art, or unrelated refactoring in this task.
