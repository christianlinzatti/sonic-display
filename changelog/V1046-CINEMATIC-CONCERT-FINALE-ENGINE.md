# V1046 – Cinematic Concert Finale Engine

**Four-stage virtual finale** (gather → rise → climax → bow) orchestrated by the existing
V1040 *authored* 360° show template in the last 12% of the currently playing track.

- New **360° paper confetti** uses one instanced mesh (≤96 pieces high tier, ≤48 balanced, none low).
  It animates based on playback position, so seeks do not cause an independent unsynchronized clock.
- New **bass shockwave ring** uses one mesh. A real strong detected beat **rising edge** and
  sufficient audio strength are mandatory. A 1.45-second cooldown prevents retriggering.
  No strobe, rapid flash, physical laser or device commands are added.
- Existing virtual lasers receive a capped accent only when their previous enable flags remain on.
  The rotating stage gets a tiny glow scale accent, with Reduced Motion and low-tier gates.
- Existing V1044 phone audience receives a gentle accent only when that orchestra is itself active.
  Manual phone modes remain authoritative. Existing V1041 avatar formation gains a bounded,
  optional climactic unison accent; manually-directed rigs, duo performances, and GLB clips win.
- Toggle under AI Show Designer → V1046 Cinematic Concert Finale Engine. Defaults **OFF**.
  Strength 0–80%; no extra microphone, network request, persistent timer or light source.
- Pure bounded V1046 planner, regression tests, strict isolated TypeScript check and
  real CI/Next build gates on GitHub/Vercel. Existing V1031–V1045 tests preserved.

Verify: `npm run verify:v1046:focused`. Full CI: `npm run typecheck && npm run build:next`.
Distribution: complete-source ZIP, excluding nested release archives and generated files.
