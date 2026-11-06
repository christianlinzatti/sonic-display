# V1011 – Network Performance Dashboard & CI-Fix

**Datum:** 2026-11-06 · **Ausgangspunkt:** Sonic Display V1010

## Neue Funktionen

- Passive Live-Anzeige unter **Einstellungen → Dashboard** (`NetworkPerformanceDashboardV1011`).
- Tatsächlich gemessene, browserlokale In-Flight-Slots nach Benutzeraktionen,
  Wiedergabe, Lyrics/Genre und optionalen Diensten; Warteschlange mit Höchststand.
- Cache-Hits, stale Antworten, zusammengefasste Abfragen, abgeschlossene und
  fehlgeschlagene Requests, Retry-, Timeout- und 429-Signale.
- Sanitized Providers, verbleibende `Retry-After`-Sperren und Circuit-Breaker-Phasen.
- Benutzeraktionen dürfen nun auch reguläre, niedrigere Queue-Aufträge verdrängen,
  wenn keine optionalen Jobs mehr übrig sind. Queue bleibt begrenzt.
- Telemetrie ist rein flüchtig, kontogebunden und enthält keine API-URLs,
  Tokens, Spotify-IDs, Künstlernamen, Lyrics oder Rohfehlermeldungen.

## Buildfehler 42202961731

Der V1010-Run brach sowohl auf Windows als auch Ubuntu in `Release reliability
regressions` ab. `tests/v1003-auto-improvement-regression.cjs:134` erwartete zurecht
`sonicFeatureRelease === version`, aber die V1010-Paketmetadaten enthielten noch
`v1009` statt `v1010`. Direkt auf GitHub wurde dieser konkrete Wert am
2026-11-06 im Commit `5a0b0a6355dcb20d8815a073b7342126228ef25d` korrigiert.
Nach dem ersten erfolgreichen Stage-Gate zeigte der neue Linux-/Windows-Lauf
`42203818896` noch ein zweites Problem: Das Mock-Response-Objekt in
`tests/v359-spotify-artist-follow-regression.cjs` hatte anders als die echte
Fetch-API keine `headers.get()`-Methode. Darum wurde das erwartete HTTP-400-
Fehlerobjekt als vermeintlicher Netzwerkfehler (`spotify_unavailable`) behandelt.
Die Test-Fixture wurde mit realistischen Headers repariert und prüft zusätzlich
`HTTP 429` samt `Retry-After`; GitHub-Commit
`4954d5242e247a1924e65f22dc8d359fa7ef3851`. Der echte Spotify-Endpunkt
blieb unverändert, um die 429- und Fehlerbehandlung nicht zu verschlechtern.

V1011 setzt alle drei Versionseinträge konsistent auf `v1011` und ergänzt den
vorzeitigen Metadaten-Guard `scripts/production-workflow-metadata.cjs`.

## Tests

- `npm run test:v1011` – V1011-Telemetrie, Privatheit, Priorität, 429, Reset, UI.
- `npm run test:v1011:types` – isolierte Netzwerk-TypeScript-Prüfung.
- `npm run test:v1010` und `npm run test:v1003` – Rückwärtskompatibilität.
- `npm run verify:v1004:focused` – historische Sicherheits- und Architekturgates.
- GitHub CI: npm ci, voller `tsc --noEmit`, `next build`, Playwright auf Node 24
  unter Ubuntu und Windows. Diese Schritte sind vor dem erfolgreichen CI-Lauf
  ausdrücklich **nicht als bestanden** anzusehen.

## Installation

Das vollständige ZIP in `releases/` hochladen, automatische Importaktion abwarten,
anschließend die Production-&-Playwright-Jobs prüfen. Die Importaktion übernimmt
keine `.github/`-Dateien; der neue V1011-Workflow ist zusätzlich im ZIP enthalten,
wird aber ohne separaten GitHub-Commit nicht aktiv. Der bereits bestehende
Produktionsworkflow führt über `prebuild` und den Vercel-Gate die V1011-Tests aus.
