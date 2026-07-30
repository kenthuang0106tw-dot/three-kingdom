# M9 / Task 9.2 — Release Candidate and Versioning

Date: 2026-07-30
Status: Accepted

## Scope

This task identifies one immutable RC and adds release verification only. It
does not change gameplay, balance, art, animation, Stage, Camera, Audio, input,
UI, or production runtime assets.

## Release identity

| Field | Value |
| --- | --- |
| Version | `0.1.0-rc.1` |
| Tag | `v0.1.0-rc.1` |
| Source commit | `b16c7398f37f78d1493cebbb1fbaf38a4e43a805` |
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
| Vinext | `0dc45dc52a1029ff1f68f820cb0e3ede48daa298960e22333e89c9cb68b47516` | `59f74549915092c3564d601b5fcb58c02ce9e73b384ee4f5e5584d126371cad1` | `15ff99b525f0205b5e3d65a5e25343b1c9186e62766170154e6bb7f7682c8f31` | Pass with declared Vinext normalization |
| GitHub Pages | `6d2f37d2cffd7bc1f4e2373190a1cde278392090714a330ed2b66589a2a4096a` | same | same | Exact pass |

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

`0.1.0-rc.1` is accepted as the single Release Candidate for M9.3 platform
acceptance. It is not a final release and is not claimed as publicly deployed.
M9.3 must test this exact source/tag without gameplay or build changes.
