# V133 — Build & Runtime Stability Suite

## Changes
- Corrected Next.js `"use client"` directive placement in `components/SonicDisplay.tsx`.
- Added `npm run test:runtime`: checks client directives, local imports, core scripts and Next app entrypoints.
- Added `npm run verify:offline`: syntax + runtime checks + all existing regression suites, without npm dependency installation.
- Added `npm run build:preflight`: checks Node version, direct dependency availability and reports lockfile presence.
- Updated `npm run verify` to stop early with actionable dependency diagnostics before typecheck/build.

## Results in this execution environment
- `npm run verify:offline`: PASS (134 TypeScript/TSX files + 17 pre-existing test scripts + runtime structure test).
- `npm run build:preflight`: BLOCKED (13 of 14 direct dependencies unresolved, `package-lock.json` missing).
- `npm install`: BLOCKED (`EAI_AGAIN` DNS/network failure resolving `registry.npmjs.org`).
- Full TypeScript check, Next.js production build, browser runtime, Raspberry Pi render benchmark: **NOT VERIFIED**.

## Run on your connected development machine
1. Use Node.js 22 (or a compatible Node.js >=20.9).
2. `npm install` (will generate a `package-lock.json`; commit it to make installs reproducible).
3. `npm run verify` (requires all dependencies).
4. `npm run dev` and test Spotify connection, Settings, avatar import, LOD changes, and browser console.
5. Once the lockfile is committed use `npm ci` on CI and fresh machines.

For local checks without external packages run `npm run verify:offline`.

No claim of a successful production build is made by this release.
