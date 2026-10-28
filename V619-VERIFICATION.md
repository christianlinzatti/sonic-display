# V619 – Verifikation (27.10.2026)

## Erfolgreiche Offline-Prüfungen

- `npm run test:v619`: PASS – 34 Regressionstest-Gruppen, 20.000 simulierte Wortzeitpunkte, Karaoke-Füllstand bleibt unverändert, Seek/Pause/Reduced Motion/fehlende Timings/Hook-Authentizität sowie DOM- und CSS-Integration.
- `npm run test:v619:types`: PASS – TypeScript-Kernkompilation V619.
- `npm run test:smoke:v619`: PASS – inklusive V618 bis V612, älterer V598- und V606-Lyricsregressionen, Syntax-/Architekturcheck.
- `npm run test:v549`: PASS – 86.304 Zeitpunkte (aus erweiterter Verifikation).
- `npm run test:v541`: PASS – 14.208 Wortzeitpunkte (aus erweiterter Verifikation).
- `npm run test:v477`: PASS – Zeitmarken, Lesbarkeit und 3D-Schutz (aus erweiterter Verifikation).
- `npm run check:syntax`: PASS – 843 TS-/TSX-Quelldateien.
- `npm run check:architecture`: PASS – 489 geprüfte Codeverweise, 10 Dokumentationskapitel.

Die lange erweiterte `npm run verify:v619`-Gesamtrunde hat hier ein Ausführungslimit erreicht, nachdem ihre Regressionstests einschließlich V477 erfolgreich waren; der danach einzeln ausgeführte letzte Syntax- und Architekturcheck war ebenfalls erfolgreich. Es liegt deshalb **keine erfolgreiche vollständige Ausführung des einen verify:v619-Kommandos** vor.

## Noch auf Zielhardware erforderlich

- `npx tsc --noEmit` und `npm run build` mit lokal installierten Projektabhängigkeiten (hier nicht vorhanden).
- Tatsächlicher 10-Zoll-Browser-/GLB-Vergleich und reale Lesbarkeit bei verschiedenen Songs. Die Testdaten sind synthetisch und beweisen keine optische Verbesserung oder höhere FPS.

## Windows-Befehle

```powershell
npm install
npm run test:smoke:v619
npm run verify:v619
npx tsc --noEmit
npm run build
```
