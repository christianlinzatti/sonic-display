# V441 – Verification

Stand: 2026-10-21

## Nachvollziehbare Prüfungen

- `npm run test:v441`: PASS (Künstler-Credits, Solo/Duo, Songintro, Verse-Fokus, gemeinsame Hook, drei Modi, manuelle V416-Priorität, keine erfundenen Stimmen, UI-/3D-Quellcodeintegration), beinhaltet `tsc -p tests/tsconfig.v441-core.json --noEmit`.
- `npm run test:v440`: PASS.
- `npm run test:v439` bis `npm run test:v433`: PASS.
- `npm run test:v432` bis `npm run test:v429`: PASS.
- `npm run test:v426` bis `npm run test:v423`: PASS.
- `npm run check:syntax`: PASS, 603 TS-/TSX-Quelldateien.
- `npm run test:imports`: PASS, 954 Projektdateien und 2.092 Imports.
- `npm run test:module-case`: PASS, 954 Source-Dateien.
- Neue TSX-Komponente syntaktisch geprüft, aber kein vollständiger React-/Next.js-Typcheck in dieser Umgebung, da `node_modules` fehlen.
- ZIP-Integrität: nach Erstellung separat mit `ZipFile.testzip()` geprüft.

## Nicht bestätigt

- **Vollständiger Next.js-Produktions-Build** einschließlich Projekt-`npm run typecheck`.
- **Interaktiver WebGL-/Browser-Sichttest** mit Formationswechsel, starkem Camera-Zoom und unterschiedlichen echten GLB-/VRM-Avataren.
- UI-Kollisionen und Cross-Platform-Verhalten bei extrem langen Credits und mobilen Viewports.

## Lokal auf Windows

```powershell
npm install
npm run verify:v441
npm run typecheck
npm run build
npm run dev
```
