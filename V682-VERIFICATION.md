# V682 – Verification / Release notes

## Completed successfully (local offline environment)

- `npm run test:v682`: **PASS**, 38 checks and 10,000 simulated frames.
- `npm run test:v682:types`: **PASS**, isolated strict TypeScript.
- `npm run test:quick`: **PASS**, covering V669–V682, syntax (943 TS/TSX source files), architecture (606 references), module casing (1,590 paths), test ambient type isolation and Spotify build-environment checks.
- `npm run test:v528`, `npm run test:v540`, `npm run test:v550`: **PASS** (3,600 / 8,640 / 9,720 scenarios), including their `:types` checks.
- `npm run test:v613`, `npm run test:v620`, `npm run test:v633`, `npm run test:v655`: **PASS**.
- Legacy camera test membership updated to V680's separately scheduled `verify:historical`; **no historical tests moved back into production prebuild**.

## NOT verified / blocking environment

- `npm run build`: **blocked** by the V680 dependency preflight. `node_modules` has 0 of 17 required package entries; `package-lock.json` is absent. The actual Next.js build and complete project `tsc --noEmit` could not run. Do not describe this as a successful production build.
- Browser/R3F rendering, particular GLB mesh proportions, physical touchscreen performance and visual occlusion have **not** been tested on actual target devices.

## Local developer verification

From the extracted repository root on the Windows development machine, with network access:

```powershell
npm install
npm run test:v682
npm run test:v682:types
npm run build
npm run verify:historical  # optional, large historical suite
```

Save the generated `package-lock.json` to your project repository for reproducible builds, if no prior lockfile exists. For a production release, verify 1–4 avatars, portrait and stage-wide poses, lyrics side/bottom placement, singer handoffs, manual camera overrides and frame pacing in the running browser.
