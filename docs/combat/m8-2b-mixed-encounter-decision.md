# M8 / Task 8.2B — Mixed Encounter Decision Prototype

Status: implementation verification complete; strategy comparison pending reviewer playtest.

## Before / after

| Parameter | Before | After |
| --- | --- | --- |
| Mauler attack cadence | 125ms startup / 125ms active / 125ms recovery | 200ms startup / 200ms active / 200ms recovery |
| Attack direction | implicit current facing | locked at attack entry |
| Attack Y line | implicit overlap | snapshots player Y at attack entry; ±48px is hittable |
| Simultaneous attackers | one Attack Slot | unchanged: one Attack Slot |
| Mauler re-entry cadence | 650–900ms director / 1150–1450ms recovery | 500–700ms director / 950–1150ms recovery |
| Duelist re-entry cadence | 400–600ms director / 700–900ms recovery | 400–500ms director / 700–800ms recovery |

Reviewer-requested difficulty change: normal Enemy HP is tripled (Soldier 12,
Mauler 15, Duelist 9). Damage, Player Combo, hitbox dimensions, Boss, stage,
art, and new systems remain unchanged.

## Automated evidence

- `mixed-encounter-decision.test.mjs` verifies locked facing/Y commitment and reliable vertical line escape.
- Existing manager flow retains slot release on attack complete, hurt, dead, and reset.
- Full suite passed 115/115; TypeScript passed; ESLint has 0 errors and four existing shell-image warnings.

## Reviewer ledger pending

Run five encounter-2 rounds for each strategy before accepting balance:

| Strategy | Runs | Damage taken | Time | Vertical dodges | Stop at attack2 | Target switches | Missed enemy attacks |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A: fixed target, full Combo, no vertical movement | 5 | Pending | Pending | Pending | Pending | Pending | Pending |
| B: deliberate evade / commitment / target switch | 5 | Pending | Pending | Pending | Pending | Pending | Pending |

The prototype is accepted only if strategy B is clearly safer or more reliable
without turning the encounter into permanent retreat.
