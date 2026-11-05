# V980 – Prüfnachweis (lokal, 5. November 2026)

Basis: vollständiges `SonicDisplay-V979.zip` mit 4.462 Einträgen.

## Bestanden

- **22 V980-Regressionsgruppen**, darunter 10.000 deterministische
  simulierte Renderer-Messfenster, FPS-Hysterese, schrittweises Drosseln und
  Wiederherstellen, Messwert-Plausibilität, Ausschalten, Songwechsel, Seek-Grenze,
  30-FPS-Pi-Sparprofil, manuelle V825-Qualitätsgrenzen und V827-Ablösung.
- **30 aktuelle Versionsregressionen** V958, V960–V980 inklusive
  Alexa/Govee-Integration, V974-Importer und V979-Konzertregie.
- Zusätzliche bestehende V825-/V826-/V827-, V901-, V903–V908-Prüfungen.
- `tsc -p tests/tsconfig.v980-core.json --noEmit` (isoliert, ohne React): PASS.
- Quellen-Syntax (1.391 TS/TSX-Dateien), Architektur sowie V959-Preflight: PASS.
- V931-Build-Gate-Regression (12 Checks) und Vercel-Parity-Regression: PASS.
- **13** Python-Unittests des `project-archive-import.py`: PASS.
- Keine neuen WebGL-Schleifen, zusätzlichen Hardwarekommandos oder
  Render-/GPU-Abfragen; V980 verwendet V826-Messfenster.

## Bewusst noch nicht freigegeben

- Vollständiger `npm run typecheck`: **fehlgeschlagen**, weil hier keine
  installierten Next.js-/React-/Node-Abhängigkeiten vorhanden sind (u.a.
  `Cannot find module 'next/server'`); Fehlerbericht liegt außerhalb der ZIP.
- Kein erfolgreich ausgeführter Next.js-Produktionsbuild und kein nachgewiesener
  echter Vercel-/GitHub-Actions-Deploy. Der lokale Node ist v22.16.0 statt der
  für das Projekt vorgesehenen Node-24-Produktionsumgebung.
- Kein Realgerätebenchmark für Raspberry Pi, Govee oder Alexa; gemessene
  FPS-Vorteile werden **nicht** behauptet. Im Low-Tier bleibt der vorhandene
  V810-Sicherheitsguard aktiv, auch wenn V980-Diagnose eingeschaltet wird.

## GitHub-ZIP-Importer E2E

- Ausgangsbasis: V979 als Git-indexierte Projektdateien.
- `--sync-tracked --dry-run` und produktiver `--sync-tracked`-Import von V980
  bestanden. 18 geschützte Pfade werden nicht überschrieben.
- Entfernt: absichtlich getrackte veraltete Datei
  `components/obsolete-v980.tsx` und zwei veraltete `__pycache__/*.pyc`
  aus der älteren V979-ZIP.
- Geschützt: `.github/workflows/owner-only-v980.yml`,
  `docs/owner-only-v980.md`, ungetracktes `data/user-setting-v980.json`.
- Im importierten Projekt: V966-Struktur (10 Checks), V974-Hygiene
  (6 Checks), V980-Regressionsprüfung (22 Gruppen) alle bestanden.
- Archivintegrität, eindeutige Pfade und `sonicRoadmapRelease=v980` geprüft.

**Freigabebedingung:** In Node 24 mit `npm ci`, vollständigem `npm run
 typecheck` und `next build` erneut prüfen; erst danach Vercel-/GitHub-Deploy
als erfolgreich melden.
