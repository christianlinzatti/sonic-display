# Sonic Display V360 – Smart Artist Discovery

## Was enthalten ist

Auf Grundlage von V359 gibt es jetzt den Button **✦ Künstler entdecken** oben rechts bei bestehender Spotify-Verbindung (auch wenn gerade kein Track läuft). Der Dialog kann ohne Unterbrechen des 3D-Visualizers geöffnet und geschlossen werden.

* **Genres:** Deutschrap, Hardstyle, Hardtekk, Techno, Hip-Hop, Rock und Ambient. Spotify liefert die Ergebnisse seiner Suche. Die Genre-Tags im Künstlerprofil sind seit dem API-Umbau teils leer. Bei wenigen Treffern bitte freie Suche verwenden.
* **Suche:** Spotify-Künstlersuche mit 350-ms-Eingabeentprellung. Maximal 10 Spotify-Treffer pro Anfrage, paginiert; keine unbekannten API-Parameter. Bei ausgeschöpften API-Suchergebnissen ist Schluss.
* **Deine Favoriten:** `GET /me/top/artists` für häufig gehörte Künstler der letzten rund sechs Monate (nicht als Neuempfehlungen ausgegeben); optionaler neuer OAuth-Scope `user-top-read`.
* **Artist Cards:** Spotify-Bild (in Originalproportion), Name, Genre, Spotify-Link, überprüfter Follow-Status und V359-Folgen/Entfolgen-Aktion. Die Ansicht zeigt auch Künstler des aktuellen Songs.
* **Songauswahl:** `GET /search?type=track&q=artist:...`, serverseitig nach exakter Künstler-ID gefiltert. **Keine Rangliste beliebtester Songs**: der dafür früher verfügbare `GET /artists/{id}/top-tracks` wurde für neue Developer-Mode-Apps entfernt. Songs öffnen sich über Spotify.
* **Status-/Follow-Aktionen:** V359 bleibt unverändert und nutzt `GET /me/library/contains`, `PUT /me/library`, `DELETE /me/library` mit `spotify:artist:{id}`. Für Statusabfragen teilt V360 die Künstler in maximal 10 IDs je Anfrage auf. Mutation nur nach bestätigtem Status, keine optimistische Erfolgsmeldung. Nach bestätigter Änderung wird auch die V359-Statusanzeige beim laufenden Song per lokalem Ereignis aktualisiert.

## Technische Dateien

- `lib/artist-discovery-v360.ts`: Genres, Eingabevalidierung, URL-/ID-Sanitizing und DTO-Normalisierung.
- `app/api/spotify/discovery/route.ts`: dynamische, serverseitige Spotify-Suche und Favoriten, Token-Refresh, Rate-Limit-/401-/403-Behandlung, `no-store`.
- `components/ArtistDiscoveryV360.tsx`: Touch- und Mausoberfläche, Folgen/Entfolgen, Songauswahl, Suchentprellung, AbortController, Status-Batching.
- `components/SonicDisplay.tsx`: Lazy-Einbindung ohne weiteren Canvas.
- `app/api/spotify/login/route.ts`: optionaler Scope `user-top-read`.
- `tests/v360-smart-artist-discovery-regression.cjs` und `V360-VALIDATION.txt`.

## Einrichtung und Berechtigungen

Beim ersten Öffnen nach dem Update Spotify über **/api/spotify/login** neu verbinden, damit `user-top-read` für die Favoriten und die schon in V359 eingeführten `user-follow-read` und `user-follow-modify` aktiv sind. Ohne `user-top-read` bleibt die Künstlersuche nutzbar; die Favoritenansicht zeigt einen Verbindungs-Hinweis. Alle Aufrufe werden serverseitig mit dem Cookie-basierten Benutzer-Token an Spotify geleitet; das Token gelangt nie ins Browser-JavaScript.

## API-Grenzen und ehrliche Produktbeschreibung

Spotify Development Mode hat seit Februar/März 2026 reduzierte Endpunkt-Verfügbarkeit. `GET /artists/{id}/related-artists` und `GET /artists/{id}/top-tracks` dürfen nicht als funktionierend vorausgesetzt werden. Das Artist-Objekt liefert `genres` nicht zuverlässig. Die Suche bietet genrebezogene Katalogtreffer, **keine algorithmisch personalisierten Empfehlungen**. Eine Laufzeitverbindung zu einem echten Spotify-Premium-Konto muss nach Installation geprüft werden. Die V359-Library-Dokumentation benennt Künstler-URIs uneinheitlich; eine abgelehnte Änderung bleibt sichtbar statt eine Erfolgsmeldung zu erzeugen.

## Prüfung

Auf einem Rechner mit Internetzugang: `npm install`, dann `npm run verify`. In der Erstellungsumgebung wurden 103 Offline-Regressionskommandos erfolgreich ausgeführt, jedoch kein vollständiger Next.js-Produktionsbuild. Für Tests mit Spotify zusätzlich: (1) neu anmelden und Berechtigungen akzeptieren; (2) Genre-Suche und freie Suche öffnen; (3) bekannten Künstler finden, Status vergleichen, folgen und entfolgen; (4) mehrere Künstler desselben Songs prüfen; (5) Favoritenansicht und Songauswahl kontrollieren.

Quellen: https://developer.spotify.com/documentation/web-api/references/changes/february-2026 , https://developer.spotify.com/documentation/web-api/reference/search , https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
