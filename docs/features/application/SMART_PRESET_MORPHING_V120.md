# V120 – Smart Dance Preset Morphing

- Smoothstep easing across all six layer gains.
- Transition duration 0–12 seconds; stored in browser localStorage.
- Mid-transition interruption starts from currently interpolated weights.
- Auto-genre transitions and manual presets use the same engine.
- Manual slider changes cancel the current transition.
- Frame-based interpolation is clamped for long frame stalls.
- Does not modify original GLB animation clips.

Validation: `npm run check:syntax && npm run test:motion-presets && npm run test:motion-morph`
