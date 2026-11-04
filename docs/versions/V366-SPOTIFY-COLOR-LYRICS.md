# Sonic Display V366 – Spotify Color Lyrics (experimentell)

Diese Version ergänzt die vorhandenen Lyrics-Provider **optional** um Spotifys nicht öffentlich dokumentierte Color-Lyrics-Schnittstelle, über die häufig Musixmatch-Lyrics verfügbar sind. Es wird **kein Musixmatch-API-Key** gebraucht.

## Aktivierung

In `.env.local` bzw. in den Vercel Environment Variables:

```env
SPOTIFY_INTERNAL_LYRICS_ENABLED=true
```

Bei ausgeschalteter Option bleibt die V365-Lyrics-Kette unverändert. Der Zugriff funktioniert nur bei Spotify-Verbindung, die Zugangstokens werden ausschließlich serverseitig aus dem vorhandenen OAuth-Session-Cookie geladen. Eine andere Authentifizierung, Cookie-Scraping oder das Auslesen von Web-Player-Tokens findet ausdrücklich **nicht** statt.

## Ablauf

1. Spotify-Playback liefert Track-ID und Album-ID.
2. Browser sendet nur Track-ID/Album-ID an `/api/lyrics`.
3. Bei aktivierter Option versucht der Server `https://spclient.wg.spotify.com/color-lyrics/v2/album/{album_id}/track/{track_id}?format=json&vocalRemoval=false&market=from_token` (bei fehlender Album-ID `/track/{track_id}`).
4. Spotify-Zeilen (`LINE_SYNCED` oder unsynchronisiert) werden in das bestehende `Lyrics`-Datenmodell normalisiert. Zeitstempel werden nur übernommen, wenn sie vorhanden und gültig sind.
5. Bei fehlenden Lyrics, Verbindungsfehlern oder HTTP 401/403/404/429/5xx folgen LRCLIB, lyrics.ovh und Genius unverändert.

## Wichtige Einschränkung

`spclient.wg.spotify.com` ist **keine offiziell dokumentierte Spotify Web API**. Der reguläre Spotify-OAuth-Token funktioniert dort möglicherweise **nicht**, selbst mit Premium. Die Benutzung und weitere Bereitstellung müssen mit Spotifys aktuellen Nutzungsbedingungen und den Rechten an Songtexten vereinbar sein. **Funktion ist nicht als produktiv verifiziert.** Unabhängig davon bleiben die bisherigen Anbieter nutzbar.

## Tests

`npm run test:v366` testet Endpoint-Schutz, ID-Validierung, Sync-Parsing, Fallback-Verkabelung und Versionsintegration. `npm run verify:offline` führt die vorhandenen Offline-Regressionen samt V366 aus. Ein realer Live-Test mit Spotify ist noch notwendig.
