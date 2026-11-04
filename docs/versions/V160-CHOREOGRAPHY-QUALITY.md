# V160 – Automatic Choreography Quality Optimizer

- Deterministische statische Timeline-Diagnose: Clip-Lücken, starke Überlappungen, Übergänge, Playback-Speed, Keyframes und Beat-Raster.
- Qualitätswert (heuristisch) und verständliche Verbesserungshinweise.
- Optionale Vorschau, sanfte Korrektur extrem kurzer Fades, ausdrückliches Übernehmen oder Verwerfen.
- Keine Änderungen an GLB-Clips oder IK-Solvern und keine automatischen Änderungen ohne Bestätigung.
- Echte Fußrutsch- und Handkontaktmessungen sind weiterhin Aufgaben der Laufzeit-Diagnose V157, nicht dieser statischen Analyse.

Prüfen: `npm run test:choreography-quality && npm run verify:offline && npm run build`
