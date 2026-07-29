# M8 / Task 8.7 — Full QA Matrix

Date: 2026-07-30
Status: Accepted
Recommendation: Go to M9 / Task 9.1 production-route verification

## Scope

This task validates the accepted Vertical Slice. It changes no gameplay,
balance, art, animation, input, Camera, Stage, Audio, UI, or production
packaging behavior.

## Automated Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Task 8.2C revalidation | Pass | 102/102 focused Stage, app, Shield Guard, and Crossbow tests |
| `pnpm test` | Pass | 147/147 |
| `pnpm typecheck` | Pass | App and worker TypeScript projects |
| `pnpm lint` | Pass with existing warnings | 0 errors; 8 existing `<img>` warnings |
| `pnpm build` | Pass | 52 public files preserved; 142 non-runtime files excluded |
| `pnpm build:github-pages` | Pass | Same 52-file production inventory preserved |

## Development Browser Matrix

The deterministic success path cleared both formal encounters, entered the
Boss arena, defeated the Boss, released the arena once, published one Stage
completion, and displayed Result.

| Viewport | Canvas | Fitted size | Overflow | Result | Runtime errors |
| --- | ---: | --- | --- | --- | ---: |
| Desktop 1280×720 | 1 | 1067×600 | none | Pass | 0 |
| Landscape 844×390 | 1 | 693×390 | none | Pass | 0 |
| Portrait 390×844 | 1 | 325×183 | none | Pass | 0 |

The Canvas remained intrinsically 1280×720 in every viewport.

## Flow and Ownership Matrix

| Contract | Result | Evidence |
| --- | --- | --- |
| Formal five-enemy Stage | Pass | `forest-entry` is Soldier + Shield Guard; `forest-ambush` is Mauler + Duelist + Crossbow |
| Single primary attacker | Pass | Automated contract retains one `EnemyManager.currentAttacker` |
| Boss completion | Pass | Boss `dead`, arena release `1`, Stage completion `1`, Result visible |
| Failure / Retry | Pass | 10 entries + 10 restarts; input blocked and actors suspended every time; Title, HP 10, locked Boss restored |
| Result / Replay | Pass | 10 Result entries + 10 replays; Title, HP 10, encounter 0, locked Boss, completion 0 restored |
| Pause / Resume | Pass | Velocity zero and attack hitbox disabled while paused; one pause/resume cycle preserved actor state |
| Reduced flash | Pass | `F` changed the independent setting while paused and retained it after resume |
| Reduced shake | Pass | `K` changed the independent setting while paused and retained it after resume |
| Audio ownership | Pass | Full success retained one Audio manager and one gameplay subscription; no layering error |
| Camera / Stage | Pass | Both encounter handoffs and Boss arena completion reached Result without overflow or runtime error |

## Mobile-Control Evidence

| Viewport | Joystick | Attack | Result |
| --- | --- | --- | --- |
| 844×390 | Player X changed 180 → 197 through the 360° joystick | Touch attack emitted `player-attack-started`, entered `attack1`, then returned to idle | Pass |
| 390×844 | Player position changed (180,602) → (196,597) through diagonal joystick input | Touch attack entered `attack1`, then returned to idle | Pass |

New physical device/OS/browser metadata was unavailable in this run. Earlier
project evidence records user-accepted iOS Safari and Android Chrome controls
and Audio, but M8.7 does not invent missing device versions.

## Production Matrix

The Vinext production build was opened with development-only query flags to
verify that they are ignored.

| Viewport | Canvas | Dataset keys | Overflow | Runtime errors |
| --- | ---: | ---: | --- | ---: |
| Desktop 1280×720 | 1 | 0 | none | 0 |
| Landscape 844×390 | 1 | 0 | none | 0 |
| Portrait 390×844 | 1 | 0 | none | 0 |

The GitHub Pages build loaded from `/three-kingdom/` with one Canvas, correct
base-prefixed gameplay assets, no diagnostic dataset, no overflow, and zero
captured runtime errors. Representative Vinext and GitHub Pages HTML, Player
PNG, and Stage BGM routes returned 200 with the correct content type.

## Defects

| Severity | Count | Finding | Disposition |
| --- | ---: | --- | --- |
| Critical | 0 | None | — |
| High | 0 | None | — |
| Medium | 0 | None | — |
| Low | 1 | GitHub Pages preview requests optional root `/favicon.ico`, which returns 404 | Carry into M9.1 route/hosting verification |

The favicon request does not affect Canvas creation, gameplay, required
runtime assets, Audio, or terminal flow. It is not hidden and is not fixed
inside this QA-only task.

## Release-Readiness Decision

M8 is accepted. The Vertical Slice is ready to enter M9 release engineering.
This is not yet a final public-release approval: M9.1 must verify deployed
production routing/hosting, including the Low favicon route finding, before
versioning or platform sign-off.
