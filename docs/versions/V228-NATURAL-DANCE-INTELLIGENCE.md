# Sonic Display V228 — Natural Dance Intelligence 2.0

Adds a deterministic, musical, stateful low-amplitude secondary motion layer to the existing ThreeAvatar rig. The new motion channels include weight transfer, hip/shoulder counter-rotation, torso lean and delayed arm/head follow-through. Rap and Hardstyle/Hardtekk have different rhythm response; confidence-gated beat phase only affects accent amplitude so a microphone-lock change does not jump the base posture. State uses frame-rate-independent exponential damping and smooths to neutral on pause/reduced motion.

No root translation, rig retargeting, IK contacts, choreography scheduler or animation assets are altered. The additive layer runs per animation frame with constant memory and no UI renders.

## Verification

`npm run test:v228` runs 8 focused offline checks. `npm run verify:offline` runs all existing checks plus V228. Full Next.js build requires `npm install` followed by `npm run typecheck && npm run build`.
