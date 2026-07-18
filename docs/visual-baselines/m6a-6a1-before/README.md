# M6A.1 Before Baseline

- Gameplay revision: `3183f1f` (`Complete M6 UI and mobile acceptance`)
- Capture date: 2026-07-18
- Logical Phaser world: 1280×720
- Browser errors: 0
- Runtime assets were not modified for these captures.

## Viewports

| Prefix | Browser viewport | Fitted Canvas |
|---|---:|---:|
| `desktop` | 1280×720 | 1067×600 |
| `landscape-844x390` | 844×390 | 693×390 |
| `portrait-390x844` | 390×844 | 325×183 |

Each prefix has `title`, `combat`, `boss`, `failure`, and `result` PNG files.

## Reproducible checkpoints

| Suffix | URL / action | Capture condition |
|---|---|---|
| `title` | `/` | Title overlay loaded, before start input |
| `combat` | `/?encounterSmoke=1`, then canvas start | First encounter spawned and first hurt pose visible |
| `boss` | `/?bossCombatSmoke=1`, then canvas start | Boss arena active during attack exchange |
| `failure` | `/?failureSmoke=1` | `canvas.dataset.gameFlowState === "failed"` |
| `result` | `/?bossClearedSmoke=1` | `canvas.dataset.gameFlowState === "cleared"` |

The smoke routes are development-only and render the existing Physics/debug
presentation. That instrumentation is intentionally preserved as evidence of
the exact gameplay checkpoint; it is excluded from art comparisons. After
captures must use the same routes, conditions, viewport sizes, and full-page
framing so the diagnostic area remains a constant rather than a visual delta.

## File manifest

```text
desktop-{title,combat,boss,failure,result}.png
landscape-844x390-{title,combat,boss,failure,result}.png
portrait-390x844-{title,combat,boss,failure,result}.png
```

Do not overwrite this directory. M6A.6 places final captures in a sibling
`m6a-6a6-after` directory and compares matching filenames side by side.
