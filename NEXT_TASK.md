# NEXT TASK

## M10 / Task 10.5HP — Zhang Fei Attack 2 Lane-Coverage Prototype

### Why this task

Task 10.5H accepted the smallest identity-agnostic contract that directly
tests the distinction missed by both rejected prototypes. Each attack will own
one fixed rectangle while the Scene reuses its existing single Arcade Zone.
Only Zhang Fei Attack 2 proposes broader vertical lane coverage; its existing
commitment and exposure remain the cost. Formal character selection cannot
advance until real comparison evidence accepts or rejects this mechanic.

### Completion conditions

- Add one required immutable hitbox to `PlayerAttackMetadata`; migrate all six
  known attacks and remove the legacy actor-level `attackHitbox` with no
  optional or fallback path.
- Keep Guan Yu Attack 1–3 at `142×86 @ (104,-48)`.
- Keep Zhang Fei Attack 1/3 at `176×88 @ (132,-48)` and set only Attack 2 to
  `176×128 @ (132,-48)`.
- Reuse exactly one Scene-owned Arcade Zone. Apply its Zone/body size and
  feet-relative offset once at attack start while disabled; active-frame events
  only enable/reposition it.
- Do not add identity branches, per-frame geometry, extra bodies, colliders,
  listeners, timers, or resolver behavior.
- Preserve Zhang Fei Attack 2 at 525ms (175/125/225ms), damage 1, knockback
  56px, five-frame Hit Stop, facing lock, hit-once, miss/block Combo behavior,
  and no armor/cancel/movement benefit. Preserve every other gameplay value.
- Add focused tests for same-lane reach, target foot deltas `+60` and `-100`,
  both facings, Attack 1/3 narrow controls, geometry reset between combo steps,
  block, hit-once, Hurt, completion, Scene reset, and shutdown.
- Complete five deterministic runs per player in Entry, Ambush, and Boss: 30
  total, using the existing aware strategy and raw telemetry.
- Accept only if the unchanged **1.5×** aware-Ambush multi-target and **+0.20**
  displacement gates pass together with reposition/isolated-finisher,
  intentional-stop, non-dominance, interruption, lifecycle, and production
  isolation gates documented in the 10.5H contract.
- Make no geometry adjustment. If any gate fails or Attack 2 becomes a
  universal answer, reject and roll back runtime gameplay changes while
  retaining the report.
- Keep Task 10.6 blocked unless this prototype is explicitly accepted.
- Update Roadmap, Sprint, Checklist, Technical Debt, NEXT_TASK, and a complete
  before/after combat report.

### Validation

- focused hitbox/definition/prototype tests
- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `pnpm build:github-pages`
- Development Desktop, 844×390, and 390×844 Entry/Ambush/Boss smoke with real
  movement and attacks.
- Production smoke: one intrinsic 1280×720 Canvas, no prototype/debug dataset,
  no overflow or captured runtime error, and unchanged packaged inventory.

### Expected files

- `app/game/player/PlayerDefinition.ts`
- `app/game/player/GuanYuAnimationMetadata.ts`
- `app/game/player/ZhangFeiAnimationMetadata.ts`
- `app/game/MainScene.ts`
- focused player/combat/prototype tests
- Task 10.5HP combat report
- `ARCHITECTURE.md`
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `CHECKLIST.md`
- `TECH_DEBT.md`
- `NEXT_TASK.md`

### Risks

- Resizing the Zone but not its Arcade body creates visual/physics drift.
- Attack 2 geometry leaks into Attack 3, Hurt, restart, or a new run.
- Broader coverage becomes a universal answer instead of a positional choice.
- Shield Guard blocks or Boss overlap differ because hit-once ordering changes.
- A failed comparison is rescued by tuning geometry or enemies.
- Prototype-only Zhang Fei assets leak into production packaging.

Do not change art, animation frames, timing, damage, knockback, Hit Stop, Combo
Window, Enemy/Boss/Stage/Camera/input/Audio/UI/React behavior, add another Zone
or shape system, implement Task 10.6, add formal character selection, or begin
Zhao Yun in this task.
