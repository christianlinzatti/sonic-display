# V139 – Reactive Stage Lighting & Visual Effects Studio

Based on V138. The existing DynamicStage has been extended with genre-sensitive illumination and a pooled geometric floor accent without modifying choreography, grounding, avatar retargeting, or GLB sources.

## Features
- Beat-edge lighting cues based on existing normalized audio metrics; energy-band signals are **not** isolated instruments.
- Rap/Deutschrap/Trap: smoother, snare-sensitive illumination.
- Hardstyle/Hardtekk: quicker kick-focused illumination and pulses.
- Frame-rate-aware exponential smoothing and input sanitization.
- Existing stage themes, settings for reactive stage and strength are preserved.
- Adaptive performance tiers: low disables floor pulse and spot sweep; balanced disables sweep; high allows all effects.
- Paused, disabled stage reactivity, or reduced-motion disables reactive geometry and beat pulses. Existing fixed lighting remains visible.

## Verify

```bash
npm install
npm run test:stage-lighting
npm run verify:offline
npm run typecheck
npm run build
```

The tests validate numerical behavior and wiring, **not** GPU rendering quality or visual effects on actual GLB avatars.
