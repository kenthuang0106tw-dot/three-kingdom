# NEXT TASK

## M10 / Task 10.5 — Zhang Fei Combat Prototype Acceptance Completion

### Why this task

The development-only Zhang Fei player definition, real animations, fixed
Entry/Ambush/Boss entrances, focused tests, and production isolation now
exist. Task 10.5 is not complete because its paired tactical evidence and
mobile comparison have not been recorded. Advancing to formal selection would
turn an unproven balance hypothesis into production behavior.

### Completion conditions

- Run five Guan Yu and five Zhang Fei trials in each fixed Entry, Ambush, and
  Boss context.
- Use the same first-three-run input strategy and the documented
  archetype-aware last-two-run strategy.
- Record all raw metrics required by
  `docs/planning/m10-zhang-fei-production-contract.md`, then calculate medians.
- Complete interactive Desktop, 844×390, and 390×844 comparison smoke.
- Make one explicit Accept / Adjust / Reject decision without inventing data.
- If adjusted, change only Zhang Fei definition values permitted by the
  contract and rerun the complete comparison.
- Pass focused/full tests, typecheck, lint, both builds, production packaging,
  reset, Pause, Hit Stop, and one-Canvas checks.

### Validation

- Neither general may have both lower median damage and lower median clear time
  in all three contexts.
- Zhang Fei must create useful reach/displacement decisions while retaining
  readable punishable recovery and no permanent safety.
- Guan Yu values and Enemy/Boss/Stage/Camera/UI/Audio/input behavior remain
  exact.
- Guan Yu's frozen presentation and gameplay values remain exact.
- Production still excludes Zhang Fei v2 until the decision is accepted.

### Expected files

- `docs/combat/m10-5-zhang-fei-combat-prototype.md`
- Minimum Zhang Fei definition/test adjustment only if the evidence requires it
- `GAME_ROADMAP.md`, `SPRINT.md`, `CHECKLIST.md`, `TECH_DEBT.md`, `NEXT_TASK.md`

### Risks

- The longer丈八蛇矛 reach may create unconditional safety.
- The 800ms finisher may be either dominant or too punishable.
- Automated checks cannot substitute for the required tactical decisions.
- Formal selection must not start from incomplete evidence.

Do not implement Task 10.6, formal Title selection, Zhao Yun, new Stage content,
Enemy/Boss tuning, new input, skills, progression, or Audio.

Do not implement formal character selection, Stage integration, or production
asset registration until Task 10.5 is accepted.
