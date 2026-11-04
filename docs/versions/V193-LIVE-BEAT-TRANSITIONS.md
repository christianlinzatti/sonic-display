# V193 – Live Transition Integration & Beat-Aware Dance Director

V192 transition profiles now affect live library-motion crossfades for the selected avatar. The live mixer uses the saved transition duration when switching between library clips. Beat sync waits for a detected kick-accent rising edge or a BPM-derived approximate bar boundary, with a two-second minimum cooldown. If BPM is unavailable, switching is immediate after cooldown. Existing choreography, timeline and manual clip selection remain unchanged. Settings update through browser storage events.

**Limits:** Kick detection is based on the existing `audio.kickAccentIntensity` field, not guaranteed Spotify audio access or exact beat timestamps. BPM grid uses local animation time and is approximate, not transport-clock synchronized. Crossfades still depend on compatible retargetable GLB clips. Full production build requires dependencies and a browser smoke test.
