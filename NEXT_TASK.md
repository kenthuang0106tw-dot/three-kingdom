# Next Task

## M5R / Task 5R.2 — Two encounter triggers and gates

### Why this is next

The 3840×720 world, three background sections, shared walk bounds, and visible
camera scrolling now pass on desktop and both target mobile viewports. The next
missing playable layer is staged combat: enemies are currently placed near the
final viewport and active from Scene creation, so the world does not yet have
two sequential Beat 'em Up encounters or meaningful camera gates.

### Completion criteria

- Define exactly two ordered encounter trigger regions and their spawn groups
  in authoritative Stage data; do not introduce hard-coded trigger coordinates
  in `MainScene`.
- Do not spawn ordinary enemies at Scene creation. Spawn each existing group
  once only when the player enters its trigger while moving forward.
- During an active encounter, acquire the existing `encounter` camera lock at
  the current bounded camera position. Clear all enemies in that encounter to
  release only the encounter lock and allow forward traversal.
- The second encounter cannot trigger before the first is cleared and cannot
  retrigger after completion. Walking backward across a trigger must not spawn
  duplicates.
- Reuse only the three existing melee archetypes and their current combat,
  Attack Slot, hit, death, and cleanup paths. Do not add or rebalance enemies.
- After the second all-clear, traversal to the final viewport remains possible.
  Boss activation, Boss camera ownership, and Boss entry remain Task 5R.3.
- Scene restart must reset both encounter triggers, enemy ownership, camera
  locks, and progression to the first encounter with no stale objects.
- Preserve the accepted three-screen world, Title/start, touch/keyboard input,
  player combat, one Phaser instance, and `scrollX` clamp.
- Do not add Boss behavior, HUD, Pause, Failure, Result, Audio, art, new actors,
  new attacks, new enemy types, scoring, or stage polish.

### Validation

- Deterministic tests prove ordered trigger eligibility, spawn-once behavior,
  first/second clear progression, duplicate crossing safety, camera-lock
  ownership, and restart reset.
- `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck` pass.
- Desktop browser smoke starts from Title, triggers encounter 1, proves the
  camera remains locked during combat, clears it, then repeats for encounter 2
  and reaches the final viewport with zero console errors.
- 844×390 landscape touch and 390×844 portrait FIT each trigger and clear both
  encounters without Canvas stretching or displaced controls.
- Ten Scene restarts retain one Canvas, one player, one Boss actor, zero enemies
  before the first trigger, no stale completion event, and no camera lock.

### Expected files

- `app/game/stage/StageConfig.ts`
- `app/game/stage/EncounterFlow.ts` or one equally small Stage-owned progression
  contract
- `app/game/EnemyManager.ts`
- `app/game/MainScene.ts`
- `tests/app-contracts.test.mjs`
- Project status/evidence documents

### Risks

- `EnemyManager` currently models one encounter lifecycle; extending it
  carelessly can leak old enemy IDs or all-clear callbacks into encounter 2.
- Reusing one camera lock reason without ordered progression can unlock the
  wrong encounter or leave the player soft-locked.
- Spawning on both sides of a trigger boundary can duplicate enemies if entry
  is evaluated without a one-shot Stage contract.
- Boss is still instantiated outside the entry sequence; do not solve that in
  this task or couple encounter completion directly to Boss internals.
