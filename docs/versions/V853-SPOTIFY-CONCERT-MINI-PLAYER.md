# V853 – Spotify Concert Mini Player

Aufbauend auf V852: dauerhaft eingeblendete, kleine Wiedergabeleiste im Konzertstil.

- Zeigt Albumcover, Song, Interpret, Fortschritt und den **aktiven** Spotify-Connect-Lautsprecher aus `/api/spotify/devices`.
- Play/Pause sowie vorheriger und nächster Titel. Funktioniert auch wenn das große Musikbibliotheksfenster geschlossen ist. Klick auf **Meine Musik** öffnet die unveränderte Playlist-Bibliothek.
- Kein zweiter Abruf des aktuellen Songs: der Player liest den vorhandenen `MusicContext` und dessen Polling. Geräteliste wird initial, bei Wiedergabestart aus der Bibliothek, bei Fensteraktivierung und höchstens alle 45 Sekunden bei sichtbarem Fenster aktualisiert. Alle Intervalle/Listener haben Cleanup.
- Server-Endpunkt `POST /api/spotify/player/control`: Same-Origin-Prüfung, `pause/resume/next/previous`-Allowlist, getrennte Spotify-Scopes, Token-Refresh und Fehlerbehandlung. Die API sendet nur Befehle an das bereits aktive Gerät; kein ungewollter Gerätewechsel oder eigener Audiostream.
- Touch-optimiert, responsive und `prefers-reduced-motion` berücksichtigt; Meldungen und erneuter Login bei fehlenden Berechtigungen.

## Prüfung

`npm run test:v853`, `npm run test:v853:types`, `npm run test:v852`, `npm run test:v851`, `npm run test:v851:types`, `npm run check:syntax`, `npm run check:architecture`.

Vor Release zusätzlich **vollständigen** `npm run typecheck` und `npm run build` auf einem System mit vollständigem `npm ci` durchführen. Wirkliche Wiedergabe erfordert Spotify Premium und ein verfügbares Spotify-Connect-Gerät. Die Spotify-Wiedergabe-API kann 403/404/429 melden; diese Fehler sind nicht durch UI-Fallbacks zu umgehen.
