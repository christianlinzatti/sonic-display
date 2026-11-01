# V699 – History Explorer: „Zuletzt gespielt“

## Nutzung

In Sonic Display nach Spotify-Verbindung oben rechts **◷ Zuletzt gespielt** öffnen. Die bisherigen Tabs **Chronik**, **Hör-Highlights**, **Cover-Galerie**, **Genre-Mix**, **Mein Musikprofil** und **Konzert-Designer** bleiben unverändert nutzbar.

### Die erweiterte Chronik

- **Suche:** Teilbegriffe aus Titel, Künstler und Album (auch mit fehlenden Umlaut-Akzenten); mehrere Wörter dürfen in verschiedenen Feldern vorkommen.
- **Zeitraum:** Alle geladenen, Heute (lokaler Kalendertag), letzte 7 oder 30 Tage relativ zur Gerätezeit. **Dies fragt keine älteren Spotify-Seiten automatisch nach:** Auf „Ältere Titel laden“ klicken, wenn weitere Ereignisse benötigt werden.
- **Wiedergaben:** Alle einzelnen Hörereignisse (inkl. Wiederholungen), nur mehrfach gehörte Songs (Mehrfachzählung innerhalb der derzeit geladenen Ereignisse) oder jeden Song einmal. Im Einmal-Modus bleibt je nach Sortierung der älteste bzw. neueste geladene Abspielzeitpunkt sichtbar.
- **Reihenfolge:** Neueste bzw. älteste Ereignisse zuerst. Der große „DEIN LETZTER SONG“-Akzent erscheint nur im ungefilterten, neuesten Verlauf.
- **Zähler:** Zeigt die Trefferzahl aus den geladenen Ereignissen; nicht die Lebenszeitstatistik des Spotify-Kontos.
- **CSV exportieren:** Exportiert auf ausdrücklichen Klick nur die **gefilterten, bereits geladenen** Titel, ISO-Zeitpunkt, Song, Künstler, Album, Songlänge und öffentlichen Spotify-Link. CSV ist Semikolon-getrennt, UTF-8 mit BOM, doppelt maskiert und schützt gegen typische Tabellen-Formelinjektionen. Kein Upload an einen Drittanbieter.
- **Mehr laden:** Lädt wie bisher je Seite 30 weitere Spotify-Hörereignisse, entfernt nur seitenübergreifende Dubletten desselben Songs zum **selben** Abspielzeitpunkt und begrenzt die Ansicht auf 600 Events. Andere Abspielzeitpunkte desselben Songs bleiben erhalten. Daten werden nach dem Schließen wie bisher verworfen.

### Spotify-Grenzen und Privatsphäre

- Es handelt sich um die von Spotifys Endpoint `/me/player/recently-played` gelieferten Ereignisse. Spotify bietet damit **keinen garantierten vollständigen Langzeitverlauf**. Auch Filter über 30 Tage zeigen nur Ereignisse, die Spotify überhaupt liefert und die du geladen hast.
- OAuth-Scope bleibt `user-read-recently-played`, Tokens werden nur serverseitig eingesetzt. Daten bleiben über `private, no-store` uncached und werden nicht automatisch in `localStorage` oder auf dem Server gespeichert. Der CSV-Export legt nur auf deinen ausdrücklichen Klick eine Datei auf dem lokalen Gerät ab.
- Bei `consent_required` über **Spotify neu verbinden** erneut Zugriff genehmigen. Bei Limits oder Netzfehlern bleibt die bereits geladene Chronik sichtbar; die fehlgeschlagene Anfrage kann erneut versucht werden.
- Tastatur: `Esc` schließt; `Tab`/`Shift+Tab` bleiben im geöffneten Dialog, der Hintergrund scrollt nicht.

### Tests

`npm run test:v699`, `npm run test:v699:types`, `npm run test:quick`, `npm run check:release`; vollständiger App-Build benötigt die externen npm-Dependencies und ein Lockfile.
