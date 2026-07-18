# Next Task

## M6A / Task 6A.3 — Enemy and Boss visual consistency

### Why this is next

M6A.2 established the accepted player-facing visual contract: one original
identity, one display scale, one feet anchor, explicit atlas metadata, genuine
frames, and reproducible QA artifacts. The three current enemy archetypes and
Boss are now the largest visible mismatch. They must be brought to the same
proportion, palette, facing, pixel-density, and alignment standard before Stage
art, effects, or product UI can be judged against the cast.

### Completion criteria

- Audit every current Soldier, Mauler, Duelist, and Boss frame; record source
  bounds, facing, feet anchor, usable poses, and rejected/contaminated poses.
- Preserve the four existing identities and gameplay roles; do not create a new
  enemy type, move, phase, AI behavior, damage value, or encounter.
- Give each actor one internally consistent display scale and common feet-world
  contract across idle, walk, attack, hurt, phase (Boss), and dead animations.
- Correct Ninja/Duelist locomotion facing, Mauler attack-facing readability,
  Boss walk readability, and any frame-specific size or feet drift through
  source/atlas metadata—not runtime transform tricks.
- Preserve active-frame indexes, attack timing, body geometry, hitboxes,
  movement speed, attack-slot policy, encounter flow, Boss decisions, and camera.
- Commit source, processed runtime sheets, atlas/metadata, provenance, red-box,
  feet-line, onion-skin, and silhouette QA assets plus reproducible tooling.
- Do not modify Guan Yu, Stage, Effects, UI, Audio, balance, or add content.

### Validation

- Native-size and 25% silhouette review confirms readable archetype silhouettes,
  accepted Guan Yu-relative height ratios, shared light direction, and palette.
- Frame/onion review confirms no crop, neighbor contamination, duplicate pose,
  feet drift, reversed movement, or false transform frame.
- Automated metadata tests cover names/counts, alpha bounds, feet anchors,
  per-actor scale, facing, atlas/image dimensions, and provenance.
- Runtime browser acceptance covers all four actors in idle, walk, attack, hurt,
  and dead/phase states at desktop, 844×390 landscape, and 390×844 portrait FIT,
  with one Canvas and no console error.
- Existing player, combat, attack-slot, encounter, Boss, failure, result, and
  M6A.2 contracts remain green.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and
  `pnpm build:github-pages`.

### Expected files

- Existing `public/art/enemy/` and `public/art/boss/` source/runtime assets,
  atlases, metadata, provenance, and QA sheets
- Focused reproducible enemy/Boss art build tools
- Minimal enemy/Boss actor, animation metadata, and asset-manifest integration
- Focused tests plus `ASSET_PIPELINE.md`, `CHECKLIST.md`, `SPRINT.md`,
  `GAME_ROADMAP.md`, `TECH_DEBT.md`, and `NEXT_TASK.md`

### Risks

- Batch generation may drift costume, anatomy, facing, weapon, or palette
  between states; reject inconsistent sets instead of repairing with transforms.
- Replacing frames can silently move active timing or hitboxes; keep phase/frame
  contracts under automated tests before and after integration.
- Actor proportion fixes can tempt body/AI retuning; gameplay geometry and
  balance remain frozen unless a visual alignment defect is proven.
- Scope can expand into Stage, effects, UI, Audio, or new content; all remain
  explicitly deferred to later M6A tasks.
