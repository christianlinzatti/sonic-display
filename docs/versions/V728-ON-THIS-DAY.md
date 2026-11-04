# V728 – On This Day: persönliche Musik-Zeitreise

## Was ist neu?

Unter **Zuletzt gespielt → Last.fm-History → On This Day** gibt es eine neue, rein lokal berechnete Ansicht. Standardmäßig wird der heutige Kalendertag (Browser-Zeitzone) mit demselben Monat/Tag in den Vorjahren verglichen. Ein Datumseingabefeld erlaubt andere Vergleichstage, der Rückblick reicht wahlweise 5, 10, 20, 30 oder bis zu 100 Jahre zurück (frühestens Jahr 2000).

Die Auswertung zeigt chronologisch absteigende Jahreskarten mit Scrobble-Zahl, eindeutigen Künstlern und Titeln. Pro Karte können die fünf meistgehörten Künstler, fünf meistgehörten Songs und die letzten fünf archivierten Wiedergaben des Tages aufgeklappt werden. Jeder Eintrag öffnet die bestehende V726-gefilterte Last.fm-Chronik mit Tag sowie optional Künstler/Song. Auch das Personal Insights Dashboard und der History-Header erhalten einen Direktlink.

**Wiederkehrende Lieblingssongs** werden ausschließlich ausgewiesen, wenn dasselbe normalisierte Paar aus Künstler + Titel am ausgewählten Kalenderdatum in **mindestens zwei unterschiedlichen Jahren** beobachtet wurde. NFKC-Normalisierung und Kleinschreibung sorgen für konsistentes Zusammenfassen. Die Anzeige behauptet weder, dass ein Song zum ersten Mal gehört wurde, noch dass fehlende Daten eine Hörpause beweisen.

## Kalender-, Daten- und Datenschutzregeln

- Lokaler Kalendertag, nicht UTC-Datum und keine feste 24-Stunden-Tageslänge; Sommer-/Winterzeit wird korrekt berücksichtigt.
- **29. Februar** wird ausschließlich mit tatsächlichen 29.-Februar-Ereignissen verglichen; keine Ausweichdaten oder erfundenen Scrobbles.
- Betrachtet nur archivierte Jahre **vor** dem gewählten Vergleichsjahr, keine Wiedergaben aus dem laufenden Vergleichsjahr.
- Ungültige, zukünftige und unvollständige Events werden verworfen; leere Tage sind **kein** Beweis für Inaktivität.
- Rein lesender Zugriff auf `archive.events` aus dem bestehenden V713-IndexedDB-Archiv; weder neue API-Aufrufe noch zusätzliche Spotify→Last.fm-Scrobbling-Übertragung oder Datenbankänderung.
- Beschränkt wiederholte Track-Highlights auf acht und pro Jahreskarte jeweilige Top-5-Einträge. Auswertung ist deterministisch, Eingabedaten bleiben unverändert.
- Tastatur-/Touch-Unterstützung, Fokusindikatoren, semantische Beschriftungen und mobile, dreispaltig-zu-einspaltig umschaltende Ansicht.

## Dateien

- `lib/lastfm-on-this-day-v728.ts` – reine Archivaggregationen
- `components/LastFmOnThisDayPanelV728.tsx` – interaktive UI
- `components/LastFmHistoryPanelV706.tsx` – Integration und Chronik-Navigation
- `components/LastFmPersonalInsightsDashboardV722.tsx` – Direktlink
- `app/globals.css` – responsives Design
- `tests/v728-on-this-day-regression.cjs` und zwei isolierte TypeScript-Configs – Funktionstests/Regressionen

Siehe `V728-VERIFICATION.md` für den konkret ausgeführten Prüfstand.
