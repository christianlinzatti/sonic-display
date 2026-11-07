# V1084 · Validation and release notes

Scope: full Sonic Display V1084, based on V1083. All new festival hardware simulations are virtual.

## Verified in the artifact preparation environment

- `npm run test:v1084`: passed, 224,000 bounded deterministic particle samples, gated CO2 bursts, seek/pause/manual overrides.
- `npm run test:v1084:types`: passed (isolated pure TypeScript feature planner).
- `npm run verify:v1084:focused`: passed (V1080–V1084 regressions and isolated type checks).
- `node scripts/v959-source-preflight.cjs`: passed (all historical source-release checks plus V1084).
- TypeScript/TSX source parser: 1,557 source files, no syntax diagnostics.

## Not certified here

- Dependency installation and the complete Next.js production build are not certified: available runtime Node 22 rather than required Node 24, npm offline cache missing `zustand@5.0.16`.
- Full TypeScript application check and Playwright browser test need GitHub Actions on Node 24 after repository import.
- Physical fog, CO2, bubbles and pyrotechnics are NOT supported and never driven by V1084.

## Commands on Node 24

1. `npm ci`
2. `npm run verify:v1084:focused`
3. `node scripts/v959-source-preflight.cjs`
4. `npm run build`
5. Check Ubuntu/Windows Production & Playwright jobs and release identity on `master`.

No previous successful run or skipped deployment smoke check is evidence of a V1084 production build.
