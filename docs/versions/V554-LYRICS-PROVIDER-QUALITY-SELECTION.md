# V554 – Lyrics-Provider-Qualitätsauswahl

Sonic Display fragt die verfügbaren Lyrics-Provider (Spotify Color Lyrics nur nach Opt-in, LRCLIB, lyrics.ovh, Genius) parallel ab, wartet auf alle abgeschlossenen Anfragen und übernimmt die beste nutzbare Variante. Fehlerhafte Provider blockieren keine Alternative.

**Priorität:** echte Wortzeitmarken > echte Zeilenzeitmarken > Text ohne Synchronisierung. Die Auswahl ist deterministisch; innerhalb derselben Kategorie zählt die Anzahl tatsächlich zeitcodierter Wörter bzw. Zeilen, danach die feste Providerreihenfolge. Die Synchronisierung wird **nicht** durch künstlich interpolierte Wort-Timestamps vorgetäuscht.

LRCLIB-Lyricsfile-Wortmarken werden auch dann gelesen, wenn das optionale `hasWordSync`-Flag fehlt. Spotify Color Lyrics bleibt opt-in und ist nicht durch die öffentliche Web-API zugesichert.

Test: `npm run test:v554` und `npm run test:v554:types`. Vorhandene UI/Karaoke-/Avatar-Lip-Sync-Komponenten lesen weiterhin das gemeinsame `Lyrics`-Modell.
