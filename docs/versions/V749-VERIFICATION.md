# V749 – Verification (2026-10-30)

**Status:** Quellen- und isoliert typgeprüfter Buildkandidat; **keine Freigabe als vollständig produktionsverifizierter Build.**

## Bestanden

- `npm run test:v749`: **40.586** Tests/Checks mit 40.000 deterministischen Frame-Konfigurationen. Darunter Sänger-Zuordnung, Ensemble/Hook, Kick/Drop, Pausen, manuelle Übersteuerung, Blackout, Tier, Lyrics-Schutz, numerische Grenzen, Übergänge und UI-Wiring.
- `npm run test:v749:types`: `tsc` mit strikten Typen für den neuen reinen Planner.
- Regressionen: `test:v740` bis `test:v748` inkl. jeweiliger isolierter Typprüfungen; ältere Lichtregressionen `test:v542`, `test:v608`, `test:v621`, `test:v689`.
- `npm run check:syntax`: 1.051 TS/TSX-Module.
- `npm run check:architecture`: V749, 753 Referenzen.
- `npm run test:module-case`: 1.777 Quelldateipfade ohne reine Groß-/Kleinschreibungs-Konflikte.
- `npm run build`: Der neue Test ist in der Preflight-Kette eingebunden und besteht dort; danach stoppt die Abhängigkeitsprüfung vor dem Next.js-Compiler.

## Ausstehend / Blockiert

- `npm run typecheck` scheitert mit fehlenden Framework- und Node-Typdefinitionen (`next/server`, React, `@types/node` etc.). **Kein vollständiger Projekt-Typcheck.**
- `npm ci --offline --ignore-scripts --no-audit --no-fund` scheitert `ENOTCACHED`: `zustand-5.0.16.tgz` ist nicht vorhanden.
- `npm run build` stoppt bei `check:dependencies`, **0/18 Kernpaketen** verfügbar. Kein erfolgreicher Next.js-Produktionsbuild.
- Kein echter Browser-/GPU-/GLB-Test und keine pixelgenaue Licht-Lyrics-Prüfung.

## Lokal reproduzieren

```powershell
npm ci
npm run test:v749
npm run test:v749:types
npm run check:syntax
npm run check:architecture
npm run test:module-case
npm run typecheck
npm run build
```

`npm run verify:v749` führt zusätzlich die vollständige V748-Verifikationskette aus, bevor der neue Gesamtcheck und Build abgeschlossen werden.
