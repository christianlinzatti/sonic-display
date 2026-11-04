# V617 – Test- und Prüfbericht (27.10.2026)

Basis V616, inklusive V612-TypeScript- und Windows-Portable-Testkorrekturen.

- `npm run test:v617`: **PASS** – 41 Gruppen und 16.000 zeitbasierte Gesichts-Samples (statische Regression, keine echten GLB-Aufnahmen).
- `npm run test:v617:types`: **PASS** – TypeScript-Kernprüfung mit lokalem TypeScript.
- `npm run test:smoke:v617`: **PASS** – vollständige geschachtelte V616-/V615-/V614-/V613-/V612-Kette und V581, V572 sowie Syntax-/Architekturprüfung.
- `npm run test:v561`, `test:v566`, `test:v597`, `test:v546`, `test:v599`, `test:v616`: **PASS** – zusätzliche benachbarte GLB-, Sängerrollen-, Lyrics-, Mund- und Duett-Regressionen.
- `node tests/check-source-syntax.cjs`: **PASS** – 841 TS/TSX-Dateien.
- `node tests/check-architecture.cjs`: **PASS** – 483 referenzierte Code-Dateien, 10 Architekturabschnitte.

**Kompatibilitätskorrekturen für ältere Regressionstests:** V616 prüft eine Versionsuntergrenze statt auf eine fest codierte V616 zu bestehen; V572 prüft die jetzt um V617 erweiterte exponentielle Glättung weiterhin explizit. Keine Tests wurden deaktiviert.

**Nicht durchgeführt / nicht nachgewiesen:** vollständiger Next.js-`npm run build`, globaler TypeScript-Typcheck und echte WebGL-/GLB-/Spotify-Sichtprüfung. In der bereitgestellten Umgebung liegt kein Projekt-`node_modules` vor. Die 16.000 Samples sind reine Unit-/Regressionstests und keine echte Audio-Phonem-Analyse.

Für Windows im Projektverzeichnis:

```powershell
npm run test:smoke:v617
npx tsc --noEmit
npm run build
```
