# NEXT TASK

## M10 / Task 10.5 — Zhang Fei Combat Prototype

### Why this task

Task 10.4 now provides the approved 47-frame Zhang Fei atlas, measured metadata,
fixed feet/origin/scale contract, reproducible QA outputs, and an isolated
development preview. The next unresolved risk is gameplay: whether the accepted
heavy spear-controller hypothesis creates a real decision beside Guan Yu
without becoming the universally safer or stronger answer.

### Completion conditions

- Add a development-only Zhang Fei player definition and comparison entrance.
- Use only the accepted Task 10.3 values: speed `200`, HP `10`, body `96×58`,
  longer actor-level attack hitbox, and the documented phase/impact values.
- Map the approved Task 10.4 poses to genuine Phaser animations without
  transforms, duplicated frames, per-state scale, or feet correction.
- Preserve one-button, one-stage-per-input, hit-confirm-only combo progression,
  per-target hit-once, independent hitbox, Hurt/Dead, Pause, Hit Stop, reset,
  Enemy/Boss, Camera, Stage, UI, and Audio contracts.
- Run five paired Guan Yu/Zhang Fei trials in Forest Entry, Forest Ambush, and
  the Boss arena using the fixed scenarios and metrics in the production
  contract.
- Produce raw results, medians, and an explicit Accept / Adjust / Reject
  decision. Subjective feel alone cannot pass.
- Keep Zhang Fei out of formal Title selection and the production asset
  manifest until Task 10.5 is accepted.
- Pass focused tests, the full suite, typecheck, lint, both builds, production
  packaging isolation, and Desktop/844×390/390×844 comparison smoke.

### Acceptance

- Zhang Fei reads as a committed space controller, not a Guan Yu recolor.
- Neither general has both lower median damage taken and lower median clear
  time in all three contexts.
- Zhang Fei's reach/displacement creates useful spacing decisions but does not
  produce permanent safety, passive waiting, or unconditional dominance.
- His longer startup/recovery remains readable and punishable on all three
  viewports.
- Guan Yu's frozen presentation and gameplay values remain exact.
- No Enemy, Boss, Stage, Camera, UI, Audio, encounter, or input tuning changes.
- Reset leaves one Player actor, one input owner, no stale definition, no
  listener/timer leak, and one Canvas.

### Expected files

- A Zhang Fei development-only `PlayerDefinition` and animation metadata.
- Minimum comparison selection/entrance wiring isolated from formal Title flow.
- Focused prototype and regression tests.
- One M10.5 comparison report with raw trials, medians, and decision.
- `GAME_ROADMAP.md`, `SPRINT.md`, `CHECKLIST.md`, `TECH_DEBT.md`, and
  `NEXT_TASK.md` at closeout.

### Risks

- Weapon reach makes Zhang Fei unconditionally safer rather than more committed.
- Longer animation frames do not map cleanly to the frozen timing hypothesis.
- Development comparison wiring leaks into production selection or packaging.
- Balance is explained only by damage/HP instead of spacing and commitment.
- Guan Yu or shared combat lifecycle regresses while adding the second
  definition.

Do not implement formal character selection, Stage integration, Zhao Yun,
second Stage content, new enemies/Boss, skills, progression, new input, or
Audio in this task.
