# V618 – Testbericht (27.10.2026)

## Erfolgreiche Prüfungen in der vorliegenden Umgebung

- `node tests/v618-full-body-performance-coordination-regression.cjs`: **54 Testgruppen**, 16.000 künstliche Frame-Samples, standbezogene Sicherheit, Grenzen und GLB-Quellintegration.
- `tsc -p tests/tsconfig.v618-core.json --noEmit`: **PASS**.
- `npm run test:smoke:v618`: **PASS**, einschließlich aller älteren verketteten V617/V616/V615/V614/V613/V612 Regressionen und Typ-Kernprüfungen.
- `npm run verify:v618`: **PASS**, einschließlich der Kontakt-/IK-Regressionen V596, V587, V494, V545 und der Gesichtstests V612.
- `node tests/check-source-syntax.cjs`: **PASS**, 842 TS/TSX-Quellen.
- `node tests/check-architecture.cjs`: **PASS**, 486 Code-Referenzen, 10 Abschnitte.

## Noch ausstehend

- Vollständiges `npx tsc --noEmit` und `npm run build` mit installierten Next.js-/React-/Three-Paketen: **hier nicht ausführbar**, weil `node_modules` fehlen.
- Reale GLB-/Spotify-Sichtprüfung inklusive Unterarm-/Schulterbewegung, Foot-IK, Voransichten, FPS und langer Songläufe.
- Raspberry-Pi-Hardwaretest (derzeit kein Raspberry Pi verfügbar).

## Empfohlene Windows-Abnahme

```powershell
npm run test:smoke:v618
npx tsc --noEmit
npm run build
```

Für sämtliche einzeln registrierten Tests: `npm run test:all`.
