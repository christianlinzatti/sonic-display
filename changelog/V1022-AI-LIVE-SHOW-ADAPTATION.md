# V1022 – AI Live Show Adaptation

## Funktion
- Read-only, erklärbare Live-Regievorschau aus V1021-Genreprofilen und verifizierter V604/V763-Timeline.
- V896-Audioenergie ist nur mit aktuellem Track, Dauer, Songposition (±600 ms), mindestens drei gültigen Samples und 0..1 Messwerten gültig; relative Intensity-Korrektur −12 bis +10 Prozentpunkte.
- V826-Rendererfenster (≥12 Frames, verifiziert, spielend) begrenzen FX-Intensität bei gemessener Framebelastung; ohne Messung wird kein FPS-Zustand erfunden.
- Manuelle Regie, Pause, Seek, Blackout deaktivieren den Vorschlag; Lyrics und Bewegungsreduktion dominieren jeden Look.
- Kein neuer Netzverkehr, keine persistente Speicherung, keine zusätzlichen Kamera-, Bühnen-, Avatar- oder Govee-Kommandos.

## Qualität
- Tests: V1022-regression und isolierter TypeScript-Check, Vorgängertests V1010–V1021, pre-install GitHub CI und Vercel Regression.
- Alle ZIP-Workflows versioniert auf V1022; GitHub-Importer benötigt für das automatische Aktualisieren geschützter Workflows weiterhin einen Token mit `workflows`-Berechtigung.
- Vollständiger Node-24-Next.js-Produktionsbuild muss über GitHub Actions nach Import bestätigt werden.
