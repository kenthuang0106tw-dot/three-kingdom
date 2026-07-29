# ER.5 — Shield Guard Production-Art Replacement

Date: 2026-07-29
Decision: Go

## Scope

ER.5 replaces only the development Shield Guard's temporary Soldier
presentation. TP-1 gameplay remains unchanged: HP, movement, attack range,
damage, guard cone, facing lock, counter/recovery timing, body, hitbox, Attack
Slot, and formal Stage isolation retain their accepted values.

## Approved identity

- Solid olive/brown standard infantry build.
- One dominant round woven rattan shield at approximately 55–60% of body
  height.
- Shield weave, rim, and central boss remain readable at 25% scale.
- Only one small secondary melee weapon.
- Authored facing left.

The neutral-idle gate was reviewed against both repository-owned approved
five-enemy references before the full sheet was integrated.

## Delivery

| Contract | Result |
| --- | --- |
| Runtime cell | 288×288 |
| Feet anchor | `(144,265)` in all 21 frames |
| Display scale | `1.025` for every state |
| Logical idle height | `215.25px` |
| Frames | idle 2, walk 4, attack 3, hurt 2, dead 4, guard 2, block 2, recovery 2 |
| Distinctness | 21 distinct pixel hashes |
| Minimum lateral padding | 15 runtime pixels |
| Source rectangles | Individually measured; no equal-width slicing |

Runtime files:

- `public/art/enemy/shield-guard.png`
- `public/art/enemy/shield-guard.atlas.json`
- `public/art/enemy/shield-guard.metadata.json`

Reproducible source and QA files:

- `public/art/enemy/shield-guard-idle-gate-source.png`
- `public/art/enemy/shield-guard-idle-gate-transparent.png`
- `public/art/enemy/shield-guard-source.png`
- `public/art/enemy/shield-guard-source-transparent.png`
- `public/art/enemy/shield-guard-extra-source.png`
- `public/art/enemy/shield-guard-extra-source-transparent.png`
- `public/art/enemy/shield-guard-debug.png`
- `public/art/enemy/shield-guard-onion.png`
- `public/art/enemy/shield-guard-silhouette-25.png`
- `tools/build_shield_guard_art.py`

## Runtime integration

`enemy-shield-guard` is a dedicated Phaser atlas. Basic state animations use
the existing Enemy state machine. Guard, block, and recovery use dedicated
Shield Guard animation keys; block completion resumes guard without changing
TP-1 timing or state ownership.

## Verification

- Direct tests: 132/132 passed after final documentation updates.
- Typecheck passed. Lint passed with zero errors and four existing `<img>`
  warnings.
- Direct Vinext and GitHub Pages builds plus production packaging passed.
- Desktop, 844×390, and 390×844 development smoke passed.
- All viewports showed one logical 1280×720 Canvas, readable shield identity,
  fixed feet alignment, and zero captured browser errors.
- Runtime inventory: 37 logical manifest entries, 47 request files,
  13,881,969 encoded bytes, and 136,297,984 decoded RGBA bytes.
- Production inventory: 50 public files / 17,658,589 bytes.
- GitHub Pages artifact: 19,178,685 bytes.

Final full-suite, typecheck, lint, build, and packaging results are recorded in
`CHECKLIST.md` and `SPRINT.md`.

## Image generation record

Mode: built-in ImageGen.

The generation brief included both approved repository references and locked
the olive/brown standard build, left-authored facing, round woven rattan shield
at 55–60% body height, readable weave/rim/central boss, small secondary weapon,
Japanese-realistic arcade pixel-art treatment, flat green extraction
background, unclipped poses, and genuine frame-to-frame changes. A neutral idle
was generated and reviewed first; separate basic and role-extra sheets followed.

Original generated outputs:

- `C:\Users\kenth\.codex\generated_images\019f4c32-f6d3-77f2-bc28-e03961d0c936\call_xQnSJGj4ZX9ZpDOZiHmAH5cs.png`
- `C:\Users\kenth\.codex\generated_images\019f4c32-f6d3-77f2-bc28-e03961d0c936\call_vmyoa84ymukYlFlqlTRHmplL.png`
- `C:\Users\kenth\.codex\generated_images\019f4c32-f6d3-77f2-bc28-e03961d0c936\call_Zj8mKhpLe1VLfjHW26WldfUk.png`

## Decision

Go. The dedicated presentation matches the approved Shield Guard identity and
passes alignment, frame, packaging, runtime, and viewport gates without
changing gameplay. The remaining temporary enemy presentation is Crossbow and
belongs to ER.6.
