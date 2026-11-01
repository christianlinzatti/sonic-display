# V711 – Verification / Freigabestatus

Stand: 29.10.2026. Grundlage: vollständiges Projekt V710 (Last.fm History Health & Auto Recovery).

## Durchgeführt (erfolgreich)

| Prüfung | Kommando | Resultat |
|---|---|---|
| V711 Datenkern | `npm run test:v711` | PASS: 83 Prüfgruppen, 12.000 ungültige Ereignisse korrekt verworfen |
| Isolierter TS-Datenkern | `npm run test:v711:types` | PASS, Exit 0 |
| Isolierter React-/JSX-Check | `npm run test:v711:ui-types` | PASS, Exit 0 |
| Vollständige schnelle Versionsregression | `npm run test:quick` | PASS, Exit 0; Tests V669–V711 einschließlich Struktur- und Sicherheitssuite |
| Syntax- und Importbindungen | `npm run check:syntax` | PASS, 990 TS/TSX-Dateien |
| Architektur | `npm run check:architecture` | PASS, 636 referenzierte Codepfade |
| Groß-/Kleinschreibung der Module | `npm run test:module-case` | PASS, keine Windows-/Linux-Dateinamenkollisionen |
| Test-Typisolation | `npm run check:test-types` | PASS, 8 test-only Ambient-Deklarationen aus produktiver Prüfung ausgeschlossen |
| Spotify OAuth / Session | `npm run test:env:spotify-build` | PASS |

Die V706–V710-Tests behielten ihre inhaltlichen Prüffälle. Lediglich ihre zuvor auf V710 fest verdrahteten Paketversions- und Schnelltest-Präfixerwartungen wurden für V711 angehoben.

## Nicht freigegeben (tatsächliche Versuche)

- **`npm run build`**: Exit 1 im Preflight `check:dependencies`, bevor Next.js gestartet werden kann. Node v22.16.0, **0 von 17 direkten Paketen installiert**, `package-lock.json` fehlt. Fehlende Pakete: `next`, `react`, `react-dom`, `three`, `@react-three/fiber`, `genius-lyrics-api`, `@react-three/drei`, `@vercel/blob`, `yaml`, `ably`, `web-push`, `@types/node`, `@types/react`, `@types/react-dom`, `@types/three`, `typescript`, `@types/web-push`.
- **`npm run typecheck`**: Exit 2 infolge fehlender React-/Next-/Node-Module und Typdefinitionen; isolierte V711-Checks sind erfolgreich, aber kein Ersatz für den projektweiten Check.
- **Browser-Abnahme**: kein Playwright-/Live-Spotify-/Live-Last.fm-Test mit tatsächlichem Konto. Kein echter Next.js-Render unter installierten Abhängigkeiten; mobile/10-Zoll-Layout nicht visuell abgenommen.

## Bekannte Grenzen

- Das zugrunde liegende Last.fm-Archiv V706 speichert maximal 8.000 Scrobbles pro Benutzer. V711 zählt **erfasste Wiedergabeereignisse**, nicht Hörminuten oder Musikkonsum außerhalb des Archivs.
- Historische Lücken können die Rangfolge und Änderungen der 30-Tage-Verteilung beeinflussen.
- Der Abgleich nach Künstler/Songname normalisiert Unicode, Groß-/Kleinschreibung und äußere Leerzeichen; er kann unterschiedliche Schreibweisen desselben Songs als unterschiedliche Titel behandeln.
- Die Monatsspalten umfassen stets die letzten zwölf Kalendermonate. Top-Listen, Wochentage und Tageszeiten nutzen den gewählten 30-/90-/365-Tage-/Gesamtzeitraum. Künstlertrends verwenden immer die beiden jüngsten rollierenden 30-Tage-Fenster.
- Quellen bleiben unabhängig. Keine neue API-Abfrage, keine Archivänderung, kein Schreiben an Last.fm oder Spotify durch die V711-Statistik.

## Abnahme auf Zielrechner

1. `npm install` im V711-Projektverzeichnis ausführen, `package-lock.json` erzeugen und prüfen/einchecken.
2. `npm run typecheck`, `npm run test:quick`, `npm run build` ausführen und nur bei Exit 0 freigeben.
3. `.env.local` mit gültigem serverseitigem `LASTFM_API_KEY` konfigurieren, Last.fm-History öffnen und ein echtes Konto testen.
4. Sommer-/Winterzeitwechsel, Last.fm-Import, Kontowechsel, automatische Sicherung sowie 10-Zoll-/Mobilansicht im echten Browser abnehmen.
