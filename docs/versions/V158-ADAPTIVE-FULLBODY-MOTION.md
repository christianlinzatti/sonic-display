# V158 – Adaptive Full-Body Motion Refinement

Opt-in, defaults **off**, available in Dance Engine Diagnostics.

Uses the last V157 IK quality snapshot (only when its dancer id matches), bounded foot-anchor, hand-target and IK correction error to smoothly lower selected additive arm/leg/hip motion amplitudes. It does **not** alter original GLB animation clips, bone rest pose, calibration, Foot IK or Hand IK. The data source is heuristic and shared across dancers; with a duo the effect may intermittently fall back to neutral. This is not a biomechanical pose solver. When playback stops the factor returns to neutral.

Test: `npm run test:fullbody-refinement`, `npm run verify:offline`, `npm run build`.
