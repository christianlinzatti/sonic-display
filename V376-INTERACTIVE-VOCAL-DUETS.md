# V376 – Interactive Vocal Duets

Based on V375; all existing features are retained. Default is **Off** to preserve old and manually choreographed scenes.

## What is included

- **Handoff:** timed visual lead handovers on four-line lyric-phrase boundaries, with a bounded outgoing acknowledgment gesture and incoming gesture.
- **Dialogue:** lyric-line-by-line visual lead rotations, short gaze exchanges and call-and-response gestures. It does not detect actual speakers.
- One pure, seek-safe dialogue resolver shared by both the 2-dancer formation and V326 group cast (up to 4). No animation clips restarted or GLB assets reloaded.
- Stage roots retain their legacy formation count, with a brief outgoing performer during a lead handoff; manual V325/V326 song-specific choreography and explicit show formations have priority.
- V371 additive face/head/arm expression overlay applied to both procedural and GLB avatars with soft radian caps; no authored keyframes overwritten.
- Inspector V373 also simulates handoffs and the corresponding head/gesture targets; settings exposed under Settings > Avatar & Tanz > V376.
- Existing V374 and V375 settings and stage roles remain; when V376 is enabled, V376 visual lead takes precedence for vocal expression.

## Important limits

The dialogue alternates visually on **timed lyric line** boundaries. It is not source separation, diarization, identification of rap performers, or phoneme detection. No lyrics means no new dialogue cues. Without multi-avatar setup, V376 remains inactive. Reduced-motion, manual authored scenes and pause disable new gesture cues; stage transitions do not load extra avatars. Gesture amplitudes remain small and are attenuated when choreography is authored.

## Verification

`npm install && npm run test:v376 && npm run verify`

The published archive excludes npm dependencies and package-lock.json. Local `next build` has not been validated without a working installation of React, Next, Three, and types.
