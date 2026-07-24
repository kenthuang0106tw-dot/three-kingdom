# Next Task

## M7 / Task 7.3 — Stage/Boss Music

### Why this is next

Tasks 7.1–7.2 established one lifecycle-safe Audio manager and complete
Combat/UI SFX coverage. The next smallest playable improvement is original or
licensed music for the bamboo Stage and Boss arena before mobile-specific audio
recovery and final mix acceptance.

### Completion criteria

- Add original or explicitly licensed Stage and Boss music with source,
  license/provenance, processing, encoding, duration, loop-point, and runtime
  mapping metadata.
- Load music only through the runtime asset manifest and BGM channel.
- Start Stage music once after a real Title start; Scene updates must not
  restart the same track.
- Transition once to Boss music when the Boss arena becomes active.
- Stop or resolve music once on Failure and Result without competing playback.
- Replay/retry and Scene restart must produce exactly one correct track.
- Respect BGM volume/mute, Pause/Resume, visibility, shutdown, and WebAudio
  lock without changing Combat/UI SFX.
- Do not add settings UI, persistence, new gameplay, rebalance combat, modify
  art, or change Stage/Boss timing.

### Validation

- Unit-test track mapping, loop ownership, idempotent start/transition/stop,
  channel mute/volume, locked output, reset, and listener cleanup.
- Browser-smoke Title/start, Stage traversal, Boss entry, Pause/Resume,
  Failure/retry, Result/replay, and ten Scene resets with one BGM owner, one
  Canvas, and zero errors.
- Verify every music request returns 200 in production and GitHub Pages builds.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Expected files

- Original/licensed Stage and Boss music sources and runtime encodings
- Music provenance, loop-point, and transition metadata
- Runtime asset-manifest entries
- Focused BGM ownership/transition tests and minimal Audio manager integration
- `ARCHITECTURE.md`, `CHECKLIST.md`, `SPRINT.md`, `GAME_ROADMAP.md`,
  `TECH_DEBT.md`, `ASSET_PIPELINE.md`, `README.md`, and `NEXT_TASK.md`

### Risks

- Scene restart or repeated Boss-entry checks can layer duplicate tracks.
- Poor loop points can click or create an obvious rhythmic gap.
- Browser autoplay can leave a track request pending across a state transition.
- Music loudness can mask accepted Combat/UI SFX; final mix remains Task 7.5.
