# V421 – Prüfbericht (20. Oktober 2026)

**Quellbasis:** Sonic Display V420 (vollständiger Projektbaum) mit V421 Articulation Comparison Studio. Paketversion `0.1.0-v421`.

## In dieser Umgebung erfolgreich ausgeführt

- `npm run test:v421`: A/B-Identität, identische Vocal-Engine und Zeitbasis, V419-Automatik versus V420-Keyframes, geschützter Bilabialverschluss, deterministische Samples, wort- und songgebundene Korrekturen, fehlerhafte Zeitstempel, Zeitversatz, reduzierte Bewegung, Inaktivität und UI-Anbindung.
- `tsc -p tests/tsconfig.v421-core.json`: strenger TypeScript-Check der neuen Vergleichs-Engine und ihrer importierten Vocal-Module.
- Alle 18 direkten Versions-Regressionsprüfungen **V404–V421** einzeln erfolgreich, einschließlich V420.
- Zusätzlich 18 ausgewählte historische Prüfungen (V356, V359, V366, V372, V373, V374, V383, V384, V385, V390, V392, V393, V397, V399, V400, V401, V402, V403) erfolgreich.
- `npm run check:syntax`: 569 TypeScript-/TSX-Quelldateien, keine Parser-Fehler.
- `npm run test:imports`: 900 Projektdateien / 1910 Imports geprüft.
- `npm run test:module-case`: 900 Dateien, keine Windows-Groß-/Kleinschreibungskollision.
- ZIP-Integrität: beim Verpacken separat geprüft.

## Nicht vollständig nachgewiesen

- Ein umfassender historischer `npm run build:preflight`-Durchlauf erreichte die V404-Prüfungen, wurde aber durch das Laufzeitlimit dieser Umgebung unterbrochen. Alle V404–V421-Tests wurden zusätzlich einzeln bestanden. Der Preflight-Gesamtlauf gilt deshalb **nicht** als vollständig abgeschlossen.
- Die direkte Abhängigkeitsprüfung `node scripts/build-preflight.cjs` meldete fehlendes `package-lock.json` und 16 nicht installierte direkte npm-Pakete. Daher wurden vollständiger `npx tsc --noEmit`, `npm run build` sowie Browser-/Spotify-/GLB-End-to-End-Tests **hier nicht durchgeführt**.
- Die A/B-Kurve ist ein Vergleich von berechneten Mundformen; keine Messung der akustischen oder visuellen Lip-Sync-Güte.

## Windows-Prüfung

```powershell
npm install
npm run test:v421
npx tsc --noEmit
npm run build
```

`npm install` erzeugt bei fehlender Lockdatei eine neue `package-lock.json`; danach kann diese in Git aufgenommen werden.
