# Sonic Display V861 — Prüfnachweis

**Stand:** 1. November 2026. **Status:** Quellstand und gezielte Regressionstests geprüft, aber **keine vollständige Produktionsfreigabe**.

## Erfolgreich

- `npm run test:v861`: Mindestabstände 90/180/365 × 24 Stunden inklusive Grenzfällen, NFKC-/Schreibweisen, Identität Künstler+Titel, doppelte UTC-Zeitstempel, Zukunfts-/ungültige Daten, archivierte Favoriten, Unveränderlichkeit, kein neuer Request, Integration und Releaseprüfkette.
- `npm run test:v861:types` und `npm run test:v861:ui-types`: strenger separater Kern-Typecheck und isolierter JSX-/UI-Typecheck.
- Funktionsregressionen `test:v849` bis einschließlich `test:v860` (Konzert, Spotify, History).
- `npm run test:v860:types` und `npm run test:v860:ui-types` erneut erfolgreich.
- `npm run check:syntax`: 1253 TS/TSX-Quelldateien.
- `npm run check:architecture`: 987 gültige Architektur-Quellreferenzen.
- `npm run test:module-case`: 2121 geprüfte Dateien ohne Windows-/Linux-Casing-Kollisionen.
- `npm run check:lockfile:v752`: Paket-Lockfile und Release-Skripte konsistent.

## Blockiert, nicht als bestanden gewertet

- **Gesamt-TypeScript (`npm run typecheck`)**: Exit 2 wegen fehlender React/Next/Node-Moduldeklarationen; im Container wurde kein `node_modules` installiert. Der Fehler sagt **nichts** über die vollständige Typkorrektheit mit installierten Abhängigkeiten aus.
- **Produktionsbuild (`npm run --ignore-scripts build`)**: Exit 127 `next: not found`, weil `node_modules/.bin/next` nicht vorhanden ist. Ein vollständiger `npm run build` startet sonst erst die umfassende Prebuild-Regression; der eigentliche Next.js-Build konnte hier nicht geprüft werden.
- Keine echte Last.fm-Account-Session, kein Spotify-Premium-Lautsprecher-/Touchdisplay-Integrationstest durchgeführt.

## Zur lokalen Prüfung

```sh
npm ci
npm run test:v861
npm run test:v861:types
npm run test:v861:ui-types
npm run typecheck
npm run build
```

**Hinweis:** Fehlende Scrobbles sind keine sicheren Wiedergabepausen. Die Oberfläche ergänzt nur die vorhandenen Last.fm-Langzeitdaten und legt keine neuen gespeicherten Daten an.
