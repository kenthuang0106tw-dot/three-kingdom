# M9.3 Platform Acceptance

Date: 2026-07-30

## Candidate

- Version: `0.1.0-rc.2`
- Tag: `v0.1.0-rc.2`
- Source: `72bb680932f8ce95057e06f8e207f4ad4665e7bb`
- Public target: `https://kenthuang0106tw-dot.github.io/three-kingdom/`

## Acceptance Result

The project owner reported that acceptance completed successfully after being
given the Android Chrome and iOS Safari completion flow. The owner then
explicitly instructed the Technical Lead to complete the release work without
supplying device metadata.

This confirmation accepts the release candidate for the required desktop and
mobile targets. No Critical or High defect was reported.

## Evidence Limitation and Owner Waiver

The repository does not contain the physical device model, OS version, browser
version, or an individual nine-run log. Those values were requested but were
not supplied. They are intentionally recorded as **unavailable** and are not
inferred or fabricated.

The project owner explicitly waived the missing metadata and per-run log for
this release. This is an evidence-quality waiver only; it does not waive the
runtime, build, route, rollback, or defect-severity gates.

## Supporting Automated Evidence

- RC2 packaging and route checks passed 5/5.
- The corrected GitHub Pages output matched the public deployment 57/57 files.
- The full automated suite passed 149/149 before acceptance.
- Typecheck, lint, Vinext production build, GitHub Pages build, and the
  one-Canvas production smoke passed.
- M8.7 previously completed the full Stage and Boss flow at desktop, 844×390,
  and 390×844 with zero captured runtime errors.

## Defects

| Severity | Count | Disposition |
| --- | ---: | --- |
| Critical | 0 | Release gate passed |
| High | 0 | Release gate passed |
| Medium | 0 | None reported |
| Low | 1 | Optional user-site root `/favicon.ico` waiver retained |

## Decision

M9.3 is accepted by the project owner against the immutable RC2 identity.
Proceed to M9.4 rollback drill. Any later RC-changing defect invalidates this
acceptance and returns the release to M9.2.
