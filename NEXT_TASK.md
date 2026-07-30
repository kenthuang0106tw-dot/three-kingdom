# NEXT_TASK

## M9 / Task 9.2 — Release Candidate and Versioning

### Why this is next

M9.1 accepted the production route and hosting contract, identified the exact
deployed commit, and verified the public repository base path. The project now
needs one immutable, identifiable Release Candidate before platform acceptance
or rollback testing can produce trustworthy evidence.

### Completion conditions

- Select one exact commit as the Release Candidate source.
- Produce a reproducible immutable build identity and version.
- Record the Release Candidate's source commit, build commands, artifact hashes,
  production file inventory, and release notes.
- Ensure the Vinext and GitHub Pages outputs correspond to the same source
  revision and required runtime inventory.
- Do not change gameplay, balance, art, animation, Stage, Camera, Audio, input,
  or UI behavior.
- Do not begin platform acceptance, rollback, or final release.

### Acceptance and validation

- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `pnpm build:github-pages`
- Rebuild comparison for the documented Release Candidate outputs.
- Route/status/MIME verification retained from M9.1.
- One-Canvas production smoke with no development presentation or runtime error.

### Expected files

- Minimum version/build identity files.
- Release Candidate manifest, hashes, and release notes.
- Roadmap, Sprint, Checklist, Technical Debt, and NEXT_TASK closeout updates.

### Risks

- Generated filenames or timestamps may make the build non-reproducible.
- Version metadata can diverge between Vinext and GitHub Pages outputs.
- Scope can drift into platform acceptance, rollback, deployment, or final
  release; those remain Tasks 9.3–9.5.
