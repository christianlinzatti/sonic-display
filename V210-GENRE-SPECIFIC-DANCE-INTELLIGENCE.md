# Sonic Display V210 – Genre-Specific Dance Intelligence 2.0

Built on V209. The deterministic heuristic ranks *installed* GLB clips by genre, names, beat intensity, song phase and allowed BPM range.

- Hardtekk: kick, stomp, footwork; Hardstyle: jump and punchy kicks.
- Techno: shuffle / groove / flow; Deutschrap: head nod / rap / bounce.
- Supported genre in motion library now includes `deutschrap`.
- Settings in the existing Smart Choreography Evolution panel: opt-in, manual genre override, style strength; persisted in `localStorage`.
- Existing automatic character motion selection uses ranking only with opt-in; manual sequence still takes precedence. V200/V201 generated suggestions use the same score.
- No automatic creation of animation frames or audio sample analysis. Tags and names are heuristics; missing suitable clips cannot be invented.
- Validation: `npm run test:genre-dance-v210`, `npm run check:syntax`, relevant regression tests. Full Next.js build requires dependencies.
