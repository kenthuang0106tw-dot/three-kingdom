# Next Task

## ER.1 — Five-Enemy Production Contract

### Why this is next

The Shield Guard, Crossbow, and their combined tactical prototype are now
accepted. Before replacing any temporary enemy art, the five existing enemy
roles need one shared production contract so visual upgrades cannot break
feet alignment, combat reach, collision ownership, memory budgets, or the
accepted tactical behavior.

### Scope

Planning and documentation only. Define the production contract for Soldier,
Duelist, Mauler, Shield Guard, and Crossbow:

- reference provenance and visual-role boundaries;
- common feet anchors, Phaser origins, display-height targets, source facing,
  alpha-bound padding, and atlas-cell rules;
- animation state lists and per-state frame budgets;
- body, attack-hitbox, guard-arc, and projectile ownership boundaries;
- encoded/decoded texture-memory and production-artifact budgets; and
- explicit Go, Revise, and No-Go review gates.

### Completion criteria

- Create `docs/character-production/enemy-cast-v2-production-contract.md`.
- Add a provenance README under `docs/visual-baselines/enemy-cast-v2/` for
  the supplied reference images; do not copy them into runtime assets.
- Update `ART_BIBLE.md`, `ASSET_PIPELINE.md`, `GAME_ROADMAP.md`, `SPRINT.md`,
  and `TECH_DEBT.md` only where they need to point to the contract or record
  its pre-production constraint.
- Do not edit runtime asset manifests, Phaser gameplay code, Stage data,
  combat timings, or existing art files.

### Validation

- Review the contract against all five enemy roles and the existing M6A asset
  freeze.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `git diff --check`.
- Run `pnpm build`, `pnpm build:github-pages`, and
  `node tools/report_performance_assets.mjs`; confirm no runtime inventory or
  budget change.

### Expected files

`docs/character-production/enemy-cast-v2-production-contract.md`,
`docs/visual-baselines/enemy-cast-v2/README.md`, `ART_BIBLE.md`,
`ASSET_PIPELINE.md`, `GAME_ROADMAP.md`, `SPRINT.md`, and `TECH_DEBT.md`.

### Risks

The supplied reference material is planning input, not cleared runtime art.
Do not invent frame sequences, change gameplay dimensions, or silently turn
the production contract into an art-integration task.
