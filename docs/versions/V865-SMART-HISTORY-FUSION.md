# V865 – Smart History Fusion 2.0

## Bedienung

1. In der Hörhistorie den Bereich **Statistiken** oder **Musikentdeckungen** öffnen und als Datenquelle **Gemeinsam** auswählen.
2. Der vorhandene V707-Abgleich lädt die Spotify-History kontogebunden und die Last.fm-History aus dem lokalen Langzeitarchiv.
3. **30 / 90 / 365 Tage** wählen; die letzten 31 Tage als zweifarbigen Quellenvergleich durchsehen und per Klick einen UTC-Tag mit einzelnen, bereits abgeglichenen Wiedergaben öffnen.
4. Die Ansicht unterscheidet Spotify-only, Last.fm-only und mögliche 1:1-Doppelungen. Ein Source-Only-Tag bedeutet nicht, dass andere Dienste sicher keine Musik erfasst haben.

## Grenzen

- Kein weiteres API-Polling, keine separate History-Datenbank und keine neue OAuth-Berechtigung.
- Quelle bleibt die heuristische V707-90-Sekunden-Zuordnung. Zwei kurze Scrobbles mit gleichem Künstler und Titel können fälschlich als identisch erkannt werden; Versionen/Remixe sind nicht sicher unterscheidbar.
- Leere Tage sind nicht „beweisbar verlorene“ Wiedergaben. Anzeige `Leere Tage im beobachteten Zeitfenster` betrachtet ausschließlich Kalendertage zwischen dem frühesten und spätesten archivierten Ereignis. Die Quellen decken eventuell unterschiedliche Zeitfenster ab.
- V865 verwendet explizit UTC-Kalendertage, damit Sommerzeitwechsel die Tagesbalken nicht verfälschen. Andere ältere Statistiken nutzen teilweise Gerätezeit.
- Archivdaten bleiben unverändert. Die vorhandene V713-Legacy-Migration im V707-Quellendialog kann das örtliche IndexedDB-Archiv bei der erstmaligen Verwendung befüllen.
- Die Oberfläche unterscheidet Fehler beim Laden von einem tatsächlich leeren Archiv. Falls der ältere Browser-Spiegel fehlt, darf die vorhandene IndexedDB-History weiterhin eingelesen werden.

## Tests

`npm run test:v865`, `npm run test:v865:types`, `npm run test:v865:ui-types`, V849–V864, `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`, `npm run typecheck`, `npm run build`.
