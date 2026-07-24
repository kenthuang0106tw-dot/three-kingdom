# Next Task

## M7 / Task 7.5 — Audio Acceptance

### Why this is next

Tasks 7.1–7.4 now provide one lifecycle-safe Audio manager, complete
Combat/UI SFX, Stage/Boss music, and accepted mobile unlock/background
recovery. The remaining M7 work is a bounded full-run acceptance and mix pass
before performance and content polish begin.

### Completion criteria

- Complete the full Vertical Slice on Desktop Chrome/Edge, iOS Safari, and
  Android Chrome with no missing, duplicate, stale, or layered cue.
- Verify Title, attack, confirmed hit, Player hurt, Enemy death, Pause, Resume,
  Failure, retry, Result, replay, Stage BGM, Boss transition, and terminal stop.
- Confirm same-frame multi-target hits remain one audible impact and every
  distinct attack/death remains readable.
- Balance SFX, Stage BGM, and Boss BGM so attacks and confirmed hits remain
  readable without clipping or masking.
- Preserve one AudioManager, one gameplay subscription, and one owned BGM
  through Pause, background recovery, retry, replay, and ten Scene resets.
- Make only evidence-backed volume/detune adjustments through existing catalog
  constants. Do not add content, settings, persistence, gameplay, art, or new
  audio architecture.

### Validation

- Record a cue/event matrix for one complete success run and one
  Failure/retry run.
- Run desktop development and production browser smoke with one Canvas, one
  manager/subscription, correct Stage→Boss transition, terminal silence, and
  zero runtime errors.
- Validate the deployed GitHub Pages build on physical iOS Safari and Android
  Chrome; record any available device/browser details and observed mix results.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Expected files

- Focused `SfxCatalog` / `BgmCatalog` tuning only if acceptance finds an
  objective mix defect
- Audio acceptance evidence
- `CHECKLIST.md`, `SPRINT.md`, `GAME_ROADMAP.md`, `TECH_DEBT.md`, `README.md`,
  and `NEXT_TASK.md`

### Risks

- Subjective mix feedback can expand indefinitely without a fixed cue matrix.
- Desktop loudness does not prove mobile speaker readability.
- Adjusting master playback instead of catalog constants could regress channel
  ownership or mobile recovery.
- Physical-device details may be unavailable; missing metadata must be recorded
  rather than inferred.
