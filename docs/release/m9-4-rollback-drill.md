# M9.4 Rollback Drill

Date: 2026-07-30

## Versions

- Previous version: `v0.1.0-rc.1`
  (`b16c7398f37f78d1493cebbb1fbaf38a4e43a805`)
- Restore target: `v0.1.0-rc.2` plus documentation-only closeout commit
  (`db0d77b4882e8f08014a27da372f24a2f646c590`)
- Public target: `https://kenthuang0106tw-dot.github.io/three-kingdom/`

## Procedure and Result

| Step | UTC | Result |
| --- | --- | --- |
| Tag dispatch attempted | 03:48:52 | Build passed; deploy rejected by Pages environment branch policy |
| Protected main rollback started | 03:50:13 | Lease-checked update from `db0d77b` to RC1 |
| RC1 workflow | — | Run `30512239021` passed |
| RC1 public verification | 03:52:03 | Document 200; 2 generated + 52 public routes passed |
| RC2 restore started | 03:52:20 | Main restored to `db0d77b` |
| Restore workflow | — | Run `30512329569` passed |
| Restored public verification | 03:53:42 | Document 200; 2 generated + 52 public routes passed |

The effective rollback took approximately 1 minute 50 seconds from the
lease-checked main update to public verification. Including the rejected tag
dispatch discovery, the entire drill still reached verified rollback in
approximately 3 minutes 12 seconds, below the 15-minute budget.

## Finding

The `github-pages` environment currently permits production deployment only
from `main`. A `workflow_dispatch` build from a release tag succeeds, but the
deploy job is rejected by environment protection. The documented rollback
procedure must therefore update `main` to the chosen immutable tag commit with
`--force-with-lease`, wait for Pages, verify all routes, and then restore the
release commit through the same guarded path.

This is an operational constraint, not a runtime defect. The failed tag
dispatch did not alter the public deployment.

## Verified Rollback Procedure

1. Record the current remote `main` SHA.
2. Push the selected immutable source to `main` using an exact
   `--force-with-lease=main:<recorded-sha>`.
3. Wait for the `Deploy GitHub Pages` workflow to complete successfully.
4. Run the production route verifier against the public URL.
5. Restore the recorded release SHA with another exact lease.
6. Wait for deployment and repeat the public route verification.

## Decision

M9.4 passes. The previous version was publicly deployed and verified within the
budget, RC2 was restored, and remote `main` points to the expected closeout
commit. Proceed to M9.5 release and defect triage.
