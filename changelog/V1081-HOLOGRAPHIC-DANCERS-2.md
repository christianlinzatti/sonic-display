# V1081 · Holographic Dancers 2.0

## Implementation
- Opt-in **AI Show Designer → V1081 Holographic Dancers 2.0** after enabling V1068.
- Six pure deterministic dancer styles for intro, verse, build, hook, interlude and finale.
- Genre-specific tempos for Deutschrap, Hardtekk, Deutschrock and pop; paired, mirrored
  hook gestures and floating movements remain fixed to the V1039 portal ring.
- Reuses nine (high) or six (balanced) lightweight silhouette projections with one
  additional instanced batch of at most 18 illuminated arm segments. No skeletal
  retargeting, duplicate GLB avatars, extra frame loops, hardware control or audio polling.
- Explicit manual portal pattern, disabled V1068, paused playback, reduced-motion,
  low-tier quality and missing valid song clock always win. Only observed beat edges
  create rhythmic accents. Existing V1070/V1071 fade weighting remains authoritative.

## Verification
- `npm run test:v1081` — 270,000 bounded time/genre/scene/portal samples.
- `npm run test:v1081:types` — strict, isolated TypeScript verification.
- `npm run verify:v1081:focused` — prior-version regressions and metadata readiness.
- `node scripts/v959-source-preflight.cjs` — all historical release guards.
- Windows, Ubuntu, Next.js and Playwright proof must come from GitHub Actions after import.

## CI integration note
The project-archive importer intentionally excludes `.github/**` from its commits.
Therefore the V1080 production workflow must be updated directly on the repository
once; new versions then run their versioned tests through `prebuild` and release gates.
Skipping deployment smoke checks is not evidence of successful deployment.
