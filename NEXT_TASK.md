# NEXT_TASK

## M8 / Task 8.6 — Flash/Shake Accessibility Settings

### Why this is next

M8.3 found no blocking visual defect. The remaining M8.7 full QA matrix depends
on completing the planned accessibility control first. This task is the
smallest eligible change that lets photosensitive or motion-sensitive players
reduce hit flash and camera shake without changing the default arcade feel.

### Completion conditions

- Add one minimal accessibility setting surface using the existing product UI;
  do not create a general settings framework.
- Provide independently testable reduced-flash and reduced-shake behavior.
- Default behavior and every existing combat parameter remain unchanged.
- Reduced flash must lower or remove full-white hit flashes without changing
  hit timing, damage, hit-stop, spark ownership, or animation.
- Reduced shake must lower or disable camera shake without changing camera
  follow, lock, handoff, or combat timing.
- Settings must survive Pause/resume and Scene reset for the current page
  session without using React gameplay state or a new backend/save system.
- Touch and keyboard users must both be able to operate the setting surface.

### Validation

- Focused tests for default parity, reduced-flash, reduced-shake, Pause/resume,
  Scene reset, and absence of combat/camera timing changes.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`, with TD-M11 reported honestly if package-manager
  wrappers stop before project scripts.
- Desktop, 844×390, and 390×844 visual smoke for default and reduced settings.
- Production contains no debug controls, console errors, Canvas duplication,
  overflow, or asset 404.

### Expected files

- Minimal accessibility policy/config and existing Phaser UI integration.
- Effect/camera consumption points only where required.
- Focused tests and M8.6 evidence/document updates.

### Risks

- A settings task could expand into a general menu, persistence, or UI redesign.
- Reduced feedback could accidentally change combat timing instead of only
  presentation intensity.
- React state or DOM controls could become coupled to Phaser gameplay.
