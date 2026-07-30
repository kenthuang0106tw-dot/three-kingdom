# M10 / Task 10.4 — Zhang Fei Atlas and Animation Preview

Status: **Accepted for development preview**

## Output

- 47 distinct right-facing poses: idle 6, walk 8, attack1 6, attack2 7,
  attack3 10, hurt 4, dead 6.
- Attack phases: `2/2/2`, `3/2/2`, and `4/3/3`
  startup/active/recovery.
- Atlas: 4032×3584, 6×8 cells of 672×448.
- Shared feet `(336,420)`, origin `(0.5,0.9375)`, display scale `0.64`.
- Weapon identity is fixed as the Zhangba serpent spear (丈八蛇矛): long dark
  shaft and a sinuous, symmetric double-edged spearhead, not a guandao.

## Generation and provenance

The source sheets were created with OpenAI built-in ImageGen in project-bound
chroma-key mode. Prompts requested a Japanese 1990s arcade-realistic heavy
warrior, thick dark beard, oxblood cloth, charcoal lamellar armor, aged bronze
fittings, stable grounded feet, and complete Zhangba serpent-spear motion.
Green backgrounds were removed with the bundled `remove_chroma_key.py` using
border auto-key, soft matte, transparent threshold 12, opaque threshold 220,
and despill. Exact prompts, source SHA-256 values, source rectangles, offsets,
and generated pixel hashes are stored in `zhangfei-v2.metadata.json`.

`tools/build_zhangfei_v2_art.py` treats each animation row independently because
the generated sheets are not uniformly partitioned. It measures alpha bounds,
uses one global source scale, aligns every frame to the common feet line, and
fails if a frame violates the eight-pixel cell margin.

## QA artifacts

- `zhangfei-v2-debug.png`: red measured bounds, cyan feet line, frame and phase.
- `zhangfei-v2-onion.png`: every state overlaid in frame order for 2 FPS review.
- `zhangfei-v2-lineup.png`: Guan Yu / Zhang Fei / Boss native display lineup.
- `zhangfei-v2-silhouette-25.png`: 25% atlas readability.
- `zhangfei-v2-identity.png`: neutral, walk, attack, and hurt identity samples.
- `zhangfei-v2-palette.json`: 24 dominant opaque colors.

## Preview

Development URL: `?previewZhangFei=1`

- `A` / `D`: previous / next state
- `Left` / `Right`: previous / next frame
- `Space`: play / pause
- `Up` / `Down`: 2 / 4 / 6 / 8 / 10 FPS
- `L`: once / loop
- `O`: onion skin

The overlay displays state, frame, phase, source rectangle, alpha bounds,
origin, offset, display scale, feet anchor, and pixel hash. Desktop browser
smoke confirmed one Canvas, fixed feet `420`, readable controls, no overflow,
and no captured runtime error. Existing responsive FIT contract tests cover
844×390 and 390×844 without changing intrinsic Canvas geometry.

## Scope result

The atlas is not registered in `RUNTIME_ASSET_MANIFEST`, not packaged into
production outputs, not selectable from Title, and not instantiated in the
Stage. Guan Yu gameplay and every Enemy/Boss/Stage/Camera/UI/Audio contract are
unchanged. Validation passed 159/159 tests, typecheck, lint with zero
errors/eight existing warnings, `pnpm build`, and
`pnpm build:github-pages`. Both packaged outputs retain the existing 52-file
runtime inventory. Task 10.5 is the only eligible next task.
