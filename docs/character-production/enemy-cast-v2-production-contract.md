# ER.1 — Five-Enemy Production Contract

Status: approved planning contract. No runtime atlas, gameplay source, Stage
data, animation timing, collision dimension, or balance value changes in ER.1.

## 1. Production goal

Replace the temporary and inconsistent enemy presentation with five distinct,
project-owned Japanese-realistic pixel-art actors while preserving the accepted
combat contracts:

1. Soldier — baseline melee line holder.
2. Duelist — fast flanking melee threat.
3. Mauler — heavy committed space threat.
4. Shield Guard — forward-only position blocker.
5. Crossbow — locked-lane ranged pressure.

The color and silhouette references listed in
`docs/visual-baselines/enemy-cast-v2/README.md` are review input only. They are
not source sprites, runtime textures, or a substitution for animation frames.
Their character identities are binding and are defined in
`docs/character-production/enemy-cast-v2-approved-prototypes.md`. Production
work may not redesign the approved hood/head treatment, weapon class, armor
mass, round shield, or repeating-crossbow silhouette.

### Approved identity summary

| Actor | Required identity |
| --- | --- |
| Soldier | Upright blue-grey military halberd infantry. |
| Duelist | Low charcoal/navy full-hooded fighter with exactly two long inward-curved hand hooks. |
| Mauler | Broad red/brown heavy fighter with one long square-headed war hammer. |
| Shield Guard | Olive/brown line holder dominated by a round woven rattan shield. |
| Crossbow | Blue-grey light ranged unit with a large horizontal repeating crossbow and rear bolt pack. |

## 2. Non-negotiable runtime ownership

| Concern | Owner / rule |
| --- | --- |
| Sprite and atlas | Phaser texture owned by `AssetManifest.ts` and `MainScene.preload()` only after a later integration task. |
| Feet alignment | Every frame resolves to one actor-specific feet anchor; animation changes never change world feet Y. |
| Display size | One `displayScale` per actor. Frame-specific offsets correct alignment; per-animation scale is prohibited. |
| Ground body | Existing Arcade ground-occupancy body remains independent from visual alpha bounds. |
| Attack | Existing independent attack hitbox remains driven by accepted startup/active/recovery metadata. |
| Guard | Shield Guard's forward guard arc remains gameplay-owned; visual shield pixels never define the guard collision. |
| Projectile | Crossbow projectile remains a separate, player-only locked-lane object; its art never changes target rules. |
| Facing | One authored source-facing direction per actor; runtime flipping continues to be the only opposite-facing implementation. |

No art task may alter HP, damage, hit stop, knockback, attack slots, input,
camera, Stage configuration, or the accepted TP-1/TP-2/TP-3 decisions.

## 3. Scale, anchor, and source-cell contract

Production atlases use a 288 x 288 logical cell. This is a production target,
not a request to change current runtime assets in ER.1. Every production cell
uses origin `(0.5, 0.92)` and feet anchor `(144, 265)` unless a later reviewed
metadata audit proves an actor-specific exception is needed. The bottom-most
opaque foot pixel must resolve to the feet line; weapon and cloak overhang may
extend horizontally but not below it.

| Actor | Target neutral idle height | Guan Yu ratio | Source-facing | Required silhouette cue | Notes |
| --- | ---: | ---: | ---: | --- | --- |
| Soldier | 210 ±10 px | 0.91 | left | halberd / layered blue armor | Baseline visual mass. |
| Duelist | 205 ±10 px | 0.89 | right | low twin-hook stance | Narrowest body, widest lateral stance. |
| Mauler | 240 ±12 px | 1.04 | right | broad shoulders / hammer | Largest normal enemy; never Boss scale. |
| Shield Guard | 215 ±10 px | 0.93 | left | round shield projects forward | Shield must read at 25% scale without enlarging body collision. |
| Crossbow | 210 ±10 px | 0.91 | right | horizontal crossbow / rear quiver | Weapon line must read separately from the projectile. |

Target heights are visual review values. Existing gameplay body and hitbox
values stay frozen until a separate integration task explicitly validates them.

## 4. Atlas and metadata requirements

Each actor receives one project-owned runtime atlas and these sibling files:

```text
{actor}.png
{actor}.atlas.json
{actor}.metadata.json
{actor}-source.png
{actor}-source-transparent.png
{actor}-debug.png
{actor}-onion.png
{actor}-silhouette-25.png
```

The metadata must record, for every frame: frame name; source rectangle;
alpha bounds; origin; display offset; feet anchor; display scale; authored
facing; animation state; startup/active/recovery tag where applicable; pixel
hash; acceptance/rejection decision; source and processing provenance.

Source strips must be preserved before chroma removal. Frame rectangles must
be measured, never inferred from equal-width slicing. Weapon tips require at
least 8 logical pixels of lateral padding; the largest Mauler hammer pose and
Shield Guard shield rim require at least 12. If a pose cannot fit without
touching a neighboring frame, use a larger source rectangle or reject it.

## 5. Animation production budget

Each listed pose must be a genuine authored frame. Rotation, translation,
scale, interpolation, or a reused still do not satisfy a frame requirement.

| Actor | Idle | Walk | Attack | Hurt | Dead | Extra states | Total minimum |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: |
| Soldier | 2 | 4 | 3 (1/1/1) | 2 | 4 | — | 15 |
| Duelist | 2 | 4 | 3 (1/1/1) | 2 | 4 | — | 15 |
| Mauler | 2 | 4 | 5 (2 startup / 1 active / 2 recovery) | 2 | 4 | — | 17 |
| Shield Guard | 2 | 4 | 3 (1/1/1) | 2 | 4 | guard 2, block 2, recovery 2 | 21 |
| Crossbow | 2 | 4 | 3 fire (1/1/1) | 2 | 4 | aim 2, locked 1, reload 2 | 20 |

Attack phase labels remain metadata owned. The existing gameplay windows are
not retimed by this contract. The Shield Guard guard/block states and Crossbow
aim/locked/reload states require distinct readable poses, but they do not add a
new gameplay state in ER.1.

## 6. Review gates

### Go

- One shared feet line holds in idle, walk, attack, hurt, dead, and role-extra
  states; no frame moves the actor's world feet.
- Each actor is recognisable at 25% silhouette scale and has a distinct weapon
  and value grouping.
- No alpha contamination, duplicate frame hash, clipped weapon, or empty
  required frame exists.
- Runtime atlas inventory and decoded texture budget pass before integration.
- A reviewer approves the source, debug, onion, silhouette, and native-size
  runtime captures together.

### Revise

- A pose is readable but feet drift, its weapon clips, or its silhouette is
  confused with another role.
- Any head treatment, weapon class, armor mass, shield silhouette, or ranged
  mechanism conflicts with the approved-prototype lock.
- A state lacks an in-between frame, clear startup, active contact, or
  recovery pose.
- The atlas can fit only by changing gameplay reach or collision dimensions.

### No-Go

- The output copies the external reference rather than creating project-owned
  art.
- A proposed frame sequence uses transform fakery or cannot prove its source
  rectangles.
- A production atlas exceeds the budget, changes accepted combat behavior, or
  lacks provenance/metadata.

## 7. Memory and delivery budget

ER.1 adds no files to the build. A later art-integration task must replace, not
append to, the existing three enemy atlases.

| Budget | Limit | Gate |
| --- | ---: | --- |
| Five-enemy runtime decoded RGBA | ≤ 29 MiB | Derived from 288 x 288 cells and the minimum 88 production frames; packed atlas layout must be measured. |
| Whole runtime decoded RGBA | ≤ 140 MiB | Must remain within the accepted M8 budget. |
| Five-enemy encoded PNG | ≤ 4.0 MiB | Measured from final runtime PNGs only; source and QA files are excluded from delivery. |
| Runtime texture count | ≤ 26 | A replacement strategy must not leave legacy enemy textures loaded. |
| Production artifact | ≤ 30 MiB | Retain the accepted GitHub Pages delivery ceiling. |

The lower cell target is a budget constraint, not permission to reduce visual
readability. If native-size and mobile review fail, reject the asset plan rather
than silently increasing its texture allocation.

## 8. Required evidence before any integration

1. Reference and provenance record.
2. Source, transparent, atlas, metadata, debug, onion, and 25% silhouette
   files for one actor at a time.
3. Frame table with all rectangles, alpha bounds, offsets, feet anchors, and
   phases.
4. Native-size desktop plus 844 x 390 and 390 x 844 captures.
5. `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`,
   `pnpm build:github-pages`, and `node tools/report_performance_assets.mjs`.
6. Before/after runtime inventory, encoded bytes, decoded RGBA, texture count,
   and a reviewer Go/Revise/No-Go decision.

## 9. Sequencing

ER.1 is complete once this contract is reviewed. The next task may create only
the first production-art pilot and its QA evidence. It must not replace all
five actors in one change.
