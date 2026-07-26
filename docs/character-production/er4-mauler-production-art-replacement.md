# ER.4 — Mauler Production-Art Replacement

## Decision

Accepted on 2026-07-26. The replacement preserves the approved broad,
red/brown, bearded heavy-infantry identity and one long square-headed war
hammer. It remains the largest normal enemy while staying visibly smaller than
the Boss.

The first generated full sheet was rejected before integration because adjacent
poses overlapped. The accepted source was measured pose by pose; incomplete and
duplicate candidates were excluded. No equal-width source slicing is used.

## Before / After

| Contract | Before | ER.4 |
| --- | --- | --- |
| Runtime cell | 384×384 | 288×288 |
| Feet anchor | `(192,354)` | `(144,265)` |
| Display scale | legacy cast scale | `1.05` for every state |
| Logical idle height | 239.8px | 240.45px |
| Frames | 15 temporary frames | 17 genuine poses |
| Attack phases | 1 startup / 1 active / 1 recovery | 2 startup / 1 active / 2 recovery |
| Source layout | temporary equal grid | measured 5×4 candidate layout |

HP, speed, damage, range, AI, body, attack hitbox, Attack Slot, Stage, Camera,
UI, and Audio are unchanged. The accepted attack remains exactly 600ms:
100ms + 100ms startup, 200ms active, and 100ms + 100ms recovery.

## Frame Metadata

All runtime frames share origin `(0.5, 0.9201388889)`, feet `(144,265)`,
display scale `1.05`, and right-authored source facing.

| Frame | Phase | Source rectangle `(x,y,w,h)` | Runtime offset `(x,y)` |
| --- | --- | --- | --- |
| idle-0 | — | `(20,70,232,275)` | `(58,36)` |
| idle-1 | — | `(252,70,245,275)` | `(60,36)` |
| walk-0 | — | `(497,70,242,275)` | `(64,49)` |
| walk-1 | — | `(739,70,231,275)` | `(66,52)` |
| walk-2 | — | `(970,70,240,275)` | `(65,51)` |
| walk-3 | — | `(0,350,232,280)` | `(63,56)` |
| attack-0 | startup | `(232,350,252,280)` | `(40,85)` |
| attack-1 | startup | `(460,350,200,280)` | `(65,97)` |
| attack-2 | active | `(660,350,168,280)` | `(80,39)` |
| attack-3 | recovery | `(828,350,262,280)` | `(29,87)` |
| attack-4 | recovery | `(0,650,250,270)` | `(64,55)` |
| hurt-0 | — | `(250,650,240,270)` | `(70,63)` |
| hurt-1 | — | `(490,650,245,270)` | `(68,65)` |
| dead-0 | — | `(735,650,230,270)` | `(66,113)` |
| dead-1 | — | `(965,650,280,270)` | `(36,106)` |
| dead-2 | — | `(0,1040,270,170)` | `(52,173)` |
| dead-3 | — | `(270,1040,275,170)` | `(35,185)` |

## Generation and Processing

Built-in image generation used both repository-owned approved references. The
final brief requested an original Japanese-realistic pixel-art Mauler: square
torso, broad grounded stance, beard, red/brown lamellar armor, and exactly one
long rectangular-headed war hammer, with distinct idle, walk, attack, hurt,
and death poses on a chroma background.

- Neutral gate source:
  `C:\Users\kenth\.codex\generated_images\019f4c32-f6d3-77f2-bc28-e03961d0c936\call_X3Pqn3gz4DKAcIDIP2KWFBDa.png`
- Accepted sheet source:
  `C:\Users\kenth\.codex\generated_images\019f4c32-f6d3-77f2-bc28-e03961d0c936\call_5Y25ed2ZytQEyTVWsnulDFrr.png`
- Rejected overlapping sheet:
  `C:\Users\kenth\.codex\generated_images\019f4c32-f6d3-77f2-bc28-e03961d0c936\call_r5wLz0mdYMgqrnKmkHvSUPOq.png`

`tools/build_enemy_art.py` removes chroma, reads explicit measured rectangles,
keeps the largest connected alpha component for each Mauler pose, aligns every
frame to the common feet anchor, and emits atlas, metadata, debug, onion-skin,
25% silhouette, and cast-lineup evidence. Original generated pixels are not
modified with rotate, scale, or interpolation to fake animation.

## Hashes

| File | SHA-256 |
| --- | --- |
| `mauler-source.png` | `16B42315D277B89F93673EC597E3EC4E2D24AFAD83B86D934FDAAF8DB1152416` |
| `mauler-source-transparent.png` | `0981C73C7825E7F68975A62CE8CF7806D56B8BC4CFD443E2E0D00BAE979F0AE7` |
| `mauler.png` | `A0D33E9240B10630DB282A5FB9779551D4D7AAB3C949D7636740D8E9A386618A` |
| `mauler.atlas.json` | `2FCC17FDC62FA7DEB756A599A9785710241BF59524BC404FEAD4B12A5DB07800` |
| `mauler.metadata.json` | `739B018F87EB8070754635656148F3F3C3E36B65BAA3C09E816EAC723A73C4B0` |
| `mauler-debug.png` | `2668FA2C7208EA2CA11078495D751EB13D7AFE9C7FBFAE75F8AA76CCC399E9A6` |

## Post-review crop correction

The reviewer found that `attack-0` retained only part of the hammer head. The
measured source rectangle ended at X=460 while the connected Mauler/hammer
component continued to X=475. The rectangle now ends at X=484, leaving nine
transparent source pixels and 41 runtime pixels to the right of the complete
hammer. The disconnected neighboring pose is still removed by connected-alpha
isolation. No pose, timing, anchor, scale, or gameplay parameter changed.

## Validation

- Direct tests: 129/129 passed.
- TypeScript: passed.
- ESLint: 0 errors; 8 pre-existing `<img>` warnings.
- Direct Vinext and GitHub Pages builds and production packaging: passed.
- Runtime inventory: 35 logical entries, 43 request files, 12,621,623 encoded
  bytes, 126,676,480 decoded RGBA bytes, and 46 packaged production files.
- GitHub Pages artifact: 17,913,999 bytes.
- Browser: Desktop, 844×390, and 390×844 each retained one logical 1280×720
  Canvas, no page overflow, and zero captured runtime errors.
- `pnpm` wrappers remain affected by TD-M11 before reaching project scripts;
  the equivalent direct project commands above are the acceptance evidence.
