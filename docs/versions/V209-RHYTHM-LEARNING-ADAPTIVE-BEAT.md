# V209 – Rhythm Learning & Adaptive Beat Intelligence

Based on V208. Adds an opt-in, locally computed beat interval learner to the V199 pause-safe bar sequencer. Source: microphone-derived `AudioFeatures` only. No Spotify raw audio or exact song timestamps.

## Behavior
- Detect rising onset signals; suppress closely spaced and implausible kicks.
- Retain up to 16 accepted beat intervals; robust median and BPM plausibility filter.
- Apply bounded, confidence-weighted beat-phase correction; avoid backward jumps.
- Freeze transport while paused, reset rhythm calibration on detected phase transitions.
- Fallback to previous V199 transport unless explicitly enabled with sufficient confidence.
- Live diagnostics in Character & Motion Library, with enable/disable and confidence threshold.

## Validation
`npm run test:rhythm-v209`, `npm run check:syntax`, `npm run test:structure-v208`. Full production build requires installed npm dependencies.

## Limits
Heuristic microphone onset learning, not sample-accurate beat tracking. Longer gaps and rhythmically complex tracks may lower confidence. No persistence of microphone raw samples.
