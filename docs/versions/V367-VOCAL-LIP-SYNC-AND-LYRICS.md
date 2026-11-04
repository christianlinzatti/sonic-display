# V367 – Vocal Lip Sync & Focus Karaoke

- 3D GLB avatar lip-sync using pre-existing viseme/mouth morph targets; jaw bone fallback. Procedural dancers get a physical animated mouth. Every dancer (including secondaries) uses the same Spotify playback time and lyrics offset. No new audio listeners or cloud service.
- Word timestamps produce bounded syllable/vowel-inspired articulation (Deutschrap-friendly), line-only timestamps use a lower-confidence approximation. Silence, unsynchronized lyrics and pause do not drive the jaw. **Not phoneme-accurate lip sync or source-separated vocal analysis.** Morph target names depend on the avatar model.
- Controls under avatar settings: enable lip sync, strength, source mode. Under lyrics settings: focus karaoke. Existing color, offset, accessibility and immersive options retained.
- Focus karaoke: a readable three-line window with now-playing focus, upcoming line, active word progress and calmer visual hierarchy. Reuses existing color palette and responsive layout.
- Verify `npm run test:v367`, `npm run typecheck`, `npm run build` after dependencies are installed.
