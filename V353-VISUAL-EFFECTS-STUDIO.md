# Sonic Display V353 – Visual Effects Studio

Build target: `sonic-display@0.1.0-v353`, based on the complete V352 ZIP. Existing avatar library, choreography, V350 lyrics/media, V351 smart composition and V352 genre director remain intact.

## Funktion

V353 adds **one shared effects policy** to the existing Three.js/R3F stage. The policy computes a single stage-wide cue from the existing genre choice, music section, beat intensity, playback status, lyrics safety policy and selected FX preset:

- **Particles:** A fixed geometry pool of 96 points is allocated once. The rendering draw range is bounded by quality tier and the selected particle-density slider. No allocations per beat, no additional Canvas.
- **Glow:** Controls the existing `DynamicStage` floor pulse and chooses a consistent tint for existing `DanceFX`; existing enabling/disabling of dance FX is preserved.
- **Shader:** A bounded alpha additive radial shader *behind* the stage (z=-4.5), controlled by intensity and music playback. It is not an expensive post-processing pipeline.
- **Photo transitions:** Controls the duration and optional fade/zoom/slide appearance for existing V347 crossfades, on both 2D and 3D photo panels. **V347 transitions must already be enabled**, preserving the previous opt-out.
- **Automatic genre mapping:** Hardstyle and Hardtekk → Rave, Deutschrap/Hip-Hop and Rock → Cinematic, Ambient → Dreamy, other supported genres → Balanced. V352 manually selected genre takes precedence. The studio works even if V352 is switched off, by using the existing detected genre.

## Settings and presets

Open `Settings → Dynamic Stage → Stage Content Plugins → Gallery Preview Editor → V353 – Visual Effects Studio`.

Choose `Automatisch nach Genre`, one of five built-in profiles, or `Individuell`. The five built-in profiles are **Balanced, Rave / Festival, Cinematic, Ambient / Dreamy and Minimal / Low Power**. The sliders adjust particle density, glow, shader intensity, transition duration and particle movement, plus a color picker and transition style. Any slider change switches to the manual/custom mode.

Save the active settings with a 36-character name as an own preset. Up to **8** local presets are stored, duplicates are replaced by name, and a selected saved preset can be removed. The UI includes a CSS-only FX simulator for genre, section, lyrics, playback and performance tier. It creates no second WebGL scene, GPU allocation or network calls.

The settings and named presets are persisted under `sonic-visual-effects-studio-v353` in localStorage. Media, lyrics, credentials and avatar data are never stored by this feature. The inputs are sanitized and hard bounded; malformed storage falls back safely to defaults. Use the Reset button to restore the default studio settings.

## Priorities and safety

1. V351 lyrics protection limits particles and shader opacity; new shader/particles are not rendered in front of the text. No pixel-perfect overlap detection is claimed.
2. V352 stage/camera color decisions remain in charge. Only **automatic mode** uses the V352 glow color; manual/saved effect colors win.
3. Paused playback and reduced-motion mode stop particle motion. Reduced-motion eliminates the V353 animated transition cue. V347 is never enabled without user opt-in.
4. Adaptive performance mode limits particle count to **96 / 42 / 0 (high / balanced / low)** at rendering time; low tier also disables the new shader. The renderer polls this without forcing React to rerender for each quality change.
5. Saved lighting timelines, blackouts, manual camera positions, GLB motions and the existing DanceFX toggles are untouched.
6. WebGL material/geometry count is fixed, material uniforms are updated in a single `useFrame` subscriber, and the stage reuses its existing Canvas.

## Main files

- `services/stageContent/visualEffectsStudioV353.ts`: validated configuration, local preset library and bounded, deterministic live FX and photo-transition cues.
- `components/visualizer/VisualEffectsStudioSettingsV353.tsx`: controls, CSS simulator, save/delete and reset.
- `components/visualizer/StageVisualEffectsV353.tsx`: single-Canvas 96-point pooled emitter and bounded additive background shader.
- `components/visualizer/ThreeAvatar.tsx`: single stage-level V353 decision, passing cues to effects, lights and photo screens.
- `components/visualizer/DanceFX.tsx`, `DynamicStage.tsx`: tinted existing DanceFX and glow gain.
- `StageContentScreensV333.tsx`, `StageContentScreenV330.tsx`, `StagePhotoGallery3DV348.tsx`, `StageImageGalleryV338.tsx`: V353-specific V347 transition duration/style when enabled.
- `GalleryPreviewEditorV343.tsx` and `app/globals.css`: touch-friendly editor and animations.
- `tests/v353-visual-effects-studio-regression.cjs`: presets, malformed state, boundaries, safety, genre matching, V347 opt-in, SSR and live wiring.

## Validation

- `node tests/check-source-syntax.cjs`: **PASS** (451 TS/TSX files)
- `node tests/v353-visual-effects-studio-regression.cjs`: **PASS**
- `node scripts/run-offline-regression-v352.cjs`: **96/96 regression commands PASS**, including all V350/V351/V352 checks. The name of the runner is historical; it includes V353 from `verify:offline`.
- ZIP integrity is checked after packaging.
- `npm run build:preflight`: **BLOCKED**. `node_modules` and `package-lock.json` are missing from the uploaded release source; most npm dependencies are unavailable locally. `tsc --noEmit` and `next build` therefore **cannot be verified here**. Do not interpret syntax-only checks as a successful production build.

On a network-connected development machine:

```bash
npm install
npm run test:v353
npm run verify
```

## Roadmap

V354: Show Timeline Editor (author multi-track sequences for dance, visuals, lighting, photos and cameras).

V355: Performance & Stability (long-running sessions, touchscreen presets and Raspberry Pi optimizations).
