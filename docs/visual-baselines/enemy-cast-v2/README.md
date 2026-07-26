# Enemy Cast v2 Reference Baseline

## Purpose

This directory records the review-only visual references for ER.1. It is not a
runtime asset directory and it must not be added to `AssetManifest.ts`.

## External reference records

| Reference | Local review path | Role in review | Runtime status |
| --- | --- | --- | --- |
| Five-enemy color lineup | `C:\Users\kenth\.codex\generated_images\019f992e-0533-74d2-a618-4f828048c377\call_kG6k2CiTExM4w5SfiZtwV0BI.png` | Material, value, weapon, and role separation | Reference only; do not copy into `public/` |
| Five-enemy silhouette lineup | `C:\Users\kenth\.codex\generated_images\019f992e-0533-74d2-a618-4f828048c377\call_VpAGONdvts6EsStpZkR6VMQE.png` | 25% silhouette and readable-role check | Reference only; do not copy into `public/` |

The visual order is Soldier, Duelist, Mauler, Shield Guard, and Crossbow.
The reference establishes role readability only. It does not establish frame
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
