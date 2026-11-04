# V856 · Music Memory Insights

V855 bleibt unverändert für das lokale Spotify-Archiv. Neu in der bestehenden Last.fm-History: monatlicher Vergleich, aufkommende Lieblingskünstler und konkret wiederentdeckte Songs.

## Bedienung

1. Den Last.fm-History-Bereich öffnen und bei Bedarf alte Scrobbles importieren oder aus dem bestehenden IndexedDB-Langzeitarchiv laden.
2. Im Abschnitt **Dein Sound im Wandel** den Analysemonat und die Zeitzone (Wien/UTC) wählen.
3. Die 12 Monatsbalken und den Vergleich zum Vormonat, die aufkommenden Favoriten und Song-Comebacks ansehen.
4. Optional Künstler- oder Songprofil direkt im vorhandenen History Explorer öffnen.

## Definitionen und Grenzen

- Ein *aufkommender Favorit* hat mindestens 3 erfasste Scrobbles im gewählten Monat und ist entweder erstmals im Archiv erfasst oder mindestens doppelt so häufig wie im Vormonat gehört worden; die Sortierung erfolgt nach Monatsplays. Das ist eine **statistische Beobachtung**, keine KI-Prognose.
- Eine *Wiederentdeckung* erfordert zwei erfasste Scrobbles desselben normalisierten Künstler-/Song-Paars im bestehenden Archiv, getrennt durch mindestens 90 volle 24-Stunden-Tage. Die Wiederentdeckung muss in den gewählten Monat fallen. Fehlende Archivdaten beweisen keine echte Hörpause.
- Vergleichszahlen sind rohe Scrobble-Zahlen, keine Hörminuten. Wenn der Vormonat keine archivierten Scrobbles enthält, wird **keine Prozentänderung** berechnet. Der aktuelle Monat kann unvollständig sein.
- Zeitgrenzen werden für beide Auswertungen einheitlich in `Europe/Vienna` oder `UTC` berechnet. Doppelte, unterschiedlich geschriebene Künstler-/Songnamen werden normalisiert.
- Die gesamte V856-Analyse ist offline, read-only und account-spezifisch (kontoabhängig neu gemounteter Wrapper). Keine neue API-Abfrage, kein zweiter Scrobble-Recorder, keine Speicherung von V856-Einstellungen, keine Veränderung an bestehendem Spotify/Last.fm-Export.

## Tests

`npm run test:v856`, `npm run test:v856:types`, `npm run test:v856:ui-types`, anschließend bestehende Versions- und Archivregressionen, `npm run check:syntax`, `npm run check:architecture`, `npm run typecheck` und `npm run build`.

Erforderliche manuelle Abnahme: Last.fm-Benutzerkonto mit Scrobbles, Smartphone/10-Zoll-Touchscreen, Zeitzonenwechsel, langes Archiv, Monatsgrenzen und Speicher-/Navigationsverhalten.
