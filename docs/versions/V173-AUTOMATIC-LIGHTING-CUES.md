# Sonic Display V173 – Automatic Lighting Cue Generator & Timeline Sync

Based on V172, preserving all previously implemented features.

## Workflow

Open **Lichtstudio** in the Avatar view while playing a Spotify track. In **Automatische Lichtshow**, choose an estimated BPM, phrase length, energy, and genre. Use **Lichtshow generieren** to preview bounded beat-/phrase-aligned cues. Select individual proposals and choose **Ausgewählte Cues übernehmen** to add them to the unsaved edit buffer. **Timeline speichern** is still required to persist the track-specific lightshow. **Vorschläge verwerfen** never changes the user's stored cues.

Generation is deterministic and client-side. Song position/duration establishes the timeline; the estimated BPM is user-set in this release. No streaming audio is downloaded or analyzed offline. Predicted "drops" are simply musical phrase boundaries; none are ground-truth drop positions. The generator limits proposals to 120, sanitizes cues, and ignores duplicates of the same kind near existing manual cues (100 ms quantization). Strobes are opt-in and still follow reduced-motion behavior at playback time.

## Regression and build

Run `npm run test:auto-light-cues`, `npm run verify:offline`, `npm run typecheck`, and `npm run build`. A complete build requires the dependencies from `npm install`, which may not be present in an offline sandbox. Verify display timing against actual tracks and the target Raspberry Pi hardware before considering the release production-tested.
