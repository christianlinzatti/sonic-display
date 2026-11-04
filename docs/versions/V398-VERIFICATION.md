# V398 – Verification

- Offline checks: **140 / 140 PASS**. Executed the exact 140 commands referenced by `verify:offline` individually (same script bodies, no code changes during the final pass). Includes V397 + V398 targeted camera regressions.
- Source syntax: **534 TS/TSX files** parsed by the built-in TypeScript syntax checker.
- Tested V398: per-section shot selection; no synthetic lyric timing, partners or speakers; disabled defaults; input normalization; camera zoom/pan bounds; lyrics protection; preview orbit angle does not change persisted zoom; UI and camera wiring.
- Package: base V397 complete archive retained, no previous file omissions (see ZIP validation); all source and regression tests included.
- Build preflight: **BLOCKED**. `package-lock.json` absent, only 1/17 direct npm dependency manifests installed. `tsc --noEmit`, Next.js production build, live WebGL/browser tests and actual 10-inch long-run tests **not executed**. Offline success does not imply production build success.
- Windows verification: `npm install`, then `npm run verify`. Enable V397, V398 and time-synced lyrics and inspect real performance with 1/2/4 onstage avatars, manual camera overrides and touch interactions.
