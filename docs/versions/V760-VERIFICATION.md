# V760 – Prüfbericht (30. Oktober 2026)

## Basis / Umfang
- Ausgangsstand: vollständiges V759-Projekt.
- Neue V760-Module: `advancedEnsembleDirectorV760.ts`, `AdvancedEnsembleControlsV760.tsx`.
- Live-Verkabelung im bestehenden `GroupDancersV326SceneV492.tsx`-Frame, Vorschau & Einstellungen in `MultiAvatarStageStudioV326.tsx`, Backup-Zuordnung in `services/settings/unifiedBackup.ts`.
- Versionskennung und Lockfile: `0.1.0-v760`; Build-Preflight `check:fast`, Windows/Linux-CI, automatische Release-Prüfung ergänzt.

## Erfolgreich
- `npm run test:v760`: **72.133** Prüfungen (inkl. 12.000 deterministischer Szenen × Sicherheits-Invarianten).
- `npm run test:v760:types` und `npm run test:v760:ui-types`: bestanden, ausschließlich isolierte Kerntypen / UI-Testtypen.
- Einzelne Regressionen **V735–V759: 25/25** bestanden.
- Zusätzlich V324, V326, V327, V328, V442, V494, V495, V506, V508, V509, V517, V638, V657, V683, V687, V752 und Backup-Tests bestanden.
- `npm run check:syntax`: **1.072** TS/TSX-Dateien geprüft.
- `npm run check:architecture`: bestanden.
- `npm run test:module-case`: **1.811** Dateipfade geprüft, keine Groß-/Kleinschreibungs-Kollisionen.
- `npm run check:lockfile:v752`: bestanden (Versionskonsistenz, CI, Lockfile-Prüfung).
- ZIP-Integrität separat geprüft.

## Nicht erfolgreich / Grenzen der Umgebung
- `npm ci --offline --ignore-scripts --no-audit --no-fund` in isoliertem temporärem Verzeichnis: `ENOTCACHED`, `zustand-5.0.16.tgz` fehlt. V760-Arbeitsverzeichnis bleibt frei von unvollständigen npm-Installationen.
- `npm run typecheck`: nicht erfolgreich, da React-, Next.js- und Node-Typdeklarationen in dieser Umgebung nicht installiert sind. **Kein Beleg eines erfolgreichen Gesamt-TypeChecks**.
- `npm run build`: Vorprüfung einschließlich V760-Tests erfolgreich bis `check:dependencies`; dort ausdrücklich **BLOCKIERT – 0/18 Kernpakete**. Die Next.js-Kompilierung wurde nicht erreicht.
- Kein realer GLB-/Browser-/GPU-Test, keine nachgewiesene visuelle Verbesserung der Bühnenpositionierung.
- Die komplette rekursive `verify:v760:static`-Kette wurde nicht als zusammenhängender grüner Lauf verifiziert; relevante einzelne Regressionen und Qualitätsgates wurden getrennt bestanden.

## Lokal auf Windows / Linux
```sh
npm ci
npm run verify:v760:static
npm run typecheck
npm run build
```
Echte visuelle Prüfung: 3 und 4 GLB-Avatare, Verse/Hook/Drop, freigegebene Fußkontakte, manuelle Cues, Sängerwechsel, reduzierte Bewegungen und Low-Tier. Erst danach Produktionsfreigabe.
