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
evidence only and is excluded from production packaging.
