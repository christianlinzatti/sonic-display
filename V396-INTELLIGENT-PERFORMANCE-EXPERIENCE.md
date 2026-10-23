# V396 – Intelligent Performance Experience

Opt-in section-aware conductor for existing V387 show, V392 group roles, V393 vocal gestures, V394 festival lighting/cameras. Default off.

- **Settings**: Avatar tuning → V396 Intelligent Performance Experience, mode Aus/Ausgewogen/Expressiv, intensity 0–100.
- Uses the same track ID and milliseconds as existing music analysis. 300ms section hysteresis, track/seek resets; beat only accents a known drop, never invents one.
- Automatically enables existing show/festival/vocal/group overlays **only when their individual modes remain off**. If a user selected a non-off mode, that setting and its strength have precedence. Existing manually authored timeline/formation and vocal casting overrides still apply in the individual directors.
- Requires synchronized active lyrics for added vocal gesture coordination; never performs speaker ID, source separation, phoneme recognition or audio capture.
- No additional geometry, lasers, strobes, extra shadows or canvas resources. Performance tier influences the existing concert intensity.
- Pauses, track removal, reducedMotion, strength zero disable the orchestrator. Advanced show controls remain independently usable with V396 off.

## Verification

`npm run test:v396`, `npm run check:syntax`, `npm run verify:offline`, then on Windows after `npm install`: `npm run typecheck && npm run build`.
The production build needs all npm packages installed; the offline checks cannot establish that production compilation succeeds.
