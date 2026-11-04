# Sonic Display V180 – Smart Genre Detection & Lighting Profile Intelligence

- Weiterentwicklung von V179: Last.fm Track-Tags mit Artist-Tags als Fallback, gewichtet nach Tag-Count.
- Hardtekk (`hardtekk`) ist jetzt ein eigener `MusicGenre` statt pauschal Hardstyle. Bereits vorhandene Hardtekk-Zuordnungen können dadurch in V179-Lichtprofilen verwendet werden.
- Schwache Titel-/Artist-Namenshinweise und optional manuell eingegebene BPM ergänzen vorhandene Tag-Evidenz; BPM allein erfindet kein Genre.
- Heuristischer Confidence Score 15–95; **keine** kalibrierte Wahrscheinlichkeit. Quellen und Match werden angezeigt.
- Bestehende manuelle Genre-Übersteuerung bleibt verfügbar und hat Vorrang.
- Spotify stellt in diesem Projekt keinen Audio-BPM-Feed bereit; der optionale BPM-Hinweis ist manuell. Auch Mikrofon-Energie wird nicht als verlässlicher BPM-Klassifikator ausgegeben.
- Bestehende Lichtprofile, Preset-Bibliothek, Versionen, Spotify und Lyrics bleiben erhalten.

Prüfen: `npm run test:genre-intelligence`, `npm run verify:offline`, nach `npm install` zusätzlich `npm run typecheck && npm run build`.
