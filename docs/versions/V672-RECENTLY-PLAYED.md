# V672 – Zuletzt gespielt

## Neue Funktion

Im verbundenen Sonic Display steht oben rechts **„◷ Zuletzt gespielt“** zur Verfügung – sowohl während der Wiedergabe als auch im Leerlauf. Die Ansicht zeigt eine besonders große Karte für den jüngsten Track, weitere Titel als Albumcover-Karten, Zeitangaben, Album, Künstler und einen Link nach Spotify. Die Titel sind nach Hördatum gruppiert (Heute, Gestern und Kalendertage), mit einer lokalen Suche über bereits geladene Titel.

## Spotify-Anmeldung

Das Spotify Web API benötigt für `/v1/me/player/recently-played` den Scope `user-read-recently-played`. Bestehende Nutzer müssen einmal **Spotify erneut verbinden** und diesen Zugriff genehmigen. Ein bestehender Login ohne diese Berechtigung erzeugt eine verständliche Aufforderung zur erneuten Anmeldung. Die API zeigt bis zu 30 Wiedergaben pro Seite; „Ältere Titel laden“ fragt über `before` nach weiteren Einträgen. Wiederholte Songs bleiben als einzelne Hörereignisse erhalten. Die Suchfunktion erfasst nur die schon geladenen Seiten, nicht die vollständige Spotify-Historie.

## Sicherheit, Datenschutz und Performance

Authentifizierung/Token-Refresh nur serverseitig. Kein Exponieren von Zugriffstokens oder Original-Spotify-Antworten im Browser. Kein Polling, kein dauerhafter Speicher, `private, no-store`, begrenzte Anfragen, validierter Cursor und sichere Spotify-Links. Cover nur von Spotify-CDN-Domains. Lesefunktion – keine Wiedergabesteuerung. Die Übersicht bleibt getrennt von 3D-Visualisierung und Lyrics.

## Test

`npm run test:v672` (UI-/Daten- und API-Tests), `npm run check:release`, `npm run build` (entspricht Produktions-Build). Ohne installierte Dependencies laufen TypeScript-Check und Next.js-Build nicht; dies muss bei der Freigabe transparent benannt werden.
