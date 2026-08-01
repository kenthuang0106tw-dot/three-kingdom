# M10.6T Zhang Fei Trial Character Select

Date: 2026-08-01

## Decision boundary

The product owner explicitly requested that the preserved Zhang Fei prototype
be added for direct play review. This task exposes it as `TRIAL BALANCE`; it
does not reinterpret or accept the rejected M10.5 tactical evidence.

## Delivered

- Phaser Title selection for Guan Yu and Zhang Fei.
- Keyboard: Left/Right or A/D, then Enter/Space/J.
- Touch: one tap on either large fighter card.
- Generic `PlayerDefinition` resolution with no React selection state.
- Lazy production packaging of Zhang Fei's approved 47-frame PNG and atlas.
- Selection persistence across Scene retry and replay restarts.

## Browser evidence

| Viewport | Selection | Stage start | Canvas | Overflow |
|---|---|---|---:|---|
| Desktop 1280×720 | Guan Yu and Zhang Fei | Pass | 1 | None |
| Landscape 844×390 | Zhang Fei touch card | Pass | 1 | None |
| Portrait 390×844 | Zhang Fei touch card | Pass | 1 | None |

Desktop Stage smoke verified both fighters and Attack 1. Development retry and
Result replay smoke retained `activePlayerDefinition=zhangfei` and one Canvas.

## Known product debt

Zhang Fei's art and runtime implementation are available for review, but his
tactical distinction and final balance remain unaccepted. Task 10.6R must
record keep, revise, or remove before additional implementation.
