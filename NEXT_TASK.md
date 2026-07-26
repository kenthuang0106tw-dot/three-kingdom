# NEXT_TASK

## GX.1 — Duelist Leap Mobility Prototype

### Why this is next

ER.3R and ER.4 complete the accepted formal melee presentation sequence. The
user explicitly wants selected agile enemies, especially the Duelist, to jump.
GX.1 is the smallest isolated gameplay prototype that tests this identity
without adding Player jumping, a generic aerial framework, or another enemy.

### Completion conditions

- Add Duelist-only takeoff, airborne, descent, and landing/recovery states.
- Use genuine new animation poses; never move an idle or walk frame vertically
  to fake a jump.
- Keep the 2.5D ground/feet position separate from visual elevation and show a
  readable ground shadow/landing lane.
- Lock the destination before airborne travel; no homing after commitment.
- Preserve the approved hood/cowl, shadowed face, long twin hooks, one actor
  scale, common feet anchor, existing HP/damage, and single Attack Slot.
- Keep the leap vertically avoidable and prevent overlap with another primary
  attack.
- Do not modify Shield Guard, Crossbow, Boss, Player moves, Stage content,
  Combo, UI, Audio, or unrelated AI.

### Validation

- Neutral and airborne art gates against the approved Duelist reference.
- Frame metadata, debug sheet, onion skin, feet/ground/elevation checks, and
  distinct pose hashes.
- Focused tests for destination lock, Attack Slot ownership, Hurt/Dead/reset
  cleanup, no homing, and no transform-faked animation.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`, with TD-M11 reported honestly if wrappers stop
  before project scripts.
- Desktop, 844×390, and 390×844 Duelist leap readability smoke tests.

### Expected files

- Duelist leap source/runtime art and metadata.
- Duelist-only state/animation integration and focused tests.
- GX.1 review evidence and minimum corresponding project-document updates.

### Risks

- Turning a bounded Duelist prototype into a generic aerial system.
- Faking elevation by changing the actor's feet/world Y instead of separating
  visual elevation from ground ownership.
- Homing during takeoff/airborne travel, making vertical evasion unreliable.
- Losing the approved hood and long twin-hook silhouette in airborne poses.
- Breaking Attack Slot, Hurt, Dead, Pause, or Scene-reset cleanup.
