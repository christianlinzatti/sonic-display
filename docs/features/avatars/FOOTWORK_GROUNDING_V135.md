# V135 – Intelligent Footwork & Grounding

Builds on V134 without removing motion layers, clips, LOD, or retargeting.

- Stateful foot plant classifier with separate entry/exit heights (contact hysteresis)
- Waits for stable near-floor contact before committing a foot lock
- Keeps a world-space ankle target during planted phase; releases on fast movement/lift
- Exponential confidence blending for smooth acquire/release
- Uses existing bounded two-bone solver and preserves its constraints
- Reactivating after pause/reduced motion resets planted state safely
- `npm run test:grounding` and `npm run verify:offline`

Limitations: Inferred foot contacts depend on named bones and suitable humanoid knee/ankle chains. Uneven ground and biomechanically correct root weight redistribution are not implemented. Real GLB motion and foot-slip should be verified in the browser.
