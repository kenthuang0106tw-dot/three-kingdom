# ER.3R — Duelist Approved-Prototype Correction

Status: implementation and Technical Lead visual review complete on 2026-07-26.

## Decision

The ER.3 technical pipeline was retained, but its exposed-topknot masked-ninja
art was rejected. ER.3R replaces only Duelist presentation with the approved
full-hooded, long twin-hook identity.

| Identity gate | Before ER.3R | After ER.3R |
| --- | --- | --- |
| Head | Exposed topknot, headband, face mask | Full charcoal/navy hood and draped cowl; no visible hair |
| Weapons | Short hook blades reading near knives/hatchets | Exactly two long inward-curved C-shaped hand hooks |
| Silhouette | Upright generic ninja | Lowest, narrow, wide-footed Duelist stance |
| Palette/material | Teal sleeveless ninja | Charcoal/navy light lamellar, muted rust, wrapped arms, ragged cloth |
| Prototype decision | Revise | Go |

The approved color and silhouette references are repository-owned under
`docs/visual-baselines/enemy-cast-v2/`. The neutral idle identity gate is
`duelist-er3r-idle-gate.png`; the final measured review sheet is
`duelist-er3r-review.png`.

## Runtime contract

| Item | Result |
| --- | --- |
| Runtime texture | `public/art/enemy/duelist.png` |
| Atlas / metadata | `duelist.atlas.json`, `duelist.metadata.json` |
| Cell / layout | 288×288, 5×3 |
| Feet / origin | `(144,265)`, `(0.5,0.920138...)` |
| Display scale | `1.025` for every state |
| Logical idle height | `206.02px` (target `205±10px`) |
| Frame budget | idle 2, walk 4, attack 3, hurt 2, dead 4 |
| Attack phases | `attack-0` startup, `attack-1` active, `attack-2` recovery |
| Authored facing | right |

No Player, Enemy AI, HP, speed, attack range, timing, body, hitbox, Attack Slot,
Stage, Camera, UI, Audio, or encounter value changed.

## Source and processing

- Built-in image generation produced the project-owned `1619×971` source.
- The two approved lineup images and the accepted neutral idle were explicit
  visual references.
- The final source uses a flat chroma background and was cleaned with the
  installed ImageGen chroma helper using border sampling, soft matte, despill,
  and one-pixel edge contraction.
- `tools/build_enemy_art.py` uses the existing fifteen measured source
  rectangles, one processing scale (`1.0`), one display scale (`1.025`), and
  one feet anchor.

Final source prompt summary:

> Recreate the approved full-hooded twin-hook Duelist in a 5×3 sheet: idle 2,
> genuine walk 4, startup/active/recovery attack 3, grounded hurt 2, and
> progressive grounded death 4. Preserve the charcoal/navy hood and cowl,
> shadowed face, low stance, rust accents, and exactly two long inward-curved
> C-shaped hand hooks. Keep upright poses approximately 195–205 source pixels
> high and every complete pose below approximately 270 source pixels wide on a
> uniform green background, with no exposed hair, short blades, missing
> weapons, transform copies, jumping, clipping, effects, text, or shadows.

SHA-256:

| File | SHA-256 |
| --- | --- |
| `duelist-source.png` | `F2EADE47887CFE159FBBF08B4A68D4B1BE7BA5DA72EC1356F36530213FFC875E` |
| `duelist-source-transparent.png` | `E864456C93DA482959D1FF4D6AF66508A4FD3573D3C7863FA6A4A8C93033F981` |
| `duelist.png` | `BB6E9A4D32B88F8AB9CF85B85137A8898E37720FCB704397FA6FCD2D1758A800` |

## Measured frame table

All rectangles use `x,y,width,height`. Every runtime bound ends at feet Y 265.

| Frame | Source rect | Runtime bounds |
| --- | --- | --- |
| idle-0 | 0,0,346,346 | 59,64,170,201 |
| idle-1 | 346,0,315,346 | 61,64,165,201 |
| walk-0 | 661,0,304,346 | 72,62,143,203 |
| walk-1 | 965,0,291,346 | 75,68,137,197 |
| walk-2 | 1256,0,363,346 | 76,67,136,198 |
| walk-3 | 0,346,330,273 | 79,65,129,200 |
| attack-0 | 330,346,304,273 | 58,66,171,199 |
| attack-1 | 634,346,371,273 | 4,109,279,156 |
| attack-2 | 1005,346,266,273 | 67,79,153,186 |
| hurt-0 | 1271,346,348,273 | 70,75,147,190 |
| hurt-1 | 0,619,323,352 | 55,72,178,193 |
| dead-0 | 323,619,284,352 | 80,125,128,140 |
| dead-1 | 607,619,281,352 | 33,152,221,113 |
| dead-2 | 888,619,324,352 | 32,144,223,121 |
| dead-3 | 1212,619,407,352 | 11,195,266,70 |

All fifteen visible-pixel hashes are distinct. Long hook tips remain inside
their own atlas cells, and no frame touches a neighbor.

## Validation

- Direct deterministic tests: 129/129 passed.
- TypeScript checks: passed.
- ESLint: zero errors; eight pre-existing image warnings.
- Direct Vinext production build and Vite GitHub Pages build: passed.
- Packaging: 46 production files with preserved source hashes.
- Delivery: 43 runtime requests, 12,788,345 encoded bytes,
  128,888,320 decoded RGBA bytes, 18,080,227-byte GitHub Pages artifact.
- Browser smoke: Desktop, 844×390, and 390×844 each rendered one 1280×720
  Canvas with no page overflow and zero captured console errors.
- Package-manager wrappers remain affected by TD-M11; equivalent direct project
  commands above are the acceptance evidence and the blocker is not hidden.
