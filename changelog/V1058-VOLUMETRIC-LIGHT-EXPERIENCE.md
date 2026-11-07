# Sonic Display V1058 · Volumetric Light Experience

- Opt-in **Volumetric Light Experience** in AI Show Designer (0–80%; default off).
- A deterministic, validated seven-chapter optical cue synchronizes the existing
  two V1032 light-cone meshes and V1036 ground-fog instance batches. The cones
  now receive an optional soft depth-fade shader; disabling V1058 retains the
  old MeshBasicMaterial cones. The V1045 atmosphere tint has priority.
- Genre-sensitive palettes: Deutschrap, Hardtekk/Hardstyle, rock/metal and pop;
  chapter intensity changes smoothly, not via strobe or fabricated audio events.
- No additional lights, scene objects, smoke particles, shadow maps, camera calls,
  Spotify requests, Govee commands, timers or remote AI APIs.
- Safety: inactive on pause, reduced motion, low GPU tier, invalid track timings,
  untrusted/mismatched show plan or disabled stage effects. Existing limits of
  0.16 floor-fog alpha and 0.095 plume alpha remain untouched; cone alpha <=0.14.
- Tests: 7 chapter cues, 4 genres, 7,000 finite samples, bad inputs, legacy
  fallback, fixed scene object budgets, UI wiring, isolated TypeScript, release gate.
- Full platform builds / Playwright must be checked in GitHub Actions with Node 24.
