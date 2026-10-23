# Sonic Display V171 – Predictive Drop Detection & Lighting Choreography Studio

Based on V170, retaining existing animation, Spotify, IK, Web Workers, lighting and kiosk flows.

## Features
- Lightweight, bounded **heuristic** anticipation during the estimated build section. Not an exact drop or phrase annotation.
- Beat-interval-informed kick-roll accents, decaying smoothly and limited to the existing stage lights and floor pulse.
- Optional short **partial** blackout (never an absolute screen blackout) during a detected build energy dip.
- On-screen **Lichtstudio** with Balanced, Hard Dance and Cinematic presets and three sliders; saved to browser localStorage and immediately applied without Canvas remount.
- Reduced-motion and disabled/reactive-off conditions suppress predictor activity. Existing tier caps and stage lighting remain active.

## Verify
Run `npm run test:predictive-lighting`, `npm run verify:offline`, `npm run typecheck`, and `npm run build` after `npm install`.
