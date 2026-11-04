# V751 – Concert Quality Dashboard – Verification

**Stand:** 30.10.2026
**Freigabestatus:** Quellcode- und isoliert typgeprüfter **Buildkandidat**. **Nicht vollständig produktionsverifiziert.**

## Bestanden

- `npm run test:v751`: **238.289** assertions including 40.000 simulated stage states, separation of configured/activated/planned, missing singer evidence, one-to-four avatars, pauses, overrides, unsynchronized lyrics, reduced motion, freshness and 0–100 % bounds.
- `npm run test:v751:types`: successful `tsc` strict mode for the new pure projection and V750 planning dependency.
- `npm run test:v751:ui-types`: successful isolated React/JSX typecheck of the real `ConcertQualityDashboardV751` and the V751/V466 stores; test-only React declarations, no production type overrides.
- `npm run test:v735` through `npm run test:v750`: **all 16 regression suites passed**. `npm run test:v740:types` through `npm run test:v750:types`: **11 isolated core TypeScript tests passed**.
- `npm run check:syntax`: **1.055** TS/TSX source modules pass syntax/import-binding checks.
- `npm run check:architecture`: **758** code references, architecture version V751 and required sections pass.
- `npm run test:module-case`: **1.784** source file names checked; no Windows/Linux case or .ts/.tsx naming collisions.
- Existing project npm scripts `build:preflight`, `test:quick`, and `check:fast` now include V751 core + UI types + regression checks. `npm run build` passed the first V751 tests in preflight before dependency check stopped the build.

## Nicht bestanden / nicht möglich

- `npm ci --offline --ignore-scripts --no-audit --no-fund`: **ENOTCACHED**, missing `zustand-5.0.16.tgz` in npm cache.
- `npm run check:dependencies`: **0/18** required project packages installed in this environment.
- `npm run typecheck`: **failed** with extensive missing Next.js, React, Node, Three.js modules/types. Full-project strict type verification is **NOT** completed; isolated tests above do not replace it.
- `npm run build`: **failed** in prebuild/check:dependencies before the Next.js compiler. No production build output was produced.
- No real browser/WebGL test verifying the dashboard's event/overlay/UI accessibility, any 3D rendering, actual FPS, singer assignment or pixels. The dashboard's QA card must be checked with real browser rendering in a proper environment.

## Local verification (Windows)

```powershell
npm ci
npm run test:v751
npm run test:v751:types
npm run test:v751:ui-types
npm run check:syntax
npm run check:architecture
npm run test:module-case
npm run typecheck
npm run build
```

Test-only stubs under `tests/stubs` are explicitly excluded from the production TypeScript configuration.
