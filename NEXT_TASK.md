# NEXT_TASK

## M8 / Task 8.3 — Release Visual Defect Pass

### Why this is next

ER.2 through ER.6 now give all five approved enemy roles project-owned
production presentation. Before accessibility settings, the full QA matrix, or
release work, the accepted Player, enemies, Boss, Stage, effects, and responsive
layouts need one bounded visual-defect pass. This is the earliest remaining
task that can find clipping, seams, readability regressions, and platform
differences without reopening the frozen art direction.

### Completion conditions

- Inspect the existing accepted assets and runtime presentation only; do not
  generate a new character set or change gameplay balance.
- Check Player, five enemy roles, Boss, Stage transitions, hit effects, HUD,
  touch controls, and camera presentation for clipping, visible seams,
  incorrect stacking, unreadable state changes, and viewport-specific defects.
- Fix only defects that are reproducible and directly evidenced.
- Preserve all current animation timing, hitboxes, HP, AI, Encounter, Camera,
  Audio, and control contracts unless a visual defect is caused by an incorrect
  presentation mapping.
- Record every inspected defect as fixed, deferred with severity, or not
  reproducible.

### Validation

- Focused regression tests for each changed presentation path.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`, with TD-M11 reported honestly if package-manager
  wrappers stop before project scripts.
- Desktop, 844×390, and 390×844 full vertical-slice smoke, including every
  enemy role and Boss.
- No new console errors, Canvas duplication, overflow, asset 404, or production
  debug leak.

### Expected files

- Existing presentation assets or mappings only when a defect is proven.
- Focused tests and visual evidence.
- M8.3 report and corresponding roadmap, sprint, checklist, architecture,
  asset-pipeline, and technical-debt updates where applicable.

### Risks

- A broad “polish” pass could silently reopen accepted art direction.
- Visual fixes could accidentally alter gameplay anchors, hitboxes, camera
  behavior, or responsive input.
- Device-only defects may require explicit reviewer evidence rather than local
  browser emulation.
