# M8 / Task 8.2A — Combo Commitment Prototype

Status: accepted by reviewer on 2026-07-25.

## Fixed scope

Only Guan Yu attack 3 has experimental impact metadata. Attack 1 and attack 2
retain their existing frame sequence, active frames, hitbox, Combo window,
damage, knockback, hit stop, and total duration. No enemy, Boss, art, audio,
Stage, Camera, or UI value changed.

## Before / after

| Attack | Before duration | After duration | Damage | Knockback | Hit stop | Recovery |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| attack1 | 375 ms | 375 ms | 1 | 26 px | 66.67 ms (4 frames) | 125 ms |
| attack2 | 375 ms | 375 ms | 1 | 26 px | 66.67 ms (4 frames) | 125 ms |
| attack3 | 375 ms | 650 ms | 1 -> 2 | 26 -> 60 px | 66.67 -> 100 ms (6 frames) | 125 -> 400 ms |

A reviewer found the previous 250 ms recovery too close to the first two
attacks. Attack 3 keeps its 125 ms startup and 125 ms active phase. The
additional 275 ms is appended to its existing recovery frame; neither its atlas frame
sequence nor hitbox timing changes.

## Mechanical verification

- `tests/combo-commitment.test.mjs` verifies attack1/2 baseline impact and
  duration, the attack3 650 ms / 400 ms recovery contract, independent impact
  values, hit-confirm gating, one-step Combo advancement, hit-once resolution,
  and Scene-create Combo reset.
- Full deterministic suite: 113/113 passed.
- TypeScript passed. ESLint passed with 0 errors and the existing 8 shell-image
  warnings.
- Vinext and GitHub Pages production builds passed. The production asset report
  remains within the accepted delivery and decoded-memory budgets.
- Production browser smoke passed on desktop, 844x390 landscape, and 390x844
  portrait: one Canvas in each profile and no captured console errors. A real
  keyboard traversal reached the first Soldier encounter.

## Scenario result ledger

The requested three ten-sample gameplay ledgers require a human-controlled
decision at the second-hit window and observation of whether a later Enemy hit
lands during attack3 recovery. Browser automation can validate input, movement,
encounter entry, rendering, and contracts, but it cannot honestly classify
player tactical intent or attribute an incoming hit to the recovery interval.
No synthetic counts are recorded as human playtest data.

| Scenario | Required samples | Recorded human samples | Status |
| --- | ---: | ---: | --- |
| Single Soldier | 10 | 0 | Pending reviewer playtest |
| Mauler + Duelist | 10 | 0 | Pending reviewer playtest |
| Boss at close range | 10 | 0 | Pending reviewer playtest |

## Technical-lead decision

**Accepted.** Reviewer acceptance confirms that the 650 ms attack3, including
its 400 ms recovery, has sufficient commitment while remaining useful. The
existing Combo and lifecycle contracts remain green. Detailed per-scenario
counts were not supplied, so this records acceptance rather than inventing a
playtest ledger.
