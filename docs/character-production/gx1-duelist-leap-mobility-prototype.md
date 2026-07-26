# GX.1 — Duelist Leap Mobility Prototype

Status: implementation and Technical Lead visual/runtime review complete on
2026-07-26.

## Decision

Accepted as a bounded Duelist-only prototype. The behavior adds committed
repositioning without Player jumping, aerial damage, homing, or a generic
airborne framework.

## Approved identity and art

The repository-owned color and silhouette lineups and the accepted ER.3R
Duelist runtime sheet were the three generation references. Every new pose
keeps the charcoal/navy hood and cowl, shadowed face, low narrow body, muted
rust layers, and exactly two long inward-curved hooks.

| Phase | Source rect | Runtime bounds | Feet |
| --- | --- | --- | --- |
| takeoff | `0,0,543,724` | `43,109,202,156` | `(144,265)` |
| airborne | `543,0,543,724` | `31,60,225,205` | `(144,265)` |
| descent | `1086,0,543,724` | `32,26,224,239` | `(144,265)` |
| landing | `1629,0,543,724` | `36,119,216,146` | `(144,265)` |

The four visible-pixel hashes are distinct. No pose is created by moving,
rotating, scaling, or interpolating an existing frame. The review sheet is
`docs/visual-baselines/enemy-cast-v2/duelist-gx1-leap-review.png`.

## Runtime contract

- Takeoff: 180ms.
- Airborne: 240ms.
- Descent: 220ms.
- Landing recovery: 420ms.
- Maximum visual elevation: 96px.
- Leap reuse cooldown: 2800ms.
- The destination X/Y is captured once before takeoff and clamped to Stage
  walk bounds.
- Ground/body travel interpolates only between the captured start and
  destination. Player movement after commitment cannot change the trajectory.
- `visualElevation` changes only sprite presentation; the 2.5D feet/body
  position remains the ground owner.
- A second actor-shadow marks the locked landing position while airborne.
- The Duelist retains the existing single Attack Slot for the full leap and
  releases it on landing, Hurt, Dead, suspension cleanup, or Scene reset.
- The leap causes no damage and does not alter HP, normal attack, hitbox,
  movement speed, Stage encounter composition, Camera, Player, UI, or Audio.

## Source and hashes

Built-in image generation created a four-pose chroma-key source. The installed
ImageGen chroma helper produced the transparent derivative; the reproducible
project builder is `tools/build_duelist_leap_art.py`.

| File | SHA-256 |
| --- | --- |
| `duelist-leap-source.png` | `BC7E9491AD7C9C7650EB4738357060D748EE01F6681454B216EA5C5921EB25D7` |
| `duelist-leap-source-transparent.png` | `D67AFDB0B5F427DCC65364E0D1BEBE7E54A0303CE425FEBD475EE02C26F3E1B4` |
| `duelist-leap.png` | `A17FE8D2F7402DDEED0AC491AA4583784B2FB1BBE90C8E4443D2FEFB57FF1407` |
| `duelist-leap.atlas.json` | `254A3E4D777DBBB722865B13CEA09699502AC0980E05046B3B2A92ED5EF24B73` |
| `duelist-leap.metadata.json` | `26BDB3678A03E8E6293CEC174E98707337AD871D6E0DE397344CD7D76F0EF954` |
| `duelist-leap-debug.png` | `E830A2C97D8C4C83982435FB46807EDB300DE9702BC22CE3B2D7A21A0A698675` |

Final prompt summary:

> Create four genuine right-facing takeoff, airborne, descent, and landing
> poses of the approved full-hooded twin-hook Duelist. Preserve the exact
> charcoal/navy hood, shadowed face, low narrow silhouette, rust accents, and
> two long inward-curved hooks. Use one evenly separated row on uniform green,
> identical scale, complete hook/feet padding, no effects, shadows, labels,
> missing weapons, extra limbs, or transformed duplicate poses.

## Validation

- Direct deterministic tests: 131/131 passed.
- TypeScript checks: passed.
- ESLint: zero errors; eight existing image warnings.
- Direct Vinext and GitHub Pages builds and packaging: passed.
- Delivery: 36 logical entries, 45 request files, 12,836,324 encoded bytes,
  128,003,584 decoded RGBA bytes, 48 production files, and an 18,132,212-byte
  GitHub Pages artifact.
- Desktop, 844×390, and 390×844 local production smoke each showed the
  airborne pose clearly, retained one 1280×720 Canvas, and captured zero
  browser errors. Portrait layout had no horizontal or vertical overflow.
- Package-manager wrappers remain affected by TD-M11; direct project commands
  are the recorded build evidence.
