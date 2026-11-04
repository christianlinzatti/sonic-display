# V163 – Real-Time Performance Profiler & Bottleneck Detection

Die neue Performance-Diagnose zeigt CPU-Phasen für Choreografie, Motion, Rigging, Hand-IK, Foot-IK und Duo-Formation. Gleitende Stichproben (maximal 120 pro Phase) ergeben Mittelwert, P95 und Maximum. Das größte P95-Signal wird heuristisch als Hauptthread-Engpass hervorgehoben. Worker-Mittelwert und P95 werden daneben angezeigt.

**Wichtig:** Das Profiling erfasst nur synchronen JavaScript-Aufwand der gekennzeichneten Aufrufe. Es misst weder GPU-Zeit noch den gesamten JavaScript-Aufwand oder die vollständige Animationsmixer-Zeit. CPU-Zeiten und asynchrone Worker-Latenzen sind nicht additiv. Die Anzeige löst keine automatische Qualitätsverstellung aus. Die P95-Werte unterschiedlicher Phasen sind nicht zwingend über dieselben Frames aggregiert.

Tests: `npm run test:runtime-profiler`, `npm run verify:offline`, `npm run typecheck`, `npm run build`. Ohne installierte npm-Abhängigkeiten ist ein vollständiger Build nicht überprüfbar.
