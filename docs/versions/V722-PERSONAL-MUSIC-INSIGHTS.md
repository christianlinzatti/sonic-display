# Sonic Display V722 – Personal Music Insights Dashboard

## Fertige Funktionen

**Zuletzt gespielt → Last.fm-History → Personal Music Insights** bietet eine neue, kompakte Startübersicht über das bereits geladene V713-IndexedDB-Langzeitarchiv des ausgewählten Last.fm-Benutzers.

- Archivkennzahlen: Scrobbles, Künstler, erfasste Tage, erfasste Kalenderjahre, längste archivierte Tages-Hörserie und Anzahl erkannter Aufsteiger.
- Hörrekorde: aktivster Tag/Monat, meistgehörter Künstler und meistgehörter Song, alle mit direkter chronologischer Navigation.
- Letzte sechs Archivmonate: klickbare Balken, lokale Kalenderzeit; „–“ vor dem ersten Archivmonat. Null erfasste Scrobbles ist kein Beweis für eine Hörpause.
- Musikerentwicklung: höchstens drei aufstrebende und drei langjährig häufig gespielte Künstler sowie drei beobachtete 90-Tage-Comebacks. Die bestehenden V721-Kriterien werden unverändert wiederverwendet.
- Entdeckungen: drei zuletzt erstmals im Archiv beobachtete Künstler, anklickbar. Keine Aussage über den Zeitpunkt der ersten tatsächlichen Begegnung mit dem Künstler.
- Schnellnavigation: zu Kalender & Chronik, V717-Rekorden, V721-Trends, V720-Entdeckungen, V718-Jahresgeschichte und V719-Jahresvergleich.
- Für Mobilgeräte und 10-Zoll-Touchscreens: umbruchfähige Navigation, CSS-Raster mit responsiven Karten, 44-Pixel-Bedienelemente, Tastaturfokus und Reduced-Motion-Kompatibilität.

## Datenintegrität

Die neue Logik referenziert ausschließlich die bereits geprüften Funktionen `lastFmMilestonesV717`, `buildLastFmTasteStoryV718`, `buildLastFmDiscoveryTimelineV720` und `buildLastFmArtistDashboardV721`. Kein zusätzlicher Last.fm-/Spotify-Aufruf, keine Änderungen am Archiv, kein zusätzliches Scrobbling oder neue Zugriffsrechte. Die Auswertung bezieht sich ausschließlich auf beobachtete Scrobbles; weder Hörminuten noch lückenlose Historie sind daraus ableitbar. Ungültige Datumseingaben geben ein leeres Aggregat zurück. Bei Kontowechsel wird die Komponente neu montiert.

## Navigation und Zugriff

Die bestehenden Filter für Tage, Monate und Künstler öffnen die frühere V715-Chronik; der Song-Shortcut setzt vorhandene Zeitfilter zurück, bevor er auf Song/Künstler filtert. Der V717-Rekordabschnitt hat einen dedizierten Anker erhalten. Alle anderen Berichtskomponenten sind unverändert.

## Prüfungen

`npm run test:v722`, `npm run test:v722:types`, `npm run test:v722:ui-types`, `npm run test:quick`, `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`, `npm run check:test-types`. Einzelheiten und noch offene Produktionsprüfungen in `V722-VERIFICATION.md`.
