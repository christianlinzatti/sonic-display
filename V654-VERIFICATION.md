# V654 – Prüfprotokoll (28. Oktober 2026)

## Erfolgreich in dieser Umgebung

- `npm run test:v654`: 15 Gruppen und 25.000 deterministische Zeitpunkte.
- `npm run test:v654:types`: isolierter TypeScript-Check erfolgreich.
- `npm run test:smoke:v654`: aktuelle Smoke-Kette einschließlich V653, V652, V651 und älterer Regressionen erfolgreich.
- `node tests/v600-ultimate-concert-director-regression.cjs`: 50 Gruppen und 18.000 Zeitpunkte.
- `node tests/v604-full-song-dramaturgy-regression.cjs`: 65 Gruppen und 40.000 Zeitpunkte.
- `node tests/v609-seamless-concert-transitions-regression.cjs`: 46 Gruppen und 30.000 Zeitpunkte.
- `npm run test:v611`, `npm run test:v613`, `npm run test:v633`: bestanden.
- `npm run test:module-case`: keine Windows-Dateinamenkollisionen.
- `npm run check:test-types`: isolierte Testtypdeklarationen erfolgreich geschützt.
- `npm run check:syntax`, `npm run check:architecture`: bestanden.

## Noch nicht bestätigt

- Die historischen Gesamtsuiten `npm run verify:offline:fast` und `node scripts/run-regression-suite-v404.cjs` wurden durch das Ausführungslimit unterbrochen. Bisherige durchlaufene Tests hatten keinen neuen Fehler.
- `npm run typecheck` über das komplette Next.js-/React-Projekt und `npm run build` erfordern installierte Abhängigkeiten; diese liegen in der hier verfügbaren Laufzeit nicht vor. **Keine vollständige Build-Freigabe** ohne erfolgreiche CI-Prüfung auf Windows und Ubuntu.
- Echter Browser-Test mit GLB-Avataren, Lyrics-Überlagerungen und längeren Konzerten bleibt ausständig.

## Release-Check lokal

```powershell
npm run verify
```

Ein erfolgreicher lokaler Build und GitHub-Actions-Lauf auf Windows/Ubuntu bestätigen anschließend die Produktionsfreigabe.
