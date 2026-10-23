# Sonic Display V233 – Emotion & Expression Engine 2.0

Based on V232. Adds a lightweight, per-avatar smoothed expression layer used in both procedural and imported-rig render paths. Detects rap/hardstyle/hardtekk genres and phrases from the existing director; controls bounded jaw/brow/eye-narrow/head tilt plus subtle gaze on procedural avatar. The imported rig uses the four expression channels provided by existing rig mapping; no new morph target names are required. Independent state, delta-time exponential easing, bounded inputs, reduced-motion and pause fade-out. Existing dance motion, partner look and matching preserved. Expression on GLB depends on available bones; no guaranteed facial animation on every imported model.

Run `npm run verify:offline`; for full build, install npm dependencies and run `npm run verify`.
