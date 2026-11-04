# V451 – Verification

- `npm run test:v451`: **PASS** – deterministic lyric precedence, pause/gap, seeking, legacy switch, one automatic info card, independent user disclosure, isolated TypeScript.
- `npm run test:v450`, `test:v449`, `test:v448`, `test:v447`: **PASS**.
- `npm run verify:v451`: bundled previous regression suite ran successfully through all tests and a complete first pass of syntax, import integrity and module-case checks; the original nested command repeated syntax/import tests and was stopped due to execution timeout. The V451 script was simplified to prevent that duplicate work.
- `npm run check:syntax`: **PASS** 618 TS/TSX sources.
- `npm run test:imports`: **PASS** 980 project files / 2,154 imports.
- `npm run test:module-case`: **PASS** 980 TS/TSX files.
- `npm run typecheck`: **NOT COMPLETE** – the project has no installed node_modules in this runtime; full TypeScript reports missing React/Next/Node type packages and cascading errors. Requires `npm install` locally.
- `npm run build`, real Spotify/Genius API and WebGL tests: **NOT RUN** in this environment.

Local checks after installing dependencies: `npm install && npm run verify:v451 && npm run typecheck && npm run build`.
