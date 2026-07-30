# NEXT_TASK

## M9 / Task 9.3 — Platform Acceptance

### Why this is next

M9.2 fixed one immutable `0.1.0-rc.1` source, build identity, runtime inventory,
and reproducible output evidence. The remaining release risk is physical
browser/device behavior; it must be measured against this exact RC before any
rollback drill or final release.

### Completion conditions

- Test the exact `v0.1.0-rc.1` source without production changes.
- Record device model, OS version, browser name/version, viewport/orientation,
  and RC identity for every run.
- Complete three full Title → two encounters → Boss → Result clears on:
  - Desktop Chrome or Edge.
  - Android Chrome.
  - iOS Safari.
- Verify touch/keyboard input as applicable, Audio unlock, Pause/resume,
  visibility recovery, orientation/resize, Failure/Retry, and Result/Replay.
- Record defects and evidence; any RC-changing fix invalidates the candidate and
  returns work to M9.2.
- Do not begin rollback, deployment, final release, or gameplay work.

### Acceptance and validation

- All nine complete clears use the exact documented RC.
- No Critical or High defect and no runtime error.
- One intrinsic 1280×720 Canvas; no debug presentation or page overflow.
- Required assets/routes continue to load from the accepted production target.
- Evidence names real device/OS/browser versions; do not infer missing data.

### Expected files

- Platform acceptance report and device/run matrix.
- Checklist, Sprint, Technical Debt, Roadmap, and NEXT_TASK closeout updates.
- No production code, gameplay, art, configuration, or runtime asset changes.

### Risks

- Physical iOS/Android devices or exact browser versions may be unavailable.
- Mobile Audio, visibility, safe-area, and orientation behavior can differ from
  emulation.
- A discovered defect may invalidate `0.1.0-rc.1`; do not patch it inside this
  acceptance-only task.
