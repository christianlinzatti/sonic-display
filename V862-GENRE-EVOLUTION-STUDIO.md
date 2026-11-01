# V862 – Genre Evolution Studio

## Neu

- Eigene Genre-Zeitreise im Last.fm-History-Bereich, mit Einstieg aus V858.
- Alternative Zeiträume: letzte 24 Kalendermonate und die letzten zehn Kalenderjahre.
- Genre-Verteilung pro selektiertem Zeitraum, Filter nach bekanntem Genre, Vergleich mit dem vorigen Zeitraum nur bei begrenzter Mindestabdeckung.
- Sichtbare Scrobble-Abdeckung und Unterscheidung zwischen Last.fm-Track- und Last.fm-Künstler-Tags.
- Maximal 72 exemplarische unterschiedliche Songs pro Ansichtsmodus und Benutzerklick, höchstens drei gleichzeitige HTTP-Anfragen. Ohne Klick keine Genre-Anfragen.
- Wiener Kalenderzeit oder UTC; kein Raten aus Künstlernamen, Songtiteln oder einem Musikgenre-Interesse des Nutzers.

## Datenqualität und Grenzen

Das angezeigte Genre basiert auf bestehenden Last.fm-Tags; Track-Tags sind aussagekräftiger als Künstler-Tags. Nicht abgefragte, unbekannte oder nicht verlässlich getaggte Scrobbles bleiben unzugeordnet. Diese Stichprobe ist keine vollständige Genreerfassung, auch wenn ein Titel in mehreren Scrobbles auftaucht. Wiederkehrende Titel können die abgedeckte Anzahl erhöhen. Fehlende Scrobbles beweisen keine Hörpause. `deutschrock` ist derzeit ein Alias der bestehenden Rock-Kategorie, keine eigenständige Genre-ID. Der Cache lebt nur bis zum Schließen der aktuellen History-Komponente und ist kontogebunden.

## Einstieg

1. Last.fm-History öffnen; vorhandenes Archiv verwenden oder importieren.
2. Unter `Genre-Zeitreise` zwischen `24 Monate` und `10 Jahre` wählen.
3. `Genre-Metadaten freiwillig laden` klicken (sendet Künstler-/Titel-Paare an den bestehenden `/api/genre`-Dienst).
4. Balken und Genre-Fokus auswählen. Abdeckung vor der Interpretation prüfen.

## Tests

- `npm run test:v862`
- `npm run test:v862:types`
- `npm run test:v862:ui-types`
- `npm run check:syntax`
- `npm run check:architecture`
- `npm run test:module-case`

Produktionsfreigabe benötigt außerdem `npm ci && npm run typecheck && npm run build` und einen echten Browser-/Touch- und Last.fm-API-Test. Die isolierten Prüfungen reichen dafür nicht aus.
