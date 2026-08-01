# M10 / Task 10.5F — Zhang Fei Second-Player Feasibility Closeout

**Date:** 2026-08-01

**Status:** Accepted planning decision

**Decision:** Defer Zhang Fei to a later milestone and close M10 without a second playable character.

## Evidence reviewed

The historical acceptance thresholds remain unchanged. This closeout does not reinterpret a failed gate as success.

| Prototype | Paired runs | Local behavior that worked | Required distinction that failed | Decision |
|---|---:|---|---|---|
| Task 10.5 — heavy commitment | 30 | Complete contexts, deliberate Attack 2 stops, Boss Attack 3 conversions, and non-dominance | More Recovery-frame punishment in at least two contexts; observed only in Ambush (5 vs 0), with Entry and Boss both 0 vs 0 | Rejected |
| Task 10.5P — formation breaker | 30 | Grouped Attack 2 repositioning and isolated Attack 3 use | Aware-Ambush multi-target ratio at least 1.5× and displaced-target advantage at least +0.20; observed 1.10× and about +0.06 | Rejected |
| Task 10.5HP — Attack 2 lane coverage | 30 | Deterministic lane probes, repositioning, intentional stops, isolated finishers, and non-dominance | Same 1.5× and +0.20 gates; observed 1.06× and +0.015 | Rejected and rolled back |

Across 90 paired runs, each hypothesis produced useful local behavior but none created a reliable, cross-context tactical distinction from Guan Yu. The production runtime therefore remains Guan Yu-only and retains the actor-level attack hitbox.

## Three evaluated outcomes

### 1. Defer Zhang Fei to a later milestone — Selected

This is the smallest decision that respects the evidence. A fourth timing, impact, or hitbox rescue would continue sunk-cost development without an accepted tactical direction. M10 closes without delivering its original second-playable result.

Product impact:

- Version 0.1.0 remains a complete Guan Yu Vertical Slice.
- There is no character-select promise in the current production build.
- Zhang Fei may return only after a later product-direction task approves a genuinely different gameplay and identity contract.

### 2. Revise the production / identity contract — Not selected

This would be valid only with explicit product-owner authority because it may invalidate the approved heavy-warrior identity, existing art budget, and previous comparison contract. No such authority is present in this task, so implementation cannot resume through this route.

### 3. Close M10 permanently without a second playable — Not selected

The tactical hypotheses failed, but the character assets and generic Player seam remain reusable. Permanently cancelling the character would discard optional value without evidence that Zhang Fei can never work under a different, authorized product contract. Deferral is more accurate than cancellation.

## Preserved work

- Generic `PlayerDefinition` composition boundary and Guan Yu regression freeze.
- Approved 47-frame Zhang Fei atlas, metadata, feet alignment, preview, QA outputs, provenance, and Zhangba serpent spear identity reference.
- Three combat reports, 90 paired-run evidence, deterministic scenarios, telemetry, and focused contract tests.
- The planning-only attack-owned hitbox design remains reference material; it is not the current runtime contract.

## Discarded assumptions

- Longer commitment and recovery alone make Zhang Fei tactically distinct.
- Stronger knockback plus repositioning alone produces a formation-breaker role.
- Broader Attack 2 vertical lane coverage alone creates meaningful multi-target distinction.
- More numeric or rectangular-hitbox tuning is an acceptable continuation of M10.

## Authority required to reopen Zhang Fei

Reopening requires an explicit product-owner decision that approves a revised gameplay / identity / art contract, a genuinely different tactical mechanic, and new acceptance criteria before implementation. It may not begin as a fourth numeric or hitbox rescue. Technical implementation, character selection, and production packaging remain unauthorized until that decision exists.

## Milestone disposition

- Task 10.5F is complete.
- Tasks 10.6 and 10.7 are removed from the active sequence and deferred with Zhang Fei.
- M10 is closed as an evidence-complete but product-goal-incomplete milestone.
- The next task is planning-only M11 / Task 11.1 — Post-M10 Product Direction Selection.
