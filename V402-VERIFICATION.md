# V402 – Verification

- Previous version: **V401 / 1,244 files**, each original path retained (no deletions).
- New items: **4 files**, including this report: conductor, behavioral regression test, documentation, verification report.
- Offline regression: **144 / 144 npm offline commands PASS**, including V402, previous camera, vocalist, show and group tests.
- Source syntax check: **541 TypeScript/TSX files PASS**.
- V402 checks: confirmed section transition timing, short false drops, song changes/seeks, genre, lyrics timing, manual priority and V396 priority, category switches, reduced-motion, pause and low-device budgets.
- ZIP: no duplicate entries, matching source paths, CRC self-test, file sizes and exact source readback for code/json/test files.
- **Production build not verified:** `npm run build:preflight` reports missing `package-lock.json` and **16/17 npm dependencies unavailable**. Thus no true Next.js production bundle, complete TypeScript typecheck, runtime browser smoke test or physical display benchmark has been performed here.

On Windows: install dependencies with `npm install`, then run `npm run verify`; copy the exact error output if a typecheck/build fails.
