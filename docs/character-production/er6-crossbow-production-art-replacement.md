# ER.6 — Crossbow Production-Art Replacement

Status: accepted on 2026-07-29.

## Identity and scope

The production Crossbow preserves the approved light blue-grey armor, tied
cloth headwear, large horizontal repeating-crossbow mechanism, and rear bolt
pack. The projectile remains a separate runtime object. ER.6 changed
presentation only: HP, movement, the 550ms tracking phase, 350ms locked phase,
900ms total aim, 3000ms reload, Attack Slot ownership, Player-only targeting,
Stage isolation, and the rejected friendly-fire behavior are unchanged.

The neutral gate and full pose set were generated with the built-in image
generation tool using both repository-owned approved references. The briefs
required a right-facing Japanese-realistic pixel-art enemy, the immutable
Crossbow silhouette locks, complete weapon padding, one feet line, a flat green
background, and no bow, firearm, hand crossbow, or shield substitution.

## Production contract

- Runtime atlas: `public/art/enemy/crossbow.png`
- Atlas metadata: `public/art/enemy/crossbow.atlas.json`
- QA metadata: `public/art/enemy/crossbow.metadata.json`
- Reproducible processor: `tools/build_crossbow_art.py`
- Cell: 288×288
- Feet anchor: `(144,265)`
- Display scale: `1.025`
- Logical idle height: `210.12`
- Source facing: right (`1`)
- Distinct frames: 20

| Animation | Frames |
| --- | --- |
| Idle | `idle-0`, `idle-1` |
| Walk | `walk-0` … `walk-3` |
| Fire | `fire-0` startup, `fire-1` active, `fire-2` recovery |
| Hurt | `hurt-0`, `hurt-1` |
| Dead | `dead-0` … `dead-3` |
| Aim | `aim-0`, `aim-1` |
| Locked | `locked-0` |
| Reload | `reload-0`, `reload-1` |

Every source rectangle is measured independently. Every runtime frame uses the
same origin, feet anchor, and display scale.

## Evidence

- Identity gate: `docs/visual-baselines/enemy-cast-v2/crossbow-er6-idle-gate.png`
- Full review: `docs/visual-baselines/enemy-cast-v2/crossbow-er6-review.png`
- Desktop: `docs/visual-baselines/enemy-cast-v2/crossbow-er6-desktop.png`
- 844×390: `docs/visual-baselines/enemy-cast-v2/crossbow-er6-landscape-844x390.png`
- 390×844: `docs/visual-baselines/enemy-cast-v2/crossbow-er6-portrait-390x844.png`
- Runtime QA: debug sheet, onion skin, and 25% silhouette under
  `public/art/enemy/`

The final delivery contains 49 runtime requests, 14,810,812 encoded bytes,
142,933,504 decoded RGBA bytes, and 52 packaged production files. The GitHub
Pages artifact is 20,108,383 bytes. Direct tests passed 133/133; typecheck,
lint with zero errors and eight existing warnings, Vinext/Vite builds,
production packaging, and all three browser viewports passed with zero
captured browser errors.
