# Next Task

## M1 / Task 1.4 — Readonly Gameplay Events and Snapshot

### Why this is next

Input and lifecycle timing now have explicit boundaries. The next P0 foundation is a readonly gameplay event/snapshot contract so Debug, future UI, and future Audio can observe gameplay without coupling to actor internals.

### Completion criteria

- Define minimal readonly event and snapshot types for player, enemy, combat, and lifecycle observations.
- MainScene publishes snapshots/events without exposing mutable actor objects.
- Existing gameplay behavior remains unchanged.
- No HUD, audio, React state, or new gameplay feature is added.
- Add contract tests proving payloads are readonly-by-convention and actor internals are not leaked.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Browser smoke: load the combat room, verify one Canvas and zero console errors.
- Confirm existing keyboard/touch input and hit-stop behavior still work.

### Expected files

- `app/game/events/` or the smallest existing contract module
- `app/game/MainScene.ts`
- `tests/**`
- `ARCHITECTURE.md`
- `SPRINT.md`
- `GAME_ROADMAP.md`
- `TECH_DEBT.md`
- `CHECKLIST.md`
- `README.md`

### Risks

- A broad event bus could recreate global coupling; keep the contract minimal and typed.
- Snapshot frequency may create unnecessary allocations if not bounded.
- Existing debug text must remain a consumer, not an owner, of gameplay state.
