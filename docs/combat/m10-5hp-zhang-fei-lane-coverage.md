# M10 / Task 10.5HP — Zhang Fei Attack 2 Lane-Coverage Prototype

Status: **Rejected; runtime gameplay migration rolled back**
Date: 2026-08-01

## Fixed experiment

The prototype temporarily migrated all six attacks from the actor-level
`attackHitbox` to one required attack-owned rectangle while retaining exactly
one Scene-owned Arcade Zone. Guan Yu stayed at `142×86 @ (104,-48)` for all
three attacks. Zhang Fei Attack 1/3 stayed at `176×88 @ (132,-48)` and only
Attack 2 used `176×128 @ (132,-48)`.

No timing, damage, knockback, Hit Stop, Combo Window, Enemy, Boss, Stage,
Camera, input, art, Audio, UI, or production asset changed. Zhang Fei Attack 2
remained 525ms (175/125/225ms), damage 1, knockback 56px, and five-frame Hit
Stop. Focused geometry tests proved same-lane coverage, both facings, target
foot deltas `+60` and `-100`, Attack 1/3 narrow controls, and Guan Yu control
geometry before the comparison began.

## Before / after parameters

| Player / attack | Before | Prototype | Other gameplay |
| --- | --- | --- | --- |
| Guan Yu Attack 1–3 | `142×86 @ (104,-48)` | unchanged | unchanged |
| Zhang Fei Attack 1/3 | `176×88 @ (132,-48)` | unchanged | unchanged |
| Zhang Fei Attack 2 | `176×88 @ (132,-48)` | `176×128 @ (132,-48)` | 525ms, damage 1, 56px, five-frame Hit Stop |

The before comparison is the complete Task 10.5P dataset in
`docs/combat/m10-5p-zhang-fei-formation-breaker.md`: aware Ambush multi-target
totals were Guan Yu 20 and Zhang Fei 22 (1.10×), with approximately +0.06
median displaced-target advantage.

## Raw prototype runs

`B/A` means baseline/aware. `M` is multi-target hits, `Avg` average targets
displaced per confirmed attack, `G` grouped Attack 2 confirms, `R` completed
repositions, `I3/U3` isolated/unsafe Attack 3 starts, `S2` voluntary Attack 2
stops, and `B3` Boss Attack 3 hits.

| Context | Player | Run | Plan | ms | Dmg | M | Avg | G | R | I3 | U3 | S2 | B3 | Commit |
| --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Entry | G | 1 | B | 24808 | 4 | 3 | 1.16 | 0 | 0 | 2 | 2 | 0 | 0 | 3500 |
| Entry | G | 2 | B | 25007 | 4 | 3 | 1.16 | 0 | 0 | 2 | 2 | 0 | 0 | 3554 |
| Entry | G | 3 | B | 25017 | 4 | 3 | 1.16 | 0 | 0 | 2 | 2 | 0 | 0 | 3605 |
| Entry | G | 4 | A | 24098 | 4 | 4 | 1.21 | 0 | 0 | 2 | 0 | 3 | 0 | 2838 |
| Entry | G | 5 | A | 24003 | 4 | 4 | 1.21 | 0 | 0 | 2 | 0 | 3 | 0 | 2834 |
| Ambush | G | 1 | B | 19362 | 4 | 2 | 1.07 | 1 | 0 | 4 | 3 | 0 | 0 | 3872 |
| Ambush | G | 2 | B | 19413 | 4 | 2 | 1.07 | 1 | 0 | 4 | 4 | 0 | 0 | 3932 |
| Ambush | G | 3 | B | 19477 | 4 | 2 | 1.07 | 1 | 0 | 4 | 3 | 0 | 0 | 3884 |
| Ambush | G | 4 | A | 18079 | 0 | 9 | 1.39 | 4 | 4 | 3 | 0 | 6 | 0 | 2698 |
| Ambush | G | 5 | A | 18880 | 1 | 9 | 1.39 | 4 | 4 | 4 | 0 | 6 | 0 | 2803 |
| Boss | G | 1 | B | 5716 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 716 |
| Boss | G | 2 | B | 5767 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 731 |
| Boss | G | 3 | B | 5789 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 717 |
| Boss | G | 4 | A | 5743 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 729 |
| Boss | G | 5 | A | 5788 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 714 |
| Entry | Z | 1 | B | 23643 | 5 | 4 | 1.24 | 0 | 0 | 2 | 1 | 0 | 0 | 3924 |
| Entry | Z | 2 | B | 22968 | 4 | 4 | 1.24 | 0 | 0 | 2 | 1 | 0 | 0 | 3963 |
| Entry | Z | 3 | B | 23484 | 5 | 4 | 1.24 | 0 | 0 | 2 | 1 | 0 | 0 | 3924 |
| Entry | Z | 4 | A | 21430 | 1 | 5 | 1.29 | 0 | 0 | 2 | 0 | 2 | 0 | 3679 |
| Entry | Z | 5 | A | 21464 | 1 | 5 | 1.29 | 0 | 0 | 2 | 0 | 2 | 0 | 3662 |
| Ambush | Z | 1 | B | 21813 | 7 | 3 | 1.12 | 1 | 0 | 6 | 2 | 0 | 0 | 4385 |
| Ambush | Z | 2 | B | 21778 | 7 | 3 | 1.12 | 1 | 0 | 6 | 2 | 0 | 0 | 4372 |
| Ambush | Z | 3 | B | 21922 | 7 | 3 | 1.12 | 1 | 0 | 6 | 2 | 0 | 0 | 4443 |
| Ambush | Z | 4 | A | 24118 | 3 | 9 | 1.38 | 5 | 5 | 4 | 0 | 6 | 0 | 3763 |
| Ambush | Z | 5 | A | 24031 | 3 | 10 | 1.43 | 5 | 5 | 4 | 0 | 6 | 0 | 3846 |
| Boss | Z | 1 | B | 6250 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 1028 |
| Boss | Z | 2 | B | 6285 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 1013 |
| Boss | Z | 3 | B | 6286 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 1045 |
| Boss | Z | 4 | A | 6305 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 1044 |
| Boss | Z | 5 | A | 6457 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 1080 |

## Gate result

- All 30 deterministic runs completed.
- Aware Ambush multi-target totals were Zhang Fei 19 and Guan Yu 18:
  **1.06×, failing the required 1.5×**.
- Aware Ambush median average targets displaced were 1.405 and 1.39:
  **+0.015, failing the required +0.20**.
- Zhang Fei still completed 10/10 grouped Attack 2 repositions, recorded eight
  isolated and zero unsafe Attack 3 starts, and stopped after Attack 2 12 times.
- The broader rectangle therefore preserved decision telemetry but did not
  create the required practical lane-coverage distinction.
- Zhang Fei aware Ambush also took median damage 3 and took about 30% longer
  than Guan Yu, so the profile was not a universal answer; that does not rescue
  the two mandatory distinctness failures.

## Regression and viewport verification

- Final rolled-back runtime: 168/168 tests, typecheck, and lint with zero errors
  and eight existing `<img>` warnings.
- `pnpm build` and `pnpm build:github-pages` completed; each packaged exactly 52
  runtime files and excluded 165 source/QA files.
- Development Desktop: one fitted Canvas, real touch Attack 1, real joystick
  displacement, and no overflow.
- Development 844×390: Canvas 693.33×390, real joystick movement from X 180 to
  182, real touch Attack 1, and no overflow.
- Development 390×844: Canvas 325×182.81, real joystick movement from X 180 to
  185, real touch Attack 1, and no overflow.
- Production: one intrinsic 1280×720 Canvas, empty prototype/debug dataset, no
  overflow, and zero captured runtime errors even with prototype query flags.

The three-viewport interaction and production-isolation checks validate the
committed rollback state. The rejected geometry itself was evaluated through
the complete 30-run development comparison before rollback.

## Decision and rollback

**Decision: Reject.** The proposed geometry failed both mandatory tactical
gates and was not adjusted. The per-attack metadata migration, Scene resizing,
and focused runtime geometry test were rolled back. The committed runtime keeps
the pre-prototype actor-level hitbox contract, Zhang Fei remains
development-only, production packaging remains Guan Yu-only, and Task 10.6
stays blocked.

The next task is planning-only Task 10.5F. It must close the second-player
feasibility decision from the three rejected gameplay prototypes; it may not
start another numeric or geometry rescue.
