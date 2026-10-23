# Sonic Display V361 – Smart Music Discovery

V361 erweitert das vollständige V360-Projekt um ein eigenes Musik-Entdeckungsfenster **♫ Musik entdecken**. Es erscheint bei einer aktiven Spotify-Verbindung, unabhängig davon, ob Musik läuft, und verwendet keinen zusätzlichen Three.js-Canvas.

## Funktionen

1. **Genres:** Spotify-Song-Suchergebnisse für Deutschrap, Hardstyle, Hardtekk, Techno, Hip-Hop, Rock und Ambient. Die Suche ist nicht personalisiert und stellt keine Beliebtheitsrangliste dar.
2. **Neue Releases:** `GET /search?type=album&q=tag:new` für von Spotify als neu markierte Alben und Singles (laut Spotify ungefähr zwei Wochen). Eine optionale Genre-Stichwort-Eingrenzung ist experimentell und sucht Albumtext; sie ist **kein verlässlicher Genre-Metadatenfilter**. Es ist weder eine vollständige Chronologie aller Releases noch eine echte personalisierte Empfehlungsliste. Alben lassen sich aufklappen und in 10er-Seiten durch die vorhandenen Titel navigieren (maximal 60 Titel im Dialog).
3. **Songs suchen:** Freie Spotify-Track-Suche mit Eingabe-Entprellung. Maximal zehn Treffer pro Spotify-Suchanfrage, Paginierung bis Offset 50.
4. **Meine Songs:** Zeigt bereits gespeicherte Spotify-Titel mittels `GET /me/tracks` (Scope `user-library-read`).
5. **Speichern, entfernen und Status prüfen:** `GET /me/library/contains`, `PUT /me/library` und `DELETE /me/library` ausschließlich mit validierten `spotify:track:{id}`-URIs. Nach einem Schreibaufruf wird der echte Status erneut abgefragt. Erst dann ändert sich die UI. Bekannte Fehler/Fehlercodes und nicht bestätigte Änderungen werden dargestellt.
6. **Cover, Erscheinungsdatum, Künstler und Spotify-Links:** Bilder bleiben unverzerrt und vollständig sichtbar (`object-fit:contain`), mit Spotify-Herkunftshinweis. Fehlende Datumsfelder werden ausdrücklich als unbekannt gekennzeichnet. Albumdetails zeigen das Veröffentlichungsdatum des gewählten Albums.
7. **Hörproben:** Ein Audioplayer wird ausschließlich angezeigt, wenn `preview_url` von Spotify mit gültiger HTTPS-CDN-Adresse geliefert wird. Das veraltete, oft fehlende Feld wird **nicht simuliert**; stattdessen bleibt immer der Link zu Spotify. Der Audioplayer ist in den Musikentdeckungsdialog eingebettet, nicht als eigenständiger Preview-Dienst.

## Dateien

- `lib/music-discovery-v361.ts`: Spotify-Abfragepfade, Sicherheits- und Größenbegrenzungen, Release-/Track-Normalisierung, Datum, Preview-URL- und URI-Validierung.
- `app/api/spotify/music-discovery/route.ts`: serverseitige Spotify-Katalog- und Library-Abfragen mit Token-Erneuerung, Rate-Limit-Behandlung, no-store.
- `app/api/spotify/music-discovery/library/route.ts`: serverseitige Library-Status- und Änderungsroute, OAuth-Scope-Prüfung, Origin-Check für Schreibzugriffe, bestätigtes Readback.
- `components/MusicDiscoveryV361.tsx`: lazy geladenes, für Touch bedienbares Dialogfenster, Suche, Genres, Neuheiten, Bibliothek, Hörproben.
- `components/SonicDisplay.tsx`, `app/globals.css`: Integration in bestehende Song- und Standby-Ansicht und Touch-CSS.
- `app/api/spotify/login/route.ts`: zwei zusätzliche OAuth-Scopes `user-library-read`, `user-library-modify`.
- `tests/v361-smart-music-discovery-regression.cjs`: Parser-, API-, Scope-, Mutation-/Verifikations-, Sicherheits- und UI-Strukturtests.

## Einrichtung

Spotify nach dem Update einmal trennen und erneut verbinden, damit die Bibliotheks-Berechtigungen angefordert werden können. Token und Refresh-Token verbleiben vollständig im serverseitigen Session-Cookie beziehungsweise Servercode und werden nicht an React übergeben. `user-top-read` für V360, `user-follow-read`/`user-follow-modify` für V359 bleiben erhalten.

Lokal: `npm install`, `npm run verify`, dann `npm run dev`.

## Grenzen und Tests

**Spotify Dev-Mode-Regeln 2026:** Die früheren API-Endpunkte `GET /browse/new-releases` und `GET /artists/{id}/top-tracks` stehen für Dev-Mode-Apps nicht mehr zur Verfügung und werden von V361 nicht verwendet. Der Suchendpunkt ist auf maximal zehn Elemente pro Anfrage begrenzt; `tag:new` gilt für **Alben**, nicht für Tracks. `preview_url` ist veraltet und kann fehlen. Spotify kann abweichende Ergebnisse nach Benutzerland, Katalog, App-Zugriff, Account und Quoten liefern.

Offline-Regression: **104/104** Prüfschritte bestanden; **471 TypeScript-/TSX-Dateien** syntaktisch geprüft. Neue V361-Datenmodelle zusätzlich mit `tsc --strict --noEmit` geprüft. Der vollständige Next.js-Produktionsbuild wurde **nicht** bestätigt, da in der Erstellungsumgebung `node_modules` und `package-lock.json` fehlten (Preflight 1/15 Pakete vorhanden). Live-Abfragen gegen ein angemeldetes Spotify-Konto stehen noch aus. Ein End-to-End-Test sollte nach der Installation neue OAuth-Scopes, Album-Releases, Genre-Katalog, mindestens einen gespeicherten/nicht gespeicherten Titel, beide Library-Mutationen und Spotify-Preview-Fallback abdecken.

Offizielle API-Dokumentation:
- https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide
- https://developer.spotify.com/documentation/web-api/reference/search
- https://developer.spotify.com/documentation/web-api/reference/save-library-items
- https://developer.spotify.com/documentation/web-api/reference/remove-library-items
