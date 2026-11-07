# V1080 · Laser Show Experience 5.0

## New
- Three-dimensional virtual formations (fan, tunnel, helix and crown) across all seven authored show chapters.
- Bounded observed-beat accents; template chapters alone never trigger a drop.
- The existing V1036 fan and V1039 architecture instanced rays are reused, without adding geometry batches, spotlights, external API calls or Govee/laser hardware controls.
- Explicit manual laser pattern selection and reduced-motion, pause, low quality, missing timing, and inactive director gates take priority.
- Opt-in through **V1057 Intelligent Laser Director** in the 360° Show Designer; disable it to restore legacy visuals.

## Validation
- `npm run test:v1080`
- `npm run test:v1080:types`
- V1080 included in Vercel and CI production gates, with Windows and Ubuntu matrix.
- V1080 inherits the existing user-facing GPU controls and performance tiers.

## Note
These are simulated visuals, not physical laser or pyrotechnic controls. Show chapters are arrangements, not detected song structure. Pulse accents require measured beat confidence.
