# V990 – Living LED Wall 3.0

**Based on:** V989. Changes are additive, opt-in and virtual-only.

## Features

- Four continuously animated looks: City Pulse (Deutschrap), Neon Matrix (Hardtekk/Hardstyle), Arena Beams (Rock), Prism Flow (Pop); a manual override selects a look within the permitted pattern family.
- Automatically follows the existing *verified* V810 section and spectral envelopes through the strict V886 parent guards. Suggestions/AI scene estimates do not trigger LED scenes.
- Concert FX Studio: opt-in, pattern choice, intensity, motion preset and camera-protection toggle, with a simulated-preview label.
- One existing V635 LED mesh and shader; **zero new lights, geometry, textures, GPU passes or timers**. Global alpha remains capped at 0.15; V990 extra scalar power is <= 0.022.
- Off by default for existing persisted settings. Low tier, pause, blackout, manual cues, authored lighting, reduced motion and fixed V886/LED presets disable the add-on.
- No real hardware/Govee writes, no strobe or fullscreen flash, no fabricated beat or BPM.

## Testing

`npm run test:v990` + `npm run test:v990:types` + existing V989/V886 regressions and full TypeScript/Next.js production build in Node 24 CI.

## Deployment

Ship the whole ZIP to `releases/SonicDisplay-V990.zip`. The archive importer intentionally protects GitHub workflow YAML; merge the workflow change separately after import. No claim of verified build before CI passes.
