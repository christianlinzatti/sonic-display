# V147 – Advanced Hand Interaction & Partner IK

Builds on V146. Conservative, opt-in additive right-hand aiming during greeting and together phases under automatic Duo Director. Rig detection supports Mixamo-style upper arm/forearm/hand names. The solver uses capped world-space CCD adjustments, blends out on pause/solo/reduced motion, limits target reach, and skips rigs without required bones. Existing animations and Foot IK are retained.

This is a *hand-target approximation*, not guaranteed hand contact: no collision simulation, full-body constraints or anatomical joint-limit model is provided. Performance depends on rig bone naming, scale and choreography.

Run `npm run test:partner-hand-ik` and `npm run verify:offline`. Run `npm install && npm run build` locally for production verification.
