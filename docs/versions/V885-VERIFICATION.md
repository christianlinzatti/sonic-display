# Sonic Display V885 – Verifikationsprotokoll (03.11.2026)

## Erfolgreich ausgeführt

- `npm run test:v885` – **61/61** neue Regressionen bestanden. Umfasst
  V604-Timeline-Verifikation, Genre-Paletten, Crossfades, Quellen-/Song-/Zeit-Sicherheit,
  Schutz für Blackouts, Seek, Pause, Reduced Motion, Low-Tier, Lyrics,
  manuelle Lichtprioritäten, Bridge-/Snapshot-Integration, CSS und JSON-Export.
- `npm run test:v885:types` – isolierte strenge TypeScript-Prüfung erfolgreich.
- `npm run test:v885:ui-types` – isolierte TS/JSX-Prüfung erfolgreich.
- `npm run verify:v885:focused` – **erfolgreich**; schließt frühere V884 (53/53),
  V883 (54/54), V882 (35/35), V881 (40/40) und V880 (44/44) ein, plus
  relevante ältere Konzert-, Lyrics-, Bühnen-, Crowd- und Performance-Tests.
- `npm run test:module-case` – **2.206** Quellen ohne case-insensitive
  Dateinamenkonflikte.
- `npm run check:syntax` – **1.290** TS/TSX-Quellen erfolgreich geprüft.
- `npm run check:architecture` – bestanden, Versionsstand 0.1.0-v885.
- `package.json` / `package-lock.json` synchron auf V885; V885-Tests in
  `prebuild`, `build:preflight`, `verify:v885:focused` und der Windows-/Linux-CI.

## Fehlende Freigaben und technische Grenzen

- `npm ci --offline --ignore-scripts --no-audit --no-fund` – **Exit 1**:
  `zustand@5.0.16` nicht im Offline-Cache (`ENOTCACHED`).
- `npm ci` mit Online-Versuch – **Exit 1**: Registry-Lookups `EAI_AGAIN`,
  npm meldet `Exit handler never called!`. Keine vollständige Installation.
- `npm run typecheck` – **Exit 2**: Projektweite Typisierung mangels
  installierter React-/Next.js-/Three- und Node-Typen nicht prüfbar.
  Der komplette Typecheck gilt ausdrücklich **nicht** als bestanden.
- `npm run build --ignore-scripts` – **Exit 127**, `next: not found`.
  Der vollständige Next.js-Produktionsbuild gilt ausdrücklich **nicht** als bestanden.
- Kein echter Spotify-/Browser-/WebGL-Playthrough und keine GPU-/Raspberry-Pi-
  Messung möglich. Insbesondere die neue Integration in `DynamicStage.tsx`
  wurde nur durch Syntax-/Import-/Statisch-Integrationschecks geprüft;
  die produktive R3F-Typisierung benötigt die fehlenden Abhängigkeiten.

**Status:** Quellcodepaket mit erfolgreich fokussierter Regression;
**kein** freigegebener Produktionsbuild. Für Produktion auf Windows `npm ci`,
`npm run verify:v885:focused`, `npm run check:architecture`,
`npm run typecheck`, `npm run build` und einen Browser-Show-Durchlauf ausführen.
Das mitgelieferte `scripts/verify-v885-windows.ps1` führt den vollständigen
Windows-Gate mit korrigiertem Node-PATH aus.
