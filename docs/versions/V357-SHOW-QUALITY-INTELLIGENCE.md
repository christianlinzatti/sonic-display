# Sonic Display V357 – Show Quality Intelligence

Base: **V356 – Autonomous Show Intelligence 2.0**. This release adds a *bounded, deterministic planning-quality guard* for **automatically generated** V356 camera, group-formation, lighting and effect cues. It reuses the same Spotify clock, R3F scene and V354 show cue; it does not introduce a new canvas, worker, sampling interval, motion mixer, audio detector, external AI service or camera animation system.

## Live behavior

- Uses the existing V356 provisional 2/4/8-bar plans, current section, genre context, lyrics visibility, photo screen count and avatar count.
- A track-seeded and phrase-index-stable camera/formation balancer varies eligible automatic compositions. Options: **Ausgewogen**, **Cinematic**, **Energiegeladen**, with user-configurable variety and calmness. When lyrics are active, camera choices are restricted to wide/medium views.
- User-configurable **maximum FX multiplier**. The content-protection option tightens brightness/FX budgets for visible lyrics and crowded photo layouts. The balancer **never increases FX or lighting above the upstream V356 output**. Existing V351 content protections and V355 performance limits are applied downstream.
- Offers a **heuristic scoring preview** for repetition, camera activity and intensity overload. These are simple deterministic estimates based on the *planned cues*; they **do not measure actual screenshot occlusion, FPS, GPU power, real motion smoothness, or subjective image quality**. Scores are advisory, not recorded model feedback.
- Absolute phrase indices and track-seeded selection keep camera and formation choices stable across React rerenders, seeking and changes to forecast length. The V356 forecast remains provisional; V357 cannot predict unobserved future drops/verses.
- Manually authored V354 timelines, manual camera/GLB choices, explicit V325–V329/group choreography, pause and Reduced Motion keep priority. No changes to the underlying GLB animation selection mechanism. V357 only changes V356-generated camera/formation cue fields and lowers optional lighting/FX gains.

## Controls and storage

`Settings → Dynamic Stage → Stage Content Plugins → Gallery Preview Editor → V357 – Show Quality Intelligence`.

- Enable/disable independently of V356; requires existing V306 automatic show and V356.
- Regiestil, Abwechslung, Ruhige Kamera priorisieren, Maximum FX-Faktor, extra protection for lyrics/photos.
- Lightweight editor preview simulates BPM, genre, section, playhead, lyrics, screen count and avatar count without WebGL. Compare before/after *planning heuristic* scores and forthcoming phrases.
- Browser-local key `sonic-show-quality-v357`. Invalid settings, absent storage and exceptions fall back to bounded defaults. No upload or cloud persistence.

## Files

- `services/stageContent/showQualityV357.ts`: pure bounded planning refinements, quality estimates and safe preferences.
- `components/visualizer/ShowQualitySettingsV357.tsx`: settings controls and no-WebGL planning preview.
- `components/visualizer/ThreeAvatar.tsx`: V357 modifies the optional V356 cue before the existing V354/351 camera, stage and FX pipeline.
- `components/visualizer/GalleryPreviewEditorV343.tsx`: adds the V357 settings panel.
- `tests/v357-show-quality-regression.cjs`: stability, deterministic seeking, lyrics/screens, manual and accessibility priority, inactive plans, storage, sanitized settings, and integration.

## Validation and limitations

- `npm run test:v357`: passes.
- `npm run verify:offline`: includes all previous offline checks and V357.
- `npm run check:syntax`: checks all TS/TSX source files.
- Semantic type check of isolated V354/V356/V357 pure planner modules with global TypeScript: passes.
- Full Next.js `next build` **not verified**, because dependencies and `package-lock.json` were missing from V356's uploaded ZIP; the offline environment has no npm package installation. To verify locally, run `npm install && npm run verify` on a network-connected machine.
- Does not run a real-life long-duration Raspberry Pi benchmark, camera collision test, subjective music-to-motion evaluation, or genuine visual-quality AI model. Future tracks and structure remain unknown without external analysis.
