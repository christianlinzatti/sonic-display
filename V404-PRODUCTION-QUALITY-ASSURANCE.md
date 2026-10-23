# Sonic Display V404 – Production Stability & Quality Assurance

Basis: **V403 mit Camera-Case-Hotfix sowie Camera-Hold- und CSS-Hotfix**. Alle bestehenden Anwendungsfunktionen bleiben erhalten.

## Neue automatisierte Tests

- **Kamera** (`tests/v404-camera-regression.cjs`): Hold-Dauer 450–2400 ms mit 1150-ms-Fallback, Kamera-Positionen, Lyrics-Schonung, Songwechsel, Pause, reduzierter Bewegung und verfügbare Avatar-Slots.
- **Lyrics** (`tests/v404-lyrics-regression.cjs`): Spotify-IDs, synchronisierte und unsynchronisierte Lyrics, Zeitstempelreihenfolge, gesungene Wörter, Lücken und Pausen. Unsynced-Text erzeugt keine erfundene Mundanimation.
- **Lippensynchronisation** (`tests/v404-lipsync-regression.cjs`): Deutschrap-Wortanfänge (B/M/P), Instrumentalteile, Lücken, reduzierte Bewegung, manuell zugewiesene Sänger, deterministisches Seek-Verhalten und numerisch gültige Gesichtsparameter.
- **Modul- und Importintegrität** (`tests/v404-import-integrity-regression.cjs`, `scripts/source-integrity-v404.cjs`): eindeutige TS/TSX-Modulnamen, korrekte Schreibweise aller lokalen Importpfade und vorhandene Module; Tests mit absichtlich falschen Referenzen beweisen, dass die Prüfung tatsächlich Fehler findet.

Die Tests verwenden echte Produktionsfunktionen und deterministische Eingaben. Reale Spotify-Netzwerkaufrufe, Browser-GPU-Performance und visuelle Renderings werden durch diese Unit-Tests **nicht** abgedeckt.

## Befehle

| Befehl | Aufgabe |
|---|---|
| `npm run test:v404` | Neue gezielte V404-Tests + Modulnamencheck; offline nutzbar mit TypeScript-Installation |
| `npm run test:quality:smoke` | Kamera-, Lyrics- und Lip-Sync-Verhalten testen |
| `npm run test:imports` | Gesamte lokale TS/TSX-Importstruktur auf Windows/Linux-Konsistenz prüfen |
| `npm run doctor:quality` | Importstruktur und vorhandene V403-Produktionsdiagnose prüfen |
| `npm run build` | **Neue V404-Prüfungen vorab**, danach Next.js-Produktionsbuild |
| `npm run verify:offline` | Traditioneller vollständiger npm-Regressionslauf; benötigt TypeScript |
| `npm run verify:offline:fast` | Dieselben Tests in separaten Node-Prozessen, aber ohne npm-Startkosten pro Test |
| `npm run verify` | Schneller vollständiger Offline-Regressionslauf, Preflight, Typecheck und finaler Next.js-Build |

Für eine frische Installation: `npm install`, danach `npm run verify`.

## CI

`.github/workflows/production-quality-v404.yml` prüft Pushes, Pull Requests und manuelle Starts unter **Windows und Ubuntu** mit Node 22. Da das bisherige Projekt keinen `package-lock.json` enthält, wird vorerst `npm install` statt `npm ci` verwendet. Ein Lockfile zur Reproduzierbarkeit ist für ein späteres Release empfohlen.

## Grenzen der Prüfung

V404 fügt produktionsnahe Tests und Release-Schutz hinzu; es ändert **keine** laufende Gesichtserkennung, Lyrics-Lizenzierung oder GPU-Renderinglogik. `transpileModule` in den Offline-Tests ist *kein* vollständiger TypeScript-Typcheck. Dafür sind `npm run typecheck` und `npm run build` mit lokal installierten Abhängigkeiten erforderlich.
