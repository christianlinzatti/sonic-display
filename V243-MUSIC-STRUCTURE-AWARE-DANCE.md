# V243 – Music Structure-Aware Dance Director

The live stage now uses an audio-feature-driven, hysteretic state machine (`musicStructureAwareV243.ts`) to identify plausible break, build, drop, hook, and verse transitions. It runs on track playback progress, resets on seek or track change, freezes while paused and limits switch rates. A confirmed state transition triggers a single additional automatic motion selection using the V242 ranking and crossfades; ordinary 16-beat selection continues. Manual clip priority is preserved. No stems or raw audio are stored.

**Limits:** Spotify does not expose stems or certified verse/chorus markers here. The classifier is heuristic, depends on reliable live audio features and does not guarantee accurate musical structure; if no meaningful changes occur, it defaults to verse.

Tests: `npm run verify:offline`; full build: `npm install && npm run verify`.
