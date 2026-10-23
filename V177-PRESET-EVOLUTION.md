# Sonic Display V177 — Lighting Preset Evolution & Auto-Tuning

Based on V176. Adds `lightingPresetEvolution.ts` with deterministic, genre-scoped proposal calculations using existing V175 feedback. Requires >=6 accept/reject votes; individual cue types need at least 3 votes before influencing a parameter. Each knob adjustment capped at ±12 percentage points, final values clipped to 0–1. No machine-learning model or cloud calls.

Use **Lichtstudio → Preset Evolution**: choose a genre in the existing generator, request a proposal, review before/after, optionally load it into the editor, and separately click **Preset speichern**. **Rückgängig (Editor)** restores the previous unsaved editor state. It does not revert a preset already saved.

All other features are retained. No real-browser, Pi GPU, or production build claimed without installed dependencies.
