# V832 – Real GLB Concert Benchmark 2.0 – Verification

## Scope

- Real-scene benchmark for 1, 2 and 4 performer slots using V826 render-loop snapshots.
- V830 visible skinned-rig evidence required on each live measurement window.
- Integrity guards: track, playback position, active verified playback, full visible cast, pixel size, performance tier and complete FX settings signature.
- Actual draw-call/triangle and WebGLRenderer.info geometry/texture counts, skinned vertices, FPS and frame times.
- Guided UI, live progress, comparable 3-row report, local JSON download.
- Separate continuous GitHub Actions technical quality workflow for Windows and Linux on push/PR/manual triggers.

## Explicit limitations

- **No GLB provenance check**: A visible SkinnedMesh does not prove it was loaded from GLB.
- **No GPU timing or VRAM bytes**: `WebGLRenderer.info` provides resource counts; render-loop FPS are not GPU timings.
- 1/2/4 configurations require real avatar selection by the user; no synthetic load.
- Results are intentionally transient and must be exported before reload.
- No full production approval until the complete TypeScript check, Next.js build, real browser/WebGL verification and human audiovisual acceptance pass.
- CI workflow is prepared, but no remote GitHub Actions completion is claimed.

## Local checks

- `npm run verify:benchmark:v832` – new benchmark regression and isolated strict TS check.
- `npm run check:syntax` and `npm run check:architecture`.
- `npm run verify:production:v831` – full release regressions + TS + actual Next build **only when dependencies exist**.
- `.github/workflows/v832-continuous-validation.yml` – run automatically on push / PR once committed to the repository.

## Measured checks for this package

- **PASS**: 53 V832 functional regression groups (`npm run test:v832`).
- **PASS**: strict isolated V832 TypeScript project (`npm run test:v832:types`).
- **PASS**: V800–V831 regression suites, 32 of 32 (each run completed).
- **PASS**: source syntax/import checks (2,393 `.ts` and `.tsx` files).
- **PASS**: architectural linked-file checks (923 code path references).
- **PASS**: V830 + V831 focused regression checks; Windows/Linux case collisions via V831 suite.
- **PASS**: package and lockfile version 0.1.0-v832 matched.
- **BLOCKED AS EXPECTED**: V831 production gate (no installed project dependencies / Next.js).
- **INCOMPLETE**: full `npm run typecheck` did not complete within 25s here (exit 124).
- **NOT RUN**: real `next build` (local `node_modules/next/dist/bin/next` missing).
- **NOT RUN**: WebGL/GPU live benchmark or any real GLB asset load (requires local live scene).
- **NOT RUN**: remote GitHub Actions CI workflow. It will run after the workflow is committed and pushed / opened in a PR.

Release state: **INTEGRATION READY / PRODUCTION NOT RELEASED**.
