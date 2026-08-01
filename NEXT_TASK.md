# NEXT TASK

## M10 / Task 10.5D — Zhang Fei Second-Player Direction Decision

### Why this task

Two complete Zhang Fei hypotheses have now been rejected. The first did not
produce distinct Recovery risk in two contexts; the second produced valid
stop/reposition/isolated-finisher behavior but only a 1.10× multi-target ratio
and about +0.06 displacement advantage. A third numeric prototype would repeat
the same mistake. Technical direction must be decided before more production
work or formal selection.

### Completion conditions

- Compare the complete Task 10.5 and 10.5P evidence without rewriting either
  acceptance threshold.
- Select exactly one direction: revise the Player/art contract with a genuinely
  different mechanic and explicit cost; defer Zhang Fei and close M10; or stop
  the second-character milestone pending product-owner direction.
- State why the other two directions are rejected.
- If revision is selected, define only a new planning task and its discovery
  questions; do not implement a mechanic, tune values, or modify art.
- Keep Task 10.6 blocked and update Roadmap, Sprint, Checklist, Technical Debt,
  and NEXT_TASK consistently.
- Add focused contract coverage proving the decision task is planning-only.

### Validation

- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- Confirm no runtime, gameplay, art, asset, Stage, Enemy, Boss, Camera, input,
  Audio, UI, or production file changes.

### Expected files

- focused M10 decision document
- focused planning-contract test
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `CHECKLIST.md`
- `TECH_DEBT.md`
- `NEXT_TASK.md`

### Risks

- Sunk-cost bias advances a rejected character.
- A third timing/damage/knockback pass is mislabeled as a new role.
- A new mechanic is implemented before its ownership and player decision are
  accepted.
- M10 is deferred without recording how it can be resumed.

Do not implement Task 10.6, formal Title selection, a third combat prototype,
new mechanics, Zhao Yun, Stage content, Enemy/Boss tuning, input, Audio, UI,
Camera, or art in this task.
