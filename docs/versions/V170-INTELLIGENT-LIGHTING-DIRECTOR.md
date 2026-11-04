# V170 – Intelligent Music Lighting Director

Built on V169. The optional music-color enabled lighting now uses an energy-envelope based state machine (intro/build/drop/break), with debounced transitions and a conservative adaptive light intensity modifier. Section names are **estimates**, not authoritative track annotations; song metadata does not provide structural segmentation.

The detector takes normalized audio features including bass, mids, highs, volume, beat, and kick accents. Build-up brightens gradually; drops accentuate kicks, breaks dim lights, and intros start softly. Existing stage theme and cue computations stay in place. Only existing point and spot lights are adjusted, with quality-tier caps and reduced-motion safeguards. Manual scene settings remain available when music colors are off.

## Validate
`npm run test:lighting-director`, `npm run verify:offline`, `npm run typecheck`, `npm run build` after `npm install`.
