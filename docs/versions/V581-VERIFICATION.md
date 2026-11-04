# V581 – Prüfprotokoll (26.10.2026)

## Implementiert / erfolgreich hier ausgeführt

- Ausgangspunkt: vom Nutzer bereitgestelltes `sonic-display-v580-concert-experience-3.zip`, entpackt und inkrementell erweitert.
- `npm run test:v581`: **PASS**, 63 neue, deterministische Assertions für echte Wortzeit- und Rollen-Gates, additive Brauen-/Squint-Morphs, konstante B/P/M-Lippenkanäle, Head-Bone-Offset-Restaurierung, Mixer-Überschreibung und optionale bestätigte Eye-Cues.
- `npm run test:v581:types`: **PASS**, isolierter TypeScript-Check des neuen Planermoduls und der importierten Kern-/Typdefinitionskette.
- `npm run test:smoke:v581`: **PASS** einschließlich `test:v580` (79 Checks, 12.000 Samples), `test:v572` (69 Checks, 16.000 Samples), isolierter Typechecks und Syntax-/Architekturprüfungen (800 TS/TSX-Dateien).
- `npm run verify:v581`: **PASS**, enthält zusätzlich die unveränderten Regressionen V546, V561, V563, V564 und V569.
- Die V580-Historientests wurden lediglich versionsübergreifend gemacht: sie verlangen mindestens Release 580 und weiterhin einen korrekten Smoke-Prebuild, statt `v580` als einzigen zulässigen Paketnamen zu erzwingen.

## Keine abgeschlossene Produktionsfreigabe

- `npm run typecheck` für das vollständige Next.js-Projekt wurde in dieser Umgebung gestartet, erreichte jedoch das Ausführungslimit; **kein vollständiger Typcheck behauptet**.
- Die für einen erfolgreichen Next.js-Build nötigen lokalen `node_modules` fehlten hier. Daher **kein echter `next build` oder Browser-WebGL-Smoke-Test**.
- Es gab keine tatsächliche Audiolippenmessung, keine GLB-Bildabnahme und keine Raspberry-Pi-FPS-/Wärme-Messung. Das ausführbare V580-Hardwarebenchmark-Skript bleibt erhalten, wurde aber nicht als Messung ausgegeben.

## Test auf dem Entwickler-PC

```bash
npm install --no-audit --no-fund
npm run test:smoke:v581
npm run typecheck
npm run build
```

Für GLB-Abnahme zwei Avatare mit expliziten V385-/V496-Zuordnungen, mindestens einen geeigneten Head-/Eye-Bone und echte word-synced Lyrics laden. Während schnellem Deutschrap auf sichtbare Kiefer-/Augen-/Kopf-Kohärenz achten; anschließend Pause, Seek, Avatar- und Trackwechsel sowie reduziertem Motion- und Low-Tier-Modus testen. Die additive V581-Bewegung darf nach Abschaltung nicht stehen bleiben. V580-Pi-Benchmark separat am tatsächlichen Zielgerät laufen lassen.
