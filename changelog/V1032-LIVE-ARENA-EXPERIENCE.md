# V1032 – 360° Live Arena Experience

Based on complete V1031 release. Stage identifier remains `arena360` and rotating platform plus the cast still share one transform.

## New experience

- Immersive stationary audience around the entire stage: instanced low-poly silhouettes, muted shirt color variations, soft phone lights and multi-tier seating with deterministic placement.
- Adaptive geometry: 36 (low), 100 (balanced), 188 (high) spectators. No remote textures, external assets or new browser timers.
- Two animated spotlight rigs with moving targets and subtle translucent beams; one real additional light in balanced quality, two in high, none in low; no dynamic shadows.
- Bounded cyan/magenta drop-ring lighting pulse. Requires a measured strong kick and bass/energy onset, with a 6-second lockout and ~1.6-second fade; never a full-screen flash or strobe.
- Optional scene-camera sweep, in `arc` (gentle +/-26°) or `orbit` (full 360° in 100 seconds) mode. Compose into the **existing** automatic camera poses; do not introduce a second camera driver. Manual edits, camera timelines, authored shots, vocal/duet and lyric closeups take priority.
- New Settings checkboxes for audience, stage lights, drop lighting, arena camera; camera mode selector. Preferences persist with the existing UI preferences.
- Pause and reduced-motion stop stage rotation (V1031), stop beam animation, disable drop impulses and disable camera orbit. Responsive tier is reused from existing adaptive performance subsystem.

## Test

```
npm ci
npm run test:v1032
npm run test:v1032:types
npm run test:v1031
npm run check:syntax
npm run check:architecture
npm run typecheck
npm run build:next
```

Local environment note: full npm dependency installation may be unavailable in this sandbox; GitHub Actions runs Node 24 and performs the full pipeline. The scene should also be visually checked in a real browser, particularly audience occlusion and camera director priorities.
