# Sonic Display V474 – Natural Rap Gesture Variety

## Neue Funktionen

- Fünf stabile Rap-Gestenmotive (`nod`, `open`, `reply`, `sweep`, `bounce`) für vorhandene zeitgebundene V472/V473-Vocal-Akzente.
- Benachbarte Lyrics-Zeilen erhalten bei gleichbleibendem Song/Avatar unterschiedliche Motive; das Motiv bleibt bei Seek und Re-Render stabil.
- Für Solos/Verses unterschiedliche Motive je Avatar; für gemeinsame Hooks geteilte Motive mit dezenter linker/rechter Asymmetrie. Die Spotify-Credits identifizieren **keine** singende Stimme.
- Kleine begrenzte Arm-, Brust- und Kopfbewegungen für prozedurale Avatare; für GLB laufen veränderte additive Vocal-Akzente durch die bestehende `useAudioMotionEngine`, ohne Clips zu überschreiben.
- Keine Animation bei Pause, Reduced Motion oder fehlenden gültigen Vocal-Lyrics, und keine Variationen auf manuell authored Choreografie oder nicht singende Background-Rollen.
- Keine zusätzlichen Intervalle, lokalen Speicherungen, Audio- oder Netzwerkaufrufe und keine neue Benutzerkonfiguration.

## Architektur und Grenzen

Die Berechnung ist vollständig deterministisch aus Track-ID, Zeilenindex, Avatar-Slot und Songabschnitt. Als Grundlage dienen ausschließlich vorhandene, bereits akzeptierte V472/V473-Gesten; die Engine erkennt weder Vocals noch Betonungen aus Audio und behauptet keine neuen Wort-Zeitstempel. Die Größe ist begrenzt (`head <= .055`, `chest <= .09`, `arms <= .11` Rad). Die zusätzlichen prozeduralen Rotationen liegen unter `.018` Rad. Die bisherige Speicher-, Playback- und Audioarchitektur bleibt unverändert.

## Verifikation

```sh
npm run test:v474
npm run test:v474:types
npm run build
```

`npm run build` führt wie bisher zuerst den Preflight und danach den Next.js-Produktions-Build aus. Der letzte vom Nutzer bestätigte vollständige Produktions-Build stammt aus V473.7; V474 muss lokal mit installierten Projektabhängigkeiten bestätigt werden.
