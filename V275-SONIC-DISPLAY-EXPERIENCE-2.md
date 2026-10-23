# V275 — Sonic Display Experience 2.0

- Opt-in 10-inch experience for the existing touch kiosk, under **Touchmodus → Experience 2.0**.
- Enhanced presentation of large 3D scene, a glass now-playing card, album art, Spotify metadata, progress and legible kinetic lyrics.
- Respects stage / split / lyrics modes, landscape and portrait layouts, accessibility and reduced motion.
- Setting saved in browser localStorage. Existing modes and full 3D avatar pipeline remain untouched when disabled.
- Does **not** add Spotify playback controls; those require a separate authenticated Spotify playback implementation.
- Run `npm run verify:offline` or `npm run test:v275`; full `npm run build` requires dependencies.
