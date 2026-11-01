# V853 – Prüfprotokoll (2026-11-01)

## Bestanden
- `npm run test:v853` – API-Aktions-Allowlist, Cross-Origin-Schutz, Scope-Prüfung, Spotify-HTTP-Fehler, React-/CSS-Integration und Paketmetadaten.
- `npm run test:v853:types` – isolierter strenger TypeScript-Check der reinen V853-Hilfsfunktionen.
- `npm run test:v852`, `npm run test:v851`, `npm run test:v851:types` – Playlist-Bibliothek, Wiedergabe-API und Playlist-Helfer unverändert funktionsfähig.
- `npm run test:v850`, `npm run test:v850:types`, `npm run test:v849`, `npm run test:v849:types` – bisherige Concert-FX-Regressionstests.
- `npm run check:syntax` – gesamte TS/TSX-Quellstruktur (1237 Dateien).
- `npm run check:architecture` – Paketversion, Dokumentation und Code-Referenzen.

## Noch nicht bestanden / nicht praktisch geprüft
- `npm run typecheck`: Vollständiger Projekt-TypeScript-Check scheitert hier mit fehlenden installierten React-/Next.js-/Node-Typen (z. B. TS2307 `next/server`, `react`). Das ist **keine erfolgreiche Gesamtprüfung**.
- `npm run build --ignore-scripts`: `next: not found`, weil die Projekt-Abhängigkeiten in der ausführenden Umgebung fehlen. Der normale Produktionsbuild mit allen Preflight-Skripten wurde **nicht** abgeschlossen.
- Echte Spotify-Connect-Kommandos, Lautsprecherwechsel, Browser-Darstellung und responsive Touch-Bedienung: mangels Spotify-Zugang und lauffähiger Next.js-Anwendung **nicht live geprüft**.

## Nächste Freigabeprüfung

`npm ci && npm run typecheck && npm run build`

Anschließend im Browser Spotify Premium verbinden, einen verfügbaren Connect-Lautsprecher öffnen und nacheinander Playlist-Start, Pause, Fortsetzen, nächster/vorheriger Song, Aktualisierung des Gerätenamens und Verhalten bei fehlendem Gerät prüfen.
