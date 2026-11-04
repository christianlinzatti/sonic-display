# V144 – Advanced Partner Interaction & Look-at IK

Based on V143, with previous functionality preserved. Adds per-avatar bone-level partner gaze cues for head pitch/yaw and optional eyes, bounded by conservative angles. Smooth frame-delta easing avoids abrupt look transitions. Pure cue engine disables gaze in solo, pause, reduced-motion and when partner is not visible. Each avatar has its own mutable cue context and retains independent animation mixer state. Procedural fallback implements head gaze. Without suitable named GLB bones, head/eye look-at gracefully does nothing.

This is intentionally **not** pupil tracking, physically precise gaze or real-time skeleton collision detection. Existing local GLB bone axes may need individual calibration. Verify visuals with actual rigs.

Test: `npm run test:partner-look`, `npm run verify:offline`; full build: `npm install && npm run build`.
