# V452 – Verification

## Erfolgreich in der bereitgestellten Umgebung

- `npm run test:v452` – Pure TypeScript/JavaScript V452-Tests, 2/3/4 Slots, Hook/Verse,
  deterministische gemeinsame Gesten, Grenzen, Reduced Motion, Pause,
  manuelle Priorität, Look-/Gestenmixer und reale Einbindung; `tsc -p
  tests/tsconfig.v452-core.json --noEmit`.
- `npm run verify:v452` – gezielte Regressionstests V423–V426 und V429–V452,
  V242 intelligente Tanzfolgen, Syntax, Imports, Modulnamen.
- Zusätzlich `npm run test:v325`, `v326`, `v327`, `v328`, `v329`, `v374`,
  `v375`, `v376`, `v385` und `v392` – erfolgreich. Bei neun Tests
  wurden historische Endloslisten erlaubter Paketversionen durch aufwärtskompatible
  Prüfungen ersetzt; die eigentlichen Funktions-Assertions bleiben bestehen.
- Archivprüfung: `zipfile.testzip()`, Versionsmetadaten,
  vollständige Dateiübernahme gegenüber der V451-ZIP.

## Noch nicht ausgeführt

- `npm run typecheck` über das gesamte Next-/React-Projekt und `npm run build`:
  Projekt-Abhängigkeiten (`node_modules`) sind in der Umgebung nicht installiert.
- Echte Browser-/WebGL-/GLB-Performance, Spotify-/Genius-Live-Abfragen.

Lokal unter Windows: `npm install && npm run verify:v452 && npm run typecheck && npm run build`.
