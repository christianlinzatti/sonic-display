# Sonic Display V362 – Personal Release Radar

V362 erweitert V361 um einen **manuell abrufbaren, persönlichen Spotify-Release-Radar**. Er erscheint als dritter Button `✦ Release Radar` oben rechts im Musikdisplay, sowohl bei Wiedergabe als auch wenn gerade kein Song läuft. Vorhandene Lyrics-, Avatar-, Spotify-Follow-, Discovery- und Library-Funktionen bleiben erhalten.

## Funktionen

- **Meine Künstler:** Ruft `GET /me/following?type=artist&limit=4` mit `user-follow-read` ab. Der Cursor `artists.cursors.after` ermöglicht das gezielte Laden der nächsten vier gefolgten Künstler. Für jeden dieser Künstler lädt der Server `GET /artists/{id}/albums?include_groups=album,single&limit=10`. Alles erfolgt ausschließlich auf Knopfdruck und mit einer Obergrenze von vier Künstler-/Albumabfragen pro Seitenabruf. Es gibt **keine automatische oder zeitgesteuerte Hintergrundprüfung**.
- **Zeitraum:** Filter für Veröffentlichungen der letzten 30, 90 oder 180 Tage. Es werden nur Alben und Singles berücksichtigt, deren Spotify-Datum die Präzision `day` besitzt; unscharfe Monat-/Jahresangaben und zukünftige Releases sind ausgeschlossen. Exakte Veröffentlichungsdaten stammen aus Spotify und nicht aus Schätzungen.
- **Spotify-Künstler und Covers:** Zeigt die untersuchten Künstler, Albumcover ohne Zuschnitt, Erscheinungsdatum und direkte Spotify-Links. Zusammenführungen entfernen doppelte Album-IDs.
- **Genres:** Ein separater Reiter greift auf die vorhandene V361-Katalogsuche zurück und bietet Deutschrap, Hardstyle, Hardtekk, Techno, Hip-Hop, Rock und Ambient. Grundlage ist `tag:new` plus ein optionales Genre-Stichwort im Album-Suchtext, **keine präzise Genre-Klassifikation und keine persönliche Empfehlungen-API**. Die Treffer sind auf zehn Alben begrenzt.
- **Ungesehen:** Benutzer können Releases manuell als „angesehen“ markieren, ungeprüfte ausblenden und Markierungen zurücksetzen. Nur die letzten 300 Album-IDs werden im Browser unter `sonic.release-radar.seen.v362` gespeichert. Weder Spotify-Token noch Songtitel, Namen oder Künstlerlisten werden persistent gespeichert. Der Status „ungesehen“ bedeutet nur „in diesem Browser nicht markiert“, nicht „Spotify hat die Veröffentlichung erst kürzlich entdeckt“.
- **Transparente Fehlerbehandlung:** 401/403/429 und teilweise fehlgeschlagene Album-Abfragen werden berücksichtigt. Bei Teilergebnissen wird explizit auf Unvollständigkeit hingewiesen. Keine Erfolgsmeldung oder Null-Release-Behauptung bei fehlgeschlagenen Künstlerabfragen.

## Umsetzung

- `lib/release-radar-v362.ts`: Cursor-/ID-/Zeitraum-Validierung, Normalisierung, Tagespräzision, Deduplizierung, lokale Markierungsgrenze.
- `app/api/spotify/release-radar/route.ts`: Serverroute mit Spotify-Session, automatischer Token-Erneuerung, Read-Scope-Check, API-Fehlercodes und `private, no-store`. Access-Token verlassen den Server nicht.
- `components/ReleaseRadarV362.tsx`: lazy geladene, touchfähige und über `Escape` schließbare Dialogansicht mit gefolgten Künstlern, Albumkarten, Genre-Reiter, Zeitraum und lokalen Markierungen.
- `components/SonicDisplay.tsx`, `app/globals.css`: Integration in beide Spotify-Displayzustände ohne zusätzlichen WebGL-Canvas.
- `tests/v362-personal-release-radar-regression.cjs`: Katalog-/Datums-, Cursor-, Scope-, Rate-Limit-, API- und UI-Regressionsprüfungen.

## Einrichtung und Grenzen

Spotify muss die Berechtigung `user-follow-read` besitzen (bereits seit V359 in der Login-Route). Bei älteren Sessions die Spotify-Verbindung trennen und erneut herstellen. V362 fügt keine neuen Scopes gegenüber V361 hinzu.

Der Radar ist **kein vollständiger Feed aller Veröffentlichungen**: Eine Seite prüft nur vier Künstler und pro Künstler lediglich die ersten zehn Album-/Single-Einträge. Bei größeren Diskografien, Features, ungenauen Datumsangaben, App-Beschränkungen oder Spotify-Rate-Limits können Veröffentlichungen fehlen. Die Genre-Neuheiten sind nicht aus den gefolgten Künstlern abgeleitet. V362 verspricht weder Push-Nachrichten noch automatisches Monitoring.

Installation: `npm install`, `npm run verify`, `npm run dev`.

## Validierung

- V362-spezifischer Parser-, API- und UI-Test erfolgreich (`node tests/v362-personal-release-radar-regression.cjs`).
- Alle 474 TS/TSX-Quelldateien syntaktisch geprüft (`npm run check:syntax`).
- Strenge isolierte TypeScript-Prüfung der zusammenhängenden V360/V361/V362-Datenmodelle: bestanden.
- Die längere sequentielle `verify:offline`-Prüfung erreichte ohne Testfehler V361, wurde aber durch ein externes Laufzeitlimit unterbrochen. Die zwei letzten Tests V361 und V362 wurden direkt separat erfolgreich ausgeführt. Deshalb wird hier **kein vollständig abgeschlossener npm-Gesamtlauf** behauptet.
- Kein Next.js-Produktionsbuild in dieser Umgebung: `node_modules` und `package-lock.json` fehlen (Preflight nur 1/15 Abhängigkeiten verfügbar). Spotify-Live-Zugriff mit einem angemeldeten Konto noch nicht verifiziert.

Offizielle Spotify-Dokumentation:
- https://developer.spotify.com/documentation/web-api/reference/get-followed
- https://developer.spotify.com/documentation/web-api/reference/get-an-artists-albums
- https://developer.spotify.com/documentation/web-api/references/changes/february-2026
