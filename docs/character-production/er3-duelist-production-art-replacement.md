# ER.3 — Duelist Production-Art Replacement

Status: technical integration completed on 2026-07-26; visual identity
superseded by ER.3R. See
`docs/character-production/er3r-duelist-approved-prototype-correction.md`.

## Runtime contract

| Item | Result |
| --- | --- |
| Runtime texture | `public/art/enemy/duelist.png` |
| Atlas / metadata | `duelist.atlas.json`, `duelist.metadata.json` |
| Cell / layout | 288×288, 5×3 |
| Feet / origin | `(144,265)`, `(0.5,0.920138...)` |
| Display scale | `1.025` for every state |
| Logical idle height | 205px |
| Frame budget | idle 2, walk 4, attack 3, hurt 2, dead 4 |
| Attack phases | `attack-0` startup, `attack-1` active, `attack-2` recovery |
| Authored facing | right |

## Provenance and processing

The source is project-owned and was generated with the built-in image
generation tool for ER.3. The previous Duelist and the accepted ER.2 Soldier
were used only as role and rendering references. The generated chroma source
is preserved as `duelist-source.png`; the alpha derivative is
`duelist-source-transparent.png`.

Final generation prompt:

> Create one regular 5×3 source sheet with exactly fifteen independently drawn
> poses of the same screen-right-facing, lean Three Kingdoms masked twin-hook
> Duelist: idle 2, genuine walk 4, coherent startup/active/recovery attack 3,
> horizontal hurt 2, and progressive grounded death 4. Use original
> Japanese-realistic Capcom/IGS-era pixel-art rendering, consistent identity,
> scale, upper-left lighting, and a low agile silhouette. Keep every full body
> and both hooked blades isolated inside its cell with generous padding and one
> shared standing baseline. Use a perfectly flat `#00ff00` background with no
> grid, shadow, effect, text, watermark, interpolation, duplicated pose, or
> detached body part.

The source is 1619×971 and is not evenly divided. `tools/build_enemy_art.py`
uses measured per-row boundaries rather than equal slicing. Each visible pose
is nearest-neighbor normalized at processing scale `0.86`; this changes
delivery size only and does not create an animation frame.

## Measured frame table

Rectangles and runtime bounds use `x,y,width,height`.

| Frame | Phase | Source rect | Source alpha bounds | Runtime bounds |
| --- | --- | --- | --- | --- |
| idle-0 | — | 0,0,346,346 | 118,73,153,233 | 78,65,132,200 |
| idle-1 | — | 346,0,315,346 | 76,73,147,233 | 81,65,126,200 |
| walk-0 | — | 661,0,304,346 | 92,73,155,235 | 77,63,133,202 |
| walk-1 | — | 965,0,291,346 | 56,73,158,235 | 76,63,136,202 |
| walk-2 | — | 1256,0,363,346 | 77,72,150,236 | 79,62,129,203 |
| walk-3 | — | 0,346,330,273 | 100,22,181,224 | 66,72,156,193 |
| attack-0 | startup | 330,346,304,273 | 50,35,217,211 | 50,84,187,181 |
| attack-1 | active | 634,346,371,273 | 37,59,309,186 | 11,105,266,160 |
| attack-2 | recovery | 1005,346,266,273 | 24,32,198,214 | 59,81,170,184 |
| hurt-0 | — | 1271,346,348,273 | 43,45,181,200 | 66,93,156,172 |
| hurt-1 | — | 0,619,323,352 | 46,32,246,207 | 38,87,212,178 |
| dead-0 | — | 323,619,284,352 | 31,105,227,140 | 46,145,195,120 |
| dead-1 | — | 607,619,281,352 | 25,152,228,103 | 46,176,196,89 |
| dead-2 | — | 888,619,324,352 | 27,168,263,79 | 31,197,226,68 |
| dead-3 | — | 1212,619,407,352 | 34,186,313,62 | 9,212,269,53 |

Every runtime bound ends at feet Y 265, remains inside the 288×288 cell, and
has a unique pixel hash. Frame-specific offsets align presentation only; the
existing Arcade body, attack hitbox, HP, speed, damage, AI, Attack Slot,
encounter, and timing values are unchanged.

## Validation

- Runtime review: `docs/visual-baselines/enemy-cast-v2/duelist-er3-review.png`.
- Debug, onion, 25% silhouette, and shared cast lineup inspected.
- 128/128 deterministic tests passed.
- Application and Worker typecheck passed.
- ESLint passed with zero errors and eight existing `<img>` warnings.
- Direct Vinext and Vite builds plus both packaging passes succeeded.
- Production smoke passed at 1280×720, 844×390, and 390×844 with one Canvas,
  no page overflow, and zero browser errors.
- Development `previewEnemy` verified Duelist `attack-1`, `walk-1`, and
  `dead-3` at the same three viewports with actor/frame/scale datasets correct
  and zero browser errors.
- Runtime report: 43 request files, 12,771,452 encoded bytes, 128,888,320
  decoded RGBA bytes, 46 production public files, and an 18,063,334-byte
  GitHub Pages artifact.
- The package-manager wrapper remains blocked before project scripts by
  TD-M11; the equivalent direct gates above passed.
