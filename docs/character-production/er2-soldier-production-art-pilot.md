# ER.2 — Soldier Production-Art Pilot

Status: accepted by reviewer on 2026-07-26.

## Runtime contract

| Item | Result |
| --- | --- |
| Runtime texture | `public/art/enemy/enemy-soldier.png` |
| Atlas / metadata | `enemy-soldier.atlas.json`, `soldier.metadata.json` |
| Cell / layout | 288×288, 5×3 |
| Feet / origin | `(144,265)`, `(0.5,0.920138...)` |
| Display scale | `1.025` for every state |
| Logical idle height | 210.12px |
| Frame budget | idle 2, walk 4, attack 3, hurt 2, dead 4 |
| Attack phases | `attack-0` startup, `attack-1` active, `attack-2` recovery |

## Provenance and review

The art is project-owned and was produced with the built-in image generator in
the ER.2 task. The original 5×3 source and transparent derivative are preserved
beside the runtime files. The reviewer rejected `walk-3`, `attack-0..2`, and
`dead-0..3`; each of those eight frames was regenerated as an independent
source pose under `public/art/enemy/source/soldier-v2/`.

The accepted review sheet is
`docs/visual-baselines/enemy-cast-v2/soldier-er2-review.png`. Chroma extraction
and nearest-neighbor source normalization are reproducible through
`tools/build_enemy_art.py`; normalization does not create or interpolate an
animation pose.

## Measured frame table

Source rectangle and runtime alpha bounds use `x,y,width,height`.

| Frame | State | Phase | Source | Source rect | Runtime alpha bounds | Display offset | Feet |
| --- | --- | --- | --- | --- | --- | --- | --- |
| idle-0 | idle | - | `enemy-soldier-v2-source-transparent.png` | 0,0,334,314 | 97,60,94,205 | 97,60 | 144,265 |
| idle-1 | idle | - | `enemy-soldier-v2-source-transparent.png` | 334,0,335,314 | 96,60,96,205 | 96,60 | 144,265 |
| walk-0 | walk | - | `enemy-soldier-v2-source-transparent.png` | 669,0,334,314 | 95,62,98,203 | 95,62 | 144,265 |
| walk-1 | walk | - | `enemy-soldier-v2-source-transparent.png` | 1003,0,335,314 | 83,64,121,201 | 83,64 | 144,265 |
| walk-2 | walk | - | `enemy-soldier-v2-source-transparent.png` | 1338,0,334,314 | 87,60,114,205 | 87,60 | 144,265 |
| walk-3 | walk | - | `source/soldier-v2/walk-3-transparent.png` | 0,0,1254,1254 | 94,61,99,204 | 94,61 | 144,265 |
| attack-0 | attack | startup | `source/soldier-v2/attack-0-transparent.png` | 0,0,1672,941 | 64,119,159,146 | 64,119 | 144,265 |
| attack-1 | attack | active | `source/soldier-v2/attack-1-transparent.png` | 0,0,1672,941 | 37,137,214,128 | 37,137 | 144,265 |
| attack-2 | attack | recovery | `source/soldier-v2/attack-2-transparent.png` | 0,0,1672,941 | 37,144,214,121 | 37,144 | 144,265 |
| hurt-0 | hurt | - | `enemy-soldier-v2-source-transparent.png` | 1338,314,334,313 | 79,71,129,194 | 79,71 | 144,265 |
| hurt-1 | hurt | - | `enemy-soldier-v2-source-transparent.png` | 0,627,334,314 | 74,81,140,184 | 74,81 | 144,265 |
| dead-0 | dead | - | `source/soldier-v2/dead-0-transparent.png` | 0,0,1254,1254 | 83,34,121,231 | 83,34 | 144,265 |
| dead-1 | dead | - | `source/soldier-v2/dead-1-transparent.png` | 0,0,1254,1254 | 59,55,170,210 | 59,55 | 144,265 |
| dead-2 | dead | - | `source/soldier-v2/dead-2-transparent.png` | 0,0,1254,1254 | 39,177,209,88 | 39,177 | 144,265 |
| dead-3 | dead | - | `source/soldier-v2/dead-3-transparent.png` | 0,0,1254,1254 | 10,128,267,137 | 10,128 | 144,265 |

Every runtime alpha bottom resolves to feet Y 265. All 15 pixel hashes are
unique. Frame-specific offsets align art only; the existing Arcade ground body
and attack hitbox remain gameplay-owned and unchanged.

## Validation evidence

- Reviewer accepted the corrected 15-frame sheet.
- Direct test suite: 127/127.
- TypeScript: passed for application and Worker projects.
- ESLint: zero errors; eight existing `<img>` warnings.
- Direct Vinext build, Vite GitHub Pages build, and both production asset
  packaging passes succeeded.
- Final production browser smoke at 1280×720, 844×390, and 390×844 retained one
  Canvas, no overflow, and zero captured errors.
- Runtime report: 43 request files, 12,880,839 encoded bytes, 132,759,040
  decoded RGBA bytes, 46 production public files, 18,516,446-byte GitHub Pages
  artifact.
- `pnpm test` and `pnpm build` remain blocked before their project scripts by
  TD-M11's dependency-status/ignored-build policy. Equivalent direct project
  commands above passed; the wrapper failure is not reported as a test failure
  or hidden.

## Scope result

Only Soldier presentation, its one visual scale/frame contract, build tooling,
focused tests, and evidence changed. Soldier gameplay body, hitbox, HP, damage,
movement, AI, attack timing, Stage, Camera, UI, Audio, and all other actor art
remain unchanged.
