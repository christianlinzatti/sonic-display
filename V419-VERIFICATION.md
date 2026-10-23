# V419 – Verifikation

## In dieser Umgebung bestanden

- `npm run test:v419`: bestanden; Opt-in, Pausen, Reduced Motion, nur Zeilen-Timing, B/P/M-Lippenverschluss, isoliertes Mundtiming, stumme Begleitrolle, schnelle Wörter, deterministisches Scrubbing, globale Lip-Sync-Deaktivierung.
- `tsc -p tests/tsconfig.v419-core.json`: bestanden (`strict:true`, nur betroffene Kernmodule und bestehende Test-Stubs; **kein gesamter Next.js-Typcheck**).
- `npm run test:v400`, `v401`, `v402`, `v403`, `v405`, `v407` bis `v419`: alle erfolgreich.
- `npm run build:preflight`: vollständige V404–V419-Testkette plus Kamera-Hold bestanden. Danach durch fehlende npm-Abhängigkeiten BLOCKED.
- `npm run check:syntax`: 565 TS-/TSX-Dateien bestanden.
- `npm run test:imports`: 894 Projektdateien, 1.893 Imports bestanden.
- `npm run test:module-case`: 894 Projektdateien, keine Windows-Case-Kollisionen.

## Nicht hier verifiziert

Die Quelle besitzt in dieser Umgebung **kein** `node_modules` und **keine** `package-lock.json`; laut Preflight wurden nur 1/17 der notwendigen Pakete erkannt. Daher wurden der vollständige `npx tsc --noEmit` sowie `npm run build` **nicht** bestätigt. Es gab keinen Browser-Test mit GLTF-Avataren und Spotify-Musik. V419 ist eine Textschätzung, **keine reale Messung akustischer Phoneme oder Silben**.

Unter Windows prüfen:

```powershell
npm install
npx tsc --noEmit
npm run build
```
