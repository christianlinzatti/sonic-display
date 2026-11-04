# V713 – Releaseprüfung (29. Oktober 2026)

## Ergebnisse

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v713` | PASS: 59 Prüfgruppen; 10.000 ungültige Ereignisse verworfen; simulierte IDB-Migration/Abgleich erhält 9.003 Einträge statt auf 8.000 zu kürzen |
| `npm run test:v713:types` | PASS: isolierter TypeScript-Kern |
| `npm run test:v713:ui-types` | PASS: isolierte React-/JSX-Dateien mit **test-only** Stubs |
| `npm run test:quick` | PASS: Exit 0, Regression V669–V713, zusätzlich Architektur/Syntax/Windows-Dateinamen-/Test-Isolation-/Spotify-Sicherheit |
| `npm run test:module-case` | PASS: 1.678 TS/TSX-Quellpfade ohne Groß-/Kleinschreibungskollision |
| `npm run check:test-types` | PASS: 8 Test-Ambient-Deklarationen von produktiver Typisierung getrennt |
| `npm run check:syntax` | PASS: 993 TS/TSX-Dateien |
| `npm run check:architecture` | PASS: 647 Codeverweise |
| `npm run build` | **BLOCKIERT:** vor Next.js bei `check:dependencies` – 0/17 Pakete installiert, `package-lock.json` fehlt |
| `npm run typecheck` | **NICHT BESTANDEN:** fehlende React-, Next.js-, Three-, Node- und weitere Modultypen ohne npm-Installation |
| Echte Browser-/Last.fm-API-Tests | **OFFEN:** kein echtes Last.fm-/Spotify-Konto oder Browser mit gespeicherter Hörhistorie vorhanden |

## Integrierte Funktionen

- Neues IndexedDB-Archiv `sonic-display-lastfm-longterm-v713`; pro Last.fm-Benutzer und Scrobble-Schlüssel getrennte Datensätze.
- Idempotente, ergänzende Migration von V706-JSON, ohne Löschung oder Überschreiben des Langzeitarchivs. Unveränderte Migration wird übersprungen.
- Manueller Last.fm-Import und V713-Backup/Restore schreiben ohne alte 8.000er-Aufbewahrungsgrenze in IndexedDB; Importdatei-Schutzgrenze 100 MB / 250.000 Ereignisse.
- Bestehender V708-/V710-Recorder spiegelt Änderungen auch außerhalb des Last.fm-Dialogs, sofern Sonic Display aktiv ist. Kein zusätzliches Last.fm-Scrobbling.
- V711, V712 und V707 werten die vollständigen aus IndexedDB geladenen Ereignisse aus.

## Offene Freigabe-Punkte

1. In der tatsächlichen Zielumgebung `npm install` ausführen und **Lockfile einchecken**, danach `npm run typecheck`, `npm run build` und `npm run test:quick` vollständig wiederholen.
2. Migration mit einem realen 8.000-Einträge-Browserarchiv prüfen, inklusive Abbruch/Neustart und IDB-Quota-Fehler.
3. Zwei Browser-Tabs, V708-Autosync, V710-Recovery, Last.fm-API 429, große Backups und Browser-Speicherbereinigung mit echten Daten end-to-end prüfen.
4. Datenbestand auf dem Zielgerät als IndexedDB-Backup sichern und Exporte tatsächlich zurückspielen.

Diese Tests belegen die Regression und den TypeScript-Kern, ersetzen **keine produktive Freigabe**. Insbesondere bedeutet „Unlimited“ keine unbegrenzte Speicherquote. Spotify→Last.fm-Scrobbling erfolgt weiterhin über die bereits verbundene Spotify-Scrobbling-Funktion von Last.fm, nicht über Sonic Display.
