# Next Task

## M5R / Task 5R.4 — Boss locomotion, facing, and Y alignment

### Why this is next

The player can now clear both ordinary encounters and enter a correctly gated
Boss arena, but the Boss remains stationary and can select attacks without
approaching or aligning with the player. Movement and facing must be correct
before Task 5R.5 can attach player-damaging attack hitboxes to trustworthy
positions and directions.

### Completion criteria

- Inspect the committed Boss lifecycle and attack frames before changing art or
  metadata. If no genuine walk frames exist, create the smallest original
  feet-aligned walk strip required for this Boss; do not animate movement by
  translating, rotating, or scaling an idle frame.
- Add one explicit locomotion decision path for the existing Boss: approach the
  player, align feet Y, stop inside configured attack range, and preserve the
  existing deterministic recovery/attack selection policy.
- Boss world movement uses its Arcade body velocity and the existing arena
  bounds. Sprite, body, feet anchor, depth, and facing remain synchronized.
- Horizontal facing follows the player and the source-art orientation metadata;
  the Boss must not walk or attack backward. Pure vertical movement preserves
  the last horizontal facing.
- Boss attacks may begin only when X distance and feet-Y difference are within
  explicit configurable thresholds. The Boss stops during attack, hurt, phase,
  dead, and cleaned states.
- Player and Boss remain inside arena bounds and do not overlap into an
  unrecoverable position. Do not add Boss attack hitboxes or player damage.
- Existing Boss entry, phase/hurt/death, cleanup, stage completion, Title,
  encounters, player combat, and mobile input remain unchanged.
- Do not add new attacks, Boss phases, HP/balance changes, HUD, Pause, Result,
  Audio, stage art, enemy types, or Task 5R.5 behavior.

### Validation

- Deterministic tests cover approach direction, Y alignment priority, stop
  range, facing, attack eligibility, non-movement states, and arena clamping.
- Asset/metadata tests prove any walk frames are genuine, share the existing
  Boss scale and feet anchor, and do not overlap adjacent atlas frames.
- `pnpm test`, `pnpm build`, `pnpm build:github-pages`, `pnpm lint`, and
  `pnpm typecheck` pass.
- Desktop browser smoke reaches the gated arena, then proves Boss X/Y world
  coordinates change toward a displaced player, feet Y aligns before attack,
  facing is correct on both sides, and no console error occurs.
- 844×390 landscape touch and 390×844 portrait FIT retain one Canvas, usable
  controls, correct Boss movement/facing, and unchanged arena entry.
- Existing Boss defeat smoke publishes one completion event after one arena
  release; ten Scene restarts retain zero premature Boss actors and no leaks.

### Expected files

- `app/game/boss/BossActor.ts`
- `app/game/boss/BossDecisionPolicy.ts` or one small locomotion policy module
- `app/game/boss/BossAttackMetadata.ts` only for source-facing metadata
- `app/game/MainScene.ts`
- `public/art/boss/*walk*` and reproducible asset metadata/tool only if genuine
  walk frames are missing
- `tests/app-contracts.test.mjs`
- Project status/evidence documents

### Risks

- Existing Boss assets do not include a walk strip; using idle-frame transforms
  would violate the animation rules and hide missing art.
- The current Boss body is immovable; changing movement ownership can desync its
  body zone, sprite, depth, or knockback callback.
- Source-facing assumptions can reverse both walk and later attack direction.
- Allowing attack selection before Y alignment would preserve the current
  unreachable-attack problem and make Task 5R.5 invalid.
- Mixing attack-hitbox work into locomotion would make failures difficult to
  isolate; player damage remains strictly deferred.
