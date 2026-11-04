# V907 – Technical verification · Development release

## Successful verifications

- **V907 regression: 1,096/1,096 passing**. Tests cover profile-label snapshots,
  authentic completed V905 run validation, anonymous exports, exact song/scene/
  FPS target/preset matching, minimum three independent runs per configuration,
  variable results, manual cleanup, and read-only UI.
- **`npm run verify:v907:focused`: Exit 0.** Runs V907 back through V880,
  with the corresponding isolated TypeScript and UI type checks as available,
  module-case, architecture, and syntax checks.
- **All 28 direct regression groups V880–V907 passed**. Older test files were
  amended only to accept V907's package version, updated doc version, and
  new first prebuild gate. All functional assertions remain intact.
- **`test:v907:types` and `test:v907:ui-types`: Exit 0**.
- **Syntax/import bindings: 1,324 TS/TSX files passed.**
- **Windows/Linux case-insensitive TS/TSX module collisions: none** across
  2,265 checked source modules.
- **Architecture:** 1,097 current code references, ten sections, passed.
- Additional older regressions **V604, V825, V826, V827, V834, V540,
  V550, V841, V842, V871 all passed**.
- Package and lockfile version consistently **0.1.0-v907**.
- Windows and Linux CI commands wired; PowerShell release gate provided.

## Not yet successfully verified

- `npm ci --offline --no-audit --no-fund`: **Exit 1 / ENOTCACHED** for
  `zustand@5.0.16`, unavailable in the local npm cache.
- `npm run typecheck`: **Exit 2**, missing Next.js/React/Node dependency types,
  including `next/server`. **Full-app TypeScript typecheck did not pass.**
- `npm run build --ignore-scripts`: **Exit 127**, `next: not found` because
  project dependencies were not successfully installed. **No production build.**
- Browser/WebGL rendering, actual GLB load count, thermal behavior, hardware
  performance benchmarks, and real-device acceptance were not executed.

## Evidence limits and user instructions

- Performance values in the running app are genuine V826 renderer frame
  measurements grouped into completed V905 sessions and V906 reports.
  Test fixtures are *synthetic tests*, not actual measured PC results.
- **GLB avatar count (2, 3, or 4) and the selected FX configuration are
  self-declared user labels, not verified or automatically applied by V907.**
  The user must alter stage/FX settings separately and inspect the scene.
- Only groups with the same private track key, verified scene, V905 preset,
  and FPS target can be paired. Different tags and performance tiers may be
  compared after 3+ independent complete runs per tagged configuration, but
  variable results are never ranked.
- Results are observational and do not establish which of several changed
  settings caused an FPS difference. No GPU timing or optical quality test.
- A PC benchmark cannot predict Raspberry Pi or mini-PC performance;
  the respective hardware must be benchmarked separately.
- Anonymous JSON omits song IDs, wall timestamps, raw frame samples and
  original run identifiers. Session data is not persisted by this module.

**Status: tested development release; production release still blocked.**
