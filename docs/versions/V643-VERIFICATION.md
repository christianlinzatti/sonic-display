# Sonic Display V643 – Verifikationsprotokoll

## Quellstand

Version `0.1.0-v643` auf Basis V642. Neue Dateien:
`components/visualizer/vocalStemAnalysisV643.ts`,
`components/visualizer/VocalStemLabV643.tsx`,
`tests/v643-vocal-stem-analysis-regression.cjs`,
`tests/tsconfig.v643-core.json`.
Die Oberfläche ist in `components/SettingsPanel.tsx` eingebunden.

## Erfolgreiche Prüfungen

- `npm run test:v643`: **PASS**, 84 Regressionstest-Gruppen und 12.000 simulierte Samplepositionen (nach finaler Stereoabsicherung erneut ausgeführt).
- `npm run test:v643:types`: **PASS**, gezielte TypeScript-Kernprüfung (erneut ausgeführt).
- `npm run test:smoke:v643`: **PASS**, kompletter früherer Lauf (Exitcode 0); die letzte kombinierte Wiederholung wurde durch eine Zeitbegrenzung vor ihrem Ende abgebrochen. Nach der anschließenden Korrektur eines älteren Test-Skript-Checks besteht dessen `npm run test:v616` separat wieder.
- `npm run verify:v643`: **PASS**, späterer vollständiger Prüflauf (Exitcode 0); zusätzlich u.a. ältere V642, V641, V640, V639, V638, V631, V632, V623, V619, V597, V567, V423, V420, V419, V415 und V384 Tests.
- `npm run check:syntax`: **PASS**, 870 TS/TSX-Quelldateien (nach letzter Änderung erneut ausgeführt).
- `npm run check:architecture`: **PASS**, 521 aktuelle Referenzen (nach letzter Änderung erneut ausgeführt).
- Der alte V616-Smoke-Pfad-Test betrachtet jetzt auch `build:preflight` als Skriptkante. Nur der Test wurde angepasst; keine Änderung an Vocal-/Tanz-Logik.

## Nicht abgeschlossen

- Next.js-Produktionsbuild: **NICHT ERFOLGREICH GETESTET**, da lokale Node-Abhängigkeiten nicht installiert sind. `npm --ignore-scripts run build` endet mit `sh: 1: next: not found`. Ein `npm run build`-Versuch lief zuvor in ältere Prebuild-Tests, wurde aber durch das Zeitlimit beendet.
- Vollständiges `npx tsc --noEmit` mit allen React/Next-Dependencies: nicht durchgeführt bzw. nicht als PASS nachgewiesen. Nur V643-Kern-Typprüfung bestanden.
- Echte Browser-Dekodierung, tatsächliche Signalgenauigkeit, mehrere importierte GLB-Avatare und 10-Zoll-Display sind noch nicht visuell/messtechnisch geprüft.
- Die Analyse beweist keine korrekte Quelletrennung, Sängeridentität, Phonemzeiten oder fehlerfreie Lippensynchronisation.

## Datenschutz, Limitationen, Schnittstellen

- Nur freiwillig bereitgestelltes, als bereits isoliert deklariertes Vocal-Audio; kein Abgriff des Spotify-Audiostreams, keine automatische Stem-Separation, kein Upload, keine dauerhafte Speicherung von PCM oder automatische Änderungen am Live-Mundrig.
- Maximal vier manuelle Sänger-Slots, 80-MB-Dateigrenze, höchstens 720 Sekunden analysierte Audiozeit, höchstens zwei Audiokanäle und insgesamt maximal 256 MiB dekodierte Kanalbytes. Die Song-ID und die Laufzeit werden für Importe und Analysen überprüft.
- Die Kanalenergie wird getrennt bewertet, um Auslöschung bei gegenphasigem Stereo zu vermeiden.
- Eine periodische Region ist kein erkannter Sänger und kein Phonem; Nutzerkennzeichnung als Stem ist keine nachgewiesene Quellenisolierung.

## Lokale Abnahme (Windows)

```powershell
npm install
npm run test:smoke:v643
npm run verify:v643
npx tsc --noEmit
npm run build
```
