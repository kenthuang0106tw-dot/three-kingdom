# Next Task

## M5 / Task 5.3 — Boss decision rhythm

### Why this is next

The Boss lifecycle and three readable attack definitions now exist. Before a
Boss actor is rendered, the project needs a deterministic, Phaser-free decision
policy that prevents seamless attack spam and chooses only legal attacks.

### Completion criteria

- Define one minimal Boss decision policy using the existing seeded random and
  gameplay clock contracts.
- Select among attack1–3 only when the Boss lifecycle is eligible and recovery
  has completed.
- Prevent immediate seamless attacks and make identical seeds produce identical
  decision sequences.
- Keep the policy Phaser-free and separate from `EnemyManager`.
- Do not spawn/render the Boss or add actor physics, phase, hurt/death visuals,
  arena, HUD, audio, stage completion, or new art.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Add deterministic sequence, recovery lockout, illegal-state, and reset tests.
- Browser smoke verifies the existing room remains unchanged with one 1280×720
  Canvas and zero page errors.

### Expected files

- `app/game/boss/**`
- `tests/**`
- `ARCHITECTURE.md`, `SPRINT.md`, `GAME_ROADMAP.md`, `CHECKLIST.md`,
  `TECH_DEBT.md`, `README.md`

### Risks

- A policy built before actor integration can become speculative. Limit it to
  attack selection and recovery timing already required by the three existing
  attack definitions; do not add movement, distance, phase, or arena rules.
