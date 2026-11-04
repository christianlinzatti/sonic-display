# Sonic Display V273 – Advanced Music Dance Intelligence

Uses the existing V243 audio-derived live structure detector but gates choreography switches with a V273 genre-aware, hysteresis/cooldown-based state machine.

- Hardtekk / Hardstyle: strong bass and kick requirements before accepting drops.
- Deutschrap: lower threshold for a hook and longer cooldown to preserve verse grooves.
- Verse, hook, build, drop, break remain distinct motion-section queries.
- Candidate phase persistence, minimum hold times, and cooldown prevent switching every audio frame.
- Pause and seek do not fabricate transitions; manual motion selection remains the winner, as in V242.
- No automatic rewriting of imported motion clips or user choreography.

Note: the audio analysis does **not** receive isolated instrument stems and is heuristic. To validate dance quality, test with actual tracks and representative motion libraries.

Run `npm run test:v273`, `npm run check:syntax`, `npm run verify:offline`, and, with dependencies, `npm run typecheck && npm run build`.
