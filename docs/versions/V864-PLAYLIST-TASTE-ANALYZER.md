# V864 – Spotify Playlist Taste Analyzer

## Anwendung

1. Unter **Meine Musik** eine Playlist auswählen.
2. Im Detailbereich auf **Playlist analysieren** tippen. Erst dann werden die bestehenden Spotify-Playlist-Seiten geladen, höchstens 500 Positionen. Die Playlist bleibt unverändert; die Analyse startet keine Wiedergabe.
3. Wenn unter Last.fm ein Benutzer eingerichtet ist, wird das vorhandene lokale, kontogebundene Langzeitarchiv **nur gelesen** und mit den Playlist-Songs verglichen. Ohne Last.fm stehen Künstleranteile und Titelübersicht weiterhin zur Verfügung.
4. Filter **Alle / Oft gehört (mindestens 3 Scrobbles) / Im Archiv / Kein Archivtreffer** und Suche verwenden.

## Grenzen & Datenschutz

- Die aktuelle Spotify-API liefert Playlist-Titel nur für eigene oder gemeinsam verwaltete Playlists; bei gefolgten fremden Playlists kann HTTP 403 auftreten. Ein entsprechender Hinweis erscheint im Analyzer.
- Kein globales Spotify-Hörprotokoll: „Kein Archivtreffer“ bedeutet nicht „nie gespielt“. Nicht gescrobbelte Geräte, Lücken, Last.fm-Konten oder abweichende Tags können Treffer verhindern.
- Songidentität aus normalisiertem Hauptkünstler und Titel; Diakritika und „feat.“-Suffixe werden vereinheitlicht. Live/Remix-Varianten werden bewusst getrennt gehalten. Der Algorithmus kann bei Sonderfällen Titel über- oder unterzuordnen.
- Doppelte Titelpositionen werden für die Vergleichszahlen zusammengefasst, nicht als mehrere unterschiedliche Songs gezählt. Keine neue Datenbank, keine neuen API-Berechtigungen, keine eigenständigen Last.fm-Requests.
- Abbruch bei Playlistwechsel/Modal-Schließen; kein dauerhaftes Hintergrund-Polling. Bei über 500 Playlist-Positionen wird die Analyse als Teilmenge bezeichnet. Fehler bei API-Paginierung erscheinen statt verdeckter Teilergebnisse.
- Falls IndexedDB nicht verfügbar oder noch leer ist, wird nur bei vorhandenem Benutzer und gefülltem lokalem Kurzzeitarchiv der eindeutig als eingeschränkt markierte Spiegel benutzt. Ist kein lokales Archiv vorhanden, werden keine Wiedergaben behauptet.

## Qualitätsbefehle

`npm run test:v864`, `npm run test:v864:types`, `npm run test:v864:ui-types`, `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`, `npm run typecheck`, `npm run build`.
