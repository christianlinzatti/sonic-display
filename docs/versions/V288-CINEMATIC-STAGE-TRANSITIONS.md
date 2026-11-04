# V288 – Cinematic Stage Transitions

- Basiert auf V287 und verwendet den vorhandenen Smart Stage Director.
- Neuer, einzelner CSS-basierter Effekt mit bühnenabhängiger Farbe, zwei animierten Lichtkegeln, Lichtakzent bei Hook/Drop und optionalem subtilen Kamerafahrt-Eindruck durch animierte Licht-/Perspektivmaske.
- Die eigentliche 3D-Kamera bleibt unverändert; dadurch keine Beeinträchtigung von Avatar-Kamerasteuerung oder zusätzlicher WebGL-Canvas.
- Konfigurierbare Schalter in den Smart-Stage-Director-Einstellungen: filmische Übergänge, Kamerafahrt-Look und Drop-Lichtakzent.
- Existing transition-duration slider applies. Reduced Motion suppresses the effect.
- **Hinweis**: Es ist ein Screen-Space-Kameraeffekt, keine reale Veränderung der Three.js-Kamera.
- Tests: `npm run verify:offline`. Typecheck und vollständigen Build bitte lokal mit `npm run build` prüfen, sofern node_modules vorhanden.
