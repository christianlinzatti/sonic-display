# V1054 — Advanced Avatar Performance Intelligence

- New opt-in local performance director refines existing V1041 two-avatar cues for the 360° Arena.
- Word-timed lyrics can produce small rap accents or longer vocal-swell gestures. Unsynced lyrics, inactive lyrics, and line-only timings never trigger these cues. No singer identity is inferred.
- Different genres and show chapters get deterministic, gently blended motifs; short phrase ramps avoid sharp gesture changes.
- Uses the existing formation performer, not a new GLB animation mixer, skeleton, audio engine or 3D scene. Does not change selected clips, stage coordinates, custom formations, vocal casting or IK.
- Manual/authored formations, saved group scenes, single performers, V325 timeline, special partner modes and reduced-motion preferences remain authoritative. Playback pause and low graphics disable extra accents.
- New UI toggle and 0–80% gesture intensity in Display → AI Show Designer; off by default. Requires a valid active show plan and V1041 automated choreography.
- `npm run test:v1054`, `npm run test:v1054:types` and `npm run verify:v1054:focused` cover lyric gates, immutable fallback, performance limits, and old regressions; prebuild plus V931/Vercel production gates include the test.
- No external AI request, timer, hardware commands, synthetic beat/drop events, additional renderer or motion clip changes.
