# V66 fixes

- Microphone off: smooth, low-amplitude estimated audio envelope; no synthetic beat onsets or flashing BEAT indicator. The approximate pulse is NOT measured Spotify audio.
- Spotify polling no longer restarts the synthetic pulse interval on each progress/fetchedAt update; the latest playback position is read from a ref.
- TypeScript CSS side-effect imports: global.d.ts declares `*.css` for TypeScript 6 and noUncheckedSideEffectImports.
- Removed deprecated tsconfig baseUrl; @/* paths still work with bundler module resolution.
- No full Next.js build performed in this environment.
