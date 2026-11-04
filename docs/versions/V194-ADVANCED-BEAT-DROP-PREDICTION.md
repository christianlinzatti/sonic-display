# V194 – Advanced Beat & Drop Prediction

The avatar library selection uses a stateful estimated music phase (verse/build/drop), replacing V193's single-frame kick threshold. It evaluates local normalized energy, bass, attack, kick accents and kick anticipation; trends are smoothed and phase changes require minimum residence time plus cooldown. Previously installed GLB clips are already preloaded by V191. Transition timing and durations still follow V193 and V192 live settings.

This is a **heuristic estimate**, not a Spotify-provided section prediction or a guaranteed ahead-of-time drop timestamp. The predictor is deliberately conservative; actual results depend on availability and fidelity of audio feature fields. No audio stream is accessed independently.

Validation: `npm run test:drop-prediction`, `npm run check:syntax`, then `npm run typecheck && npm run build` with installed dependencies.
