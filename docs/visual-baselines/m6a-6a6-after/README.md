# M6A Visual Acceptance and Asset Freeze

Task 6A.6 accepted the M6A runtime visual set on 2026-07-23. The audit
compares the candidate runtime against baseline revision `3183f1f`. The
candidate started from runtime revision `381dbf5`; the freeze evidence and
diagnostic instrumentation are committed by this task.

## Capture matrix

All five checkpoints were captured at three fitted viewports:

| Viewport | Canvas display size | Checkpoints |
| --- | ---: | --- |
| Desktop | 1067 × 600 | Title, Combat, Boss, Failure, Result |
| Landscape 844 × 390 | 693 × 390 | Title, Combat, Boss, Failure, Result |
| Portrait 390 × 844 | 325 × 183 | Title, Combat, Boss, Failure, Result |

The 15 matching pairs have identical dimensions. Individual comparisons are in
`comparisons/`; `comparison-contact-sheet.png` provides the complete review
surface. Deterministic development routes were used only to reach repeatable
checkpoints:

- Combat: `?encounterSmoke=1`
- Boss: `?bossCombatSmoke=1`
- Failure: `?failureSmoke=1`
- Result: `?bossClearedSmoke=1`

Failure/retry and Result/replay were also exercised with keyboard input. Each
returned to the expected flow with one Canvas and no runtime error.

## Manual review

All 15 comparisons passed the objective M6A review:

- no character or weapon clipping and no neighboring-frame contamination;
- stable character feet anchors and 2.5D depth placement;
- no visible three-screen Stage seam;
- readable combat effects without obscuring character silhouettes;
- title, HUD, pause/failure/result panels remain inside safe areas;
- the 360-degree touch stick and attack/pause targets remain usable at both
  mobile fits.

The visual differences from the baseline are the intended M6A character,
stage, effects, and product-UI upgrades. No art was regenerated during 6A.6.

## Runtime and asset budget

- Runtime manifest: 23 logical entries
- Requested runtime asset files: 31
- PNG textures in manifest requests: 23
- Encoded runtime asset bytes: 11,421,285 bytes (10.89 MiB)
- Estimated decoded RGBA bytes: 136,629,760 bytes (130.30 MiB)
- Phaser runtime texture count after load: 24
- Canvas count: 1
- Performance sample: 60 warm-up frames + 300 measured frames
- Average: 60.00 FPS
- 1% low: 59.92 FPS
- Runtime errors: 0
- Production diagnostic leakage: none

Exact hashes, dimensions, provenance checks, and per-file sizes are recorded in
`visual-freeze-audit.json`.

## Finite defect list

No M6A visual blocker remains. Two measured optimization concerns are deferred
to the planned performance milestone:

- Phaser remains a large JavaScript chunk in production builds.
- Estimated decoded texture memory is about 130.30 MiB before browser-specific
  compression or disposal behavior.

These measurements do not fail the current 60 FPS acceptance baseline and are
not authorization to redesign or rebalance the frozen M6A content.

## Freeze rule

The accepted M6A asset set is frozen. Later milestones may only reopen it for a
reproducible clipping, contamination, missing-file, alignment, readability, or
runtime defect. Audio and later gameplay work must not silently regenerate,
replace, or rebalance these assets.
