# Next Task

## M8 / Task 8.2A — Human Combo-Commitment Decision Ledger

### Why this is next

The code-level experiment is verified, but its game-feel claim is not. The
third strike now has distinct damage, knockback, hit stop, and recovery; only
a human-controlled sample can establish whether players sometimes stop after
attack2 and whether attack3 recovery is meaningfully punishable.

### Completion criteria

- Record ten second-hit decisions in each required scenario: Soldier, Mauler +
  Duelist, and close-range Boss.
- For every decision record whether attack3 was used, whether it finished an
  enemy, whether the player was hit during its recovery, or whether the player
  deliberately stopped after attack2.
- Compare the totals to the acceptance and rejection criteria in
  `docs/combat/m8-2a-combo-commitment.md`.
- Record one conclusion only: accept the current values, adjust only attack3
  parameters, or reject and restore its baseline values.

### Acceptance method

- Run the production build on desktop or mobile and play the three scenarios.
- Keep the code and configuration unchanged while collecting the samples.
- Verify that all three scenarios contain at least one deliberate stop after
  attack2 and that attack3 is neither the universal best option nor ignored.
- Add the completed counts and reviewer decision to the task report.

### Expected files

- `docs/combat/m8-2a-combo-commitment.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `TECH_DEBT.md` only if the result exposes a concrete follow-up risk

### Risks

- Automated browser checks cannot infer player intent; fabricated tactical
  counts would invalidate the experiment.
- A result based on fewer than ten decisions per scenario is inconclusive.
- Any proposed fix beyond attack3 damage, knockback, hit stop, or recovery is
  out of scope and must become a separate task.
