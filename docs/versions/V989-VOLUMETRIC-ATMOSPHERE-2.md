# V989 — Volumetric Atmosphere 2.0

V989 extends V972 (verified V966 immersive cues) with **up to six additional low-alpha 3D shader planes**: soft light cones and shallow floor haze. This is a *visual approximation* of volume, not expensive raymarched or physically simulated fog.

## Operation
- Concert Studio → enable concert engine, virtual effects, V966 immersive atmosphere, V972 volumetric atmosphere, then V989 additional depth effect.
- Set atmosphere mode (auto / soft-beams / ground-fog), depth intensity and existing V972 quality (Eco/Balanced/Cinematic).
- Eco adds at most **two** draw calls, Balanced **four**, Cinematic **six**. Does not add lights, postprocessing, timers, independent loops, network calls or physical-device commands.
- Only verified active song sections, and only after explicit opt-in. Manual shows, timeline overrides, low-performance mode, compact FX and paused playback disable V989.
- Reduced-motion preference prevents time-based shader drift. Lyrics reduce atmosphere alpha to protect readability.
- The global V972 economy profile is suitable for low-power targets when the renderer considers them capable; V989 turns **off** automatically when the runtime declares lowPerformance, including on an overloaded Raspberry Pi.

## Validation
`npm run test:v989`, `npm run test:v989:types`, `npm run verify:v989:focused`.
Full `npm ci`, TypeScript and Next.js build must pass on Node 24 CI. ZIP importer protects GitHub Actions workflow changes; update workflow outside ZIP import if needed.
