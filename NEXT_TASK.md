# NEXT_TASK

## M9 / Task 9.5 — Release and Defect Triage

### Why this is next

RC2 has passed owner platform acceptance and a real rollback/restore drill.
The remaining work is to run final immutable gates, classify defects, publish
the `0.1.0` release identity, and leave one explicit post-release planning task.

### Completion conditions

- Run tests, typecheck, lint, Vinext build, and GitHub Pages build.
- Verify required production routes and one-Canvas public presentation.
- Confirm Critical 0 and High 0; place remaining issues in Technical Debt or
  Backlog without expanding scope.
- Create final `0.1.0` release notes and manifest from the accepted RC2 source.
- Create and push immutable tag `v0.1.0`.
- Publish the GitHub Release and deploy the final accepted source.
- Update Roadmap, Sprint, Checklist, README, and NEXT_TASK.
- Do not add gameplay, content, art, balance, Stage, Camera, Audio, input, or UI
  changes.

### Acceptance and validation

- All final automated gates pass.
- Final public deployment serves the document and all required routes.
- One intrinsic 1280×720 Canvas and no production debug/runtime error.
- No Critical or High defect remains.
- Tag, release notes, manifest, GitHub Release, and deployed source identify the
  same accepted runtime.

### Expected files

- `release/0.1.0.md`
- `release/0.1.0.manifest.json`
- Roadmap, Sprint, Checklist, Technical Debt, Backlog, README, NEXT_TASK
- No runtime source or asset changes.

### Risks

- Final rebuild could expose reproducibility or route regressions.
- Tag/release identity can diverge if created before final verification.
- Post-release ideas must not expand this release task.
