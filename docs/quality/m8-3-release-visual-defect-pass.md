# M8 / Task 8.3 — Release Visual Defect Pass

Status: accepted on 2026-07-29.

## Scope

This was an inspection and regression task. It did not reopen the accepted art
direction or change gameplay. The pass covered the Player, Soldier, Duelist,
Mauler, Shield Guard, Crossbow, Boss, all three Stage sections, hit feedback,
HUD, touch controls, camera handoff, Failure, Result, and production debug
exclusion.

## Defect disposition

| ID | Suspected defect | Result | Evidence / disposition |
| --- | --- | --- | --- |
| RV-01 | Character or weapon clipping | Not reproduced | Player and all five enemies stay inside measured runtime cells; Mauler `attack-0`, Duelist `dead-3`, Shield Guard, Crossbow, and Boss weapon poses were visually checked. |
| RV-02 | Feet jump or incorrect stacking | Not reproduced | Every Player/enemy metadata frame ends on its shared feet anchor with one actor scale; Boss lifecycle frames end at Y 420. |
| RV-03 | Stage seam or Camera node snap | Not reproduced | `cameraHandoffSmoke=1` crossed entry and ambush sections; three 1280px section bounds and split layers are contiguous. |
| RV-04 | HUD, Failure, or Result unreadable | Not reproduced | Desktop Failure and Victory overlays, Player/Boss HUD, and touch controls remained within the Canvas. |
| RV-05 | Responsive overflow or stretched fine-pointer Canvas | Not reproduced | Desktop rendered at 1066.67×600, 844×390 at 693.31×389.98, and 390×844 at 325×182.81; all retained the 16:9 Canvas ratio with no document overflow. |
| RV-06 | Production physics/debug leak | Not reproduced | Production Canvas had no dataset diagnostics, physics outlines, debug text, duplicate Canvas, or captured browser error. |
| RV-07 | Physical coarse-pointer platform difference | Deferred — Low | Existing coarse-pointer CSS and prior physical mobile acceptance remain unchanged. This cycle did not have new device/OS/browser evidence, so it does not claim a new physical-device pass. Recheck in M8.7. |

No Critical, High, or Medium visual defect was found. Because no production
defect was reproducible, this task intentionally changes no art, animation
mapping, gameplay, camera, Stage, control, or responsive CSS.

## Browser evidence

- Development formal encounter and camera-handoff paths: one Canvas, zero
  captured errors.
- Development Shield Guard + Crossbow composition: both production identities
  readable; no clipping or page overflow.
- Development Boss, Failure, and Result paths: lifecycle/HUD/overlay readable;
  zero captured errors.
- Production Desktop, 844×390, and 390×844: one Canvas, no horizontal or
  vertical document overflow, zero production dataset keys, zero captured
  errors.
- Eight inspected browser paths reported zero captured errors.

## Automated evidence

`tests/release-visual-defects.test.mjs` protects:

- Player and all five enemy cell bounds, shared feet anchors, and one scale.
- Boss lifecycle cell bounds, shared feet anchor, and one scale.
- Three contiguous Stage sections and background/ground split boundaries.
- Pixel filtering, FIT scaling, safe-area, touch, and production debug
  exclusion contracts.

Closeout passed `pnpm test` (138/138), `pnpm typecheck`, `pnpm lint` with zero
errors and eight existing `<img>` warnings, `pnpm build`, and
`pnpm build:github-pages`. Both outputs preserve the same 52-file runtime
inventory; no asset or production byte changed in this audit-only task. The
previous TD-M11 wrapper blocker did not reproduce: every pnpm command reached
and completed its project script.
