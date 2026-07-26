# NEXT_TASK

## ER.4 — Mauler Production-Art Replacement

### Why this is next

ER.3R corrected and accepted the Duelist against the repository-owned five-enemy
prototype. Mauler is now the only formal melee cast member still using the
earlier temporary 384×384 presentation, so replacing it completes the proven
one-actor melee production sequence without mixing in gameplay expansion.

### Completion conditions

- Replace only Mauler visual source, metadata, atlas, and QA evidence.
- Preserve the approved broad red-brown heavy silhouette, large cleaver,
  grounded stance, and visibly larger normal-enemy scale.
- Produce 17 genuine frames: idle 2, walk 4, attack 5, hurt 2, dead 4.
- Preserve current Mauler gameplay, attack timing and phases, body, hitbox,
  speed, HP, damage, AI, Stage, Camera, UI, Audio, and Attack Slot behavior.
- Use one actor-wide scale and feet anchor; do not use per-animation scale or
  transforms to fake motion.
- Do not implement Duelist leap behavior, Shield Guard/Crossbow production art,
  or any unrelated feature.

### Validation

- Neutral-idle identity gate against both approved repository references before
  full-sheet integration.
- Native and 25% color/silhouette review, debug sheet, onion skin, measured
  rectangles, feet anchors, frame hashes, and shared cast lineup.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`, with TD-M11 reported honestly if wrappers stop
  before project scripts.
- Desktop, 844×390, and 390×844 production smoke tests.

### Expected files

- Mauler-only source/runtime art and metadata files.
- Mauler generation/extraction tooling only where required.
- ER.4 review evidence and the minimum corresponding project-document updates.

### Risks

- Producing a generic large Soldier instead of the approved heavy Mauler.
- Cropping the cleaver or losing its silhouette at 288×288 runtime cell size.
- Feet drift caused by wider attack/death poses.
- Accidentally changing accepted Mauler combat timing or facing while replacing
  presentation.
