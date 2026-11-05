# Sonic Display V890 – Release- und Prüfstatus

**Stand: 03.11.2026.** Diese ZIP ist eine lauffähig vorbereitete Quellcode-Version, aber **keine bestätigte Produktionsfreigabe**.

## Erfolgreich in dieser Laufzeitumgebung

- V890: 91/91 deterministische Regressionstests, darunter verifizierte Musikabschnitte, fehlende Performer, Schutz bei Pause, Seek, Blackout und manuellem Licht.
- Isolierte TypeScript-Checks: `test:v890:types`, `test:v890:ui-types`.
- V889 (108 Checks), V888 (96), V887 (78), V886 (127), V885 (61), V884 (53), V883 (54), V882 (35), V881 (40), V880 (44): jeweilige direkte Funktionstests erfolgreich.
- `test:v882:types`, `test:v882:ui-types`, `test:v881:types`, `test:v881:ui-types`: bestanden.
- Relevante Licht-Regressionen V551, V542, V689, V636, V772 und `test:stage-lighting`: bestanden.
- `check:syntax`: 1.298 TS/TSX-Quelldateien, bestanden.
- `test:module-case`: 2.220 Quelldateien ohne kritische Windows-Groß-/Kleinschreibungskollision, bestanden.
- `check:architecture`: bestanden.

## Noch nicht bestätigt

- Die rekursive `verify:v890:focused`-Gesamtkette wurde wegen Laufzeitlimit **nach dem V882-Regressionsaufruf unterbrochen**. Die verbleibenden V882/V881-Typprüfungen sowie einige ältere Gruppen wurden anschließend separat erfolgreich ausgeführt. Eine vollständige grüne Gesamtkette ist nicht behauptet.
- `npm ci --offline`: fehlgeschlagen, da das Paket `zustand@5.0.16` nicht im lokalen npm-Cache vorliegt (`ENOTCACHED`).
- Vollständiger `npm run typecheck` und `npm run build`: ohne installierte React-/Next-/Three-Abhängigkeiten hier nicht zuverlässig prüfbar.
- Es liegt kein beobachteter Browser-/WebGL-/GLB-Durchlauf mit echten Titeln und Avataren vor.

## Lokale Release-Prüfung unter Windows

```powershell
npm ci
npm run verify:v890:focused
npm run check:architecture
npm run test:module-case
npm run check:syntax
npm run typecheck
npm run build
npm run dev
```

Alternativ `powershell -ExecutionPolicy Bypass -File scripts/verify-v890-windows.ps1` für die wesentlichen Gates. Die CI-Workflow-Datei `.github/workflows/v832-continuous-validation.yml` enthält einen neuen V890-Schritt mit fokussierten Tests vor den v889-Regressionsprüfungen.
