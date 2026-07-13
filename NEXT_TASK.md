# Next Task

## M5 / Task 5.2 — Boss attack 1–3

### Why this is next

Boss HP, state, cleanup, and reset ownership are now explicit and independent
from normal enemies. The next task must provide three readable attacks with real
startup, active, recovery, and telegraph frames before any Boss AI is written.

### Completion criteria

- Inspect available Boss references/assets before implementation; do not assume
  frames can be evenly sliced.
- Add original runtime-ready Boss art and metadata for three distinct attacks,
  each with startup, active, recovery, and readable telegraph frames.
- Define Phaser-free attack metadata and deterministic frame-order/timing tests.
- Keep Boss attacks unspawned and AI-free; do not add decision rhythm, phase,
  arena, HUD, audio, stage completion, or normal-enemy changes.
- If adequate real frames cannot be produced, stop and document the missing art
  rather than faking attacks with transforms.

### Validation

- Run `pnpm test`, `pnpm build`, `pnpm lint`, and `pnpm typecheck`.
- Validate atlas rectangles, feet anchors, frame order, and asset routes.
- Browser smoke verifies the existing room remains unchanged with one 1280×720
  Canvas and zero page errors.

### Expected files

- `public/art/boss/**`
- `app/game/boss/**`
- `app/game/assets/AssetManifest.ts`
- `tools/**` only for a reproducible Boss asset pipeline
- `tests/**`
- `ASSET_PIPELINE.md`, `ARCHITECTURE.md`, `SPRINT.md`, `GAME_ROADMAP.md`,
  `CHECKLIST.md`, `TECH_DEBT.md`, `README.md`

### Risks

- Three attacks require enough real intermediate poses to avoid unreadable or
  fake animation. Asset quality and feet-anchor consistency are the gate; do not
  compensate with rotate, scale, translate, or interpolation.
