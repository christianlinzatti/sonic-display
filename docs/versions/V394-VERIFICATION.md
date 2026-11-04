# V394 – Release verification

- Source version: `0.1.0-v394`
- `npm run test:v394`: **PASS** (drop/section hysteresis, track reset, camera/lighting/authored safety)
- `npm run check:syntax`: **PASS** (526 TS/TSX files)
- 136/136 `verify:offline` subcommands: **PASS** (executed separately as configured in `package.json` using Node.js; see release report)
- `npm run build:preflight`: **BLOCKED** (16 of 17 npm dependencies missing and no `package-lock.json`). `npm run typecheck` and `npm run build` were not completed here.
- Archive: ZIP CRC check and complete preservation of all earlier V393 ZIP files.

V394 is off by default; song/lyrics/hand-authored priorities and performance-tier limits remain in effect.
