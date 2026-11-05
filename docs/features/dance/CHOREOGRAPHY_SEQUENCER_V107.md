# Sonic Display V107 — Advanced Choreography Sequencer Studio

Based on V106; all existing files retained.

- Up to eight visual animation tracks, clip positioning via native drag-and-drop.
- Quarter-note beat ruler and configurable 40–240 BPM with snap-to-beat.
- Numeric beat and time inputs, existing per-clip transitions and Bézier/keyframe editors retained.
- Timeline schema adds optional `track`, `bpm` and `snap` fields; old V105/V106 JSON is supported by sanitization.
- Playback uses the existing timelineWeights engine; parallel lanes retain their existing additive mixing logic.

## Validation

Run `npm ci` (when lockfile matches), `npm run typecheck`, `npm run build`.
Browser-test drag/drop, import/export and animation synchronization on the target device.
