# NEXT TASK

## M10 / Task 10.5R — Zhang Fei Tactical Hypothesis Revision

### Why this task

Task 10.5 completed all 30 paired runs and was rejected. Zhang Fei remained
readable, useful, mobile-safe, and non-dominant after definition-only changes,
but his Recovery was punished more than Guan Yu's in only Ambush, not the two
required contexts. Increasing recovery again would be numeric tuning without a
new tactical explanation and risks making waiting the primary play. Formal
character selection must remain blocked until the role is revised.

### Completion conditions

- Review the Task 10.5 raw runs and state one revised tactical role for Zhang
  Fei that still uses the approved丈八蛇矛 identity and existing 47 frames.
- Define which existing Player Definition values or existing phase mappings
  may change; prohibit Enemy, Boss, Combo Window, Stage, Camera, input, and art
  changes.
- Replace the failed two-context Recovery criterion with measurable criteria
  that test the revised role directly without weakening non-dominance.
- Specify one fixed Entry/Ambush/Boss comparison protocol, raw metrics,
  Accept/Adjust/Reject gates, and a maximum of one prototype adjustment.
- Add contract coverage proving this task is planning-only and Task 10.6 stays
  blocked.
- Update Roadmap, Sprint, Technical Debt, Checklist, and the next-task record.

### Validation

- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `pnpm build:github-pages`
- Confirm Guan Yu, production assets, formal Title selection, and released
  Stage behavior are unchanged.
- Confirm no runtime gameplay or art file changes in this task.

### Expected files

- `docs/planning/m10-zhang-fei-production-contract.md` or one focused 10.5R
  contract document
- Focused planning-contract test
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `CHECKLIST.md`
- `TECH_DEBT.md`
- `NEXT_TASK.md`

### Risks

- Rephrasing the failed criterion without changing the tactical hypothesis.
- Using more HP, damage, or recovery as a substitute for a distinct decision.
- Tuning enemies or Boss to manufacture acceptance.
- Starting formal selection before a replacement prototype is accepted.

Do not implement the revised combat prototype, Task 10.6, formal Title
selection, Zhao Yun, new Stage content, Enemy/Boss tuning, new input, skills,
progression, Audio, or new art in this task.
