# NEXT_TASK

## M8 / Task 8.2C — Five-Enemy Stage Encounter Integration

### Why this is next

All five enemy roles now have accepted gameplay prototypes and production
presentation, but the formal three-screen Stage still uses only Soldier,
Mauler, and Duelist. Shield Guard and Crossbow remain development-only. M8.7
full QA must not begin until the final encounter content is actually playable.

### Completion conditions

- Place Soldier, Duelist, Mauler, Shield Guard, and Crossbow in the formal
  three-screen Stage; every role must appear at least once.
- Change only Stage encounter spawn/composition and the minimum necessary
  encounter cadence. Preserve existing Enemy configs, HP, damage, animation,
  AI contracts, Attack Slot, Player, Boss, art, Audio, and Camera ownership.
- Keep the existing single-primary-attacker rule and readable recovery windows.
- Shield Guard and Crossbow must create useful position/target decisions without
  overlapping into unavoidable or off-screen damage.
- Do not create a general Encounter Director, new Stage, new enemy, new attack,
  new art, or new progression system.
- Failure/Retry, Result/Replay, Boss entry, Pause, accessibility settings, and
  Scene reset must retain deterministic ownership.

### Validation

- Focused StageConfig/encounter tests for all five roles, deterministic spawn,
  Attack Slot exclusivity, cleanup, clear progression, and reset.
- Before/after encounter composition and pressure report.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.
- Complete the formal Stage on Desktop, 844×390, and 390×844 with one Canvas,
  no overflow, no asset 404, and zero runtime errors.
- Verify each role visibly enters combat, can be defeated, and cannot block
  Boss entry or terminal flow.

### Expected files

- Existing Stage encounter configuration/composition.
- Minimum necessary encounter tests and acceptance report.
- Roadmap, Sprint, Checklist, and NEXT_TASK closeout updates.

### Risks

- Five roles may create unreadable simultaneous pressure.
- Adding enemies may extend combat duration without adding decisions.
- Shield Guard or Crossbow may become a fixed first target.
- Scope may drift into AI retuning, a new director, or another Stage.
