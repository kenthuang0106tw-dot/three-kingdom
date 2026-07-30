# NEXT_TASK

## M10 / Task 10.2 — Player Definition Boundary and Guan Yu Freeze

### Why this is next

The accepted runtime directly names Guan Yu across `MainScene`, `PlayerActor`,
`PlayerAttackController`, animation metadata, asset loading, and tests. Adding
Zhang Fei on top of those hard-coded paths would duplicate state/combat logic
or scatter identity conditionals. One second real consumer now justifies a
small definition seam before any Zhang Fei art or gameplay is integrated.

### Completion conditions

- Record Guan Yu's current texture, animation keys/frames, feet/origin/scale,
  body, movement, lifecycle, attack timing, damage, knockback, and Hit Stop as
  focused regression expectations.
- Add one typed `PlayerDefinition` shape containing only differences required
  by the two known players.
- Express Guan Yu as one immutable definition.
- Make `PlayerActor`, `PlayerAttackController`, animation registration, and
  Scene player construction consume that definition.
- Keep Guan Yu as the only registered and instantiated runtime player.
- Preserve all Guan Yu pixels, animation frame order, timing, movement, HP,
  combo, hitbox, damage, effects, Audio events, and full Stage behavior.
- Do not add Zhang Fei assets, animation keys, selection UI, prototype tuning,
  or runtime branches.
- Do not change Enemy, Boss, Stage, Camera, flow, input, Audio, React, or UI.

### Acceptance and validation

- Focused tests prove every accepted Guan Yu gameplay and presentation value is
  unchanged through the definition.
- No production source outside the minimum Player/MainScene composition path
  changes.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages` pass.
- Desktop, 844×390, and 390×844 retain one 1280×720 Canvas, Guan Yu movement,
  all three attacks, Pause, and no captured runtime error.
- Production runtime inventory and GitHub Pages routes remain valid.

### Expected files

- `app/game/player/PlayerDefinition.ts`
- `app/game/player/GuanYuAnimationMetadata.ts`
- `app/game/player/PlayerActor.ts`
- `app/game/player/PlayerAttackController.ts`
- `app/game/MainScene.ts`
- Focused contract tests and closeout documents.

### Risks

- Moving values changes Guan Yu timing or feet alignment.
- The definition grows into a speculative skill/equipment framework.
- Global Phaser animation registration accidentally duplicates keys.
- Zhang Fei scope leaks into a behavior-preserving foundation task.
