# Next Task

## M5R / Task 5R.1 — Three-screen world and visible camera scrolling

### Why this is next

The accepted Stage work currently proves only single-room contracts: runtime
world width is still 1280 pixels, equal to the logical viewport, so camera
follow cannot produce visible scrolling. HUD and the remaining M6 product UI
would decorate an incomplete room instead of advancing the Beat 'em Up vertical
slice. The first Recovery task must therefore establish a real traversable
three-screen stage before encounter or Boss behavior is expanded.

### Completion criteria

- Expand the authoritative StageConfig world to at least 3840×720 while keeping
  one logical 1280×720 Phaser Canvas.
- Render three contiguous 1280px-wide bamboo-stage sections with no blank area,
  stretching, or visible uncovered seam. Reusing the current forest art as a
  temporary stage section is allowed; new visual polish is not part of this
  task.
- Let the player move beyond the first viewport and traverse the expanded walk
  bounds without leaving the playable ground area.
- Make the main camera visibly follow the player: integer `scrollX` must move
  above 0 and clamp at the final world edge (expected maximum 2560 for a 3840px
  world and 1280px viewport).
- Ensure initial encounter/Boss lock ownership does not permanently prevent
  traversal. Do not implement encounter triggers or Boss combat in this task;
  document any temporary unlocked-content behavior for Task 5R.2/5R.3.
- Place existing combat content outside the starting viewport using Stage data
  rather than new hard-coded world-bound constants where required to make the
  traversal path observable.
- Preserve Title/start, keyboard/touch input, player combat, physics alignment,
  hit effects, one Phaser instance, and Scene restart cleanup.
- Do not add HUD, Pause, Failure, Result, Audio, new actors, new attacks, new
  enemies, encounter sequencing, Boss movement, or Boss damage.

### Validation

- Deterministic tests prove world/walk containment, three stage sections, player
  edge clamping, camera scroll at start/middle/end, and no duplicate world-bound
  policy.
- `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck` pass.
- Desktop browser smoke starts from Title, moves the player out of the first
  viewport, records `scrollX > 0`, reaches the final camera clamp, and retains
  one 1280×720 Canvas with zero console errors.
- 844×390 landscape and 390×844 fitted portrait smokes show the same logical
  traversal without Canvas stretching or touch-control displacement.
- Ten Scene restarts retain one Canvas, one player, one existing Boss actor, no
  stale completion event, and the initial camera position.

### Expected files

- `app/game/stage/StageConfig.ts`
- `app/game/camera/CameraFollow.ts` only if the accepted pure calculation needs
  a verified correction
- `app/game/MainScene.ts`
- Stage layout/background configuration or existing scene asset routing
- `tests/app-contracts.test.mjs`
- Project status/evidence documents

### Risks

- Existing encounter and Boss camera locks currently assume one room and can
  make a wider world appear unchanged.
- Repeating the current 1280px background can expose seams or scaling errors;
  keep section placement explicit and defer art polish.
- World-space and screen-space coordinates can be mixed, causing actors,
  hitboxes, touch controls, or debug overlays to drift.
- Moving existing content with new MainScene literals would create another
  bounds policy; StageConfig must remain authoritative.
