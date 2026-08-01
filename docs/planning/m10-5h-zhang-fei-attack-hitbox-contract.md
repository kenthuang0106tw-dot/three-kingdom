# M10 / Task 10.5H — Zhang Fei Attack-Specific Hitbox Contract

Status: **Accepted 2026-08-01 as a planning contract. No runtime change.**

## Decision

Approve one minimum, identity-agnostic contract for a future prototype:
**each `PlayerAttackMetadata` owns one immutable, fixed hitbox profile for its
whole attack**.

This is not per-frame weapon collision. Startup, active, and recovery continue
to come from the existing animation metadata. The profile is configured once
when an attack begins, enabled only on existing active frames, and disabled on
every other frame and exit path.

## Ownership audit

| Owner | Current responsibility | Contract after a future migration |
| --- | --- | --- |
| `PlayerDefinition` | Identity, actor presentation/body/lifecycle, one shared `attackHitbox`, three attacks | Actor data plus three attacks; no actor-level hitbox |
| `PlayerAttackMetadata` | Frame order, phase frames, timing, impact | Also owns exactly one fixed `hitbox` |
| `PlayerAttackController` | Selects current attack and answers phase queries | Exposes the selected metadata unchanged; no Phaser object or identity branch |
| `PlayerActor` | Sprite, feet, facing, ground body, shadow | Unchanged; owns no attack zone |
| `MainScene` | Creates one independent Arcade Zone, positions/enables it, resolves overlaps | Still owns exactly one Zone; applies selected metadata generically at `startAttack()` |
| `CombatResolver` | Hit-once resolution for supplied overlaps | Unchanged; geometry remains outside damage resolution |
| `EnemyManager` / Shield Guard | Target body and front-cone block decision | Unchanged; block filters overlap before damage and cannot confirm Combo |
| `EffectDirector` / lifecycle | Hit Stop, flash, spark, shake, Pause/visibility ownership | Unchanged |

The current implementation already registers one animation-update and one
animation-complete listener in `create()` and removes both on Scene shutdown.
The future geometry change adds no listener, timer, collider, or body.

## Minimum schema

The future implementation may add this value type and field:

```ts
type PlayerAttackHitbox = Readonly<{
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}>;

type PlayerAttackMetadata = Readonly<{
  // existing fields remain
  hitbox: PlayerAttackHitbox;
}>;
```

After all six known attacks supply the field, remove the legacy
`PlayerDefinition.attackHitbox`. Do not support both paths, optional fallback,
named profile registry, character ID switch, inheritance, or arbitrary shape.

## Single-Zone consumption

A future implementation must preserve this exact lifecycle:

1. Scene creation constructs one disabled Arcade Zone. It may use Attack 1's
   dimensions as initial inert dimensions.
2. `startAttack(step)` calls `PlayerAttackController.begin(step)` and receives
   the selected immutable metadata.
3. While the Zone is disabled, the Scene applies `hitbox.width/height` to both
   the Zone and its Arcade body, then positions it from Player feet and facing.
4. Existing animation-update handling only enables/repositions the Zone on the
   selected attack's active frames; all other frames disable it.
5. Animation completion, miss, block-only completion, Hurt, Dead, combo reset,
   Scene restart, and shutdown disable the same Zone. The next `startAttack`
   always reapplies its profile, so no geometry can leak between combo steps.

Facing uses `playerFootX + facing * offsetX`; Y uses
`playerFootY + offsetY`. Width and height do not flip. The attack line remains
locked by the existing attack-facing contract. There is no per-frame offset,
polygon, rotated shape, weapon entity, or visual transform.

## Frozen geometry for the future prototype

All values are logical Phaser pixels relative to Player feet.

| Player / attack | Width | Height | Offset X | Offset Y | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| Guan Yu Attack 1–3 | 142 | 86 | 104 | -48 | Frozen control; current value copied to every attack |
| Zhang Fei Attack 1 | 176 | 88 | 132 | -48 | Narrow control; current value |
| Zhang Fei Attack 2 | 176 | **128** | 132 | -48 | Prototype broad lane sweep |
| Zhang Fei Attack 3 | 176 | 88 | 132 | -48 | Narrow control; current value |

Only Attack 2 height differs. This isolates vertical lane coverage from reach,
damage, knockback, timing, feet, and facing. The legal discovery range is
120–136px height, but the next prototype must begin and finish at 128px; it has
no tuning pass. A failed or dominant result returns to planning.

With the existing 58×52 enemy ground body and the same horizontal overlap, the
focused geometry check uses target foot deltas `+60` and `-100`: Zhang Fei
Attack 2 must overlap both, while his 88px Attack 1/3 profiles must overlap
neither. Same-lane targets must remain reachable by all three attacks. This is
a contract probe, not a replacement for playtesting.

## Explicit tactical cost

Zhang Fei Attack 2 keeps the current development definition unchanged except
for the proposed geometry:

- total duration **525ms**: 175ms startup, 125ms active, 225ms recovery;
- damage 1, knockback 56px, five-frame Hit Stop;
- facing and attack line locked after startup begins;
- front-only rectangle with no armor, invulnerability, HP, damage, Combo
  Window, cancel, movement, or turning benefit;
- miss and Shield Guard block do not confirm Combo;
- Hurt still interrupts the attack and clears the Zone.

Attack 1, Attack 3, all Guan Yu values, enemies, Boss, and encounters are fixed.

## Future prototype protocol

The sole eligible implementation task is Task 10.5HP. It changes only the
schema migration, six metadata profiles, generic single-Zone consumption,
focused tests/diagnostics, and comparison report.

### Fixed comparison

- Use the existing development-only Guan Yu/Zhang Fei entrance.
- Use the same Entry, Ambush, and Boss scenarios and deterministic seed.
- Complete five runs per player per context: **30 total**.
- Preserve the Task 10.5P aware strategy, 230px threat radius, 1000ms/64px
  reposition rule, and raw telemetry.
- Record Attack 2 target count, target foot-Y deltas, grouped confirms,
  repositioning, isolated/unsafe Attack 3 starts, damage, duration,
  interruptions/recovery hits, blocks, and reset state.

### Acceptance gates

All gates must pass:

1. The `+60` and `-100` lane probes distinguish only Zhang Fei Attack 2;
   same-lane reach and left/right mirroring remain correct.
2. In aware Ambush runs, Zhang Fei's Attack 2 multi-target total is at least
   **1.5×** Guan Yu's; the rejected threshold is not lowered.
3. Median average targets displaced per confirmed aware Ambush Attack 2 exceeds
   Guan Yu by at least **+0.20**; the rejected threshold is not lowered.
4. Every aware Zhang Fei grouped Attack 2 is followed by the established real
   reposition input; each aware Ambush run includes at least two isolated
   Attack 3 starts and zero unsafe starts.
5. At least one valid Ambush opening is intentionally left at Attack 2 because
   committing or repositioning is unsafe. Broader coverage must not make the
   full combo automatic.
6. Zhang Fei is no more than 20% slower than Guan Yu in Ambush or Boss and does
   not have both lower median damage and lower median duration in all contexts.
7. Attack 2 can still be interrupted during commitment; no armor, tracking,
   rear hit, extra damage, or Combo confirmation on miss/block appears.
8. One attack hits each target once, same-frame global effects remain
   coalesced, and Boss/Shield Guard behavior remains correct.
9. Pause, Hit Stop, Hurt, Dead, combo reset, ten Scene resets, and shutdown
   leave the Zone disabled with Attack 1 geometry reapplied on the next run.
10. Desktop, 844×390, 390×844, both production builds, runtime inventory, and
    production isolation remain accepted.

### Reject and rollback

Reject without further numeric rescue if any threshold fails, if Attack 2
becomes the universal answer, if the best strategy is passive waiting, or if
implementation requires identity branches, extra Zones, per-frame geometry,
Enemy/Boss tuning, or art changes. Rollback is the Task 10.5HP commit: restore
the actor-level shared profile and retain this document plus the rejected
evidence. Task 10.6 remains blocked after rejection.

## Expected future implementation files

- `app/game/player/PlayerDefinition.ts`
- `app/game/player/GuanYuAnimationMetadata.ts`
- `app/game/player/ZhangFeiAnimationMetadata.ts`
- `app/game/MainScene.ts`
- focused player/combat/prototype tests
- one Task 10.5HP combat report and closeout document updates

No `PlayerActor`, `PlayerAttackController`, `CombatResolver`, Enemy, Boss,
Stage, Camera, React, input, Audio, UI, art, atlas, or production asset file is
expected to change. Any need to modify those owners stops the prototype for
contract review.
