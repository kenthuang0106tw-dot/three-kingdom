# Next Task

## M7 / Task 7.2 — Combat/UI SFX

### Why this is next

Task 7.1 established one lifecycle-safe Audio manager with SFX/BGM channels,
gameplay-event observation, pause/visibility handling, and user-gesture unlock.
The next smallest playable improvement is to route combat and product-flow SFX
through that boundary before Stage/Boss music is introduced.

### Completion criteria

- Add original or explicitly licensed runtime SFX for player attacks, confirmed
  hits, player hurt, enemy death, Title start, Pause/Resume, Failure, Result,
  and replay/retry actions.
- Record source, license/provenance, processing, encoding, duration, and runtime
  mapping metadata for every file.
- Load every sound only through the runtime asset manifest.
- Map immutable gameplay/flow events to Audio manager SFX commands; actors,
  combat, UI controllers, and React must not call Phaser sound directly.
- Each semantic event plays at most once.
- Coalesce same-frame multi-target hits so volume does not stack excessively.
- Respect SFX channel volume/mute, Audio lock, Pause/Resume, Scene reset, and
  shutdown without duplicate listeners or playback.
- Do not add BGM, rebalance combat, modify art, or change gameplay timing.

### Validation

- Unit-test event-to-SFX mapping, one-shot semantics, multi-target coalescing,
  channel mute/volume, locked output, reset, and listener cleanup.
- Browser-smoke Title/start, attack/hit/hurt, Pause/Resume, Failure/retry, and
  Result/replay with one manager, one subscription, one Canvas, and zero errors.
- Verify all audio requests return 200 in production and GitHub Pages builds.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Expected files

- Original/licensed Combat/UI audio sources and runtime encodings
- Audio provenance and event-mapping metadata
- Runtime asset-manifest entries
- Focused Audio mapping tests and minimal manager/event integration
- `ARCHITECTURE.md`, `CHECKLIST.md`, `SPRINT.md`, `GAME_ROADMAP.md`,
  `TECH_DEBT.md`, `ASSET_PIPELINE.md`, `README.md`, and `NEXT_TASK.md`

### Risks

- One visual hit may publish more than one event or hit several targets in one
  frame, causing clipping or excessive loudness.
- Browser autoplay policy may drop commands before unlock; playback must not be
  reported as successful while locked.
- UI actions do not all have semantic events yet; add only the minimal readonly
  event contract required by this task.
- Generated or third-party audio without recorded rights/provenance cannot be
  accepted.
