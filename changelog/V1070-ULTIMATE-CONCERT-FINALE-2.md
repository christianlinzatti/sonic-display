# V1070 · Ultimate Concert Finale 2.0

An opt-in, deterministic **four-phase final 12%** score shared between the
existing Arena360 decor stage and existing avatar/camera choreography.
Phases: `gather` (0.88–0.925), `rise` (0.925–0.965), `climax`
(0.965–0.992), `bow` (0.992–1.0). The central avatar floor is untouched.

Attenuation only: V1066 outer petals, V1067 floating satellites, V1068
holograms, V1057 lasers, V1059 LED wall and optional V1041 automatic cast and
camera requests. Existing manual settings, foot IK, lyric roles, actual beat/
drop evidence, device safety limits and optional toggle state stay authoritative.
No real Govee/pyro/laser control, no independent frame loop or extra GPU meshes.

Enabled explicitly from AI Show Designer; off by default. Fails closed if
track clock invalid, no verified show plan, paused, motion reduction, low GPU,
wrong show chapter, invalid strength or all relevant channels disabled.

Checks: npm run test:v1070, npm run test:v1070:types, npm run verify:v1070:focused,
source syntax/architecture, preflight, ZIP importer. Complete Next.js CI
and Playwright require a GitHub upload.
