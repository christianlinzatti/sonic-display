# V659 – Verification (28.10.2026)

## Bestanden

- `npm run test:v659`: 620 gültige Bibliotheks-Deskriptoren, Auswahl über 250 Asset-IDs, 100 simulierte Abrufwechsel mit begrenztem Cache; keine letzten-24-Begrenzung. Keine Real-GLB- oder Browser/GPU-Footprint-Messung.
- `npm run test:v659:types`: isolierter TypeScript-Check für den Nachfrageplaner.
- `npm run test:v190`, `npm run test:v438`, `npm run test:v535`, `npm run test:v533`: Bibliothek, Genre-/Rap-Automatik, Fingerprints, einzelner GLB-Import.
- `node tests/motion-prefetch-v212-regression.cjs`, `node tests/v412-rap-presets-regression.cjs`: der begrenzte V212-Prefetch und die V412-Show-Cues funktionieren unverändert.
- `npm run test:smoke:v659`: vollständige aktuelle verkettete Smoke-Suite V659 bis V616, Exit-Code **0** (zweimal ausgeführt; nach dem erweiterten Katalog zuletzt erneut Exit 0).
- `npm run check:syntax`: **910** TS-/TSX-Dateien geprüft.
- `npm run check:architecture`: **564** aktuelle Referenzen geprüft.
- `npm run test:module-case`: **1531** Quelldateien ohne Windows-Groß-/Kleinschreibungskollision.
- `npm run check:test-types`: 8 test-only ambient TypeScript-Deklarationen vom Produktivbuild isoliert.
- `npm run test:env:spotify-build`: Spotify-Import ohne produktive Umgebungsvariablen getestet.

## Nicht bestätigt

- `npm run typecheck` wurde versucht, Exit **2** bereits infolge nicht vorhandener Projektabhängigkeiten (`next/server`, React-/Node-Typen fehlen). Die Umgebung enthält kein `node_modules`, daher ist dies **kein** Beleg für einen vollständig typkorrekten V659-Build.
- `npm run build` / Next.js-Produktionsbuild nicht erfolgreich durchgeführt; npm-Abhängigkeiten müssen erst installiert werden.
- Echte 3D-GLB-Browser-, GPU- und Performance-Langzeittests fehlen. Die 64-Clips-pro-Datei-Sicherheitsgrenze im separaten Bulk-Import-Workflow besteht weiter; beim lokalen Speichern gilt die Browser-Storage-Quote.

## Nächster CI-Schritt

Im GitHub-Workflow `.github/workflows/concert-validation-v571.yml` wird auf Ubuntu und Windows jeweils `npm run build` ausgeführt. Dessen `prebuild` ruft `check:release` inklusive aktueller Smoke-Testkette und `typecheck` auf. V659 ist bis dahin **nicht produktionsfreigegeben**.
