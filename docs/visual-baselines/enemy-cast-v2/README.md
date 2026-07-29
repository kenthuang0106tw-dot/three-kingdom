# Enemy Cast v2 Reference Baseline

## Purpose

This directory records the review-only visual references for ER.1. It is not a
runtime asset directory and it must not be added to `AssetManifest.ts`.

## Approved reference records

| Reference | Repository file | Original source path | Runtime status |
| --- | --- | --- | --- |
| Five-enemy color lineup | `approved-five-enemy-color.png` | `C:\Users\kenth\.codex\generated_images\019f992e-0533-74d2-a618-4f828048c377\call_kG6k2CiTExM4w5SfiZtwV0BI.png` | Review only; excluded from `public/` |
| Five-enemy silhouette lineup | `approved-five-enemy-silhouette.png` | `C:\Users\kenth\.codex\generated_images\019f992e-0533-74d2-a618-4f828048c377\call_VpAGONdvts6EsStpZkR6VMQE.png` | Review only; excluded from `public/` |

The visual order is Soldier, Duelist, Mauler, Shield Guard, and Crossbow.
The immutable character identities are recorded in
`docs/character-production/enemy-cast-v2-approved-prototypes.md`. The
repository copies are authoritative; future work must not rely on conversation
memory or external-only paths. The reference does not establish frame
boundaries, animation poses, physics dimensions, gameplay reach, or a license
to reuse pixels. Each production actor still requires project-owned source art,
metadata, a runtime atlas, and an accepted reviewer baseline.

## Review rules

- Evaluate a neutral idle lineup on one shared feet line.
- Confirm each role remains distinguishable at 25% scale by silhouette and
  weapon, not only by color.
- Preserve the existing Japanese-realistic pixel-art direction; do not make a
  derivative copy of the reference image.
- Keep references outside the production build and GitHub Pages inventory.

## ER.2 accepted Soldier review

`soldier-er2-review.png` records the revised 15-frame debug sheet accepted by
the reviewer on 2026-07-26. The reviewer specifically rejected the first
`walk-3`, `attack-0..2`, and `dead-0..3`; all eight were regenerated as
independent source poses before acceptance. This review image is QA evidence,
not a runtime texture.

## ER.3 Duelist review

`duelist-er3-review.png` records the measured 15-frame Duelist runtime sheet:
idle 2, walk 4, startup/active/recovery attack 3, hurt 2, and dead 4. All
frames use the shared `(144,265)` feet line and one scale. The image is review
evidence only and is excluded from production packaging. Its technical layout
passed, but its exposed-topknot masked-ninja identity was later rejected.

## ER.3R Duelist approved-prototype correction

`duelist-er3r-idle-gate.png` records the neutral-pose identity gate.
`duelist-er3r-review.png` records the final fifteen measured frames. The full
hood/cowl, shadowed face, low stance, and two long inward-curved hooks pass
side-by-side review against both approved repository references. Both files are
QA evidence and are excluded from production packaging.

## ER.4 Mauler approved-prototype replacement

`mauler-er4-idle-gate.png` records the neutral identity gate.
`mauler-er4-review.png` records the final seventeen measured frames: idle 2,
walk 4, attack 5, hurt 2, and dead 4. The broad red/brown bearded heavy
silhouette and single long square-headed war hammer pass both approved
references. Both files are QA evidence only and are excluded from production
packaging.

The review image was updated after the reviewer found a clipped `attack-0`
hammer head. The corrected measured rectangle includes the complete connected
hammer with explicit right-side padding and excludes the neighboring pose.

`duelist-gx1-leap-review.png` is the GX.1 four-pose review sheet. It records
genuine takeoff, airborne, descent, and landing poses against one feet line;
runtime visual elevation is applied separately from the shared ground anchor.

## ER.5 Shield Guard approved-prototype replacement

`shield-guard-er5-idle-gate.png` records the neutral identity gate.
`shield-guard-er5-review.png` records all 21 measured frames and the 25%
silhouette check. The olive/brown standard build, dominant round woven rattan
shield, readable rim/weave/central boss, and small secondary weapon pass both
approved references. Desktop, 844×390, and 390×844 runtime captures are stored
beside the review evidence. These files are QA evidence and excluded from
production packaging.
