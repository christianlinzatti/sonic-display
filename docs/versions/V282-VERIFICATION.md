# V282 – Prüfung und bekannte Grenzen

- `npm run verify:offline`: **PASS** am 16. Oktober 2026.
- Enthalten: Syntaxcheck (308 TypeScript-/TSX-Dateien), Versions-Regressionen V263–V282, 13 Bühnen-Themen-Checks, Bühnenlicht-Tests, Runtime-Struktur (564 Checks), Touch-Kiosk- und Multi-Avatar-Regressionstests.
- Bestehende historische Versionsprüfungen wurden von fixen Versionsstrings auf Mindestversionen umgestellt (die geprüften Funktionen bleiben Teil der Tests); der alte Touch-Kiosk-Check verwendet den aktuellen lazy geladenen Settings-Einstieg.
- `npm run build:preflight`: **BLOCKIERT**. Die Umgebung enthält keine installierten npm-Abhängigkeiten bzw. kein `package-lock.json`; ein vollständiger Next.js-Build und TypeScript-Typcheck können daher hier nicht bestätigt werden.
- Eine WebGL-Visualisierung und die Maus-/Touch-Interaktion wurden noch nicht im Browser ausgeführt. Nach `npm install`: `npm run verify`, anschließend die Stage-Modal-Interaktion im Browser testen.

Die 3D-Vorschau verwendet vorhandene `DynamicStage`-/`StageEnvironment`-Komponenten. Scheinwerfer-Lichtkegel und Nebel sind schlanke visuelle Näherungen. Die Beat-Demo ist synthetisch, keine Spotify-Audioanalyse.
