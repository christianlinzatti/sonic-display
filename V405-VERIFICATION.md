# Sonic Display V405 — Verification

## Local checks completed (20 October 2026)

- `npm run verify:offline:fast` — **PASS**, 154 isolated test invocations, including V405 Rap-Lip-Sync tests and the older V403/V404 QA tests.
- `npm run test:v405` — **PASS**: German-rap F/V/W, S/Z/ß/sch, vowels O/U/Ö/Ü and E/I/Ä, B/P/M closures, lyric word bounds, silence, artist-role overrides, flags, invalid strengths and reproducible seeks.
- `npm run test:quality:smoke` — **PASS**: V404 camera, lyrics, lip-sync and V405 refinement.
- `npm run test:imports` — **PASS**: 854 source files, 1,794 local imports and conflict fixtures.
- `npm run doctor:quality` — **PASS** static integrity, 0 unresolved local imports. The production doctor reported missing npm packages in the sandbox.
- `npm run check:syntax` — **PASS**: 544 TypeScript/TSX source files.
- `tsc --noEmit` — **not verified** due to missing project dependencies and React/Next.js/@types declarations in this environment. This is NOT a clean TypeScript build result.
- `next build` — **not executed**; npm packages absent (16 of 17 package manifests missing in this environment). The previous V403 production build was successful on Windows according to the user; that does not prove V405 builds.

## Run on Windows

```powershell
npm install
npm run verify
```

`npm run build` automatically executes the new V405 regression test before invoking Next.js. Preserve the project structure and all prior files when replacing V404.

## Scope

All new V405 lip shapes are **estimates derived from synchronized word timestamps and graphemes**, not speech recognition, actual phoneme alignment, vocalist identity detection, or browser/GPU image-level verification.
