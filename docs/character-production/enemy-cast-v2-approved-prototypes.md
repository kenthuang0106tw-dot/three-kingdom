# Enemy Cast v2 — Approved Character Prototypes

## Status

Creative Director visual lock. This document defines the identities that all
Enemy Redesign production art must preserve. Passing atlas, animation, build,
or runtime tests does not override a failed visual-identity review.

## Canonical References

| Reference | Repository file | SHA-256 |
| --- | --- | --- |
| Approved color lineup | `docs/visual-baselines/enemy-cast-v2/approved-five-enemy-color.png` | `FFBEE16F1B171F1EF59B73A4D3A57CCFA389EA577BB172F8255F487FD4ECD55D` |
| Approved silhouette lineup | `docs/visual-baselines/enemy-cast-v2/approved-five-enemy-silhouette.png` | `1F5D220EA3423A3967D6D869BD9CEB34B340F9E7241C72F5E0EA1FB9C8E7310E` |

The original review sources were created under
`C:\Users\kenth\.codex\generated_images\019f992e-0533-74d2-a618-4f828048c377\`.
The repository copies above are authoritative for future work; implementation
must not depend on those external paths or on conversation memory.

The fixed left-to-right order is:

1. 軍府戟兵 / Soldier
2. 兜帽雙鉤 / Duelist
3. 方頭戰鎚 / Mauler
4. 圓形藤盾兵 / Shield Guard
5. 輕裝連弩兵 / Crossbow

## Immutable Identity Locks

### 1. Soldier — 軍府戟兵

- Upright standard-infantry silhouette and disciplined military posture.
- Blue-grey lamellar armor, dark-red ties, light cloth layers.
- Domed helmet with a short red plume.
- One long pole halberd; it reads vertically in idle.
- Must not become a short-axe, sword, plain-spear, or fantasy-heavy character.

### 2. Duelist — 兜帽雙鉤

- Shortest, narrowest, and lowest stance in the lineup.
- A real charcoal/navy hood and cowl with a shadowed face.
- An exposed topknot, ninja headband, or ordinary face mask is not a hood.
- Dark light armor, muted rust accents, and ragged lower layers.
- Exactly two long inward-curved hand hooks, one in each hand, with readable
  negative space between weapon and body.
- Must not read as axes, short knives, swords, claws, or generic ninja weapons.
- Planned gameplay signature: the Duelist is the first normal enemy selected
  for a deliberate leap/reposition prototype. This is a future gameplay task,
  not permission to add transform-faked jumping during ER.3R.

#### Future leap art constraint

- A production leap requires genuine startup, airborne, descent, and landing
  poses; moving one idle frame vertically is prohibited.
- Airborne visual elevation must be separate from the 2.5D ground/feet
  position, with a ground shadow communicating the landing lane.
- Takeoff and landing must preserve the actor's approved hood, long twin hooks,
  display scale, and common feet anchor.
- ER.3R corrects the current identity only. Leap behavior and additional frames
  belong to the separately accepted `GX.1` prototype.

### 3. Mauler — 方頭戰鎚

- Largest normal enemy, but still clearly smaller than the Boss.
- Square torso, broad stance, beard, and heavy red/brown lamellar armor.
- One long war hammer with a rectangular or square head.
- Must not become a round mace, spiked ball, axe, club, or enlarged Soldier.

### 4. Shield Guard — 圓形藤盾兵

- Solid standard build in olive/brown armor.
- A dominant round woven rattan shield, approximately 55–60% of body height.
- Weave, rim, and central boss remain readable at 25% scale.
- Carries only a small secondary melee weapon.
- Must not use a kite, rectangular, tower, metal shield, or tiny buckler.

### 5. Crossbow — 輕裝連弩兵

- Standard-light blue-grey armor and tied cloth headwear.
- One large horizontal repeating crossbow with readable stock, arms, and
  mechanism.
- Rear bolt/quiver pack remains part of the silhouette.
- Projectile is a separate runtime object.
- Must not become a bow, firearm, tiny hand crossbow, or heavy shield unit.

## Mandatory Pre-Generation Gate

Before generating or revising any of these five enemies:

1. Read this document and the ER.1 production contract.
2. Open both repository reference images and include them as visual references.
3. Copy the selected character's immutable locks into the generation brief.
4. Produce and compare a neutral idle pose before making the full animation set.
5. Record side-by-side evidence for color identity, silhouette, weapon class,
   body mass, head treatment, and feet alignment.
6. Mark the task `Revise` and stop integration when any identity lock fails.

Generic prompts such as “same style” are insufficient. Temporary runtime art,
previous generated frames, and memory of earlier discussions are not substitutes
for the two approved reference images.

## Current Conformance Audit — 2026-07-26

| Actor | Decision | Finding |
| --- | --- | --- |
| Soldier | Go | Long halberd, blue armor, upright military silhouette remain consistent with the approved prototype. |
| Duelist | Go (ER.3R) | Full hood/cowl, shadowed face, low stance, and two long inward-curved hooks now match the approved identity; gameplay remains unchanged. |
| Mauler | Go (ER.4) | Seventeen-frame production art preserves the square-headed long war hammer, beard, broad red/brown silhouette, and largest-normal-enemy scale. |
| Shield Guard | Go (ER.5) | Twenty-one production poses preserve the dominant round woven rattan shield, olive/brown build, small secondary weapon, and shared feet line without changing TP-1 gameplay. |
| Crossbow | Go (ER.6) | Twenty production poses preserve the large horizontal repeating crossbow, rear bolt pack, light blue-grey armor, tied cloth headwear, and shared feet line without changing TP-2/TP-3 gameplay. |
