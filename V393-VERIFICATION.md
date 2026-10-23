# V393 – Release verification

- Source version: `0.1.0-v393`.
- `npm run test:v393`: PASS – lyric confidence, facial connection, backing role, manual priority and context gating.
- `npm run check:syntax`: PASS – 525 TS/TSX files.
- `verify:offline` individual commands: 135 of 135 PASS (Node.js subprocesses, no npm fetch, includes syntax and V393 regression).
- `npm run build:preflight`: BLOCKED – 16 of 17 dependencies not installed, package-lock.json absent.
- `npm run typecheck` and `npm run build`: NOT VERIFIED, do not infer production build success.
- Full archive: previous V392 files checked for retention; ZIP integrity validated.
