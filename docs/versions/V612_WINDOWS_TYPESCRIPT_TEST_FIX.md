# V612 – plattformunabhängiger TypeScript-Loader für Regressionstests

## Ausgangssituation

Der `npm run build`-Preflight scheiterte unter Windows in `tests/v562-advanced-facial-calibration-regression.cjs` mit `MODULE_NOT_FOUND`, weil einige Tests TypeScript über einen absoluten, Linux-spezifischen Pfad unter `/opt/nvm/` geladen haben.

## Änderung

- Alle 27 betroffenen `tests/*.cjs`-Dateien verwenden nun `require('./typescript-loader.cjs')` statt fest verdrahteter Installationspfade oder plattformspezifischer Suchschleifen.
- `tests/typescript-loader.cjs` lädt in erster Linie das lokal installierte Paket `typescript` (`npm install`), unabhängig von Windows/macOS/Linux.
- Der optionale Umgebungsvariablen-Override `TYPESCRIPT_PATH` bleibt erhalten.
- Wenn TypeScript fehlt, liefert der Loader einen konkreten Hinweis auf `npm install` beziehungsweise `npm ci`.
- Der Anwendungscode und die `package.json` bleiben gegenüber dem vorherigen V612-TypeScript-Fix unverändert.

## Prüfung

- `npm run test:smoke:v612`: PASS (V612, V597, V581, V582, V562, V572, V546, Architektur)
- `npm run check:syntax`: PASS (836 TS/TSX-Dateien)
- `node --check` für 497 Testskripte: PASS
- `node tests/v559-beat-vocal-portrait-regression.cjs`: PASS
- `node tests/v560-glb-portrait-regression.cjs`: PASS
- `node tests/v565-intelligent-dance-transitions-regression.cjs`: PASS

Ein vollständiger `next build` wurde hier nicht ausgeführt, weil die regulären npm-Projektabhängigkeiten nicht lokal installiert sind. Auf dem Entwicklungsrechner nach dem Entpacken `npm run build` ausführen.
