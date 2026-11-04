# V404 – Verification report

## Checked in this environment (Node v22.16.0)

- `npm run test:v404`: **PASS** — camera, lyrics, lip-sync, import spelling and module collisions.
- Source integrity: **852 source files, 1790 local imports, 0 unresolved imports, 0 case mismatches, 0 ambiguous module names** (number includes the new runner).
- V403 production doctor: **PASS**, 543 TS/TSX files, 1532 imports, zero unresolved imports.
- Existing V387, V388, V389 and V403 regression scripts: **PASS** after version compatibility changes.
- Fast full-suite attempt: **147 individual tests passed** through V403. The process was cut off by the execution environment time limit immediately before the V404 tests; V404 tests subsequently passed separately. This is **not** a claim that the entire one-command suite finished.

## Not verified here

- `npm run typecheck` and the complete `next build` **could not be executed** because most npm dependencies are absent. No success for a complete V404 production build is claimed.
- Windows / GitHub Actions checks need to run after checking in or unzipping the project and installing dependencies.

## Release acceptance on Windows

```powershell
npm install
npm run verify
```

`npm run build` alone automatically runs the V404 smoke and import tests through `prebuild` before Next.js starts. Build warnings or type errors still cause normal Next.js failure.
