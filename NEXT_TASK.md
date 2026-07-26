# NEXT_TASK

## ER.3R — Duelist Approved-Prototype Correction

### Why this is next

ER.3 passed its technical pipeline but failed the recovered approved-prototype
review. The current Duelist reads as an exposed-topknot masked ninja with short
hook blades instead of the locked full-hooded twin-hook character. Starting
Mauler production before correcting this would allow known visual drift to
remain in the cast.

### Completion conditions

- Replace only Duelist visual source, metadata, atlas, and QA evidence.
- Preserve the approved full charcoal/navy hood and cowl, shadowed face, low
  narrow stance, and exactly two long inward-curved hand hooks.
- Pass neutral-idle side-by-side review against both approved repository images
  before producing or integrating the full animation set.
- Preserve all ER.3 gameplay, frame budgets, timing, feet alignment, one-scale,
  metadata, atlas, packaging, and performance contracts.
- Do not modify Mauler or any unrelated gameplay/system content.

### Validation

- Native and 25% color/silhouette comparison against both approved references.
- Debug sheet, onion skin, measured rectangles, feet anchors, and frame hashes.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.
- Desktop, 844×390, and 390×844 production smoke tests.

### Expected files

- Duelist-only source/runtime art and metadata files.
- Duelist generation/extraction tooling only where required.
- ER.3R visual evidence and the minimum corresponding project-document updates.

### Risks

- Drifting back toward a generic ninja, exposed hair, or short axe/knife shapes.
- Losing the long-hook negative space at runtime scale.
- Accidentally changing accepted gameplay while replacing presentation.
