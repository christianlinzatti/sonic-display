# V565 – Verification and limitations

Validated against the V564 complete project snapshot, no edits to cached/source GLB files.

## Passed

- `npm run test:v565`: 45 V565 regression assertions (automatic/manual gates; verse/hook, measured beat-energy rise, foot contact, pose mismatch, clip-length bounds, pause/reduced motion/low-tier, preview deterministic demo timeline, mixer isolation, UI wiring).
- `npm run test:v565:types`: focused compiler check for the new pure V565 planner and inherited V564 core types.
- `npm run verify:v565`: new tests plus V554–V564 focused regression/unit/type chain and source syntax/architecture checks.
- `npm run test:v537`: earlier natural motion/pose matching checks.
- `npm run test:v492`: existing preset/mixer checks.
- `npm run test:v545`: 7,200 synthetic dance frames.
- `npm run test:v551`: 12,150 atmosphere and verified casting combinations.
- `npm run test:v552`: 43,200 deterministic Raspberry Pi transparency-gating frames.
- `npm run test:v553`: concert benchmark fixture checks.
- `npm run check:syntax`: 787 TS/TSX files.
- `npm run check:architecture`: package/doc version agreement, reference checks.

## Scope and remaining verification

- The real GLB preview is opt-in and uses **only two eligible motion clips embedded in the selected GLB**. It does not import external library GLBs into this preview; their existing live playback is untouched.
- Demo switch timings are synthetic; onset cues on live stage come from the existing beat-energy estimator, not a verified isolated drum stem. Music sections are already-known estimates/labels, not a new analysis service.
- Each GLB preview model has its own cloned scene and private mixer; face/morph animation tracks are excluded. No additional WebGL light, shadows, interval or animation-frame loop was introduced.
- No full Next.js production build: dependencies (`node_modules`) unavailable in the provided snapshot. No browser/WebGL visuals, real GLB animation pair, GPU/FPS measurement, or 10-inch/Raspberry Pi hardware test was possible. Focused/static tests **do not prove** full runtime functionality.
