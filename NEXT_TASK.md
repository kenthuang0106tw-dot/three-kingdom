# NEXT_TASK

## M9 / Task 9.4 — Rollback Drill

### Why this is next

M9.3 is accepted against the immutable RC2. Before final release, the deployed
site must prove that a previous tagged version can replace the current version
and that RC2 can then be restored without changing source.

### Completion conditions

- Push the immutable RC1 and RC2 tags to the release remote.
- Deploy the previous `v0.1.0-rc.1` tag through the production Pages workflow.
- Confirm the public route is healthy after rollback.
- Restore `v0.1.0-rc.2` through the same workflow.
- Confirm required public routes and the one-Canvas production surface.
- Record workflow IDs, timestamps, elapsed rollback time, and restoration.
- Complete the rollback within 15 minutes.
- Do not change gameplay, art, balance, Stage, Camera, Audio, input, or UI.

### Acceptance and validation

- The previous tag deploys successfully.
- The public target remains reachable and required routes return 200.
- Rollback completes within 15 minutes.
- RC2 restore deploys successfully and becomes the final public target.
- No retained workflow, artifact, or source ambiguity remains.

### Expected files

- Rollback drill report.
- Checklist, Sprint, Technical Debt, Roadmap, and NEXT_TASK closeout updates.
- No production code or asset changes.

### Risks

- GitHub Pages deployment queue time could exceed the 15-minute budget.
- A remote tag or workflow permission problem could block dispatch.
- A successful workflow without public propagation must not be counted as a
  completed rollback.
