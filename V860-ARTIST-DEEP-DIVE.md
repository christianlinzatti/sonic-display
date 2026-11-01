# V860 — Artist Deep Dive

Das neue `LastFmArtistDeepDiveV860` ergänzt die vorhandenen V858-Dashboard- und V859-Timeline-Ansichten im bestehenden kontogebundenen Last.fm-Panel. Es erstellt **keinen neuen Scrobble**, ruft **keinen Endpunkt** auf und verändert **keine gespeicherten Daten**.

## Funktionen

- Künstler per Unicode-normalisierter Suche auswählen. Verschiedene Groß-/Kleinschreibungen und Vollbreitenzeichen werden demselben Künstler zugeordnet.
- Erster und letzter **archivierter** Scrobble, Anzahl Wiedergaben, verschiedene Titel und bekannte Alben.
- Vollständiger Jahresverlauf einschließlich Jahren ohne gespeicherte Einträge. Der Prozentanteil eines Künstlers wird für jedes Jahr auf die **gesamte erfasste Last.fm-History dieses Jahres** bezogen, nicht auf eine theoretische Spotify-Gesamthörzeit.
- Tippen auf ein Jahr filtert die Top-Songs und Top-Alben nach dem betreffenden Jahr. Die Gesamtanzeige bleibt jederzeit verfügbar.
- Die Albumstatistik zählt nur Ereignisse mit bekannten Albumtiteln. Unbekannte Platzhalter werden ausdrücklich separat als unzugeordnete Wiedergaben ausgewiesen.
- Klicks führen in den vorhandenen History Explorer. Keine Wiedergabe oder Geräteumschaltung wird automatisch ausgelöst.
- Wahlweise Kalenderzeit nach Wien oder UTC, auch für Datumsgrenzen.
- Touch-taugliche Controls, Keyboard-Fokus, responsives Layout und `prefers-reduced-motion`.

## Vertrauensgrenzen

Die Datenquelle ist das **bereits geladene**, an den Last.fm-Account gebundene IndexedDB-Langzeitarchiv. Zeitstempel werden validiert und zukünftige ungültige Daten verworfen. „Erstmals“ heißt nur „erstmals im gespeicherten Archiv“ und nicht erster tatsächlicher Kontakt mit dem Künstler. Das Fehlen eines Scrobbles ist kein Beleg für eine Hörpause. Album-IDs sind nicht verfügbar, daher zählt ein normalisierter Albumname pro Künstler als Album; gleichnamige unterschiedliche Veröffentlichungen können zusammenfallen. Für Top-Titel werden normalisierte Songnamen pro Künstler gezählt; verschiedene gleichnamige Aufnahmen können zusammenfallen.

## Prüfungen

`npm run test:v860`, `npm run test:v860:types`, `npm run test:v860:ui-types`, bestehende History-/Spotify-/Konzertregressionen, `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`, `npm run check:lockfile:v752`. Vollständiger produktiver TypeScript-Check und Next.js-Produktionsbuild sind weiterhin verbindliche Freigabeprüfungen. Ausfälle durch fehlende Pakete sind im separaten `V860-VERIFICATION.md` dokumentiert.
