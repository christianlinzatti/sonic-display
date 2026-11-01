# V750 – Verification (2026-10-30)

**Status:** Isoliert typ- und quellengeprüfter Buildkandidat. **Kein vollständig produktionsverifizierter Release.**

## Bestanden

- `npm run test:v750`: **556.102** gezielte Checks, darunter 60.000 deterministische Szenen mit unterschiedlichen Liedpositionen, Songabschnitten, Sänger- und Gruppenrollen, manuellen Zuständen und Leistungsprofilen. Ein-/Ausschaltung, Lyrics-Synchronität, Dichte, Drop, Pause, Reduced Motion, Stärke 0, Seek/Track-Grenzen, numerische Schutzgrenzen und Integrations-Wiring geprüft.
- `npm run test:v750:types`: isolierter TypeScript-Check in Strict Mode.
- Regressionen `test:v735` bis `test:v749` inklusive aktuellen isolierten Typprüfungen V740–V750.
- Zusätzliche `test:v665`, `test:v666`, Lichttests `test:v542`, `test:v608`, `test:v621`, `test:v689`.
- `npm run check:syntax`: **1.052** TS/TSX-Quellmodule; `npm run check:architecture`: **755** dokumentierte Quellpfade; `npm run test:module-case`: **1.779** geprüfte Quelldateien ohne rein case-sensitive Konflikte.
- V750 in `check:fast`, `build:preflight` und `test:quick` eingebunden.

## Nicht erfolgreich / offen

- `npm ci --offline --ignore-scripts --no-audit --no-fund`: `ENOTCACHED` für `zustand-5.0.16.tgz`. Online-Paketinstallation stand hier nicht zur Verfügung.
- `npm run typecheck`: TS2307 / TS2580 für nicht vorhandene `next/server`, React-/Node-Typen usw.; somit **keine vollständige Typfreigabe**. Die neuen Core-Module wurden isoliert geprüft.
- `npm run check:dependencies`: **0/18** Kernpakete installiert. `npm run build` startet `prebuild`, führt ältere Tests aus und stoppt vor dem Next.js-Compiler bei fehlenden Paketen. **Kein erfolgreicher Next.js-Produktionsbuild.**
- Nicht möglich: echte mehrfache GLB-/WebGL-Renderingprüfung, FPS- und Speicherbenchmark, Pixel-/Lyrics-Kollisionstests, Browser-Integration der neuen React-Props.

## Lokal reproduzieren (Windows)

```powershell
npm ci
npm run test:v750
npm run test:v750:types
npm run check:syntax
npm run check:architecture
npm run test:module-case
npm run typecheck
npm run build
```

`npm run verify:v750` führt die vollständige historische Verifikationskette inklusive Builds aus und benötigt installierte Abhängigkeiten.
