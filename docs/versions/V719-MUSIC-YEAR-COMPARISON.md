# Sonic Display V719 – Musikjahre im Vergleich

## Bedienung

Unter **Zuletzt gespielt → Last.fm-History → History Explorer → Musikjahre im Vergleich** lassen sich über zwei unabhängige Auswahllisten (Jahr A und B) zwei beliebige im lokalen Archiv belegte Kalenderjahre auswählen. „⇄ Tauschen“ vertauscht die Richtung des Vergleichs; die Deltas bleiben immer **B − A**. Die Auswahl ändert keine Scrobbles.

Die Übersicht zeigt in zwei Jahren beobachtete Scrobbles, unterschiedliche Künstler, Songs und aktive Tage, dazu zwölf Monats-Doppelbalken auf einer gemeinsamen Skala. Ein Klick öffnet die jeweilige Jahreschronik mit inklusivem lokalen Datumsfilter. Weitere Karten zeigen bis zu acht beobachtete Künstler nur in Jahr B, bis zu acht Künstler nur in Jahr A, bis zu acht gemeinsame Künstler mit den größten Änderungen beim Anteil aller Scrobbles (in **Prozentpunkten**, nicht Stunden), sowie bis zu acht wiederentdeckte Songs. Ein Klick auf Künstler bzw. Song setzt Jahr, Künstler und gegebenenfalls Song-Suche und springt zur vorhandenen Chronik. Das aktive Last.fm-Konto bestimmt alle Daten; beim Wechsel wird die Vergleichsauswahl zurückgesetzt.

## Aussagegrenzen

- „Neu in B“ heißt: in B, aber nicht in A erfasst. **„Erstmals im Archiv“** ist eine andere Kennzahl; wenn der Künstler schon in älteren Archivjahren vorkommt, ist das kenntlich gemacht.
- „Nicht in B“ heißt nicht, dass ein Künstler wirklich nicht gehört wurde. Es heißt nur, dass im lokalen Archiv keine entsprechenden Scrobbles beobachtet wurden.
- Ein wiederentdeckter Song muss **in beiden ausgewählten Jahren** archivierte Scrobbles haben und im chronologisch späteren Jahr nach **mindestens 90 lokalen Kalendertagen ohne im Archiv beobachteten Scrobble dieses Songs** erneut auftauchen. Zwischeneinträge aus *beliebigen* Jahren unterbrechen die Pause. Der Vergleich funktioniert auch bei vertauschten Jahren.
- Scrobbles sind keine nachgewiesenen Hörminuten. Genres werden ohne belastbare externe Tags nicht zugeordnet. Unvollständige Imports, ein laufendes Jahr, Archivlücken oder gelöschte Browserdaten können die Ergebnisse verfälschen.
- Lokale Tages-, Monats- und Jahresgrenzen verwenden wie V716 die Zeitzone des Browsers, einschließlich Sommer- und Winterzeit. Song- und Künstleridentität: Unicode NFKC + Case-Folding.

## Technische Integration

- `lib/lastfm-year-compare-v719.ts`: reine, validierende Auswertung aus vorhandenen `LastFmEventV706[]`; kurze Year-Selector-Funktion; A/B-Zahlen und Wiederentdeckungen.
- `components/LastFmYearComparePanelV719.tsx`: barrierearme, responsive und touchfreundliche Auswahl, Statistiken und Chronik-Buttons.
- `components/LastFmHistoryPanelV706.tsx`: Einbindung mit vorhandenen `archive.events`, Jahres-/Künstler-/Song-Filtern; ohne neue Speicher-, API- oder Scrobbling-Operationen.
- `app/globals.css`: V719-Styles.
- `tests/v719-lastfm-year-compare-regression.cjs`, `tests/tsconfig.v719-core.json`, `tests/tsconfig.v719-ui.json`: Regressionen und isolierte Typechecks.

Keine zusätzlichen Last.fm-Scrobbles und keine Konflikte mit dem bereits in Last.fm aktivierten Spotify-Scrobbling. Bestehende V706–V718-Ansichten und Backup/Sync-Funktionen bleiben erhalten.

Siehe `V719-VERIFICATION.md` für den Test- und Buildstatus.
