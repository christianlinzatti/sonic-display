# V1055 · Dynamic Concert Stage & Avatar Interaction Engine

**Status:** implemented as opt-in local visual choreography, initially disabled.

## Performance

- **Seven concert chapters** have stage-zone cues for `center`, `front`, `left`, `right`, `rear` and `finale` plus alternating cast, crowd, platform and ensemble focus.
- The same Spotify playback position and V1040/V1052 show score produce deterministic movements per track. Chapter changes use eased interpolation, not per-render random values or an independent clock.
- In an eligible automatic **procedural duo** the existing V142 group targets translate together by at most 0.31 Three.js units in the middle of the rotating stage. Separation is unchanged; the existing V143 separation, V324 ensemble, V506/V508 collision and Foot-IK guards retain control.
- Slight performer yaw emphasis is applied only with a permitted position movement. GLB/FBX models, imported motion clips, manually authored choreography, locked feet, low graphics, paused playback and reduced motion are excluded from root translation.
- Optional V1043/V1047/V1053 camera cues, V1044/V1051 crowd effects and V1038 floating scenic platforms get **attenuation-only** intensity factors keyed to the same focus. No new camera or audience instance is created, nor are existing user effect enables changed.
- Floating peripheral platforms stay **decorative**; performers remain supported by the central turntable and never step onto suspended geometry.

## How to enable

Display → AI Show Designer: generate and enable a V1040 plan; enable V1041 automatic Avatar Choreography and then V1055 Stage & Avatar Interaction. Additional camera, audience and floating-stage options stay independent and are only coupled when already enabled. V1055 strength is 0–80%. All options default to off.

## Safety / build

No new animation mixers, render loops, timers, pyrotechnic triggers, microphone access or Govee commands. Route decisions are local show templates, **not** detected music segments or an AI cloud service.

Validation: `npm run test:v1055`, `npm run test:v1055:types`, `npm run verify:v1055:focused`, `npm run check:syntax`, `npm run check:architecture`, `node scripts/v959-source-preflight.cjs`. V931 and the existing Vercel production script run the V1055 regression, alongside the older tests. Full React/Next production build still requires the dependencies / configured CI environment.
