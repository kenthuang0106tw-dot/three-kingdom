# M8 Performance Budget and Baseline

Status: accepted on 2026-07-24

## Measurement contract

- Revision under test: local Task 8.1 candidate based on `c3cd8f3`.
- Browser surface: controlled Chromium development runtime on Windows.
- Logical game size: 1280×720 in every run.
- Fitted Canvas sizes:
  - Desktop: 1066.67×600.
  - 844×390 landscape profile: 693.33×390.
  - 390×844 portrait profile: 325×182.81.
- Checkpoints: Title, normal combat, encounter handoff, Boss combat,
  Failure, and Result.
- Each cell uses 60 warm-up frames followed by 300 measured Phaser loop
  deltas.
- Every checkpoint was run twice. Average-FPS stability tolerance is 5%.
- `?performanceProfile=1` enables readonly development datasets.
  `performanceCheckpoint` selects the state gate and `performanceViewport`
  selects the fitted shell size.

The landscape and portrait runs reproduce the accepted fitted Canvas sizes on
the same desktop browser. They validate responsive presentation and relative
render cost; they are not measurements of physical mobile CPU/GPU performance.
The browser exposed Chromium `performance.memory`; physical iOS Safari and
Android memory values were not available and are not inferred.

## Budgets

| Metric | Desktop budget | Fitted mobile budget |
| --- | ---: | ---: |
| Average FPS | ≥53 | ≥55 |
| 1% low FPS | ≥45 | ≥48 |
| Worst sampled frame | ≤22ms | ≤21ms |
| Two-run average variance | ≤5% | ≤5% |
| Runtime textures | ≤28 | ≤28 |
| JS heap used, when exposed | ≤64 MiB | ≤64 MiB |

Shared delivery budgets:

| Metric | Budget |
| --- | ---: |
| Requested runtime asset bytes | ≤15 MiB |
| Estimated decoded RGBA textures | ≤140 MiB |
| GitHub Pages artifact | ≤30 MiB |
| Raw production JavaScript | ≤2 MiB |

These are Vertical Slice budgets, not general promises for future content.
Unsupported metrics must be recorded as unavailable. A failed budget selects a
later optimization task; Task 8.1 does not optimize.

## Runtime measurements

Each FPS cell is `run 1 / run 2`. The 1% low is the lower run; worst frame is
the higher run.

### Desktop

| Checkpoint | Average FPS | Min 1% low | Max worst ms |
| --- | ---: | ---: | ---: |
| Title | 53.99 / 56.60 | 46.69 | 21.44 |
| Combat | 55.35 / 57.23 | 46.87 | 21.38 |
| Handoff | 55.89 / 56.69 | 51.20 | 19.54 |
| Boss | 56.26 / 56.87 | 48.37 | 21.15 |
| Failure | 55.21 / 55.83 | 50.80 | 19.69 |
| Result | 55.59 / 56.27 | 50.43 | 19.87 |

Maximum average-FPS variance was 4.72%. Maximum observed JS heap used was
40.02 MiB.

### 844×390 landscape fit

| Checkpoint | Average FPS | Min 1% low | Max worst ms |
| --- | ---: | ---: | ---: |
| Title | 57.75 / 57.50 | 55.77 | 17.96 |
| Combat | 57.73 / 57.71 | 56.24 | 17.83 |
| Handoff | 57.30 / 56.58 | 50.64 | 19.82 |
| Boss | 57.31 / 57.63 | 55.80 | 17.96 |
| Failure | 57.75 / 57.61 | 55.93 | 17.89 |
| Result | 56.73 / 56.59 | 55.73 | 17.96 |

Maximum average-FPS variance was 1.26%. Maximum observed JS heap used was
43.98 MiB.

### 390×844 portrait fit

| Checkpoint | Average FPS | Min 1% low | Max worst ms |
| --- | ---: | ---: | ---: |
| Title | 57.63 / 57.67 | 55.77 | 17.96 |
| Combat | 57.10 / 57.05 | 55.29 | 18.11 |
| Handoff | 57.23 / 56.88 | 55.71 | 17.96 |
| Boss | 57.39 / 57.24 | 55.56 | 18.03 |
| Failure | 57.83 / 57.38 | 56.01 | 17.87 |
| Result | 57.44 / 57.11 | 56.40 | 17.73 |

Maximum average-FPS variance was 0.78%. Maximum observed JS heap used was
49.16 MiB.

All runtime frame, stability, heap, and texture budgets passed. Every run
reported 24 runtime textures, one Audio manager, and one gameplay subscription.
GameObject counts were stable by checkpoint: Title/Combat/Handoff 26, Boss and
Failure 30, Result 25.

## Reset ownership

- `?resetSmoke=1`: 10 Scene resets, one Canvas, one Audio manager, one
  subscription.
- `?failureSmoke=1`: 10 failures and 10 retries, one Canvas, no remaining Boss
  or encounter Enemy.
- `?resultSmoke=1`: 10 Results and 10 replays, one Canvas, no remaining Boss or
  encounter Enemy.

No listener, actor, Canvas, Audio owner, or runtime texture growth was observed.

Local production smoke also passed with one Canvas at the normal
1066.67×600 desktop fit. Supplying `performanceProfile=1` and
`performanceViewport=portrait` exposed no profiling dataset and did not change
the production Canvas fit, confirming that the measurement seam is
development-only.

## Asset and build measurements

`node tools/report_performance_assets.mjs` reads the runtime manifest and build
output without modifying either.

| Metric | Result | Budget | Status |
| --- | ---: | ---: | --- |
| Logical manifest entries | 35 | Informational | Pass |
| Requested runtime files | 43 | Informational | Pass |
| Requested runtime bytes | 12,891,503 (12.29 MiB) | 15 MiB | Pass |
| PNG request bytes | 11,361,701 | Informational | Pass |
| WAV request bytes | 1,470,218 | Informational | Pass |
| Estimated decoded RGBA | 136,629,760 (130.30 MiB) | 140 MiB | Pass, near limit |
| Runtime textures | 24 | 28 | Pass |
| GitHub Pages artifact | 125,451,173 (119.64 MiB) | 30 MiB | **Fail** |
| Raw production JavaScript | 1,501,450 (1.43 MiB) | 2 MiB | Pass |

The artifact failure is caused by the current production copy including
unrequested source, debug, onion-skin, silhouette, overview, and other QA files
from `public/`. Runtime requests remain within budget, so this is a packaging
defect rather than evidence that gameplay loads 119.64 MiB.

## Task decision

Task 8.1 establishes the baseline and does not fix the failing artifact budget.
The measured failure makes M8 / Task 8.4 the next eligible task. It must first
exclude non-runtime QA/source files from production output without deleting
their repository sources or changing frozen runtime art. Atlas or decoded-memory
changes require separate evidence after packaging is corrected.
