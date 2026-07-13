# Next Task

## M5 / Task 5.1 — Boss state/ownership contract

### Why this is next

Milestone 4 now has accepted mixed-archetype lifecycle and cleanup behavior.
Before adding Boss attacks or art, the project needs one explicit ownership and
state contract so the Boss does not become a special case inside EnemyManager.

### Completion criteria

- Define one Phaser-free Boss state and lifecycle ownership contract.
- Keep Boss ownership separate from `EnemyManager` while reusing established
  combat events and stage boundaries where appropriate.
- Cover legal state transitions, damage/death entry, cleanup, and reset behavior
  with deterministic tests.
- Do not add Boss art, attacks, AI decisions, arena content, HUD, audio, or a
  generic Boss framework.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Browser smoke verifies the existing room remains unchanged: one 1280×720
  Canvas with zero page errors.
- Confirm `EnemyManager` does not own or instantiate the Boss contract.

### Expected files

- `app/game/boss/**`
- `tests/**`
- `ARCHITECTURE.md`, `SPRINT.md`, `GAME_ROADMAP.md`, `CHECKLIST.md`,
  `TECH_DEBT.md`, `README.md`

### Risks

- Reusing too much EnemyManager behavior would couple Boss lifecycle to normal
  enemy formation and Attack Slot rules. Keep the contract minimal and
  Phaser-free until real Boss attacks provide concrete requirements.
