# Sonic Display V716 – Interaktiver History-Kalender

## Neue Funktion

In **Zuletzt gespielt → Last.fm-History → History Explorer** ist oberhalb der bestehenden Suchmaske ein Monatskalender sichtbar. Er zeigt für jeden Tag die Anzahl tatsächlich im lokalen Last.fm-Archiv vorhandener Scrobbles.

- Durch **‹ / ›** monatsweise bis zum ältesten bzw. neuesten archivierten Monat blättern (auch Monate ohne Treffer innerhalb des Archivzeitraums).
- **Kalendertag wählen**: stellt im History Explorer ein genau eintägiges, inklusives lokales Datumsintervall ein, stellt auf Seite 1 zurück und navigiert zur Chronik. Auch Tage ohne Einträge sind wählbar und zeigen einen leeren Tagesfilter.
- **Tagesfilter aufheben** entfernt nur die Datumsbegrenzung; Suche und Künstlerfilter bleiben erhalten. **Filter zurücksetzen** ist weiterhin der V715-Gesamtreset.
- Farbintensität mit festen Stufen 0 / 1–4 / 5–14 / 15–34 / ≥35 Scrobbles. Die konkreten Zahlen bleiben sichtbar; Information wird nicht allein durch Farbe vermittelt.
- Kalender berücksichtigt bestehende Freitextsuche und Künstlerfilter, aber **nicht** den aktiven Datumsfilter oder die Seitenposition. So kann man bequem zwischen Tagen desselben Songs oder Künstlers wechseln.
- Startet ohne eigene gespeicherte Kalenderpräferenz beim neuesten archivierten Monat. Kein neuer API-Endpunkt, kein Cloud-Schreiben, kein Spotify-Last.fm-Doppel-Scrobbling.

## Zeit- und Datenmodell

Alle Kalenderauswertungen basieren auf `archive.events` (V713 IndexedDB-Langzeitarchiv, pro Last.fm-Account) und verwenden die Zeitzone des Browsers für lokale Tagesgrenzen. Der Monatsvergleich arbeitet mit echten lokalen Monatsanfängen und ist daher auch an Sommer-/Winterzeit-Umstellungen korrekt. Zahlen zeigen **erfasste Scrobbles**, keine Hörminuten und keinen Anspruch auf Vollständigkeit.

## Dateien

- `lib/lastfm-history-calendar-v716.ts`: rein lesender Kalender-Kern und Monatsgrenzen
- `components/LastFmHistoryPanelV706.tsx`: Kalender, Filteraktion und Chronik-Sprung
- `app/globals.css`: Touch-/Tastatur-/Responsive-Styling
- `tests/v716-history-calendar-regression.cjs`, `tests/tsconfig.v716-core.json`, `tests/tsconfig.v716-ui.json`: Regressionen und isolierte Typprüfungen

## Abnahmehinweise

Eine reale Browser-Abnahme mit vorhandener IndexedDB-History sollte insbesondere große Archive, Kontowechsel, geschlossene Archive und die Touch-Auswahl prüfen. Die optionale Last.fm-Automatik und Lückenreparatur aus V708/V710 bleiben unverändert und führen nur mit der bestehenden Zustimmung Abfragen durch.
