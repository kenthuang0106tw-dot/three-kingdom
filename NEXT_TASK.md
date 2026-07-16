# Next Task

## M5R / Task 5R.6 — Player failure and deterministic restart

### Why this is next

The Boss can now approach, align, attack, and damage the Player through the
established combat effects. HP reaching zero still lacks an accepted product
flow: input, combat ownership, timers, camera locks, and stage actors must enter
one explicit `failed` mode and restart without leaking state. This must be
trusted before Boss-cleared flow and end-to-end Vertical Slice acceptance.

### Completion criteria

- Player HP reaching zero transitions game flow exactly once from `playing` to
  `failed`; repeated damage or callbacks cannot publish a second failure.
- In `failed`, Player movement and attack input are ignored, active Player and
  enemy/Boss attack hitboxes are disabled, and combat AI no longer advances.
- Restart uses the existing Phaser Scene lifecycle and title/start ownership;
  no DOM state, page reload, `setTimeout`, or parallel reset path is introduced.
- Restart restores Player HP/state/position, stage progression, encounters,
  Boss ownership, camera locks, timers, hit records, and completion/failure
  counters to their documented initial values.
- Ten consecutive fail-and-restart cycles retain exactly one Canvas, one input
  registration set, and no stale actor, collider, timer, lock, or event.
- No Result UI styling, Boss-cleared behavior, HUD, audio, new content, combat
  balance, or Task 5R.7 behavior is added.

### Validation

- Pure/contract tests cover the legal `playing → failed` transition, exactly-once
  failure ownership, ignored duplicate damage, and new-run reset.
- Browser smoke lets a real Boss reduce Player HP to zero, then verifies failed
  mode blocks movement/attack/AI before invoking the documented restart path.
- Repeat fail/restart ten times and verify Player HP/position, encounter index,
  Boss count, camera locks, completion count, Canvas count, and listener/timer
  ownership after every cycle.
- Re-run Boss attack, Boss defeat cleanup, and ordinary encounter regressions.
- Verify desktop and 844×390 landscape touch viewports with zero browser errors.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Estimated files

- `app/game/MainScene.ts`
- `app/game/state/GameFlowState.ts`
- Existing Player lifecycle/reset boundary if required
- `tests/app-contracts.test.mjs`
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `NEXT_TASK.md`
- `ARCHITECTURE.md`
- `TECH_DEBT.md`
- `CHECKLIST.md`

### Estimated risk

- The current delayed Player-death restart may bypass an observable failed mode
  or race with Boss attack completion and hit-stop clocks.
- Resetting visual state without resetting encounter, camera-lock, and actor
  ownership would pass once but leak across repeated runs.
- A second failure event from a late overlap/timer can duplicate restart work.
- Pausing the whole Scene incorrectly can also pause the only restart input or
  timer; failure ownership and restart ownership must remain explicit.
