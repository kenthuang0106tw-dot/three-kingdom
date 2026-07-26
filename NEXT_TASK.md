# NEXT_TASK

## ER.5 — Shield Guard Production-Art Replacement

### Why this is next

GX.1 completes the requested Duelist leap identity. Shield Guard is the next
approved five-enemy prototype still using Soldier substitute art, while its
TP-1 directional guard gameplay is already accepted and must remain frozen.
Replacing presentation now completes one isolated actor without starting the
Crossbow or changing combat rules.

### Completion conditions

- Open both repository-owned approved lineup references before generation.
- Pass a neutral-pose identity gate before producing the full sheet.
- Preserve the solid olive/brown infantry build and dominant round woven
  rattan shield at approximately 55–60% of body height.
- Keep shield weave, rim, and central boss readable at 25% scale.
- Produce genuine idle, walk, guard, attack, hurt, and dead poses with one
  feet anchor and one display scale.
- Replace only Shield Guard presentation; preserve its accepted HP, speed,
  damage, guard cone, facing lock, counter/recovery timing, body, hitbox,
  Attack Slot, and formal Stage isolation.
- Do not start Crossbow art, change TP-1 gameplay, or modify Player, Boss,
  Stage, Camera, UI, Audio, or unrelated enemy code.

### Validation

- Neutral identity gate against both approved references.
- Measured atlas metadata, distinct pose hashes, debug sheet, onion skin,
  25% silhouette, feet alignment, and weapon/shield padding checks.
- Focused tests proving Shield Guard gameplay constants and contracts are
  unchanged.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`, with TD-M11 reported honestly if wrappers stop
  before project scripts.
- Desktop, 844×390, and 390×844 guard/attack/hurt/dead readability smoke tests.

### Expected files

- Shield Guard source/runtime art, atlas, metadata, QA, and review evidence.
- Minimum Shield Guard asset/config integration and focused tests.
- ER.5 report and corresponding roadmap, sprint, checklist, architecture,
  asset-pipeline, and technical-debt updates.

### Risks

- Producing a metal, tower, kite, rectangular, or undersized shield instead of
  the approved dominant round woven rattan shield.
- Letting the shield clip adjacent frames or become unreadable at mobile size.
- Changing accepted TP-1 gameplay while replacing presentation.
- Expanding the task into Crossbow art or a general armor/guard framework.
