# Next Task

## M6A / Task 6A.2 — Guan Yu animation quality upgrade

### Why this is next

M6A.1 fixed the visual target and comparison baseline. Guan Yu is the highest
priority visible gap: idle, walk, and attack currently use different display
scales; idle has one frame; the six attack poses lack enough transition and
recovery frames. The Player must establish the accepted identity, proportion,
palette, pixel density, and animation pipeline before enemies or Stage art are
matched to it.

### Completion criteria

- Audit every existing Guan Yu source/runtime frame before replacement; record
  alpha bounds, feet anchor, facing, usable poses, and rejected poses.
- Produce one consistent original Guan Yu identity for idle, walk, attack1,
  attack2, attack3, hurt, and dead using genuine consecutive frames.
- Meet the Art Bible minimum visual requirements: idle 6, walk 8, attack1 5,
  attack2 6, attack3 8, hurt 4, and dead 6 or more distinct poses.
- All animations use one display scale and a common feet-world contract; frame
  metadata owns origin/offset alignment and state changes do not jump more than
  4 logical pixels without intentional pose motion.
- Preserve current movement speed, Combo rules, damage, startup/active/recovery
  total durations, hitbox windows, body geometry, world position, camera, AI,
  Stage flow, and input behavior. Added frames subdivide existing phases only.
- Commit source, processed runtime sheets, explicit atlas, metadata, red-box and
  feet-line debug sheets, provenance record, and a reproducible build tool.
- Remove animation-specific Player scale values only as required to consume the
  accepted unified metadata; do not refactor unrelated Player/combat code.
- Do not modify enemies, Boss, Stage, Effects, UI, Audio, balance, or new moves.

### Validation

- Native-size and 25% silhouette review confirm Guan Yu identity, 230±10px idle
  height, readable action direction, and the accepted jade/antique-gold palette.
- 2 FPS frame preview and onion-skin verify no crop, neighbor contamination,
  duplicate pose, feet drift, weapon/limb teleport, or false transform frame.
- Automated metadata checks cover frame names/counts, bounds, common scale,
  feet anchor, phase tags, atlas/image dimensions, and source provenance.
- Runtime browser acceptance covers idle → walk → attack1–3 → hurt/dead at
  desktop, 844×390 landscape, and 390×844 portrait FIT with one Canvas and no
  console error.
- Existing combat, input, lifecycle, encounter, Boss, Failure, Result, and M6A
  baseline contracts remain green.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Expected files

- `public/art/guanyu/*-source.png`
- `public/art/guanyu/*-transparent.png`
- `public/art/guanyu/*.png`
- `public/art/guanyu/*.atlas.json`
- `public/art/guanyu/*.metadata.json`
- `public/art/guanyu/*-debug.png`
- One reproducible `tools/build_guanyu_*.py` pipeline
- Minimal `app/game/player/PlayerActor.ts`, animation metadata/manifest, and
  `app/game/MainScene.ts` integration changes
- Focused tests plus `ASSET_PIPELINE.md`, `CHECKLIST.md`, `SPRINT.md`,
  `GAME_ROADMAP.md`, and `NEXT_TASK.md`

### Risks

- Image generation may drift identity, anatomy, facing, costume, or palette
  between strips; reject inconsistent sets instead of patching with transforms.
- Large weapon/arm arcs can contaminate neighboring frames if atlas rectangles
  are inferred as equal cells.
- Replacing six coarse attack poses with more frames can accidentally move
  active timing or Combo windows; phase duration and hitbox contracts must be
  tested before and after.
- A unified scale can reveal current source-resolution mismatch; fix through
  source/export and metadata, not per-animation scale exceptions.
- Scope can expand into Zhang Fei, Zhao Yun, enemies, Stage, Effects, or UI;
  those remain explicitly deferred.
