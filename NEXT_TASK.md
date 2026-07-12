# Next Task

## M1 / Task 1.7 — Responsive Mobile Landscape Contract

### Why this is next

The input, lifecycle, event, and deterministic-time boundaries are now explicit. The next P0 task validates the actual mobile landscape viewport, safe-area behavior, and touch canvas scaling so the game can be tested on a phone instead of only in a desktop browser harness.

### Completion criteria

- Define the mobile landscape viewport and safe-area contract for the 1280×720 Phaser canvas.
- Canvas preserves aspect ratio without stretching or CSS animation.
- Touch controls remain inside the playable canvas and have usable hit areas.
- Orientation/resize and focus changes do not create duplicate Phaser instances or stuck input.
- Add a documented LAN or hosted smoke path for a physical phone.
- Do not add new gameplay, enemies, UI systems, or deployment platform configuration.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Browser viewport smoke at a mobile landscape size with one Canvas and zero console errors.
- Physical phone smoke over a reachable URL: touch movement, attack, orientation/resize, and focus recovery.

### Expected files

- `app/globals.css`
- `app/game/PhaserGame.tsx`
- `app/game/input/TouchInputController.ts`
- `tests/**`
- `ARCHITECTURE.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `TECH_DEBT.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- Mobile browser viewport units and safe areas differ across iOS Safari and Android Chrome.
- CSS scaling can introduce pixel shimmer or move Phaser pointer coordinates.
- Physical-device validation needs a LAN or hosted URL; localhost alone is insufficient.
