# M10 / Task 10.5 — Zhang Fei Combat Prototype

Status: **Implementation complete; paired combat decision pending**

## Identity and implementation

The development prototype uses the approved Zhang Fei identity and the
**Zhangba serpent spear (丈八蛇矛)**. It is not an ordinary straight spear,
guandao, or bare-hand replacement. All 47 Task 10.4 frames are mapped directly
to Phaser animations with one feet origin and one display scale.

Development comparison URLs:

- `?playerPrototype=guanyu&prototypeScenario=entry`
- `?playerPrototype=zhangfei&prototypeScenario=entry`
- replace `entry` with `ambush` or `boss` for the other fixed contexts.

These entrances skip the formal Title prompt and instantiate only the requested
fixed scenario. Production ignores them. Zhang Fei is not in the runtime asset
manifest, production package, or formal Title selection.

## Parameter comparison

| Property | Guan Yu control | Zhang Fei prototype |
| --- | ---: | ---: |
| Speed | 235 px/s | 200 px/s |
| Body | 86×54 | 96×58 |
| HP / hurt | 10 / 300ms | 10 / 300ms |
| Hitbox | 142×86 at +104,-48 | 176×88 at +132,-48 |
| Attack 1 | 375ms; 125/125/125 | 450ms; 150/100/200 |
| Attack 1 impact | 1 / 26px / 4f | 1 / 34px / 5f |
| Attack 2 | 375ms; 125/125/125 | 525ms; 175/125/225 |
| Attack 2 impact | 1 / 26px / 4f | 1 / 42px / 5f |
| Attack 3 | 650ms; 125/125/400 | 800ms; 225/150/425 |
| Attack 3 impact | 2 / 60px / 6f | 3 / 88px / 8f |

Attack phase columns are startup/active/recovery. Both actors retain the same
one-button, one-stage-per-input, hit-confirm-only combo, hit-once resolver,
independent hitbox, Hurt/Dead, Pause, Hit Stop, and reset owners.

## Evidence completed

- Focused definition/animation/composition tests pass.
- Guan Yu's frozen definition remains byte-for-value identical.
- Desktop browser loaded Zhang Fei in Forest Entry with one 1280×720 Canvas,
  the Soldier + Shield Guard composition, fixed feet, development datasets,
  no overflow, and the full丈八蛇矛 silhouette visible.
- Production packaging excludes `public/art/zhangfei-v2` and retains the
  released 52-file inventory.

## Paired trial matrix

The required five Guan Yu/Zhang Fei paired tactical runs per context are not
recorded in this checkpoint. No raw damage/clear-time values, medians, or
Accept/Adjust/Reject decision are invented. Task 10.5 therefore remains open
and Task 10.6 formal selection is blocked until those trials and the
844×390/390×844 interactive comparison are completed.
