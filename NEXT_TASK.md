# Next Task

## M8 / Task 8.2B — Mixed Encounter Decision Prototype

### Why this is next

Attack3 is now an accepted high-commitment finisher. The next bounded step is
to make the existing Mauler + Duelist encounter create readable decisions about
vertical evasion, stopping at attack2, and target switching.

### Completion criteria

- Keep one Attack Slot holder at a time and retain all existing Player,
  Combo, damage, HP, art, and Boss contracts.
- Make the Mauler lock direction and attack line at startup, creating a
  vertically dodgeable attack and a readable recovery window.
- Let the Duelist reposition or threaten commitment without producing an
  overlapping unavoidable main attack.
- Compare five no-adjustment runs and five deliberate-play runs in encounter 2.

### Validation

- Add focused tests for attack-slot ownership, startup direction/Y locking,
  vertical line evasion, release on hurt/dead/complete, and Scene reset.
- Run tests, typecheck, lint, both production builds, and desktop / 844x390 /
  390x844 encounter-2 smoke checks.

### Expected files

- Existing Enemy configuration and manager files only where evidence requires
  a timing, line-lock, or formation adjustment
- Focused encounter decision tests and before/after report
- `SPRINT.md`, `GAME_ROADMAP.md`, `TECH_DEBT.md`, and `NEXT_TASK.md`

### Risks

- Raising damage, HP, or adding a second simultaneous attacker is out of scope.
- A permanent retreat strategy or unreadable overlapping attack windows rejects
  the prototype.
