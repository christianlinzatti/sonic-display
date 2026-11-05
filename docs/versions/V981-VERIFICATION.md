# V981 – Verifikationsbericht (5. November 2026)

## Bestandene lokale Prüfungen

- 16 V981-Regressionsgruppen, inklusive 10.000 simulierte, vollständige
  V826-Messfenster, Scope-Reset bei Track-/Seekwechsel, Hysterese,
  Trendbewertung, vorsichtigen diagnostischen Hinweisen und Sicherheit bei
  ungültigen Messwerten.
- 38/38 breit angelegte Testskripte: V958, V960–V981, V825, V826, V827,
  V931/V959, Alexa/Govee, V974-Importer-/Repositoryschutz,
  Vercel-Produktionsparität.
- Isolierter TypeScript-Check:
  `tsc -p tests/tsconfig.v981-core.json --noEmit`: PASS.
- Syntax- und Architekturprüfungen des Gesamtprojekts: PASS.
- V980-OOM-Hotfix im nächsten Release weiterhin enthalten: SONIC_LOW_MEMORY_BUILD,
  Next.js Webpack Memory Optimizations, kein persistenter Produktionsbuildcache.

## Offene oder getrennt zu prüfende Gates

- Ein *vollständiger V981* `tsc --noEmit`/Next.js-Build ist lokal ohne
  installierte App-Abhängigkeiten nicht nachgewiesen. Der GitHub-/Vercel-
  Produktionslauf für V981 wird erst durch den ZIP-Upload ausgelöst.
- V980 auf GitHub `master` hat bereits erfolgreiche vollständige Linux- und
  Windows-Gates und ein erfolgreiches Vercel-Produktionsdeployment.
- **Achtung:** Der GitHub-V965-Public-Reachability-Smoke auf V980 meldete
  `HTTP_302` auf einer Vercel-Deployment-URL. Das ist kein Next.js-Buildfehler,
  aber die öffentliche Erreichbarkeit ist damit nicht freigegeben. Die
  Weiterleitung/Protection bzw. die korrekte Produktionsdomain muss gesondert
  geprüft werden; keine heimliche HTTP-Redirect-Freigabe.

## ZIP-Importer End-to-End

- Release-Kandidat aus 4.470 Dateien auf eine frisch entpackte V980-Basis
  mit simuliertem Git-Index importiert.
- `--sync-tracked --dry-run`: PASS; realer `--sync-tracked`-Import: PASS.
- Die absichtlich veraltete, getrackte Datei
  `components/obsolete-v981.tsx` wurde entfernt.
- Inhabereigener GitHub-Workflow, historische Dokumentation und
  nicht getrackte Nutzerdaten wurden ausdrücklich erhalten.
- Nach dem Import: V966 (10 Checks), V974 (6), V980 (22), V981 (16)
  und Vercel-Konfiguration erfolgreich; ZIP-Inhaltsintegrität fehlerfrei.

## Grenzen

- Die Diagnose stammt aus den realen Renderer-Frameabständen und
  `WebGLRenderer.info`, **nicht** aus GPU-Timing-/CPU-Profiler-Messungen.
- Kein Schreiben in Nutzerdateien, keine zusätzliche R3F-Schleife, keine
  Netzwerkanfragen, keine Govee/Alexa-Befehle, kein Eingriff in V980/V825.
- Ein echter Raspberry-Pi-Benchmark bleibt ausstehend.

**Status:** V981 Release-Kandidat. Vollständige Produktionsfreigabe erst nach
V981 GitHub-Actions-/Vercel-Checks und Klärung der HTTP-302-Smoke-Meldung.
