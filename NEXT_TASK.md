# NEXT TASK

## M10 / Task 10.5H — Zhang Fei Attack-Specific Hitbox Contract

### Why this task

Task 10.5D selected contract revision after two complete numeric prototypes
failed distinct tactical acceptance. Zhang Fei's existing Attack 2 art and
positioning evidence support one bounded question: can a broader front-facing
2.5D lane-coverage profile create a real formation-breaking choice while its
current commitment and exposure remain the cost? The current architecture owns
one shared actor-level rectangle and explicitly forbids per-attack geometry, so
ownership and limits must be accepted before any code change.

This task is **planning/discovery only**.

### Completion conditions

- Audit the existing `PlayerDefinition`, `PlayerAttackController`,
  `PlayerActor`, `MainScene`, independent Arcade attack zone, hit-once,
  CombatResolver, block, reset, Pause, Hit Stop, Hurt, and production-isolation
  ownership paths.
- Choose exactly one minimum identity-agnostic schema for fixed per-attack
  geometry, or reject the mechanic if it cannot preserve those owners.
- Define how one existing attack zone would consume a profile without
  per-frame shapes, identity branches, extra bodies, duplicate listeners, or
  Scene-owned character data.
- Freeze a proposed Attack 2 geometry range relative to feet and facing; Attack
  1 and Attack 3 remain narrow controls. Do not apply the values.
- Preserve the explicit cost: current 525ms Attack 2 commitment, startup facing
  lock, front-only exposure, no armor, invulnerability, extra damage, HP,
  Combo Window, or cancel benefit.
- Define one future prototype protocol with fixed Guan Yu control, Entry,
  Ambush, and Boss contexts; direct lane-coverage, multi-target,
  stop/reposition, punishment, dominance, mobile-readability, lifecycle, and
  rollback gates.
- State the exact architecture document amendment and expected implementation
  files a later prototype would require, without modifying them now.
- Keep Task 10.6 blocked and update Roadmap, Sprint, Checklist, Technical Debt,
  and NEXT_TASK consistently.
- Add focused contract coverage proving this task is documentation/tests only.

### Validation

- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- Confirm no runtime type, gameplay, hitbox, metadata, art, asset, Stage,
  Enemy, Boss, Camera, input, Audio, UI, or production file changes.

### Expected files

- focused M10 hitbox-contract document
- focused planning-contract test
- `ARCHITECTURE.md`
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `CHECKLIST.md`
- `TECH_DEBT.md`
- `NEXT_TASK.md`

### Risks

- The proposal becomes per-frame weapon collision instead of one fixed
  per-attack profile.
- Zhang Fei identity leaks into `MainScene` or combat resolution.
- Broader coverage removes Attack 2 positioning decisions and becomes a
  universal answer.
- A future prototype is authorized without numeric rejection and rollback
  gates.
- Planning silently changes current runtime metadata or production packaging.

Do not implement hitbox geometry, modify `PlayerDefinition`, tune Zhang Fei,
change animation/art, run a third combat prototype, implement Task 10.6, add
formal Title selection, Zhao Yun, Stage content, Enemy/Boss tuning, input,
Audio, UI, or Camera behavior in this task.
