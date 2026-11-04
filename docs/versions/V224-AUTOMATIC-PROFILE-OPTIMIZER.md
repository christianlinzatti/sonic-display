# Sonic Display V224 – Automatic Benchmark Profile Optimizer

Der bereits bestehende automatische High/Balanced/Low-Benchmark wurde verbessert, nicht dupliziert.

- Reine, testbare Empfehlungslogik in `components/visualizer/benchmarkOptimizer.ts`.
- Empfiehlt die **höchste** Stufe, die mindestens 55 FPS und weniger als 10 % langsame Frames erreicht.
- Bei Nichterreichen der Ziele: konservative Auswahl anhand der Rate langsamer Frames, danach FPS; ausdrücklich **kein** behauptetes Erreichen der Ziel-FPS.
- Unvollständige, ungültige oder zu dünne Messungen ergeben keine Empfehlung.
- Ergebnisse bleiben gerätespezifisch und sind von Szene, Auflösung und Avatar-/Lyrics-Kombination abhängig.
- Die bisherige Qualitätseinstellung wird nach dem Benchmark wiederhergestellt; ein Benchmarkprofil wird nur über den bestehenden expliziten Speichern-Button gespeichert.
- Der Benchmark nutzt vorhandene Messwerte; keine zusätzlichen GPU-/CPU-Zähler im Renderloop.

Prüfen: `npm run verify:offline`; vollständiger Build: `npm install && npm run verify`.
