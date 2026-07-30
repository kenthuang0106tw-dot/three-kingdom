# M9 / Task 9.2 — Release Candidate and Versioning

Date: 2026-07-30
Status: Accepted after RC2 correction

## Scope

This task identifies one immutable RC and adds release verification. Its RC2
correction canonicalizes JSON/XML line endings only; it does not change
gameplay, balance, art content, animation, Stage, Camera, Audio, input, or UI.

## Release identity

| Field | Value |
| --- | --- |
| Version | `0.1.0-rc.2` |
| Tag | `v0.1.0-rc.2` |
| Source commit | `72bb680932f8ce95057e06f8e207f4ad4665e7bb` |
| Node | `v24.14.0` |
| Package manager | `pnpm@11.7.0` |
| Runtime inventory | 52 files, identical in both outputs |

The source commit is deliberately the accepted production source before this
documentation/tooling commit. The manifest verifies that every production
input still matches that source, avoiding a manifest/commit self-reference.

## Rebuild evidence

Two consecutive Vinext and GitHub Pages builds passed. GitHub Pages reproduced
the exact raw tree hash. Vinext changes only two generated UUID values in
`dist/server/index.js` and one generated prerender secret copied to two JSON
files. The manifest preserves the original raw artifact hash and declares the
three-value normalization used for its reproducibility hash.

| Output | First artifact hash | Second artifact hash | Reproducible hash | Result |
| --- | --- | --- | --- | --- |
| Vinext | `0c1077a9256e12953a7811526601f46acf1d53a1a2a97a6bd3b6ee62d1c1613c` | `703608cd0bc60531b31a2491681f37002d320049eacd7835178f60f36dc7a86b` | `cd0e84ca1ce46cdf44d82e493aed26feafcd026bbe781a0de2ebc3daa3876ca4` | Pass with declared Vinext normalization |
| GitHub Pages | `a8a1c63666bd7fd16c77d8ef6f50948d0d8ba705e1e8112091524d8be45ded75` | same | same | Exact pass |

The verifier rejects production-input drift, runtime-inventory drift, file
count/byte drift, or a reproducible tree-hash mismatch.

## Validation

- M9.1 focused production-route tests: 2/2 passed.
- Public route verifier: 54/54 required deployed routes passed.
- Full automated suite before closeout: 149/149 passed.
- Typecheck passed.
- Lint passed with zero errors and eight pre-existing `<img>` warnings.
- Vinext and GitHub Pages production builds passed and retained 52 runtime files.
- Production browser smoke: one intrinsic 1280×720 Canvas, no overflow, zero
  debug dataset keys, and zero captured errors.
- M9.1 optional root `/favicon.ico` Low waiver remains unchanged.

## Decision

### Cross-platform correction

The first M9.3 preflight compared every deployed file instead of relying on
route status alone. It found 46/57 raw matches and 11 JSON/XML files whose
contents were equal after CRLF/LF normalization. RC1 was therefore superseded,
not sent into platform acceptance.

`package-production-assets.mjs` now writes production JSON/XML as LF on every
platform. Focused packaging/route tests passed 5/5, and the corrected Windows
GitHub Pages build matched the public deployment 57/57 files byte-for-byte.

`0.1.0-rc.2` at
`72bb680932f8ce95057e06f8e207f4ad4665e7bb` is the accepted Release Candidate
for M9.3. It changes no gameplay or asset content; it only makes runtime text
packaging portable. M9.3 must test this exact source/tag.
