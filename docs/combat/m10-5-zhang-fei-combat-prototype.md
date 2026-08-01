# M10 / Task 10.5 — Zhang Fei Combat Prototype

Status: **Rejected after complete paired comparison**
Date: 2026-08-01

## Scope and identity

The development-only prototype uses the approved 47-frame Zhang Fei atlas and
the丈八蛇矛 identity. Guan Yu remains the frozen control. The fixed contexts are:

- Entry: Soldier + Shield Guard;
- Ambush: Mauler + Duelist + Crossbow;
- Boss: close legal attack range.

The first three runs use the same baseline controller for both generals. Runs
four and five use the same archetype-aware controller, including vertical line
avoidance, Crossbow threat priority, Shield Guard flanking, and one deliberate
stop after Attack 2 while multiple enemies remain. Both controllers feed the
normal `ActionSnapshot`; they do not write actor coordinates, HP, enemy state,
or hit results.

## Parameter history

| Parameter | Guan Yu control | Initial Zhang Fei | Adjustment 1 | Final evaluated Zhang Fei |
| --- | ---: | ---: | ---: | ---: |
| Speed | 235 | 200 | 200 | 200 |
| Attack hitbox | 142×86, +104/-48 | 176×88, +132/-48 | unchanged | unchanged |
| Attack 1 total / damage | 375ms / 1 | 450ms / 1 | unchanged | unchanged |
| Attack 2 total / damage | 375ms / 1 | 525ms / 1 | unchanged | unchanged |
| Attack 3 total | 650ms | 800ms | 800ms | 975ms |
| Attack 3 recovery | 275ms | 425ms | 425ms | 600ms |
| Attack 3 damage | 2 | 3 | 2 | 2 |
| Attack 3 knockback / Hit Stop | 60px / 6f | 88px / 8f | unchanged | unchanged |

Adjustment 1 removed the initial Entry dominance but produced Recovery hits in
only Ambush. The final adjustment added 175ms to Attack 3 recovery. No Enemy,
Boss, Stage, Camera, Combo Window, hitbox, input, UI, Audio, or art value was
changed.

## Final raw runs

Array columns use Attack 1/2/3 order. `S/H/M/B/I` means
started/hit/missed/blocked/interrupted. `Stop2` is a voluntary stop after a
confirmed Attack 2. `RecHit` is damage received during a recovery frame.
`Commit` is accumulated recovery time in milliseconds.

### Entry

| Player | Run | Strategy | Complete | Duration | Damage | S | H | M | B | I | Stop2 | RecHit | Multi | Avg displaced | Commit |
| --- | ---: | --- | --- | ---: | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| Guan Yu | 1 | baseline | yes | 25295 | 5 | 14/12/4 | 13/4/2 | 0/0/0 | 0/11/3 | 1/0/0 | 0 | 0 | 3 | 1.16 | 3503 |
| Zhang Fei | 1 | baseline | yes | 24388 | 6 | 12/11/4 | 12/4/2 | 0/0/0 | 0/10/3 | 0/0/0 | 0 | 0 | 3 | 1.17 | 4821 |
| Guan Yu | 2 | baseline | yes | 24851 | 4 | 14/12/4 | 13/4/2 | 0/0/0 | 0/11/3 | 1/0/0 | 0 | 0 | 3 | 1.16 | 3492 |
| Zhang Fei | 2 | baseline | yes | 23768 | 5 | 12/11/4 | 12/4/2 | 0/0/0 | 0/10/3 | 0/0/0 | 0 | 0 | 3 | 1.17 | 4814 |
| Guan Yu | 3 | baseline | yes | 24927 | 4 | 14/12/4 | 13/4/2 | 0/0/0 | 0/11/3 | 1/0/0 | 0 | 0 | 3 | 1.16 | 3538 |
| Zhang Fei | 3 | baseline | yes | 24317 | 6 | 12/11/4 | 12/4/2 | 0/0/0 | 0/10/3 | 0/0/0 | 0 | 0 | 3 | 1.17 | 4739 |
| Guan Yu | 4 | aware | yes | 22309 | 2 | 14/12/2 | 13/3/2 | 0/0/0 | 0/11/2 | 1/0/0 | 1 | 0 | 3 | 1.17 | 2808 |
| Zhang Fei | 4 | aware | yes | 25129 | 5 | 13/12/3 | 13/4/2 | 0/0/0 | 1/11/3 | 0/0/0 | 1 | 0 | 2 | 1.11 | 4671 |
| Guan Yu | 5 | aware | yes | 22043 | 2 | 14/12/2 | 13/3/2 | 0/0/0 | 0/11/2 | 1/0/0 | 1 | 0 | 3 | 1.17 | 2788 |
| Zhang Fei | 5 | aware | yes | 25215 | 5 | 13/12/3 | 13/4/2 | 0/0/0 | 1/11/3 | 0/0/0 | 1 | 0 | 2 | 1.11 | 4663 |

### Ambush

| Player | Run | Strategy | Complete | Duration | Damage | S | H | M | B | I | Stop2 | RecHit | Multi | Avg displaced | Commit |
| --- | ---: | --- | --- | ---: | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| Guan Yu | 1 | baseline | yes | 19429 | 4 | 12/11/8 | 11/9/7 | 0/2/0 | 0/0/0 | 1/1/1 | 0 | 0 | 2 | 1.07 | 3924 |
| Zhang Fei | 1 | baseline | yes | 21275 | 5 | 10/10/8 | 10/8/8 | 0/1/0 | 0/0/0 | 0/1/2 | 0 | 1 | 2 | 1.08 | 4859 |
| Guan Yu | 2 | baseline | yes | 19554 | 4 | 12/11/8 | 11/9/7 | 0/2/0 | 0/0/0 | 1/1/1 | 0 | 0 | 2 | 1.07 | 3927 |
| Zhang Fei | 2 | baseline | yes | 21121 | 7 | 10/9/8 | 10/8/8 | 0/0/0 | 0/0/0 | 1/1/2 | 0 | 2 | 2 | 1.08 | 4730 |
| Guan Yu | 3 | baseline | yes | 19483 | 4 | 12/11/8 | 11/9/7 | 0/2/0 | 0/0/0 | 1/1/1 | 0 | 0 | 2 | 1.07 | 3910 |
| Zhang Fei | 3 | baseline | yes | 21269 | 7 | 10/9/8 | 10/8/8 | 0/0/0 | 0/0/0 | 1/1/2 | 0 | 2 | 2 | 1.08 | 4699 |
| Guan Yu | 4 | aware | yes | 16849 | 0 | 8/8/7 | 8/8/7 | 0/0/0 | 0/0/0 | 0/0/0 | 1 | 0 | 5 | 1.22 | 3552 |
| Zhang Fei | 4 | aware | yes | 17408 | 0 | 7/7/5 | 7/7/5 | 0/0/0 | 0/0/0 | 0/0/0 | 1 | 0 | 10 | 1.53 | 3993 |
| Guan Yu | 5 | aware | yes | 16803 | 0 | 8/8/7 | 8/8/7 | 0/0/0 | 0/0/0 | 0/0/0 | 1 | 0 | 5 | 1.22 | 3523 |
| Zhang Fei | 5 | aware | yes | 15892 | 0 | 6/6/5 | 6/6/5 | 0/0/0 | 0/0/0 | 0/0/0 | 1 | 0 | 11 | 1.65 | 3434 |

### Boss

| Player | Run | Strategy | Complete | Duration | Damage | S | H | M | I | RecHit | Boss A3 | Commit |
| --- | ---: | --- | --- | ---: | ---: | --- | --- | --- | --- | ---: | ---: | ---: |
| Guan Yu | 1 | baseline | yes | 5818 | 2 | 3/2/2 | 2/2/2 | 0/0/0 | 1/0/0 | 0 | 2 | 716 |
| Zhang Fei | 1 | baseline | yes | 6112 | 2 | 2/2/2 | 2/2/2 | 0/0/0 | 0/0/0 | 0 | 2 | 999 |
| Guan Yu | 2 | baseline | yes | 5756 | 2 | 3/2/2 | 2/2/2 | 0/0/0 | 1/0/0 | 0 | 2 | 717 |
| Zhang Fei | 2 | baseline | yes | 6018 | 2 | 2/2/2 | 2/2/2 | 0/0/0 | 0/0/0 | 0 | 2 | 998 |
| Guan Yu | 3 | baseline | yes | 5735 | 2 | 3/2/2 | 2/2/2 | 0/0/0 | 1/0/0 | 0 | 2 | 718 |
| Zhang Fei | 3 | baseline | yes | 6153 | 2 | 2/2/2 | 2/2/2 | 0/0/0 | 0/0/0 | 0 | 2 | 1013 |
| Guan Yu | 4 | aware | yes | 5703 | 2 | 3/2/2 | 2/2/2 | 0/0/0 | 1/0/0 | 0 | 2 | 715 |
| Zhang Fei | 4 | aware | yes | 5911 | 2 | 2/2/2 | 2/2/2 | 0/0/0 | 0/0/0 | 0 | 2 | 978 |
| Guan Yu | 5 | aware | yes | 5796 | 2 | 3/2/2 | 2/2/2 | 0/0/0 | 1/0/0 | 0 | 2 | 713 |
| Zhang Fei | 5 | aware | yes | 6056 | 2 | 2/2/2 | 2/2/2 | 0/0/0 | 0/0/0 | 0 | 2 | 993 |

Boss Block, multi-target, and voluntary-stop values are all zero by context.

## Median comparison

| Context | Guan Yu duration / damage / recovery hits / commitment | Zhang Fei duration / damage / recovery hits / commitment |
| --- | --- | --- |
| Entry | 24851ms / 4 / 0 / 3492ms | 24388ms / 5 / 0 / 4739ms |
| Ambush | 19429ms / 4 / 0 / 3910ms | 21121ms / 5 / 5 / 4699ms |
| Boss | 5756ms / 2 / 0 / 716ms | 6056ms / 2 / 0 / 998ms |

All 30 final runs completed. Both generals deliberately stopped after Attack 2
twice in Entry and twice in Ambush. Both converted ten Boss Attack 3 openings.
Neither general has lower median damage and duration in all three contexts.

## Viewport and lifecycle evidence

- Desktop: one intrinsic 1280×720 Canvas; fixed Entry composition and real
  movement/attack flow; no overflow.
- 844×390: fitted 693.33×390 Canvas; joystick moved Zhang Fei from X 180 to
  195 and touch attack started Attack 1; no overflow.
- 390×844: fitted 325×182.81 Canvas; the same joystick and attack interaction
  succeeded; no overflow.
- Pause, Hit Stop, Hurt, hit-once, Combo one-step, reset, and production
  isolation remain covered by the automated suite.

## Decision — Reject

The final hypothesis passes completion, identity, stop/commit, Boss conversion,
non-dominance, and mobile readability checks. It fails the explicit acceptance
criterion that Zhang Fei receive more Recovery punishment than Guan Yu in at
least two contexts: this occurred only in Ambush (5 versus 0), while Entry and
Boss were both 0 versus 0. Increasing Recovery further would risk making
waiting the primary play and would be a third balance rescue without evidence
that enemy timings can express it.

Task 10.5 is therefore rejected. The prototype and telemetry remain
development-only evidence; Zhang Fei is not added to formal Title selection or
production packaging. Task 10.6 remains blocked. The next task must revise the
tactical hypothesis before another combat prototype; it may not tune enemies
to force this prototype to pass.
