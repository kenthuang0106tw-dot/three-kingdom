# M10 / Task 10.5P — Zhang Fei Formation Breaker Combat Prototype

Status: **Rejected after complete initial comparison**
Date: 2026-08-01

## Prototype and fixed boundaries

The development-only prototype tested the Task 10.5R formation-breaker role.
Zhang Fei retained the approved 47 frames and Zhangba serpent spear (丈八蛇矛).
Attack 2 knockback changed from 42px to 56px; Attack 3 returned from the failed
975ms/600ms-recovery rescue to 800ms/425ms recovery. Damage, HP, speed, body,
hitbox, Attack 1, Enemy, Boss, Combo Window, Stage, Camera, input, art, Audio,
UI, and production assets did not change.

The measurement boundary was frozen before trials: nearby threat radius 230px,
reposition window 1000ms, and required movement 64px. Repositioning used normal
vertical `ActionSnapshot` input; it never wrote actor coordinates or gameplay
state. Runs 1–3 used the unchanged baseline strategy and runs 4–5 used the same
role-aware strategy for both generals.

## Raw initial runs

`B/A` means baseline/aware. `M` is multi-target hits, `Avg` average targets
displaced per confirmed attack, `G` grouped Attack 2 confirms, `R` completed
repositions, `I3/U3` isolated/unsafe Attack 3 starts, `S2` voluntary Attack 2
stops, and `B3` Boss Attack 3 hits.

| Context | Player | Run | Plan | ms | Dmg | M | Avg | G | R | I3 | U3 | S2 | B3 | Commit |
| --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Entry | G | 1 | B | 25412 | 5 | 3 | 1.16 | 0 | 0 | 2 | 2 | 0 | 0 | 3502 |
| Entry | Z | 1 | B | 23554 | 5 | 4 | 1.24 | 0 | 0 | 2 | 1 | 0 | 0 | 3944 |
| Entry | G | 2 | B | 26143 | 7 | 3 | 1.16 | 0 | 0 | 2 | 2 | 0 | 0 | 3569 |
| Entry | Z | 2 | B | 22446 | 4 | 4 | 1.24 | 0 | 0 | 2 | 1 | 0 | 0 | 3837 |
| Entry | G | 3 | B | 25112 | 5 | 3 | 1.16 | 0 | 0 | 2 | 2 | 0 | 0 | 3506 |
| Entry | Z | 3 | B | 23246 | 5 | 4 | 1.24 | 0 | 0 | 2 | 1 | 0 | 0 | 3820 |
| Entry | G | 4 | A | 23475 | 3 | 4 | 1.21 | 0 | 0 | 2 | 0 | 3 | 0 | 2873 |
| Entry | Z | 4 | A | 21264 | 1 | 5 | 1.29 | 0 | 0 | 2 | 0 | 2 | 0 | 3614 |
| Entry | G | 5 | A | 24072 | 4 | 4 | 1.21 | 0 | 0 | 2 | 0 | 3 | 0 | 2818 |
| Entry | Z | 5 | A | 21017 | 1 | 5 | 1.29 | 0 | 0 | 2 | 0 | 2 | 0 | 3664 |
| Ambush | G | 1 | B | 19277 | 4 | 2 | 1.07 | 1 | 0 | 4 | 4 | 0 | 0 | 3901 |
| Ambush | Z | 1 | B | 21899 | 7 | 3 | 1.12 | 1 | 0 | 6 | 2 | 0 | 0 | 4425 |
| Ambush | G | 2 | B | 19425 | 4 | 2 | 1.07 | 1 | 0 | 4 | 4 | 0 | 0 | 3956 |
| Ambush | Z | 2 | B | 22771 | 7 | 0 | 1.00 | 0 | 0 | 7 | 2 | 0 | 0 | 4617 |
| Ambush | G | 3 | B | 19471 | 4 | 2 | 1.07 | 1 | 0 | 4 | 3 | 0 | 0 | 4010 |
| Ambush | Z | 3 | B | 18393 | 5 | 4 | 1.21 | 1 | 0 | 5 | 3 | 0 | 0 | 4120 |
| Ambush | G | 4 | A | 17965 | 0 | 9 | 1.39 | 4 | 4 | 3 | 0 | 6 | 0 | 2701 |
| Ambush | Z | 4 | A | 19429 | 0 | 11 | 1.50 | 5 | 5 | 2 | 0 | 7 | 0 | 3272 |
| Ambush | G | 5 | A | 17713 | 1 | 11 | 1.48 | 4 | 4 | 3 | 0 | 7 | 0 | 2469 |
| Ambush | Z | 5 | A | 19204 | 0 | 11 | 1.50 | 5 | 5 | 2 | 0 | 7 | 0 | 3172 |
| Boss | G | 1 | B | 5967 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 734 |
| Boss | Z | 1 | B | 5920 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 819 |
| Boss | G | 2 | B | 5853 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 732 |
| Boss | Z | 2 | B | 6160 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 888 |
| Boss | G | 3 | B | 5689 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 730 |
| Boss | Z | 3 | B | 6125 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 872 |
| Boss | G | 4 | A | 5757 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 732 |
| Boss | Z | 4 | A | 5920 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 818 |
| Boss | G | 5 | A | 5699 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 747 |
| Boss | Z | 5 | A | 6062 | 2 | 0 | 1.00 | 0 | 0 | 2 | 0 | 0 | 2 | 871 |

## Median and gate summary

| Context | Guan Yu duration / damage | Zhang Fei duration / damage |
| --- | --- | --- |
| Entry | 25112ms / 5 | 22446ms / 4 |
| Ambush | 19277ms / 4 | 19429ms / 5 |
| Boss | 5757ms / 2 | 6062ms / 2 |

- All 30 runs completed.
- Aware Ambush multi-target totals were Zhang Fei 22 and Guan Yu 20: **1.10×,
  failing the required 1.5×**.
- Aware Ambush median average targets displaced were approximately 1.50 and
  1.44: **+0.06, failing the required +0.20**.
- Both aware Zhang Fei Ambush runs completed every grouped Attack 2 reposition
  (5/5 each), used two isolated Attack 3 starts, and recorded zero unsafe starts.
- Across aware Entry/Ambush, Zhang Fei stopped after Attack 2 18 times and used
  isolated Attack 3 eight times. Neither branch was impossible.
- Both generals converted two Boss Attack 3 openings in every run.
- Zhang Fei was 0.8% slower in Ambush and 5.3% slower in Boss, within the 20%
  anti-waiting budget, and did not dominate all three contexts.

No definition adjustment was used. Attack 2 knockback or phase timing cannot
directly create the missing target-count advantage without counter-intuitively
tuning numbers to the threshold; increasing knockback can separate later
targets and reduce subsequent multi-hits. Repeating 30 runs after such a rescue
would not test a clearer tactical cause.

## Viewports and decision

- Desktop: Entry, Ambush, and Boss telemetry completed with one 1280×720 Canvas.
- 844×390: Canvas 693.33×390, no overflow; real joystick movement and touch
  Attack 1 succeeded.
- 390×844: Canvas 325×182.81, no overflow; real joystick movement and touch
  Attack 1 succeeded.
- Production: prototype query ignored; one intrinsic 1280×720 Canvas, empty
  dataset, no overflow, and zero captured runtime errors. Both packages retain
  the 52-file inventory and exclude Zhang Fei v2 assets.

**Decision: Reject.** The positioning behavior is valid and readable, but the
contracted formation-breaker advantage is not distinct enough from Guan Yu.
Thresholds were not weakened and Enemy/Boss values were not changed. Zhang Fei
remains development-only; Task 10.6 stays blocked.
