# M8 / Task 8.2C — Five-Enemy Stage Encounter Integration

Date: 2026-07-30
Status: Accepted

## Scope

This task changes only the formal Stage encounter composition. It does not
retune Player, enemy HP, damage, movement, AI, Attack Slot, Boss, Camera,
Audio, animation, or art.

## Before / After

| Encounter | Before | After |
| --- | --- | --- |
| `forest-entry` | Soldier | Soldier + Shield Guard |
| `forest-ambush` | Mauler + Duelist | Mauler + Duelist + Crossbow |
| Formal enemy total | 3 | 5 |
| Formal roles | Soldier, Mauler, Duelist | Soldier, Shield Guard, Mauler, Duelist, Crossbow |

## Spawn Contract

| Spawn ID | Role | X | Y |
| --- | --- | ---: | ---: |
| `enemy-front` | Soldier | 1300 | 560 |
| `enemy-entry-guard` | Shield Guard | 1430 | 470 |
| `enemy-upper-rear` | Mauler | 2320 | 455 |
| `enemy-lower-front` | Duelist | 2420 | 625 |
| `enemy-ambush-crossbow` | Crossbow | 2520 | 530 |

All points are inside the Stage walk bounds. Every pair within an encounter
starts at least 72 pixels apart. The two encounters remain deterministic and
must clear in order before Boss entry.

## Runtime Ownership

- `MainScene` still owns one `EnemyManager`.
- `EnemyManager` still owns one `currentAttacker` Attack Slot.
- Every role uses its existing immutable `EnemyConfig`.
- Enemy removal still releases the Attack Slot, destroys actor-owned objects,
  and records the removal against the active encounter.
- Development builds expose the active encounter role list as read-only Canvas
  dataset evidence. Production builds do not expose this diagnostic state.

## Validation

- Focused five-enemy and encounter-contract tests: 102/102 passed.
- Final full test suite: 147/147 passed after documentation closeout.
- Typecheck passed.
- Lint passed with zero errors and eight existing `<img>` warnings.
- Production build passed and retained 52 packaged public files.
- GitHub Pages build passed and retained the same 52 packaged public files.

Browser smoke used the deterministic formal encounter and Boss-clear paths:

| Viewport | Result | Canvas | Overflow | Runtime errors |
| --- | --- | ---: | --- | ---: |
| Desktop 1280×720 | Result reached after both encounters and Boss | 1 | none | 0 |
| 844×390 | Result reached; intrinsic Canvas stayed 1280×720 | 1 | none | 0 |
| 390×844 | Result reached; intrinsic Canvas stayed 1280×720 | 1 | none | 0 |

The smoke path recorded both formal compositions, cleared all five enemies,
entered the Boss arena, defeated the Boss, and emitted `stageCompleteCount=1`.
The final production build also retained one Canvas, no overflow, zero
development dataset keys, and zero captured browser errors at all three
viewports.

## Decision

Accepted. All five production enemy roles now appear exactly once in the
formal three-screen Stage. The next and only task is M8 / Task 8.7 — Full QA
Matrix. No new gameplay or content belongs in that task.
