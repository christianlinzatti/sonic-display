# V215 — Cached Avatar Skeleton Processing

- Cache bone name / quaternion references per loaded Three.js model instance with `useMemo([model])`.
- Reuse those references for live LOD pose correction and periodic diagnostics instead of traversing the scene graph on every animation frame.
- Reuse a scratch Quaternion while computing auto-tune angular errors.
- Preserve all existing mixer, pose correction, diagnostic sampling cadence, and multi-avatar behavior.
- Run `npm run verify:offline` and (with dependencies installed) `npm run typecheck && npm run build`.

The optimization reduces object traversal and allocations. It does not claim measured frame-time improvements; benchmark on target hardware.
