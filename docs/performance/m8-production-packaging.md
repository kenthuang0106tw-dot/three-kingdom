# M8 Production Asset Packaging

Status: accepted on 2026-07-24

## Defect

Task 8.1 measured a 125,451,173-byte GitHub Pages artifact against a 30 MiB
budget. The game requested only 12,891,503 bytes. Vite copied all 145 files
under `public/`, including source, debug, onion-skin, silhouette, overview, and
other QA material that production never requests.

## Packaging contract

- The runtime manifest contributes 43 request files.
- The React/GitHub Pages arcade shell contributes three unique side-art files.
- The final production public inventory therefore contains exactly 46 files.
- Source and QA files remain in `public/` and in Git; they are removed only from
  `dist/client` and `dist-github` after a successful build.
- `tools/package-production-assets.mjs` accepts only those two output paths,
  removes copied public files outside the inventory, and compares every
  preserved file SHA-256 with its source before completing.
- Build-generated JavaScript, CSS, fonts, HTML, and server files are not part of
  the public-file pruning boundary.

## Measurements

| Metric | Before | After | Budget | Result |
| --- | ---: | ---: | ---: | --- |
| GitHub Pages artifact | 125,451,173 | 18,172,139 | 31,457,280 | Pass |
| Runtime manifest requests | 12,891,503 | 12,891,503 | 15,728,640 | Pass |
| Complete production public inventory | Not separated | 16,668,123 | Informational | Pass |
| Estimated decoded RGBA | 136,629,760 | 136,629,760 | 146,800,640 | Pass |
| Raw production JavaScript | 1,501,450 | 1,501,450 | 2,097,152 | Pass |
| Preserved public files | 145 copied | 46 | 46 | Pass |
| Excluded copied public files | 0 | 99 | 99 | Pass |

The build step removed 107,279,034 copied bytes from each production public
output. No source file or accepted runtime asset changed.

## Validation

- Every one of the 46 files exists in both production outputs and has the same
  SHA-256 as `public/`.
- Representative source, debug, overview, and onion/QA routes are absent.
- Vinext production serves all required JSON, PNG, XML, and WAV routes with the
  correct content type.
- GitHub Pages preview loads the base-path JavaScript, all Phaser assets, and
  all four side-art image instances.
- Desktop, 844×390 landscape fit, and 390×844 portrait fit each passed Title,
  Combat, Handoff, Boss, Failure, and Result checkpoints with one Canvas,
  24 textures, one Audio manager, and one gameplay subscription.
- Ten reset, ten Failure/retry, and ten Result/replay cycles retained one Canvas
  and no stale Enemy or Boss.

Task 8.4 changes packaging only. It does not rebuild atlases, modify images or
audio, introduce pooling, or change gameplay.
