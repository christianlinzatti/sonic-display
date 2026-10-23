# V397 Verification

- `npm run verify:offline`: **139/139** commands passed.
- Syntax inspection: **532 TypeScript/TSX** source files parsed.
- Dedicated tests verify: timed lyrics, solo/duet/group selection, manual stage casting, stable sections, controlled shot holds, track changes/seek/pause, missing/hidden anchors, lyrical safety, strength and device budget.
- All previous V396 files were retained in the complete source archive.
- `npm run build:preflight`: dependency check **blocked**, only **1/17** direct npm dependency manifests present; `package-lock.json` absent.
- Full `tsc --noEmit`, `next build`, browser integration and long-running 10-inch device tests **not executed** in this runtime; results must not be inferred from offline checks.
- Windows: `npm install`, then `npm run verify`, then test with 1, 2 and 4 loaded avatars. Use synced lyrics and manually assigned vocal roles to verify shot selection.
