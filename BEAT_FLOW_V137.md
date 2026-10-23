# V137 – Advanced Beat & Flow Detection

A browser-side, low-cost temporal classifier builds on existing microphone-derived kick/snare energy proxies. Includes genre-specific envelopes for Deutschrap/trap and Hardstyle/Hardtekk, onset debouncing, confidence tracking, pause/reduced-motion resets, and musical-accent-informed live/choreography crossfade durations. Existing dance engines, Foot IK, LOD and presets are unchanged.

This **does not** identify real isolated kick/snare stems or rap syllables; it operates on existing normalized audio features. Spotify metadata without live analyzed samples cannot supply reliable transients.

Run `npm run test:beat-flow`, `npm run verify:offline` and with installed dependencies `npm run verify`.
