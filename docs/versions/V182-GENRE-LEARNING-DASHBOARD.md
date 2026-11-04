# Sonic Display V182 – Genre Learning Dashboard & Correction Management

Basiert auf V181; sämtliche bisherigen Funktionen und Speicherformate bleiben erhalten.

## Neue Funktionen

- Genre-Lern-Dashboard im Music Animation Controller, erreichbar über „Genre-Dashboard öffnen“.
- Suche nach Artist oder Track-ID, Genre-Filter und Zusammenfassung der gespeicherten Genres.
- Einzelbearbeitung, Mehrfachauswahl, Massenkorrektur und bestätigtes Löschen.
- JSON-Export, validierter JSON-Import (bis 1 MB), Vorschau neuer Einträge, Konflikte und Duplikate.
- Wahl zwischen Zusammenführen ohne Überschreiben und bestätigter Konfliktersetzung. Import wird erst nach ausdrücklicher Freigabe gespeichert.
- Weiterhin maximal 250 Songkorrekturen mit lokalen browserbasierten Daten.

**Hinweis:** V181 speichert Track-ID, Artist, Genre und Änderungszeit, nicht den Songtitel. Das Dashboard zeigt daher Artist und Track-ID statt erfundener Titel. Die Artist-Texte sind auf die bereits gespeicherte Normalform reduziert.

## Prüfungen

`npm run test:genre-dashboard` und `npm run verify:offline`. Danach mit installierten npm-Abhängigkeiten `npm run typecheck && npm run build` ausführen. Die JSON-Transferfunktion verwendet die Dateiverarbeitung des Browsers und keinen Server.
