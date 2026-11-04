# V241 – Natural Choreography Variations

Builds on V240. Adds deterministic, phrase-aware low-amplitude movements to the existing live ThreeAvatar rig: torso, shoulders, hips, arms and head.

- Variation magnitude uses the existing danceVariation setting, genre, energy, BPM and phrase progress.
- Rap uses half-time texture; Hardstyle/Hardtekk use fast accents.
- Fixed per-bar texture with smooth boundary envelope and exponential interpolation; no random per-frame jitter.
- No changes to clip transitions, foot IK, root translation or live beat clock.
- Paused and reduced-motion states smoothly return to neutral.
- Does not claim to synthesize brand-new imported full-body animation clips.

Run: `npm run test:v241` and `npm run verify:offline`.
