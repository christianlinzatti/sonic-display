# V392 – Release verification

- Source version: `0.1.0-v392`
- `npm run test:v392`: **PASS** (musical cue/state behavior and wiring)
- `npm run check:syntax`: **PASS** (524 TS/TSX files)
- 134 / 134 `verify:offline` subcommands: **PASS** (each run separately as configured in `package.json`, using Node.js).
- `npm run build:preflight`: **BLOCKED** (16/17 npm dependencies missing; `package-lock.json` absent). `npm run typecheck` and `npm run build` not completed in this environment. Full production validation must be done on a machine with installed npm dependencies.
- Archive: ZIP CRC check and complete preservation of the V391 verified ZIP content.

Changes are opt-in and limited to existing procedural stage dynamics, root yaw and gesture strength; source animation clips, imported animations and IK foot anchors are unchanged.
