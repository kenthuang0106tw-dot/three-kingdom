# M10 / Task 10.5D — Zhang Fei Second-Player Direction Decision

Status: **Completed 2026-08-01 — revise the Player/art contract before another prototype.**

## Evidence reviewed

The decision uses the completed Task 10.5 and Task 10.5P protocols. Their
thresholds and results are retained exactly; this task does not reinterpret a
failed gate as a pass.

| Evidence | Task 10.5 committed controller | Task 10.5P formation breaker |
| --- | --- | --- |
| Protocol | 30 paired Entry/Ambush/Boss runs | 30 paired Entry/Ambush/Boss runs |
| Behavior that worked | Deliberate Attack 2 stops and Boss Attack 3 conversions | Every aware grouped Attack 2 was followed by repositioning; isolated Attack 3 was used with zero unsafe starts |
| Required distinction | More Recovery punishment in at least two contexts | At least 1.5× Ambush multi-target hits and +0.20 displacement advantage |
| Result | More punishment only in Ambush; Entry/Boss were both 0 versus 0 | 1.10× multi-target ratio and about +0.06 displacement advantage |
| Decision | Reject | Reject |

The common result is not that Zhang Fei lacks usable behavior. It is that
timing, damage, and knockback changes applied through one actor-level rectangle
do not produce a sufficiently distinct 2.5D target-coverage decision.

## Selected direction

Select **revise the Player/art contract with a genuinely different mechanic and
an explicit cost**.

The only candidate carried into discovery is an **attack-specific hitbox
profile**: Zhang Fei Attack 2 may use a broad, front-facing 2.5D sweep with more
vertical lane coverage than his Attack 1 and Attack 3. This matches the existing
seven-pose Attack 2 spear sweep and directly targets the failed multi-target
coverage signal. It is not authorized for implementation by this decision.

The explicit cost is part of the mechanic, not a later balance rescue:

- Attack 2 retains its current 525ms commitment and existing startup/recovery.
- Facing and attack line remain locked after startup begins.
- The sweep remains front-only and grants no armor, invulnerability, extra
  damage, HP, Combo Window, or cancel benefit.
- A miss or block still produces no hit confirm and ends the combo normally.

No Attack 1, Attack 3, Enemy, Boss, Stage, Camera, input, UI, Audio, or art value
is changed by Task 10.5D.

## Why the other directions are rejected

### Do not defer Zhang Fei and close M10 yet

M10 already has accepted identity, 47 approved poses, stable feet/atlas data,
mobile-readable preview, and two complete rejected gameplay datasets. Task
10.5P also proved that stop/reposition/isolated-finisher decisions are usable.
That evidence justifies one bounded contract investigation aimed at the failed
coverage cause. Deferral before that investigation would discard a concrete,
testable lead rather than avoid speculative work.

### Do not stop pending product-owner direction

No missing product choice is required to make the technical decision. The
project goal still names Zhang Fei as the second playable general, the current
architecture constraint is documented, and both rejection reports identify the
same limitation. The Technical Lead can authorize contract discovery without
authorizing gameplay implementation or formal selection.

## Architecture finding

`PlayerDefinition` currently owns one `attackHitbox` shared by all three attack
steps. `PlayerAttackController` consumes attack timing/impact data, while the
Scene composes that one actor-level zone. The M10 architecture contract also
explicitly forbids per-attack geometry. Adding a second rectangle directly to
Zhang Fei metadata now would therefore violate the accepted boundary and hide a
cross-owner change inside another prototype.

Task 10.5H must decide the smallest coherent contract before code changes. It
must answer:

1. Whether hitbox geometry belongs on `PlayerAttackMetadata` or in a separately
   keyed immutable profile owned by `PlayerDefinition`.
2. How the Scene and attack controller activate one attack-specific profile
   without branching on player identity.
3. Whether the existing single independent Arcade zone can be resized/rebased
   at attack start, avoiding extra bodies, listeners, or per-frame geometry.
4. How facing, feet-relative offsets, active-frame timing, hit-once, block,
   multi-target, reset, Pause, Hit Stop, Hurt, and production isolation remain
   unchanged.
5. Which fixed geometry and paired acceptance gates would prove distinct lane
   coverage without making Attack 2 a dominant universal answer.

## Next gate

The sole next task is **M10 / Task 10.5H — Zhang Fei Attack-Specific Hitbox
Contract**. It is planning/discovery only. It may propose the minimum schema,
ownership, geometry limits, rollback boundary, and one measurable future
prototype, but it may not edit runtime types, attack metadata, hitboxes, art, or
formal character selection.

Task 10.6 remains blocked until 10.5H is accepted and a later explicitly
authorized prototype proves the revised mechanic.
