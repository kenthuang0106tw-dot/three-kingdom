# M10 / Task 10.5R — Zhang Fei Tactical Hypothesis Revision

Status: **Accepted as a planning contract; prototype not yet accepted**
Date: 2026-08-01

## 1. Evidence-based diagnosis

Task 10.5 rejected the original **committed space controller** hypothesis after
30 paired runs. Increasing Attack 3 recovery from 425ms to 600ms still produced
more Recovery-frame hits than Guan Yu in only Ambush. Entry and Boss recorded
zero Recovery-frame hits for both generals, so those two contexts do not expose
that distinction. Raising the number again would test patience rather than a
new tactical role.

The same evidence does support a different hypothesis. In the two aware
Ambush runs, Zhang Fei produced 10 and 11 multi-target hits with 1.53 and 1.65
average targets displaced per confirmed attack. Guan Yu produced 5 and 5 with
an average of 1.22. Both completed without damage. This is evidence for group
separation, not evidence for globally unsafe recovery.

## 2. Revised role — formation breaker

Zhang Fei is a **formation breaker**. His Zhangba serpent spear (丈八蛇矛) uses
the first two attacks to contact and separate a clustered enemy line. After a
confirmed Attack 2, the intended choice is:

- stop and reposition when multiple threats remain close; or
- commit to Attack 3 when the displaced target is isolated and the opening is
  readable.

Guan Yu remains the faster all-rounder with safer general-purpose sequencing.
Zhang Fei is not a tank, a longer-ranged safe character, or a character whose
identity depends on waiting through excessive recovery.

## 3. Revised prototype values

Only existing `PlayerDefinition` values and existing phase mappings may change.
No per-frame hitbox, new state, new input, armor, skill, cancel, or identity
branch is authorized.

| Property | Guan Yu control | Rejected 10.5 final | 10.5P starting hypothesis |
| --- | ---: | ---: | ---: |
| movement / HP / hurt | 235 / 10 / 300ms | 200 / 10 / 300ms | unchanged |
| ground body | 86×54 | 96×58 | unchanged |
| shared hitbox | 142×86 at +104/-48 | 176×88 at +132/-48 | unchanged |
| Attack 1 total / damage / knockback / Hit Stop | 375ms / 1 / 26px / 4f | 450ms / 1 / 34px / 5f | unchanged |
| Attack 2 total / damage / knockback / Hit Stop | 375ms / 1 / 26px / 4f | 525ms / 1 / 42px / 5f | **525ms / 1 / 56px / 5f** |
| Attack 3 total / phase | 650ms / 125-125-400 | 975ms / 225-150-600 | **800ms / 225-150-425** |
| Attack 3 damage / knockback / Hit Stop | 2 / 60px / 6f | 2 / 88px / 8f | unchanged |

Attack 2 displacement is the role-bearing change. Attack 3 returns to its
pre-rescue recovery because the revised hypothesis no longer tries to create
punishment by raw delay. Attack 1, damage, HP, speed, body, hitbox, Combo Window,
and all shared lifecycle contracts remain unchanged.

Task 10.5P may make **at most one** definition-only adjustment after testing the
starting hypothesis. The report must show the initial result before the
adjustment. A second rescue attempt means Reject.

## 4. Fixed paired protocol

Use the same development build, clean Scene start, spawn positions, gameplay
seed, and controller rules for each paired run. Guan Yu is always the control.
Run each general five times in each unchanged context:

1. Entry — Soldier + Shield Guard;
2. Ambush — Mauler + Duelist + Crossbow;
3. Boss — close legal attack range.

Runs 1–3 use the identical baseline strategy. Runs 4–5 use the identical
role-aware strategy. Role-aware logic may read only visible gameplay state. It
must not set positions, HP, enemy state, hit results, or actor clocks.

The role-aware strategy must:

- use Attack 1/2 normally to challenge grouped targets;
- after a multi-target Attack 2, stop and move before the next attack while
  multiple nearby threats remain;
- use Attack 3 when no more than one nearby enemy can punish its recovery;
- preserve normal vertical avoidance, Shield Guard flanking, and Crossbow line
  response for both generals.

Record every raw run and medians. Required raw metrics are completion, duration,
damage taken, Attack 1/2/3 started/hit/missed/blocked/interrupted, voluntary
Attack 2 stops, recovery hits, multi-target hits, confirmed attacks, average
targets displaced, commitment time, Boss Attack 3 conversions, and:

- `groupedAttack2Confirms`: Attack 2 confirms against at least two targets;
- `repositionAfterAttack2`: grouped confirms followed by movement before the
  next attack;
- `isolatedAttack3Starts`: Attack 3 starts with at most one nearby legal threat;
- `unsafeAttack3Starts`: Attack 3 starts with two or more nearby legal threats.

The nearby-threat radius and time boundary must be fixed before the first run
and printed in the report. They may not be changed after results are observed.

## 5. Accept / Adjust / Reject gates

### Accept

All of the following must pass:

- all 30 paired runs complete without Enemy, Boss, Stage, Camera, Combo Window,
  input, art, Audio, UI, or production-manifest changes;
- in the two aware Ambush runs, Zhang Fei has at least **1.5×** Guan Yu's total
  multi-target hits and at least **+0.20** higher median average targets
  displaced per confirmed attack;
- every aware Zhang Fei Ambush run records at least one grouped Attack 2 confirm
  followed by repositioning before the next attack;
- across aware Entry and Ambush runs, Zhang Fei records at least two voluntary
  Attack 2 stops and at least two isolated Attack 3 starts, proving that neither
  stopping nor finishing is the fixed answer;
- Zhang Fei has zero unsafe Attack 3 starts in the aware runs;
- both generals convert at least one legal Boss Attack 3 opening per Boss run;
- neither general has both lower median damage and lower median clear time in
  all three contexts;
- Zhang Fei's median clear time is no more than 20% slower than Guan Yu's in
  any context, preventing passive waiting from becoming the role;
- miss/block cannot continue Combo, one input advances at most one stage, one
  attack damages each target once, and Pause/Hit Stop/Hurt/reset remain intact;
- Desktop, 844×390, and 390×844 interaction remains readable and production
  packaging remains unchanged.

### Adjust

One adjustment may change only Zhang Fei's Attack 2 knockback or existing
Attack 2/3 phase durations. Damage, HP, speed, body, hitbox geometry, Attack 1,
Enemy, Boss, Stage, Camera, Combo Window, input, and art remain frozen. The
complete 30-run protocol must then be repeated once.

### Reject

Reject if the starting hypothesis and its one allowed adjustment fail any hard
gate; if success requires additional damage, HP, range, Enemy/Boss tuning, new
systems, or altered test thresholds; if Zhang Fei becomes the universal faster
and safer choice; or if the best play becomes permanent Attack 2 stopping,
permanent Attack 3 completion, or passive waiting. Keep the evidence and leave
formal selection blocked.

## 6. Scope and next gate

Task 10.5R is documentation and contract coverage only. It does not change
runtime code, `PlayerDefinition`, animation metadata, art, asset manifests, or
formal Title selection. Task 10.6 remains blocked.

The sole next implementation task is **M10 / Task 10.5P — Zhang Fei Formation
Breaker Combat Prototype**. Only an accepted 10.5P result may unblock 10.6.
