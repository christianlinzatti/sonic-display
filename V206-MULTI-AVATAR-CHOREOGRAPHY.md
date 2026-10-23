# V206 – Multi-Avatar Choreography 2.0

Builds on V205 without removing earlier modes.

## Features
- Opt-in director for **two** avatars, sharing one BPM-derived four-beat clock.
- Alternating lead/partner solos, unison, and three-step call-and-response roles.
- Configurable section length (1–16 bars) and solo emphasis.
- Drop together on detected high kick and energy, not inferred Spotify song structure.
- Live scene changes reuse persistent `FormationDancers` skeleton instances and existing partner awareness/IK.
- UI in Settings → Avatar tuning → V206 Multi-Avatar Choreography.
- Prior V141 automatic duo mode takes precedence only when V206 is disabled.
- LocalStorage is optional and guarded against invalid JSON or storage failures.

## Limits
- Supports two dancers, not arbitrarily many.
- Beat timing is BPM-estimated, not sample accurate; playback seeking is not phase-aligned.
- Role emphasis currently applies to gesture intensity and duet/sync scene selection, not to independent GLB clip timelines. No new animation frames are synthesized.
- Unit and source-level regression tests are not a substitute for a real browser/WebGL and Next.js production build.

## Tests
`npm run test:multi-choreo-v206`, `npm run check:syntax`.
