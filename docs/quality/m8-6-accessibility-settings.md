# M8 / Task 8.6 — Flash/Shake Accessibility Settings

Date: 2026-07-30

## Outcome

Accepted. The existing Phaser Pause overlay now exposes two independent
presentation settings without introducing a general settings framework:

| Presentation | Default | Reduced | Timing |
| --- | ---: | ---: | ---: |
| Hit flash tint | `0xffffff` | `0x9fb3a0` | 90ms unchanged |
| Camera shake intensity | `0.003` | `0.0008` | 50ms unchanged |

Damage, Hit Stop, spark, knockback, animation, attack metadata, Camera
follow/lock/handoff, AI, Stage, Audio, and React ownership are unchanged.

## Ownership

- `MainScene` owns one `AccessibilitySettings` instance.
- `PauseController` owns keyboard `F` / `K` and two touch targets.
- `EffectDirector` consumes a readonly settings snapshot only when presenting
  flash or shake.
- Pause/resume and Scene restart do not reset the settings object during the
  current page session.
- No local storage, backend, React state, DOM gameplay control, or global
  mutable variable was added.

## Validation

- Focused default, independent toggle, ownership, cleanup, and effect-boundary
  tests passed.
- `pnpm test`: 143/143 passed.
- `pnpm typecheck`: passed.
- `pnpm lint`: 0 errors, 8 existing `<img>` warnings.
- `pnpm build`: passed; 52 production public files preserved.
- `pnpm build:github-pages`: passed; 52 production public files preserved.
- Development Desktop: keyboard and touch toggles changed both settings;
  Pause/resume retained them.
- Development 844×390 and 390×844: fitted Canvas had no document overflow;
  Pause settings remained visible and portrait touch toggling succeeded.
- Production Desktop: one Canvas, no development dataset, settings UI present,
  both reduced labels visible, and zero captured browser errors.

## Decision

Accept M8.6. Proceed next to M8 / Task 8.2C so all five completed enemy roles
enter the formal Stage before M8.7 full QA.
