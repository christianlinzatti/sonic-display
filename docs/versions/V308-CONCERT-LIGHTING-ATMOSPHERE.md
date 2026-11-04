# Sonic Display V308 — Concert Lighting & Atmosphere

V308 extends V307 Dance Quality & Expression and V306 Ultimate Show Director without changing imported character or motion formats.

## Visual additions

- **Two spatial light shafts on high quality** using transparent additive 3D cone meshes. The cones use extremely inexpensive shader materials, not volumetric raymarching, postprocessing or textures.
- **Actual shadowless spotlights** aligned to the cones. Real illumination adds depth to the dancer and stage without allocating shadow maps.
- **Soft localized floor haze**, a radial, depth-tested additive shader that fades without hard cutoffs. On high quality two haze areas can be shown; balanced quality uses one.
- **Distance fog** on the real Three.js scene, whose range scales with the Haze Density slider and is restored on cleanup. Nothing is attached to an ineffective child group.
- **Musically controlled pan and intensity**, paced by playback time and the V306 ShowCue (verse, hook, build, drop, break). Transitions are exponentially smoothed. Pause and reduced-motion modes keep the shafts stationary and dim.
- **Authored lighting timeline respects blackout and strobe attenuation**, including 0 brightness at full blackout. No new rapid strobing is generated.

## Settings

Settings → Dynamic Stage → Smart Stage Director → **Concert Lighting & Atmosphere · V308**.

Enable concert atmosphere, enable beams, enable floor haze, enable extra spotlights, sync to V306 show director, light intensity, haze density, and spotlight sweep. Settings persist under `sonic-concert-atmosphere-v308` in localStorage.

The new settings default to *on*, but each effect can be independently disabled; the preexisting DynamicStage lights remain and still follow old settings. Existing V306 lighting enable/disable takes priority when sync is active.

## Performance and fallbacks

- **High:** two cone meshes, two unshadowed spotlights, two small haze planes and optionally distance fog.
- **Balanced:** one cone, one unshadowed spotlight, one haze plane and optional light distance fog.
- **Low:** no new cone, spotlights, floor haze or distance fog; existing lighting unaffected.
- Scene-detail level `minimal-lights` turns off new physical spots; beam/detail controls also bound to existing scene-detail flags.
- The design avoids video shader effects, fullscreen passes, textures and new shadow maps.

This produces the appearance of gentle light shafts in haze, not true physically simulated scattering. Source of real music response depends on the existing audio pipeline: Spotify may use estimated rhythm when no live microphone/analyzer signal is available.

## Verify

- `npm run test:v308` – deterministic unit and integration assertions for settings, genre-independent dynamics, section direction, blackout, performance quality, pause and reduced motion.
- `npm run verify:offline` – full offline regression suite including V305–V308 and syntax of every TS/TSX source.
- `npm run build:preflight` – checks availability of Next.js, React, Three.js and TypeScript packages.
- `npm install && npm run build` (network-connected machine) – required to check full Next.js production build; npm packages are not bundled inside the ZIP.

## Notes

The other V307 preferences, the existing 3D scene and all imported avatar animation libraries are preserved. The new stage shafts are displayed only on the 3D-avatar stage, never inside the track UI or the lyrics controls.
