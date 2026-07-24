# Next Task

## M7 / Task 7.4 — Mobile Unlock/Recovery

### Why this is next

Tasks 7.1–7.3 now provide one lifecycle-safe Audio manager, complete Combat/UI
SFX, and exactly-once Stage/Boss music. The remaining prerequisite for final
mix acceptance is reliable mobile user-gesture unlock and recovery after the
browser loses visibility or suspends audio.

### Completion criteria

- Keep one `AudioManager`, one gameplay-event subscription, and one owned BGM
  track across every active Scene lifecycle.
- On iOS Safari and Android Chrome, the first explicit Title tap must unlock
  audio and play exactly one Stage track plus the Title cue.
- If the browser is hidden, backgrounded, interrupted, or its audio context is
  suspended, returning to the game must resume the correct current Stage/Boss
  track without layering, restarting from a conflicting state, or replaying
  stale SFX.
- Manual Pause and visibility suspension must remain independent; clearing one
  reason cannot resume while the other remains active.
- Pointer cancel, orientation change, Failure/retry, Result/replay, and ten
  Scene resets must retain correct input and Audio ownership.
- Add only the minimum lifecycle recovery needed by observed device behavior.
  Do not add settings UI, persistence, new audio content, gameplay, balance,
  art, or Stage/Boss timing changes.

### Validation

- Unit-test unlock races, suspended-context recovery, visibility/manual pause
  ordering, latest pending BGM intent, stale SFX rejection, reset, and cleanup.
- Browser-smoke landscape and portrait viewports for Title tap, Stage/Boss
  music, Pause/Resume, visibility recovery, Failure/retry, Result/replay, and
  ten Scene resets with one Canvas and zero errors.
- Validate the deployed GitHub Pages build on physical iOS Safari and Android
  Chrome; record device/browser versions and observed unlock/recovery results.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Expected files

- `app/game/audio/AudioManager.ts` and focused lifecycle adapter/tests
- Minimal `MainScene` telemetry or semantic lifecycle event changes if required
- Mobile audio acceptance evidence
- `ARCHITECTURE.md`, `CHECKLIST.md`, `SPRINT.md`, `GAME_ROADMAP.md`,
  `TECH_DEBT.md`, `README.md`, and `NEXT_TASK.md`

### Risks

- iOS Safari may require a fresh explicit gesture after an OS-level
  interruption rather than accepting automatic resume.
- Phaser game focus and WebAudio context state can recover in a different
  order, producing a false resume unless both are observed.
- Replaying queued SFX after a long background suspension would sound stale.
- Physical-device verification requires the deployed public build and cannot
  be replaced by viewport emulation alone.
