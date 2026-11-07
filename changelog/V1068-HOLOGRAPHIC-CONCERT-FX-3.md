# V1068 – Holographic Concert FX 3.0

Opt-in cinematic hologram projections using the EXISTING V1039 portal rings and crystals,
plus one instanced 2D performer-silhouette batch (max 9 silhouettes, balanced/high tier).
Six authored V1040 looks: awakening, reflection, vortex, duet, breath and finale.
When V1066/V1067 is active, its normalized phase may synchronize hologram motion.
These are world-fixed visual decorations, not additional artists, not holographic hardware
and not detected live vocal or song events. No new clocks, audio polling, network, hardware
commands, Govee or camera ownership. Manual hologram patterns win. Low-tier, pause,
Reduced Motion, missing show, unsafe time and disabled holograms fail closed.

Bounds: radial <= 5cm; vertical <= 9cm; yaw <= .095rad; silhouette alpha and ring
brightness remain under the existing V1039 cap. One additional instanced draw call
only when V1068 has a valid cue at balanced/high graphics quality. Defaults OFF.

Tests: `npm run test:v1068`, `npm run test:v1068:types`,
`npm run verify:v1068:focused`, `node scripts/v959-source-preflight.cjs`.
Full Next.js / Playwright validation on GitHub after importing release ZIP.
