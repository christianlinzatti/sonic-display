# V114 — Dance Physics & Momentum Engine

Secondary rig motion (torso, hip counter-rotation, arm swing, head and knee follow-through) uses a spring–damper integrator with variable-delta substeps. Deutschrap and trap use softer damping for relaxed momentum; Hardstyle/Hardtekk use faster, tighter response. Angular range and velocity are clamped; pause/Reduced Motion resets spring state. Imported authored clips, root translations and Foot IK are untouched.

No external physics library, cloud service or real audio-stream access needed. This is lightweight stylized motion, not a full rigid-body simulation.

Validation: `npm install && npm run typecheck && npm run build`; visually inspect on an avatar, particularly transitions and foot planting.
