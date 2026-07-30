# M9 / Task 9.1 — Production Route and Hosting Verification

Date: 2026-07-30
Status: Accepted
Public URL: https://kenthuang0106tw-dot.github.io/three-kingdom/
Deployed commit: `b07bd03ae9a4061f6bd1124bee0d5aad3a161c15`

## Scope

This task verifies production routing and hosting only. It changes no gameplay,
art, animation, balance, Stage, Camera, Audio, input, UI flow, or production
asset bytes.

## Automated Route Contract

`tools/verify-hosting-routes.mjs` now derives the required public routes from
the runtime manifest and shell inventory, reads the generated HTML routes, and
verifies HTTP status and MIME type. JavaScript accepts the two valid hosting
forms used by the project: `text/javascript` and `application/javascript`.

| Target | Document | Generated routes | Public routes | Result |
| --- | --- | ---: | ---: | --- |
| Vinext production server | `/` 200 HTML | Generated JS/CSS all 200 | 52/52 | Pass |
| GitHub Pages preview | `/three-kingdom/` 200 HTML | 2/2 | 52/52 | Pass |
| Deployed GitHub Pages | `/three-kingdom/` 200 HTML | 2/2 | 52/52 | Pass |

The deployed scan verified 54 non-document routes. Required PNG, Atlas JSON,
bitmap-font XML, WAV, generated JavaScript, and CSS routes returned 200 with an
accepted content type. A wrong root-level runtime asset path and excluded QA
assets remain 404 in the local Pages contract.

## Hosting and Deployment

- GitHub Pages is public, HTTPS-enforced, and deployed by
  `.github/workflows/deploy-pages.yml`.
- The latest successful Pages workflow is run `30481481187`.
- That workflow deployed commit
  `b07bd03ae9a4061f6bd1124bee0d5aad3a161c15`.
- Local commit `385ca3b` contains only the M8.7 QA closeout. M9.1 adds only
  route tests, a verification tool, and documentation, so the deployed gameplay
  and runtime assets are the accepted M8 build.
- Direct navigation and reload at `/three-kingdom/` both recreated one Canvas
  without a browser error.

## Browser Matrix

| Target | Viewport | Fitted Canvas | Canvas | Dataset keys | Overflow | Errors |
| --- | --- | --- | ---: | ---: | --- | ---: |
| Vinext production | 1280×720 | 1067×600 | 1 | 0 | none | 0 |
| Vinext production | 844×390 | 693×390 | 1 | 0 | none | 0 |
| Vinext production | 390×844 | 325×183 | 1 | 0 | none | 0 |
| GitHub Pages preview | 1280×720 | 1067×600 | 1 | 0 | none | 0 |
| GitHub Pages preview | 844×390 | 693×390 | 1 | 0 | none | 0 |
| GitHub Pages preview | 390×844 | 325×183 | 1 | 0 | none | 0 |
| Deployed GitHub Pages | 1280×720 | 1067×600 | 1 | 0 | none | 0 |
| Deployed GitHub Pages | 844×390 | 693×390 | 1 | 0 | none | 0 |
| Deployed GitHub Pages | 390×844 | 325×183 | 1 | 0 | none | 0 |

Every Canvas retained the intrinsic 1280×720 size. The responsive checks used
real browser iframe browsing contexts at the exact target dimensions after the
browser's temporary top-level viewport override failed to change its fixed
1280×720 window.

## Optional Favicon Finding

The optional user-site root request
`https://kenthuang0106tw-dot.github.io/favicon.ico` returns 404. This is
explicitly waived for the Vertical Slice:

- repository Pages owns `/three-kingdom/`, not the user-site root;
- the favicon is not in the runtime manifest or required shell inventory;
- all 54 required deployed routes pass;
- the 404 does not affect Canvas creation, gameplay, Audio, direct navigation,
  reload, or terminal flow.

This waiver does not classify a missing required production route as
acceptable.

## Validation

- Previous M8.7 baseline: 147/147 tests, typecheck, lint with 0 errors and 8
  existing warnings, Vinext build, and GitHub Pages build passed before M9.1.
- Focused route tests: Vinext and GitHub Pages contracts passed.
- Final gates: 148/148 tests, typecheck, lint with 0 errors and 8 existing
  warnings, Vinext build, and GitHub Pages build passed.
- Public route verifier: 54/54 deployed routes passed.
- Browser: all nine target/viewport combinations passed with zero captured
  errors.

## Decision

M9 / Task 9.1 is accepted. The exact public deployment and repository base-path
contract are known and reproducible. The only next task is M9 / Task 9.2 —
Release Candidate and Versioning.
