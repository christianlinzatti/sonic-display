# V236 – Smart Stage Director 2.0

- Adds a shared lightweight estimated stage mood (rest/groove/build/drop) based on normalized live audio, with debounce and frame-rate-independent smoothing.
- R3F live camera adds restrained, reversible sway and dolly emphasis, respecting reduced-motion and playback stop.
- Existing stage beams get a bounded dynamic sweep contribution, without extra lights, draw passes, or config editing.
- Existing lighting presets, manual light timelines, scene detail controls and music-responsive avatars remain.
- Note: stage moods are **energy heuristics** rather than verified song sections. Camera framing requires visual acceptance testing with actual avatar models and display aspect ratios.
- `npm run verify:offline`, `npm run verify` (requires installed npm packages).
