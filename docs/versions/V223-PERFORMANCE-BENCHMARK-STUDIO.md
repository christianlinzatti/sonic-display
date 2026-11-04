# V223 – Performance Benchmark Studio

- Auf Basis von V222, ohne zusätzliche Abfragen im WebGL-Renderloop.
- Manuell beschriftete, start-/stoppbare Messläufe mit Avatarzahl und automatisch übernommener Grafikstufe.
- Mindestens fünf aktive Messintervalle pro Lauf; Vergleich von FPS, Minimum, Frame-Zeit und langsamen Frames.
- Maximal acht Läufe im Arbeitsspeicher; Abbrechen und Löschen möglich. Keine persistente Datensammlung.
- Messwerte kommen aus V222 Performance History. Es handelt sich nicht um isolierte GPU- oder CPU-Benchmarks.
- Offline-Suite: `npm run verify:offline`; vollständiger Build bei installierten Abhängigkeiten `npm run verify`.
