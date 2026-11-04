# V217 – Multi-Avatar Performance Engine (incremental)

Builds on V216 with unchanged animation, safety, audio, Spotify, lyrics and installers.

- Avoid duplicate `setPredictedPhase` calls in a burst of animation frames before React commits: phase changes are gated by a frame-local ref, while React state still drives the UI/selection.
- Remove per-frame composite string construction in the multi-avatar director: compare scene, role and phrase individually and notify React only when these change.
- Memoize derived partner props across stable parent props/mode renders.
- Preserve the full-frequency Three.js animation mixer, grounding and IK paths and existing scheduler budgets. No claim of reduced GPU draw calls or improved measured FPS.
- Regression test: `npm run test:multi-avatar-v217`. Run `npm install && npm run verify` locally for full Next.js build/type checking.
