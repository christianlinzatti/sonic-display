# Sonic Display V431 – Prüfnachweis

21. Oktober 2026. Ausgangspunkt ist das vollständige ZIP von V430.

## Erfolgreich hier ausgeführt

- `npm run test:v431` – bestanden: Szenenprojektions- und Override-Regeln, Track-Isolation, fehlerhafte Zeitstempel, fehlende Rollen/Avataranzahl, Auswahlgrenzen, begrenzter Zeilenausschnitt, exakte Editor-Anbindung und Nicht-Seeken.
- `tsc -p tests/tsconfig.v431-core.json` – bestanden: strenge TypeScript-Prüfung für V429/V430/V431-Rechenlogik inklusive V416-Abhängigkeiten.
- `npm run test:v430` und `npm run test:v429` – bestanden.
- `npm run test:v415`, `test:v416`, `test:v417`, `test:v418` bis `test:v426`, `test:v407` bis `test:v414` – bestanden als Einzelaufrufe (V412 ausdrücklich einschließlich Nullguard).
- `npm run check:syntax` – bestanden: 583 TS/TSX-Dateien.
- `npm run test:imports` – bestanden: 923 Projektdateien, 1.983 Importe.
- `npm run test:module-case` – bestanden: 923 Quelldateien ohne Groß-/Kleinschreibungs-Kollisionen.

## Nicht bestätigt

- `node scripts/build-preflight.cjs` **BLOCKED**: Im V430-Ausgangsarchiv fehlt `package-lock.json`; 16 von 17 npm-Paketen sind in dieser Laufzeit nicht verfügbar (`next`, `react`, `react-dom`, `three`, R3F u.a.).
- Daher `npx tsc --noEmit` und `npm run build` **nicht erfolgreich geprüft**. Keine Browser-/GPU-/Avatar-GLB-Vorschau oder visuelle Pixel-/Kamera-Bewegungs-Abnahme.
- Der gesamte kombinierte Regressionstest `verify:offline:fast` wurde hier nicht vollständig durchlaufen; die oben aufgeführten Einzeltests wurden ausdrücklich ausgeführt.

## Lokale Abschlussprüfung (Windows)

```powershell
npm install
npm run test:v431
npx tsc -p tests/tsconfig.v431-core.json
npm run check:syntax
npm run test:imports
npm run test:module-case
npx tsc --noEmit
npm run build
```

Ein bestandener isolierter Core-Test ist **kein Nachweis**, dass die komplette Next.js-App mit allen Dependencies und der Live-3D-Bühne produktionsreif gebaut wurde.
