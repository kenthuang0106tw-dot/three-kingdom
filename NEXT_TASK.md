# Next Task

## ER.2 — Soldier Production-Art Pilot

### Why this is next

ER.1 now freezes the shared five-enemy art contract. The Soldier is the safest
single actor to prove its pipeline because it has no special guard, projectile,
or multi-stage attack presentation. A successful pilot validates the pipeline
before Shield Guard and Crossbow receive distinct production art.

### Scope

Create project-owned Soldier art and its complete source-to-atlas QA package:
source provenance, transparent extraction, measured frame metadata, debug
sheet, onion sheet, 25% silhouette sheet, and a limited runtime replacement.
Keep all gameplay tuning, body/hitbox dimensions, Stage data, Camera, UI, and
other enemy assets unchanged.

### Completion criteria

- All fifteen Soldier contract frames are distinct and have measured source
  rectangles, alpha bounds, offsets, common feet anchor, and one scale.
- Soldier idle, walk, attack, hurt, and dead preserve the existing animation
  keys and accepted gameplay phase windows.
- New Soldier runtime art stays within the ER.1 memory and delivery budgets.
- Desktop, 844 x 390, and 390 x 844 review shows no clipping, feet drift,
  wrong-facing frame, or hitbox/body mismatch.

### Validation

- Run the ER.1 provenance, frame, anchor, pixel-hash, and atlas checks.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`,
  `pnpm build:github-pages`, `node tools/report_performance_assets.mjs`, and
  `git diff --check`.
- Perform development and production three-viewport gameplay smoke tests.

### Expected files

Soldier art source/processed/atlas/metadata/QA files, the focused validation
test, asset manifest entries only if required for replacement, and the ER.2
evidence documents. No other enemy runtime asset is in scope.

### Risks

The reference lineup is not reusable art. Do not generate transform-faked
frames, guess frame rectangles, expand collision to match a weapon, or use the
pilot as permission to alter the remaining four actors.
