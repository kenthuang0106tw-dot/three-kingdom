# TP-1 Shield Guard Tactical Prototype

## Scope

Development-only encounters keep the formal Bamboo Stage spawn configuration
unchanged:

- `?shieldGuardTest=A`: Shield Guard only.
- `?shieldGuardTest=B`: Shield Guard plus the existing Duelist.

The prototype reuses Soldier art. A cyan triangular marker shows its locked
guard direction; no production sprite, atlas, or new material was created.

## Rules implemented

| Rule | Prototype value |
| --- | --- |
| Guard sector | 110 degrees total, forward-only |
| Guard direction lock | 800 ms |
| Initial guard distance | 230 px / Y difference <= 100 px |
| Damage while front-blocked | 0 |
| Combo hit confirmation while blocked | none |
| Attack direction/Y line | captured at attack startup |
| Shield Guard Y-line tolerance | 28 px |
| Guard during attack/recovery | disabled |
| Miss recovery | 800–1200 ms |
| HP | Soldier baseline: 12 |

An attack has per-target block memory, so a continuing active frame does not
replay block sparks or sound. Block feedback uses the existing temporary spark
and a brighter, detuned existing hit cue; it intentionally does not add hit
stop, damage, knockback, or player stun.

A successful front block also renews the 800 ms Guard lock and releases the
Attack Slot. Therefore frontal repetition keeps the shield up instead of
forcing an immediate counterattack; once pressure stops, normal attack-slot
cadence may resume.

While stationary, the Shield Guard uses an immovable ground-occupancy body:
player contact cannot push him. Only his own walk movement and combat
knockback may change his world position.

## Test evidence

Automated checks passed on 2026-07-25:

- 122 tests: front/side/back geometry, guard-lock source contract, attack-slot
  release, block exclusion from damage/combo, and isolated development entry.
- Typecheck passed.
- Lint passed with the four pre-existing `app/page.tsx` image warnings.
- Vinext and GitHub Pages production builds passed.
- Desktop Test B browser smoke loaded the two-enemy prototype and reported no
  browser console errors.

## Manual acceptance ledger — required before acceptance

This implementation is **not yet accepted**. The required 5-run before/after
strategy measurements must be recorded by a human player; no values are
invented here.

| Scenario | Runs | Record |
| --- | ---: | --- |
| Before: Soldier + Duelist, frontal combo | 5 | completion, damage, line changes, target switches |
| After: Shield Guard + Duelist, frontal combo | 5 | blocks, damage, completion time |
| After: intentional flank/target switching | 5 | side/back hits, line changes, target switches, recovery punish windows, damage, time |

Acceptance requires a reliable vertical flank, no instantaneous 180-degree
guard turn, exactly one primary attacker, and deliberate play outperforming
frontal repetition. If that comparison fails, revert this prototype rather
than beginning TP-2 or formal shield art.
