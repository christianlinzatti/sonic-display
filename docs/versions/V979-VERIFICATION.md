# V979 – Prüfnachweis (lokal, 5. November 2026)

Ausgangsbasis: vollständige `SonicDisplay-V978.zip` (4.454 Einträge).

## Erfolgreich nachgewiesen

- 20 neue V979-Regressionstestgruppen, einschließlich 10.000 deterministischer
  synthetischer Songzustände, positiver gemeinsamer Lichtgrenzen,
  Stufenauswahl, Effektsicherheit, pausierter Wiedergabe, manueller Cues,
  reduzierter Bewegung, Raspberry-Pi-/Compact-FX-Sperren und
  Ausfallsicherheit bei unzuverlässigen Analyseabschnitten.
- **29** Regressionen V958 und V960–V979 inklusive V974-Repository-Hygiene:
  `python /mnt/data/run-v979-regressions.py` in vier parallelen Testprozessen.
- `tsc -p tests/tsconfig.v979-core.json --noEmit`: bestanden.
- `node tests/check-source-syntax.cjs` und
  `node tests/check-architecture.cjs`: bestanden.
- `node scripts/v959-source-preflight.cjs`: bestanden;
  keine Windows-/Linux-Namenskollisionen, Lockfile zur bisherigen
  `package.version`-Linie `0.1.0-v908` passt weiterhin.
- 13 Python-Sicherheitstests für den V974-ZIP-Importer bestanden.
- Keine Änderungen an Alexa, Govee, den Windows-/Raspberry-Pi-Bridges oder
  GitHub Actions durch ZIP-Inhalt (geschützte Workflows bleiben im Repository).

## Noch nicht nachgewiesen

- **Kompletter `tsc --noEmit` scheiterte in der lokalen Umgebung**, weil
  Projekt-Abhängigkeiten (`next`, `react`, `@types/node` etc.) nicht
  installiert sind. Der lokale Node ist 22.16.0, während das Projekt
  für Produktion Node 24 verlangt.
- **Ein vollständiger Next.js-Produktionsbuild, GitHub Actions, Vercel,
  Windows-/Raspberry-Pi-Gerätebetrieb und echte WebGL-/Govee-Hardware**
  wurden in dieser lokalen Umgebung nicht erfolgreich verifiziert.
- Vor Produktionsfreigabe auf Node 24 `npm ci`, `npm run typecheck`
  und `next build` durchlaufen lassen. Die aktualisierten V931-/Vercel-
  Gates melden Abbrüche als Fehler, nicht als erfolgreichen Build.

## ZIP-Import erfolgreich getestet

- Archiv enthält **4.462 reguläre Projektdateien**, davon **4.444 vom Importer
  übernommene Dateien** und **18 unverändert geschützte Pfade**
  (`.github/**` und der Importer selbst).
- Lokaler E2E-Smoke: V978 als Git-Baseline, V979 als `releases/SonicDisplay-V979.zip`;
  sowohl `--sync-tracked --dry-run` als auch echter `--sync-tracked`-Import bestanden.
- Die absichtlich getrackte Altdatei `components/obsolete-v979.tsx` wurde
  im Dry-run angekündigt und beim Import entfernt. Die ungetrackte Datei
  `data/user-setting-v979.json` sowie der zusätzliche Workflow
  `.github/workflows/owner-only-v979.yml` und ein Dokument unter `docs/`
  blieben erhalten.
- Im **importierten** Projekt bestanden V966-Struktur (10 Checks),
  V974-Repository-Hygiene (6 Checks) und V979-Regressionsprüfung (20 Gruppen).
- ZIP-Integrität mit `ZipFile.testzip()`, eindeutige Dateinamen und
  `sonicRoadmapRelease=v979` sind geprüft. **Kein behaupteter echter
  GitHub- oder Vercel-Deploy.**
