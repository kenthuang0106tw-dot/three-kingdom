# NEXT_TASK

## ER.6 — Crossbow Production-Art Replacement

### Why this is next

ER.5 completes the approved Shield Guard presentation without changing TP-1.
Crossbow is now the only approved five-enemy role still using Soldier
substitute art. Its TP-2 locked-lane gameplay and TP-3 composition decision are
already accepted, so presentation can be replaced in isolation.

### Completion conditions

- Read both repository-owned approved references and the ER.1 production
  contract before generation.
- Pass a neutral-idle identity gate: standard-light blue-grey armor, tied cloth
  headwear, one large horizontal repeating crossbow with readable stock, arms,
  and mechanism, plus a rear bolt/quiver pack.
- Produce 20 genuine frames: idle 2, walk 4, fire 3, hurt 2, dead 4, aim 2,
  locked 1, and reload 2.
- Use one 288×288 cell contract, one feet anchor, one display scale, measured
  non-equal source rectangles, and at least 8 logical pixels of weapon padding.
- Replace only Crossbow presentation. Preserve HP, movement, Aim tracking,
  locked line, Fire, Reload, projectile ownership/range, Player-only targeting,
  Attack Slot, body, hitbox, Stage isolation, and rejected friendly-fire
  decision.
- Do not change Shield Guard, other enemies, Player, Boss, Stage, Camera, UI,
  Audio, or combat balance.

### Validation

- Neutral identity gate against both approved references.
- Measured atlas metadata, 20 distinct pose hashes, debug sheet, onion skin,
  25% silhouette, feet alignment, and crossbow/quiver padding checks.
- Focused tests proving all TP-2/TP-3 gameplay constants and target rules remain
  unchanged.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`, with TD-M11 reported honestly if wrappers stop
  before project scripts.
- Desktop, 844×390, and 390×844 aim/locked/fire/reload/hurt/dead readability
  smoke tests.

### Expected files

- Crossbow source/runtime art, atlas, metadata, QA, and review evidence.
- Minimum Crossbow asset/config integration and focused tests.
- ER.6 report and corresponding roadmap, sprint, checklist, architecture,
  asset-pipeline, and technical-debt updates.

### Risks

- The weapon may read as a bow or tiny hand crossbow instead of the approved
  large horizontal repeating mechanism.
- Weapon arms, rear quiver, or bolts may clip or contaminate adjacent frames.
- Presentation work could accidentally retime Aim/Lock/Fire/Reload or alter
  the explicitly Player-only projectile contract.
