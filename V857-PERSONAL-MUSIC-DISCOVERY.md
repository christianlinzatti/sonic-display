# V857 · Personal Music Discovery Intelligence

## Neues History-Radar

V857 ergänzt das vorhandene Spotify-/Last.fm-History-Studio **innerhalb der bestehenden Last.fm-History**. V856 und die bestehenden Auswertungen bleiben erhalten. Der Verlauf wird aus dem kontoabhängig geladenen V713-IndexedDB-Archiv gelesen. Die Funktion speichert keine Scrobbles und verändert keine alten Einträge.

- **Aufsteigende Favoriten:** Künstler mit mindestens drei Scrobbles im gewählten Monat. Vergleich ihres Anteils am Monatsgesamtvolumen mit dem kumulierten Anteil der **drei vorherigen Monate**; ein Aufwärtstrend wird nur bei mindestens zehn Scrobbles in beiden Zeiträumen angezeigt. Prozentpunkte sind **beobachtete Anteilsunterschiede**, keine Prognose.
- **Erstmals erfasste Künstler:** erste Erwähnung im vorhandenen Archiv im gewählten Monat; mindestens drei Scrobbles. „Neu im Archiv“ bedeutet nicht automatisch „erstmals gehört“.
- **Genre-Kompass:** Die Last.fm-Scrobbles enthalten keine Genres. Ein Klick auf „Genre-Metadaten abrufen“ ruft über das **bestehende** `/api/genre` maximal sechs der häufigsten unterschiedlichen Titel je Monat aus den letzten sechs Monaten, höchstens 36 insgesamt, mit maximal drei gleichzeitig laufenden Abfragen ab. Dabei werden Künstler-/Songtitel an Last.fm übertragen. Es ist keine Spotify-Premium-Berechtigung zusätzlich nötig. Der vorhandene `LASTFM_API_KEY` muss korrekt konfiguriert sein.
- **Strenge Metadatenprüfung:** Es werden nur Genre-Ergebnisse mit Quellen `track` oder `artist`, passenden Tag-Belegen und Mindestvertrauen berücksichtigt. Reine BPM-/Titelnamensvermutungen zählen nicht; fehlende Tags bleiben **unbekannt**. Artist-Tags sind ein weniger präzises Indiz als Track-Tags. API-Fehler werden nicht als „unbekannt“ gecacht.
- **Transparenz:** Die Verteilung zeigt ausschließlich die **erkannten Scrobbles** und immer die Abdeckung je Monat (zugeordnet / gesamt). Nicht untersuchte Titel werden weder hochgerechnet noch Genres zugeordnet. Bei geringer Stichprobe ist kein repräsentativer Trend ableitbar.
- **Datenschutz/Leistung:** Keine automatischen API-Aufrufe, keine zweite Hörverlauf-Aufzeichnung, keine persistenten Genre-Schreibzugriffe. Erkennungsergebnisse liegen nur im Speicher der aktuellen Konto-/UI-Sitzung. Ein Geräte- oder Kontowechsel startet mit leerem Cache. API-Aufrufe werden beim Unmount abgebrochen.

## Tests und Freigabe

`npm run test:v857`, `npm run test:v857:types`, `npm run test:v857:ui-types`, Regressionen V855/V856, `npm run check:syntax`, `npm run check:architecture`, danach `npm run typecheck` und `npm run build`.

Manuell: reales Last.fm-Konto, Last.fm-API-Key, Genres in echten Track-/Artist-Tags, Wechsel des Analysetags/Monats/Zeitzone und die mobile/10-Zoll-Touch-Darstellung prüfen. Ein vollständig bestandener Produktionsbuild ist für die Freigabe erforderlich.
