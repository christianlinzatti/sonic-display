# Sonic Display V413 – Lyrics-Aware Choreography

In V413 erhalten **ausdrücklich aktivierte V412-Live-Choreografie-Presets** dezente, zeitlich begrenzte Rap-Gestenakzente aus synchronisierten Lyrics. Wortzeitstempel werden bevorzugt; andernfalls gelten nur Zeilenstarts. Unsynchronisierte Lyrics, Pausen und Reduced Motion erzeugen keine neuen Akzente.

- Die existierende Spotify-/Lip-Sync-Zeitbasis (`progressMs`) wird wiederverwendet.
- `lyricsAwareRapChoreographyV413.ts` enthält einen reinen deterministischen Sampler ohne externe API und ohne Audio-Vokalerkennung.
- Die V412-Motion-Auswahl, Clip-Überblendungen und Verse-/Hook-Show-Cues bleiben unverändert. Die zusätzliche Akzentstärke ist auf 150 % begrenzt.
- Choreografien außerhalb aktivierter V412-Presets bleiben unberührt.
- Wortbetonungen sind aus Wortstarts abgeleitete Bewegungsakzente, **keine** phonetisch oder akustisch erkannte Betonung.

Prüfung: `npm run test:v413`, `npx tsc --noEmit`, `npm run build`.
