# V454 – Verification

## Bestanden in dieser Umgebung

- `npm run test:v454`: reiner Kamera-Planer, Portrait-/Hook- und Ensemble-Bilder für 1–4 Slots, Mindestabstände und Blickwinkel, Lyrics-Schutz, Zoom-/Gesichtsanker-Grenzen, Übergangs-Hold von 2,1 s, Wiedergabesprünge, Trackwechsel, Pause, alte V442-Gruppenframing-Priorität, Integrations- und Vorrang-Assertions; `tsc -p tests/tsconfig.v454-core.json --noEmit` erfolgreich.
- `npm run verify:v454`: gezielte V423–V426/V429–V454-Regressionen, V242, Sprach-/Quellsyntax sowie Import-/Modulnamenprüfung. V393/V406/V407 werden durch V453 übernommen.
- Eine ältere **strukturelle** V429-Regression wurde auf die neue Kompositionsreihenfolge (`V429 → V432 → V454 → V351`) aktualisiert, ohne die funktionalen V429-Sicherheitsprüfungen abzuschwächen.
- Syntax: **621** TS-/TSX-Dateien. Imports: **986** Projektdateien, **2.171** Imports. Modulnamen-Kollisionen: keine.
- ZIP-Archivintegrität und Dateivollständigkeit gegenüber der V453-Version werden beim Release-Packaging geprüft.

## Offen

- Vollständiger `npm run typecheck` und `npm run build`: Hier fehlen die `node_modules`; nur isolierte, vollständig typisierte Modulprüfungen sind möglich.
- WebGL-/GLB- und Spotify-Livetest mit echten Dateien und der Zielkamera (darunter Dreier-/Vierer-Casts) ist weiterhin erforderlich.

## Windows

```powershell
npm install
npm run verify:v454
npm run typecheck
npm run build
```
