# V883 – Verifikationsstand (3. November 2026)

## Nachweisbar bestanden

- `npm run test:v883`: **54/54** Unit-/Sicherheits-/Integrationstests,
  inklusive falscher oder fehlender Timeline, BPM-freier Planungslogik,
  Hook/Drop/Finale, Song-/Seek-/Pausen-Grenzen, 18,5-Sekunden-Cooldown,
  Viertel-Verteilung, 3D-Ring, instanziertem Konfetti, Licht-, Tanz-,
  Manual-/Blackout-Priorität, Browser-Optionen und JSON-Export.
- `npm run test:v883:types`: strikter isolierter TypeScript-Corecheck – grün.
- `npm run test:v883:ui-types`: isolierter React-/R3F-UI-Typecheck mit
  **ausschließlich testlokalen** Stubs – grün. Stubs werden nicht in das
  produktive TypeScript-Build eingebunden oder in produktive Komponenten kopiert.
- `npm run test:v882`: **35/35** bestehende V882-Sync-Regressionen – grün.
- `npm run verify:v883:focused`: V883 plus V882, V881, V880 und ältere
  fokussierte Konzert-/Lyrics-/Crowd-/Performance-Tests – grün.
- `npm run test:module-case`: **2.202** Quellen ohne Windows-kritische
  Case-Kollisionen – grün.
- `npm run check:syntax`: **1.288** TS/TSX-Dateien, Syntax und Import-Bindungen
  – grün.
- `npm run check:architecture`: Dokumentations-/Versions-Konsistenz – grün.
- `package.json` und `package-lock.json`: `0.1.0-v883`;
  V883 in `prebuild`, `build:preflight`, V832-CI (Windows/Ubuntu)
  und `scripts/verify-v883-windows.ps1` eingebunden.

## Nicht bestätigt / offen

- `npm ci --offline --ignore-scripts --no-audit --no-fund`: **Exit 1**.
  `zustand@5.0.16` ist im lokalen npm-Cache nicht verfügbar (`ENOTCACHED`).
- `npm run typecheck`: **Exit 2**, weil unter anderem React, Next.js,
  `@types/node` und weitere Abhängigkeiten nicht installiert sind.
  Das ist **kein** erfolgreicher gesamthafter TypeScript-Nachweis.
- `npm run build --ignore-scripts`: **Exit 127** (`next: not found`).
- Noch kein realer Browser-/GPU-Test über einen vollständigen Song und kein
  Raspberry-Pi- oder Geräte-Benchmark.

**Release-Status:** Fokussiert getestet und als vollständiges Quellcodeprojekt
bereitgestellt, aber **nicht als produktionsbuild-verifiziert freigegeben**.
Nach erfolgreichem `npm ci` müssen der vollständige TypeScript-Check,
Next.js-Produktionsbuild und ein echter WebGL-Showdurchlauf bestanden sein.
