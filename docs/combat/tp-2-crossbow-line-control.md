# TP-2 Crossbow Line-Control Prototype

Status: implementation verification pending manual strategy comparison.

## Development-only entrances

- Test A: `?crossbowTest=A` — Crossbow alone.
- Test B: `?crossbowTest=B` — Crossbow plus existing Soldier.

Neither entrance changes the formal Stage encounter configuration.

## Timing contract

| Phase | Duration | Behaviour |
| --- | ---: | --- |
| Aim tracking | 550 ms | Yellow line slowly follows Player Y. |
| Lock | 350 ms | Red line freezes; existing UI confirmation cue plays. |
| Fire | immediate at 900 ms | One straight temporary arrow is created on the locked line. |
| Reload | 3000 ms | Releases Attack Slot; no primary threat. |

The arrow moves at 520 px/s for at most 960 px and is destroyed by its first valid Player or other Enemy overlap. At Lock, it snapshots the Player's feet Y; it is pinned to that horizontal line every update and only hits a target with the same rounded feet Y. Any vertical movement after Lock avoids the arrow. The Crossbow may obtain the single Attack Slot up to 640 px away (instead of melee's 220 px), so it can create a visible ranged decision before entering melee distance. Player hits use the existing Hurt path. Friendly Enemy hits deal 1 damage, Hurt, Flash, Spark, and a 16 px horizontal knockback without global hit-stop.

## Manual acceptance ledger

Do not treat this table as completed until the reviewer performs the runs.

| Strategy | Runs | Player arrow hits | Successful vertical dodges | Aim interrupts | Combo stops | Target switches | Friendly hits | Completion time |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A: ignore line, keep attacking nearest target | 0 / 5 | — | — | — | — | — | — | — |
| B: read Lock, dodge, interrupt, switch targets | 0 / 5 | — | — | — | — | — | — | — |

Acceptance requires Strategy B to be materially safer than A, readable Lock timing in desktop/landscape/portrait, at least one deliberate friendly-fire attempt in Test B, and no simultaneous second primary attacker.
