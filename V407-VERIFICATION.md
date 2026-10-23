# Sonic Display V407 – Verification

Stand: 20. Oktober 2026

## Erfolgreich überprüft

- `npm run test:v407`: erfolgreich. Deckt Kick-/Snare-Trennung, Verse/Hook-Gesten, Mikrofon-Provenienz, gedämpfte Bewegung, Background-Rollen, deaktivierte Gesten/Choreografie-Priorität, Pausen, Instrumentalabschnitte, Bounding und beide Renderer ab.
- `node scripts/run-regression-suite-v404.cjs`: **158 isolierte Testausführungen bestanden**, einschließlich V403/V404/V405/V406/V407 und historischen Modulen.
- `node tests/v404-import-integrity-regression.cjs`: erfolgreich; 858 Projektdateien, 1.807 Imports kontrolliert.
- `node tests/module-case-regression.cjs`: erfolgreich; keine kollidierenden Modulnamen auf Windows.
- `node tests/check-source-syntax.cjs`: erfolgreich; 546 TS-/TSX-Dateien ohne Parserfehler.
- `node scripts/production-doctor-v403.cjs`: 546 TS-/TSX-Quelldateien, 1.545 lokale Imports, 0 ungelöste Imports, keine Pflichtdatei fehlt.
- `npm run build` verwendet jetzt den npm-Lifecycle `prebuild`, um die kritischen Regressionstests vor dem Next.js-Build auszuführen; `npm run verify` führt die historische Regression, Typecheck und Produktions-Build inklusive Preflight aus.

## Umweltbedingte Grenzen

- Vollständiger Next.js-/Webpack-Build **nicht bestätigt**, weil in der Prüfungsumgebung 16 von 17 npm-Direktabhängigkeiten fehlen. Entsprechend scheitert `npm run build:preflight` erst beim Dependency-Check mit dem klaren Hinweis, vorher `npm install` auszuführen.
- `tsc --noEmit` wurde versucht, konnte aber mangels React/Three.js/Next.js und zugehöriger `@types` nicht erfolgreich abgeschlossen werden. Für die neue Moduldatei `rapRhythmPerformanceV407.ts` wurden dabei keine eigenen TypeScript-Fehler gemeldet. Diese Beobachtung ist **kein** Ersatz für einen erfolgreichen vollständigen Typecheck.
- Browser-GPU-Tests mit echten GLB-Modellen, echte Song-/Mikrofon-Latenz sowie optische Sichtprüfung sind noch erforderlich.

## Auf dem Windows-Rechner

```powershell
npm install
npm run verify
```

Alternativ schneller:

```powershell
npm run test:v407
npm run build
```

`npm run build` führt die Preflight-Tests automatisch aus; die reguläre Offline-Gesamtsuite bleibt unter `npm run verify` aktiv.
