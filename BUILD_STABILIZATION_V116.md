# V116 — Build stabilization and motion regression checks

This pass makes the motion regression checks executable without application dependencies, and adds a complete TypeScript/TSX parser check. It preserves the existing Next.js application and installed features.

## Local verification

- `npm run check:syntax`: checks TypeScript/TSX **syntax only**. Uses a globally installed TypeScript compiler in this execution environment (local users can set `TYPESCRIPT_PATH` to their TypeScript package directory).
- `npm run test:motion`: six deterministic regression checks for motion genre selection, finiteness, joint limits, and pause/reduced-motion resets. Uses the same TypeScript compiler.
- `npm install` then `npm run typecheck` and `npm run build`: full compile and production integration checks.
- `npm run verify`: runs syntax, regression tests, typecheck, and Next.js build sequentially.

## Known limitations

Dependency installation timed out in the package creation environment. Hence the TypeScript typecheck and Next.js production build remain **unverified**. Syntax checks are not substitutes for these checks. No real browser/3D avatar verification was performed. The motion suite covers pure logic and does not claim to validate rendering, Spotify playback, or foot-IK.
