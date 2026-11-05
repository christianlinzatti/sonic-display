# V77 – Smart Lyrics Sync

- LRCLIB `hasWordSync` + `lyricsfile` YAML: `lines[].words[]` mit `start_ms`/`end_ms` werden in echte Wortzeiten umgewandelt.
- Fallback auf `syncedLyrics` (LRC), mit geschätzter gleichmäßiger Wortdauer.
- Ohne Synchronisierung bleibt die bisherige klassische Textdarstellung ohne zeitgenaue Hervorhebung.
- In der Lyrics-Ansicht wird zwischen echten und geschätzten Zeitstempeln unterschieden.
- Das Lyrics Studio aus V76 und alle vier Stile bleiben erhalten.
- Neue Laufzeit-Abhängigkeit: `yaml`. Nach dem Update bitte `npm install` ausführen.
