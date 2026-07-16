# Next Task

## M5R / Task 5R.7 — Boss defeat and cleared flow

### Why this is next

Player failure, combat suspension, and deterministic restart are now accepted.
The remaining flow gap before end-to-end Vertical Slice acceptance is the
successful terminal path: defeating the Boss already cleans the actor and
publishes a stage-completion event, but normal gameplay does not yet enter the
single authoritative `cleared` game-flow state.

### Completion criteria

- A genuinely defeated Boss completes its death animation/fade and cleanup,
  releases the Boss arena lock, publishes stage completion, and transitions
  game flow exactly once from `playing` to `cleared` in that order.
- Scene shutdown, diagnostic destruction, duplicate cleanup callbacks, and a
  non-defeat Boss removal cannot enter `cleared` or publish another completion.
- In `cleared`, Player input, enemy/Boss AI, movement, attack hitboxes, damage,
  encounter progression, and camera progression stop.
- `failed` and `cleared` remain mutually exclusive terminal modes until a later
  explicit new-run/replay task; no implicit restart is added.
- Existing Boss death animation, 500ms fade, actor cleanup, arena release,
  completion payload, and Player failure behavior remain unchanged.
- No Result UI, replay button, HUD, audio, scoring, new content, combat balance,
  or Task 5R.8 end-to-end acceptance behavior is added.

### Validation

- Pure/contract tests cover `playing → cleared`, duplicate transition rejection,
  failed/cleared exclusivity, and non-defeat cleanup rejection.
- Source/contract tests verify ordering: Boss cleanup, arena release, one
  completion publication, then one cleared transition.
- Browser smoke defeats a real Boss and verifies Boss 0, arena released,
  completion count 1, flow `cleared`, stopped input/combat, and no later duplicate.
- Re-run Player failure/restart, Boss attack damage, and ordinary encounter
  regressions.
- Verify desktop and 844×390 landscape touch viewports with zero browser errors.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Estimated files

- `app/game/MainScene.ts`
- Existing flow/completion contract only if a minimal pure seam is required
- `tests/app-contracts.test.mjs`
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `NEXT_TASK.md`
- `ARCHITECTURE.md`
- `TECH_DEBT.md`
- `CHECKLIST.md`

### Estimated risk

- Transitioning before Boss cleanup or arena release can leave a terminal soft
  lock with live physics ownership.
- Both cleanup callback and completion-event code may attempt to enter cleared,
  causing duplicate publication or an invalid terminal transition.
- Scene shutdown can look like Boss cleanup unless the existing defeated versus
  destroyed reason remains authoritative.
- Reusing failed-mode suspension carelessly could also create a failure overlay
  or restart listener on the successful path.
