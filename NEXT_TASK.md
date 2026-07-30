# NEXT_TASK

## M10 / Task 10.3 — Zhang Fei Gameplay and Production Contract

### Why this is next

Task 10.2 proved that the accepted Guan Yu runtime can consume one minimal
Player Definition without behavior change. Before producing or integrating
Zhang Fei frames, the project must lock what makes him tactically and visually
different; otherwise art production would precede gameplay decisions and cause
expensive atlas or animation rework.

### Completion conditions

- Audit the existing Zhang Fei source/master images only as feasibility inputs;
  do not promote them to runtime.
- Lock one approved Zhang Fei identity reference: Japanese arcade-realistic
  Three Kingdoms pixel art, heavy warrior silhouette, dark beard, and serpent
  spear. Record prohibited identity drift.
- Define his tactical role relative to Guan Yu using measurable hypotheses for
  movement, body, attack startup/active/recovery, damage, knockback, and Hit
  Stop. Values remain prototype hypotheses, not formal balance.
- Preserve the existing one-button, three-stage, hit-confirm combo grammar,
  independent attack hitbox, hit-once, hurt/dead, Pause, Hit Stop, and reset
  contracts.
- Define genuine frame budgets for idle, walk, attack1–3, hurt, and dead,
  including startup/active/recovery classification for every attack.
- Define one feet anchor, origin, display-scale target, cell/atlas rules,
  alpha-bound analysis, debug sheet, onion-skin, silhouette, provenance, and
  preview acceptance.
- Define a development-only before/after combat comparison for Guan Yu versus
  Zhang Fei in the existing encounter/Boss contexts.
- Record acceptance, adjustment, and rejection criteria before art production.
- Update Roadmap, Sprint, Asset Pipeline, Architecture, Checklist, and Technical
  Debt only as required by the accepted contract.
- Do not generate or edit art, add runtime assets/animations, implement
  selection, modify Player gameplay, or change Enemy/Boss/Stage/Camera/UI/Audio.

### Acceptance and validation

- One signed-off contract uniquely distinguishes Zhang Fei from Guan Yu without
  relying only on HP or damage.
- Frame and atlas requirements are specific enough for Task 10.4 to execute
  without guessing crop, feet, phase, facing, or continuity.
- Prototype metrics are reproducible and cannot declare success from subjective
  “heavier feel” alone.
- The contract explicitly rejects dominance, excessive waiting, unreadable
  recovery, fake transform animation, identity drift, and scope expansion.
- Contract tests confirm Task 10.3 remains planning-only and Task 10.4 is the
  sole eligible implementation task.
- `pnpm test`, `pnpm typecheck`, and `pnpm lint` pass.

### Expected files

- `docs/planning/m10-zhang-fei-production-contract.md`
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `NEXT_TASK.md`
- `ASSET_PIPELINE.md`
- `ARCHITECTURE.md`
- `CHECKLIST.md`
- Contract tests.

### Risks

- Existing source images are mistaken for approved production frames.
- Zhang Fei differs only through larger numbers instead of a tactical choice.
- Frame count is locked before required transitions are understood.
- The contract leaks into Task 10.4 art production or Task 10.5 gameplay.
- A speculative generic character/weapon/skill framework is introduced.
