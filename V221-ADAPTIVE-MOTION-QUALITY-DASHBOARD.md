# V221 – Adaptive Motion Quality Dashboard

- In der vorhandenen Dance-Engine-Diagnose integriert; keine neuen Messungen im WebGL-Frame-Loop.
- FPS, mittlere Frame-Zeit, langsame Frames, Motion-Qualität (heuristisch), Animations-Hz, Grafik-DPR, CPU-Scheduler-Stufe und instrumentierte CPU-Phasen.
- Zustandsanzeige berücksichtigt fehlende Daten, hohe Frame-Last, Scheduler und Motion-Warnungen. Ausschließlich lesend, ohne Änderungen an Auto-Tuning, IK oder Beat-Synchronisierung.
- CPU-Gesamtauslastung in Prozent ist über die Browser-Messwerte nicht verlässlich verfügbar; gezeigt werden nur instrumentierte Phasen.
- Der globale Diagnose-Store repräsentiert bei mehreren Avataren die jeweils letzte Meldung, nicht die Summe aller Avatare.
- Offline-Regressionsprüfung: `node tests/v221-dashboard-regression.cjs`; gesamte Offline-Suite: `npm run verify:offline`.
- Vollständiger `next build` ist erst mit installierten npm-Abhängigkeiten verifizierbar.
