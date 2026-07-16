# Next Task

## M5R / Task 5R.5 — Boss attack hitbox and player damage

### Why this is next

Boss entry, locomotion, facing, Y alignment, lifecycle animation, and arena
bounds are now trustworthy. The remaining blocker to an actual Boss fight is
that existing Boss attack animations do not create an active hitbox and cannot
damage the player. This must be completed before failure/restart and cleared
flow can be accepted.

### Completion criteria

- Each existing Boss attack keeps its current startup, active, and recovery
  frame contract; no new attacks or art are added.
- One independent Arcade Physics attack zone follows the Boss facing and is
  disabled outside active frames.
- Attack metadata, not visual transforms or elapsed-time guesses, controls the
  hitbox size, offset, and active frames.
- One Boss attack can hit the player at most once, even across multiple active
  frames or overlap updates.
- A valid hit reduces Player HP once and reuses the established Player flash,
  hit stop, horizontal knockback, hurt lockout, and recovery behavior.
- Wrong Y alignment, startup frames, recovery frames, disabled/dead Boss, or an
  already-consumed swing cannot damage the player.
- Boss locomotion remains stopped throughout attack and resumes only through
  the existing lifecycle/decision completion path.
- Boss facing and hitbox direction remain correct on both sides of the player.
- No Boss HP/phase rebalance, failure screen, stage-clear changes, HUD, audio,
  new animation, new enemy, or Task 5R.6 behavior is added.

### Validation

- Pure/contract tests cover every attack's startup/active/recovery frame map,
  left/right hitbox placement, Y rejection, and once-per-swing hit record.
- Browser smoke observes a player HP decrement from a real active-frame overlap,
  Player hurt/flash/knockback, and no damage during startup/recovery.
- Repeat at least ten Boss swings and verify exactly one damage event per landed
  swing with no listener, collider, timer, or hit-record accumulation.
- Verify an attack on the wrong Y lane misses and Boss first realigns before a
  later attack can connect.
- Re-run Boss defeat cleanup and ten Scene restarts; confirm one Canvas, no
  stale attack zone/collider/timer, and zero browser errors.
- Verify desktop and 844×390 landscape touch viewports.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Estimated files

- `app/game/boss/BossActor.ts`
- `app/game/boss/BossAttackMetadata.ts`
- `app/game/MainScene.ts`
- Existing combat/player effect boundary only if required to reuse the current
  damage path without duplication
- `tests/app-contracts.test.mjs`
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `NEXT_TASK.md`
- `ARCHITECTURE.md`
- `TECH_DEBT.md`
- `CHECKLIST.md`

### Estimated risk

- Animation frame events and attack-zone timing can drift, producing invisible
  early/late hits.
- A scene-level overlap callback can fire every update unless the per-swing hit
  record is owned and reset at one explicit attack boundary.
- Flipping the sprite without mirroring the attack offset would make one facing
  direction miss or strike behind the Boss.
- Reimplementing Player damage effects inside Boss code would duplicate combat
  timing and make later failure flow inconsistent.
- Collider/listener cleanup omissions can survive Scene restart and cause
  duplicate damage; ten-restart validation is mandatory.
