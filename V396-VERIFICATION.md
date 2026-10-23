# V396 verification

- Syntax parse: **531** TS/TSX files passed.
- Offline suite: **138 of 138** commands passed.
- V396 dedicated behavioral tests cover section hysteresis, song/seek resets, explicit mode priority, role fallback, FPS tier gating, and lyric-timing conditions.
- Next.js build and full `tsc --noEmit`: **not run**. 16 of 17 direct dependency manifests missing; `package-lock.json` absent.
- Real 10-inch display test: **not run**.

To test on Windows with network access: `npm install`, `npm run verify` (includes `typecheck` and production `build`).
