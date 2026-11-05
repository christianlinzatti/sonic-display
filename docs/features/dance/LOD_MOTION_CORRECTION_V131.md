# V131 — Automatic LOD Motion Correction Engine

Adds a conservative local-quaternion correction during LOD crossfades. The original outgoing LOD stays untouched. Each new LOD bone may rotate up to 5 degrees per frame and only if its angular mismatch is below 30 degrees; the target is approached by at most 25% per frame. Missing bones, stale samples, paused playback, and Reduced Motion skip correction. Pose snapshots are sampled around 8 Hz, so this is not a perfect frame-exact synchronization system.

No GLB files are modified. Automatic discovery without `lod-manifest.json` remains available. A visually seamless transition is not guaranteed, particularly with different skeleton rest poses.

Checks: `npm run check:syntax`, `npm run test:lod-correction`, `npm run verify` (latter requires installed dependencies).
