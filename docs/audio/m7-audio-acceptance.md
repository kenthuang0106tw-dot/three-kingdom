# M7 Audio Acceptance

Status: accepted 2026-07-24

## Cue matrix

| Flow | Event | Expected audio |
| --- | --- | --- |
| Success | Title start | `ui-start`, Stage BGM |
| Success | Player attack | `player-attack` |
| Success | Confirmed Enemy hit | `hit-confirmed` |
| Success | Enemy defeated | `enemy-death` |
| Success | Pause | `ui-pause`; owned BGM pauses |
| Success | Resume | `ui-resume`; owned BGM resumes |
| Success | Boss activation | Stage BGM stops; Boss BGM starts once |
| Success | Player hurt | `player-hurt` |
| Success | Stage completion | `ui-result`; BGM stops |
| Success | Replay | `ui-confirm` |
| Failure | Title start | `ui-start`, Stage BGM |
| Failure | Player hurt | `player-hurt` |
| Failure | Player death | `ui-failure`; BGM stops |
| Failure | Retry | `ui-confirm` |

`tests/audio-acceptance.test.mjs` locks this matrix to the semantic event
catalogs. Existing `AudioManager` tests continue to cover same-frame
multi-target hit coalescing, one manager/subscription, BGM ownership, pause,
visibility recovery, and cleanup.

## Mix evidence

The generated WAV peaks and catalog gains exposed one deterministic worst-case
defect: a final hit may play the confirmed-hit cue, Enemy-death cue, and current
BGM in the same frame.

| Source | WAV peak | Previous gain | Candidate gain |
| --- | ---: | ---: | ---: |
| Confirmed hit | 0.8965 | 0.72 | 0.60 |
| Enemy death | 0.4767 | 0.68 | 0.50 |
| Stage BGM | 0.7167 | 0.30 | 0.30 |
| Boss BGM | 0.6781 | 0.34 | 0.30 |

The conservative sum of simultaneous peaks was approximately 1.185 during
Stage BGM and 1.200 during Boss BGM. The candidate catalog gains reduce those
sums to approximately 0.991 and 0.980 respectively. No master gain, channel
ownership, detune, audio asset, or playback architecture changed.

## Automated and browser evidence

- `pnpm test`: 103/103 passed.
- `pnpm typecheck`: passed.
- `pnpm lint`: 0 errors; eight pre-existing `<img>` warnings.
- `pnpm build`: passed.
- `pnpm build:github-pages`: passed.
- Development `bossEntrySmoke`: one Canvas, one Audio manager, one gameplay
  subscription, one Stage-to-Boss transition, one stopped Stage track, and one
  active Boss track.
- Development `failureSmoke`: ten failure/retry cycles completed with one
  Canvas, one manager, and one subscription.
- Development `resultSmoke`: ten Result/replay cycles completed with one
  Canvas and no stale terminal flow.
- Local production output opened at the Title screen and started the playable
  Stage after one explicit pointer gesture.

## Physical-device acceptance

The candidate at revision `d7b477b` was deployed through GitHub Pages. The user
explicitly accepted the tuned mix on physical iOS Safari and Android Chrome.
Confirmed hits, Enemy death, Stage BGM, and Boss BGM remained readable at the
candidate gains. Device, OS, and browser versions were not supplied and are
recorded as unavailable rather than inferred.
