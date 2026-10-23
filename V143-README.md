# Sonic Display V143 – Avatar Interaction & Partner Awareness

Based on V142. Adds partner-facing stage transforms (gentle yaw), subtle beat-triggered duet lean, and safe minimum separation between stage formations. This is intentionally conservative: it does not overwrite skeletal tracks, IK foot anchors, GLB assets or the V141 director. Solo and reduced-motion modes keep neutral yaw and lean.

Run `npm run test:partner-awareness`, `npm run verify:offline`; on a machine with npm dependencies run `npm run typecheck && npm run build`.

Limitations: partner attention is simulated by whole-body orientation, not eye-bone tracking. No bone-to-bone handholds or realtime body collision physics.
