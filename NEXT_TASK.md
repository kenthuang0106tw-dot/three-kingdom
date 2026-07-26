# Next Task

## ER.4 — Mauler Production-Art Replacement

### Why this is next

ER.2 and ER.3 proved the 288×288 source-to-atlas workflow for the two standard
melee actors. Mauler is the last formal melee runtime actor and the next
highest-risk silhouette because its hammer and 240px target height must fit
the same delivery budget without changing accepted reach or attack timing.
Completing it before Shield Guard and Crossbow prevents temporary-role art
from hiding a remaining formal-cast inconsistency.

### Scope

Create project-owned Mauler art and its complete source-to-atlas QA package:
seventeen genuine frames, source provenance, transparent extraction, measured
frame metadata, debug sheet, onion sheet, 25% silhouette sheet, and an isolated
runtime replacement. Preserve Mauler gameplay tuning, body/hitbox dimensions,
authored-facing behavior, Stage data, Camera, UI, Soldier, Duelist, Shield
Guard, and Crossbow.

### Completion criteria

- Idle 2, walk 4, attack 5, hurt 2, and dead 4 are distinct genuine poses.
- Attack metadata preserves two startup, one active, and two recovery poses
  without retiming the accepted gameplay window.
- Every frame has measured rectangles, alpha bounds, offsets, a common feet
  anchor, one scale, and sufficient hammer padding.
- Mauler remains the largest normal enemy and distinct from Soldier/Duelist at
  native and 25% silhouette scale.
- Runtime memory, delivery, desktop, 844×390, and 390×844 gates pass.

### Validation

- Run provenance, frame, anchor, padding, pixel-hash, atlas, and gameplay-freeze
  checks.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`,
  `pnpm build:github-pages`, `node tools/report_performance_assets.mjs`, and
  `git diff --check`; document TD-M11 if the wrapper still stops before scripts.
- Perform development QA review and production three-viewport smoke tests.

### Expected files

Mauler source/processed/atlas/metadata/QA files, focused validation tests,
pipeline constants needed for its seventeen-frame layout, ER.4 evidence, and
project status documents. No other actor runtime asset is in scope.

### Risks

The hammer can exceed the 288px cell or visually imply gameplay reach beyond
the frozen hitbox. Do not crop it, shrink animations independently, reuse
frames, alter the hitbox, retime the attack, or compensate by changing Mauler
gameplay.
