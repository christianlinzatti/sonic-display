# V851 – Spotify Playlist & Speaker Control

Ausgehend von V850, eigenständiger Playlist-Bereich in Sonic Display (Button **♫ Playlists & Lautsprecher**). Auch verfügbar, wenn gerade kein Track abgespielt wird. Die 3D-Bühne bleibt unberührt.

## Bedienung

1. Nach dem Update über `/api/spotify/login` **Spotify erneut verbinden**, damit die zusätzlich benötigten Scopes gewährt werden: `playlist-read-private`, `playlist-read-collaborative`, `user-modify-playback-state`. `user-read-playback-state` war bereits vorhanden.
2. Button **Playlists & Lautsprecher** öffnen. Auf **Alle Playlists** wechseln, Playlists mit **☆** zur lokalen Auswahl hinzufügen (bis 100). Die Auswahl bleibt für diesen Browser gespeichert. Sie wird nicht in der App-Datenbank oder auf dem Server gespeichert.
3. In der oberen Leiste Spotify-Connect-Lautsprecher auswählen. Ggf. Spotify auf dem Gerät öffnen und **Geräte aktualisieren**.
4. Playlist auswählen, **Playlist auf Lautsprecher starten** drücken oder einen einzelnen Titel (▶) auswählen. Die Server-API sendet `PUT /me/player/play?device_id=...` mit dem Playlist-URI und optional einer 0-basierten Titelposition an Spotify. Keine Browser-Audioausgabe, keine Audio-Downloads.

## Wichtige Einschränkungen

- Für Spotify-Web-API-Wiedergabesteuerung ist **Spotify Premium** notwendig. Das Gerät muss über Spotify Connect erkannt werden und `is_restricted=false` zurückgeben. Manche Geräte erscheinen in der Spotify-API grundsätzlich nicht.
- Seit Spotify **Februar 2026** muss der Titelabruf `GET /playlists/{id}/items` verwenden. Spotify beschränkt diesen Abruf auf eigene und gemeinsam bearbeitete Playlists. Bei fremden Playlists wird ein verständlicher Hinweis gezeigt; **Playlist starten** bleibt als separate Funktion sichtbar.
- Spotify-Geräte-IDs sind nicht dauerhaft stabil. Die Oberfläche ruft sie beim Öffnen neu ab und speichert sie bewusst nicht dauerhaft.
- Playlists werden in 30er-Seiten und Titel in 40er-Seiten geladen. Nur aktiv ausgewählte Playlists laden ihre Titel, um die Spotify-API zu schonen.
- Cover werden unverändert mit `object-fit: contain` angezeigt; jedes Playlist- und Track-Element hat einen Link zu Spotify, und ein Spotify-Link steht im Footer.
- Bestehende Spotify-Verbindungen haben die neuen Scopes noch nicht. Das UI zeigt dann **Spotify erneut verbinden**.

## Technische Umsetzung

- `lib/spotify-playlists-v851.ts`: Eingabeprüfung, Normalisierung, Seiten, Geräte, Favoriten.
- `lib/spotify-playlists-server-v851.ts`: Token-Refresh, Scope-Checks, Fehlerbehandlung, Rate-Limit-Header, sichere HttpOnly-Session-Cookies.
- `app/api/spotify/playlists/route.ts`: Benutzer-Playlists.
- `app/api/spotify/playlists/[id]/items/route.ts`: Titel einer Playlist.
- `app/api/spotify/devices/route.ts`: verfügbare Spotify-Connect-Geräte.
- `app/api/spotify/playlists/play/route.ts`: POST nur mit kanonischer Origin, geprüften IDs/Position und neuem Scope; Wiedergabe nur nach Klick.
- `components/SpotifyPlaylistsV851.tsx`: lazy geladenes Playlist-Modal inkl. Favoriten, Suche, Geräteauswahl, Titelliste und Live-Status.
- `app/globals.css`: Touch-/Mobil-Layout.

## Prüfungen

- `npm run test:v851` – Regressionstests mit simulierten Spotify-API-Antworten (kein echtes Spotify-Konto nötig).
- `npm run test:v851:types` – strikter TypeScript-Check für die neue pure Utility-Library.
- `npm run typecheck` – vollständiger TypeScript-Check (nur mit vollständig installiertem `node_modules`).
- `npm run build` – Next.js-Produktionsbuild (nur mit vollständig installiertem `node_modules`).

**Stand bei Erstellung:** Reine V851-Utility-Typprüfung und V851-Regressionstests erfolgreich. Vollständiger Projekt-TypeScript-Check und Next.js-Produktionsbuild sind in dieser Arbeitsumgebung nicht durchführbar, da `npm ci` offline ohne gecachte Pakete scheitert. Die ZIP ist daher **nicht als produktionsvalidiert zertifiziert**. Ein echter Spotify-Premium-Account und ein Spotify-Connect-Lautsprecher waren für End-to-End-Tests nicht verfügbar.
