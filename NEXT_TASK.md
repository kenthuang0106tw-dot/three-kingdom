# NEXT_TASK

## M9 / Task 9.1 — Production Route and Hosting Verification

### Why this is next

M8 Full QA is accepted with no Critical, High, or Medium defect. Release
engineering must now prove that the actual production and GitHub Pages hosting
contracts serve every required route correctly before versioning or platform
sign-off. M8.7 also found one Low route issue: the optional root favicon
request returns 404 in the GitHub Pages preview.

### Completion conditions

- Inventory every production HTML, JavaScript, CSS, image, Atlas, font, and
  Audio route required by the Vinext and GitHub Pages builds.
- Verify the local production server, GitHub Pages preview, and deployed
  GitHub Pages URL use the correct base path, status code, and MIME type.
- Resolve or explicitly waive the optional `/favicon.ico` 404 without changing
  gameplay, art direction, or asset packaging ownership.
- Confirm direct navigation and reload work at the public repository base path.
- Confirm production still exposes one Canvas, no development dataset/debug
  presentation, no overflow, and zero runtime error at Desktop, 844×390, and
  390×844.
- Record a reproducible hosting matrix and identify the exact deployed commit.

### Acceptance and validation

- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `pnpm build:github-pages`
- Automated route/status/MIME checks for both local production outputs.
- Browser smoke on local production, GitHub Pages preview, and the deployed
  public URL.
- No required production route may return 404 or an incorrect MIME type.

### Expected files

- Hosting/route tests or scripts only where existing coverage is insufficient.
- Minimum favicon or shell metadata change if the Low finding is fixed.
- `docs/quality/m9-1-production-hosting.md`.
- Roadmap, Sprint, Checklist, Technical Debt, and NEXT_TASK closeout updates.

### Risks

- Local preview may pass while the deployed repository base path is wrong.
- Cache propagation can make a newly deployed commit appear stale.
- Scope can drift into release versioning, platform QA, or unrelated asset
  optimization; those remain later M9 tasks.
