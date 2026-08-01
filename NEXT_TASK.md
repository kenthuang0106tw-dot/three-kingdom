# NEXT TASK

## M10 / Task 10.5F — Zhang Fei Second-Player Feasibility Closeout

### Why this task

Three complete, bounded Zhang Fei gameplay hypotheses have now been rejected:
the original heavy commitment prototype, the formation-breaker timing/impact
prototype, and the Attack 2 lane-coverage prototype. All produced useful local
behavior but failed their frozen cross-context distinction gates. Formal
character selection cannot proceed, and a fourth parameter or geometry rescue
would be sunk-cost development without a new product decision.

The highest-value next step is therefore one planning closeout that decides
whether to defer Zhang Fei and close M10, revise the approved player identity /
art / gameplay contract with explicit product-owner authority, or stop the
second-player milestone. It must not implement the decision.

### Completion conditions

- Revalidate the committed Task 10.5HP rollback state and its report.
- Compare the complete evidence from Tasks 10.5, 10.5P, and 10.5HP without
  weakening or replacing any historical acceptance threshold.
- Identify which proposed distinctions were observed locally and which failed
  to survive Entry, Ambush, and Boss comparison.
- Evaluate exactly three outcomes: defer Zhang Fei to a later milestone,
  request an explicitly authorized revision of the production/identity
  contract, or close M10 without a second playable character.
- Select exactly one outcome with explicit reasons, product impact, preserved
  work, discarded assumptions, and the authority required before coding may
  resume.
- Mark Task 10.6 either blocked or removed from the active sequence. It may not
  become the next task unless the selected outcome explicitly supplies an
  accepted gameplay direction.
- Update Roadmap, Sprint, Checklist, Technical Debt, NEXT_TASK, and one concise
  feasibility decision record.
- Make no runtime, test gameplay, art, asset, build configuration, Stage,
  Enemy, Boss, Camera, input, Audio, UI, or React change.

### Validation

- focused documentation contract test
- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `pnpm build:github-pages`
- verify the committed production manifest and runtime remain unchanged

### Expected files

- `docs/planning/m10-5f-zhang-fei-feasibility-closeout.md`
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `CHECKLIST.md`
- `TECH_DEBT.md`
- `NEXT_TASK.md`
- one focused planning contract test

### Risks

- Continuing because assets already exist rather than because gameplay passed.
- Rewording failed thresholds to manufacture acceptance.
- Treating a planning decision as permission to implement new art or mechanics.
- Leaving Task 10.6 nominally next while its gameplay dependency is unresolved.
- Discarding reusable atlas, preview, telemetry, and Player-boundary work when
  only the tactical hypothesis failed.

Do not implement character selection, another Zhang Fei prototype, timing or
hitbox tuning, Zhao Yun, new art, or any gameplay feature in this task.
