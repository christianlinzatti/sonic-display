# V412 verification record

- New `tests/v412-rap-presets-regression.cjs`: passed (preset validation, deduplication, persistence round-trip, deterministic crossfades, mode switching, missing assets, and runtime/UI wiring).
- V409, V410 and V411 regression tests: passed.
- **Full offline regression: 164 isolated test executions passed** using `NODE_OPTIONS=--experimental-strip-types` (needed for historic `.mjs` tests on Node 22). The standard Windows verification command remains `npm run verify`.
- **Source audit passed:** 870 source files, 1,841 local imports, no missing/mis-cased imports or Windows TS/TSX filename collisions. **TypeScript/TSX AST syntax passed:** 553 files.
- **Build-preflight functional tests passed**; dependency check blocked as expected: `package-lock.json` absent and 16 of 17 runtime/development dependencies missing. Full `tsc --noEmit` and `next build` **not verified in this environment**, because project npm dependencies (React, Three.js, Next.js) are absent. Run `npm install && npm run verify` on a development machine.
- No claim is made that drop heuristics identify every Verse/Hook boundary or that an installed GLB motion is necessarily compatible with every rig.
