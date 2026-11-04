# V399 – Verification report

## Environment

- Source baseline: complete V398 project archive (`sonic-display-v398-camera-performance-studio.zip`).
- Node.js 22.16.0, npm 10.9.2, project-local npm dependencies unavailable.
- Version: `0.1.0-v399`.

## Passed offline checks

- `node tests/check-source-syntax.cjs`: **537 TS/TSX files**, no syntax diagnostics.
- 141/141 offline commands listed under `verify:offline`, including V397, V398 and the new `test:v399` and camera-studio regression tests, exit code 0 (run using the exact package.json commands).
- V399 behavior: demo cast counts 1–4, safe bounded positions and fallback, true V326 stage-coordinate import, no invented duet partners, solo/duet/group framing, stage width, radial zoom/pan persistence to V398, safe malformed pose handling, reduced-motion and lazy component/UI wiring.
- Package manifest and code were updated for V399. Older tests' explicit supported-release whitelists were extended only for the new project version; functional assertions remain.

## Unverified and known limits

- `node scripts/build-preflight.cjs`: BLOCKED — package-lock.json absent; 16 of 17 declared dependencies missing. Full `npm run typecheck`, `npm run build`, and GPU browser playback have **not been verified**.
- The V399 preview displays GLB models at rest or neutral stand-ins, not the real audio-driven choreography or automatically detected vocalist. Saving only persists V398 shot/pan/distance for the chosen section, and live camera use requires V397/V398 enabled.
- A real GPU/browser test with 1–4 avatars and a Windows `npm install && npm run verify` remains recommended.

## Packaging

- ZIP archive is built from the V399 source workspace, with all prior V398 archive entries retained. CRC and byte-level content checks are performed at release packaging.
