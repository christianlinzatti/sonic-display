# Sonic Display V359 – Spotify Artist Follow (Library API 2026)

Diese Version ergänzt unter dem Interpretentitel im Musik-Display den Live-Spotify-Follow-Status sowie **+ Folgen** und **Entfolgen** für sämtliche beim aktuellen Track verfügbaren Spotify-Künstler-IDs (maximal 10).

## API-Integration

- `GET /api/spotify/current` liefert `artistDetails` mit `id`, `name` und einem sicheren Künstlerprofil-Link.
- `GET /api/spotify/artists/follow?ids=<csv>` liest die Zustände serverseitig über `GET https://api.spotify.com/v1/me/library/contains?uris=...`, zum Beispiel `uris=spotify%3Aartist%3A2takcwOaAZWiXQijPHIx7B`.
- `POST /api/spotify/artists/follow` mit `{ "artistId": "…", "follow": true }` ruft `PUT https://api.spotify.com/v1/me/library?uris=...` auf; `follow:false` verwendet `DELETE`.
- Nach einer Mutation wird mit `GET /me/library/contains` erneut geprüft; die UI meldet **nur bestätigte Änderungen**. Unbestätigte Änderungen bleiben offen und werden nicht als Erfolg angezeigt.
- Es werden bewusst **keine veralteten `/me/following`-Mutationen** genutzt.

OAuth-Scopes: `user-read-currently-playing user-read-playback-state user-follow-read user-follow-modify`. **Bestehende Sitzungen nach dem Update neu über den Spotify-Login verbinden**, damit die Follow-Scopes wirklich vorliegen. Der Zugriff erfolgt über die verschlüsselte serverseitige Session; keine Spotify-Tokens im Browser. Statusdaten werden nicht persistiert. Änderungen unterliegen einer serverseitigen Same-Origin-Prüfung sowie ID-Validierung.

## Spotify-Dokumentationswiderspruch / Einschränkung

Spotify beschreibt seit Februar 2026 die Library-API als Ersatz für Artist-Follow und -Unfollow:

- https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide
- https://developer.spotify.com/documentation/web-api/reference/check-library-contains
- https://developer.spotify.com/documentation/web-api/reference/save-library-items
- https://developer.spotify.com/documentation/web-api/reference/remove-library-items

Der Migrationsleitfaden bestätigt die Zuordnung **Artist-Follow → PUT/DELETE /me/library**, die aktuelle Referenz von PUT/DELETE zählt `spotify:artist:` jedoch *nicht* unter den unterstützten URI-Typen auf (GET /contains schon). Dadurch ist ohne echte Spotify-Session **nicht garantiert**, dass der Artist-Schreibzugriff für die konkrete App akzeptiert wird. HTTP 400/404/405/410/422 werden daher als nicht unterstützt gemeldet. Bei Fehlern kann der Benutzer das sichere Spotify-Künstlerprofil direkt öffnen. Es wird kein Erfolg simuliert.

## Validierung

- `npm run test:v359`: simulierte Spotify-GET/PUT/DELETE-Antworten, Status-Rücklesung, Query-Encoding, Mehrfachkünstler, OAuth-Scope- und Same-Origin-Checks, deaktivierte Erfolgsmeldung bei Spotify-Ablehnung.
- `npm run verify:offline`: alle 102 lokalen Kommandos erfolgreich.
- `npm run check:syntax`: 464 TS/TSX Dateien erfolgreich.
- `tsc --noEmit --strict --target ES2022 --module esnext --lib es2022,dom lib/artist-follow-v359.ts`: bestanden.
- `npm run build:preflight`: blockiert: Next.js-, React- und TypeScript-Abhängigkeiten fehlen; der vollständige Next.js-Build und End-to-End-Test mit Spotify-Premium-Konto konnten hier nicht erfolgen.

Lokal: `npm install && npm run verify`, anschließend Spotify neu verbinden und Folgen/Entfolgen an einem echten Künstlerprofil prüfen.
