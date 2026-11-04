# V794 – Prüfbericht

Datum: 31.10.2026. Grundlage: vollständiges Projekt-ZIP V793.

## Bestanden

- `npm run test:v794`: Build→Peak-Nachbarschaft, Neben-Hook/Hauptdrop, Abblendung vor dem Drop, begrenzte Wirkung, kein Effekt in Vers/Break, deterministische Seek-/Replay-Werte, keine fremde Track-ID, Dauer oder Scene; manuelle Dance-/Kamera-/Lichtpriorität und Lyrics-Schutz. Komponentenverkabelung als statischer Vertrag geprüft.
- `npm run test:v794:types`: strenger, isolierter TypeScript-Check des neuen deterministischen Planers.
- `npm run test:v793`, `npm run test:v793:types`, `npm run test:v792`, `npm run test:v792:types`, `npm run test:v791`, `npm run test:v791:types`, `npm run test:v790`, `npm run test:v790:types`.
- `npm run test:v789`, `npm run test:v788`, `npm run test:v787`, `npm run test:v785`, `npm run test:v784`.
- Direkt ausgeführte und bestandene Regressionen `test:v749`, `test:v670`, `test:v609`, `test:v608`, `test:v761`, `test:v679`, `test:v681` (bestehende Licht-, Qualitäts-, Kamera- und Songregie).
- `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`: Projektsyntax, Referenzen, Windows-Dateinamenkollisionen, Versionierungsstand.

## Nicht vollständig geprüft

- `npm ci --offline` schlug mit `ENOTCACHED` für `zustand-5.0.16.tgz` fehl. Daher konnten **vollständiger** `npm run typecheck`, `npm run build` und reale WebGL-/GPU-Tests nicht verifiziert werden. Kein positives Build-Versprechen.
- Die längere `test:v762`-Regressionsprüfung wurde durch das verfügbare Laufzeitlimit unterbrochen; daraus folgt weder ein Bestehen noch ein Fehlernachweis.
- Visuelle Wirkung unter realem Browser mit GLB-Avataren, 10-Zoll-Framing, Licht-Timeline und Lyrics muss noch am Gerät geprüft werden.

## Lokale Freigabe

```
npm ci
npm run test:v794
npm run test:v794:types
npm run check:syntax
npm run check:architecture
npm run test:module-case
npm run typecheck
npm run build
```

Wenn möglich, `npm run test:v762` zusätzlich separat ausführen. Danach 1–4 GLBs mit Songwechsel, Seek, Hook/Drop, gesetzten Blackouts und geschützten Lyrics im Browser prüfen.
