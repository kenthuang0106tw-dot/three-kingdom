# Next Task

## ER.3 — Duelist Production-Art Replacement

### Why this is next

ER.2 proved the full source-to-atlas pipeline, the 288×288 delivery target, and
the reviewer workflow on one actor. Duelist is the next lowest-risk formal
runtime replacement: it uses the same fifteen-frame state budget but has a
different silhouette, source facing, speed, and flanking role that must remain
readable before the heavier or prototype-only actors are attempted.

### Scope

Create project-owned Duelist art and its complete source-to-atlas QA package:
source provenance, transparent extraction, measured frame metadata, debug
sheet, onion sheet, 25% silhouette sheet, and an isolated runtime replacement.
Keep Duelist gameplay tuning, body/hitbox dimensions, source-facing behavior,
Stage data, Camera, UI, Soldier, Mauler, Shield Guard, and Crossbow unchanged.

### Completion criteria

- All fifteen Duelist contract frames are distinct and have measured source
  rectangles, alpha bounds, offsets, common feet anchor, and one scale.
- Duelist idle, walk, attack, hurt, and dead preserve the existing animation
  keys and accepted gameplay phase windows.
- Duelist remains distinct from Soldier at native and 25% silhouette scale.
- New Duelist runtime art stays within the ER.1 memory and delivery budgets.
- Desktop, 844 x 390, and 390 x 844 review shows no clipping, feet drift,
  wrong-facing frame, or hitbox/body mismatch.

### Validation

- Run the ER.1 provenance, frame, anchor, pixel-hash, and atlas checks.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`,
  `pnpm build:github-pages`, `node tools/report_performance_assets.mjs`, and
  `git diff --check`.
- Perform development and production three-viewport gameplay smoke tests.

### Expected files

Duelist art source/processed/atlas/metadata/QA files, the focused validation
test, asset manifest entries only if required for replacement, and the ER.3
evidence documents. No other actor runtime asset is in scope.

### Risks

The reference lineup is not reusable art. Do not copy Soldier proportions,
generate transform-faked frames, guess frame rectangles, change the existing
right-facing contract, expand collision to match the twin-hook silhouette, or
retune Duelist gameplay to compensate for art.
