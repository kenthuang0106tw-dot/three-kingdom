# NEXT TASK

## M10 / Task 10.5P — Zhang Fei Formation Breaker Combat Prototype

### Why this task

Task 10.5R replaced the rejected global-Recovery hypothesis with one role that
is supported by the existing Ambush evidence: Zhang Fei uses the丈八蛇矛 to
break clustered formations, then chooses between repositioning after Attack 2
and finishing an isolated target with Attack 3. Formal character selection
cannot begin until this decision is demonstrated rather than merely specified.

### Completion conditions

- Implement only the starting values frozen in
  `docs/planning/m10-5r-zhang-fei-tactical-hypothesis.md`: Attack 2 knockback
  56px and Attack 3 phase 225/150/425ms; retain damage 2 and every other frozen
  Zhang Fei/Guan Yu value.
- Extend development-only telemetry with grouped Attack 2 confirms,
  reposition-after-Attack-2, and isolated/unsafe Attack 3 starts using one
  radius and timing boundary fixed before running trials.
- Preserve the identical baseline controller for paired runs 1–3 and add only
  the contracted formation-breaker decisions to the identical aware controller
  used for paired runs 4–5.
- Complete five Guan Yu and five Zhang Fei runs in each unchanged Entry,
  Ambush, and Boss context; record all raw metrics and medians.
- Apply at most one permitted definition-only adjustment, repeat all 30 runs if
  used, and publish the before/after evidence.
- Produce an explicit Accept or Reject result against every hard gate. Task
  10.6 remains blocked unless the result is Accept.
- Keep production assets, formal Title selection, released Stage behavior,
  Enemy/Boss values, Combo Window, input, art, Audio, UI, and Camera unchanged.

### Validation

- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `pnpm build:github-pages`
- Desktop development smoke for Entry, Ambush, and Boss telemetry.
- 844×390 and 390×844 development interaction smoke.
- Production smoke proving prototype queries are ignored, one 1280×720 Canvas
  remains, no debug dataset is exposed, and no runtime error occurs.
- Confirm the production packaged inventory remains 52 files and contains no
  Zhang Fei v2 asset.

### Expected files

- `app/game/player/ZhangFeiAnimationMetadata.ts`
- `app/game/MainScene.ts`
- focused Zhang Fei prototype tests
- `docs/combat/m10-5p-zhang-fei-formation-breaker.md`
- `GAME_ROADMAP.md`
- `SPRINT.md`
- `CHECKLIST.md`
- `TECH_DEBT.md`
- `NEXT_TASK.md`

### Risks

- Extra knockback creates safety without a real stop/reposition decision.
- The aware controller manufactures the desired metric by writing gameplay
  state instead of using normal inputs.
- Thresholds are changed after observing results.
- Attack 2 stopping becomes the only correct answer.
- Zhang Fei dominates clustered and single-target contexts simultaneously.
- A failed hypothesis is advanced to formal selection because it looks heavy.

Do not implement Task 10.6, formal Title selection, Zhao Yun, new Stage content,
Enemy/Boss tuning, Combo Window changes, new input, skills, progression, Audio,
UI, Camera, or new art in this task.
