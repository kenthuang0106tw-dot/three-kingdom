# Next Task

## M5R / Task 5R.3 — Boss arena entry sequencing

### Why this is next

The three-screen world and both ordered ordinary encounters now work. The Boss
still exists from Scene creation and is not owned by a real stage-entry
sequence, so the playable path can expose Boss state and arena ownership before
the player has cleared the second encounter. Sequencing entry is the smallest
next step that joins the accepted Stage and Boss contracts without prematurely
implementing Boss locomotion or damage.

### Completion criteria

- Normal play starts with no active or visible Boss actor and no `boss` camera
  lock; existing development smoke modes may create their isolated fixture.
- Clearing both ordinary encounters makes one Boss-entry trigger eligible in
  authoritative Stage data. It cannot activate early or more than once.
- Entering the Boss arena creates/activates exactly one existing Boss actor,
  acquires the existing `boss` camera lock at the authoritative arena bounds,
  and prevents backward escape while the fight is active.
- Encounter completion must not directly call Boss internals; Stage progression
  only exposes eligibility, while MainScene remains the Phaser orchestration
  boundary.
- Boss death/cleanup continues to release only `boss` ownership and publish the
  existing stage-completion event exactly once. Do not change Boss combat,
  movement, facing, damage, art, HP, timing, or phase behavior.
- Scene restart resets Boss-entry eligibility, actor ownership, arena locks, and
  completion state with one Canvas and no stale listener or object.
- Preserve Title/start, three-screen traversal, both encounter gates, existing
  enemies, player combat, touch/keyboard input, and camera scroll bounds.
- Do not add Boss locomotion, Boss player damage, HUD, Pause, Result, Audio,
  assets, actors, attacks, enemy types, balance changes, or stage polish.

### Validation

- Deterministic tests prove Boss entry is ineligible before both encounter
  clears, triggers once after them, owns one Boss actor/lock, and resets cleanly.
- `pnpm test`, `pnpm build`, `pnpm build:github-pages`, `pnpm lint`, and
  `pnpm typecheck` pass.
- Desktop browser smoke starts from Title, clears both ordinary encounters,
  proves no Boss exists beforehand, enters the arena once, and observes one
  `boss` camera lock with zero console errors.
- Existing Boss defeat smoke still releases the arena and emits one completion
  event; ten Scene restarts retain one Canvas, zero premature Boss actors, no
  stale completion, and no camera lock.
- 844×390 landscape touch and 390×844 portrait FIT retain aligned controls and
  can reach the Boss entry without Canvas stretching.

### Expected files

- `app/game/stage/StageConfig.ts`
- `app/game/stage/EncounterFlow.ts` or one small Stage-owned entry contract
- `app/game/MainScene.ts`
- `app/game/BossActor.ts` only if activation ownership cannot remain in Scene
- `tests/app-contracts.test.mjs`
- Project status/evidence documents

### Risks

- The existing Boss is constructed eagerly; changing ownership can break
  restart cleanup or development Boss smoke fixtures.
- Reusing `encounter` and `boss` lock reasons incorrectly can release the wrong
  gate or leave the player soft-locked.
- Coupling the second encounter callback directly to Boss construction would
  make future Stage sequencing difficult to test and reset.
- Existing completion tests assume one Boss lifecycle; entry gating must retain
  exactly-once cleanup and publication behavior.
