# Sonic Display V673 — Hör-Highlights

## Neu

Neben der Spotify-Chronik aus V672 gibt es den Reiter **„✦ Hör-Highlights“**. Die optisch aufbereitete Auswertung zeigt:

- Zahl der geladenen Wiedergaben, verschiedene Songs, zusätzliche Wiedergaben bereits gehörter Titel und verschiedene Hörtage
- Die fünf meistgespielten Songs (mit Cover, Spotify-Link, Platzierung und Anzahl)
- Die fünf häufigsten angezeigten Künstler-/Feature-Credits mit Balkendiagramm
- Tageszeiten-Verteilung (Nacht, Morgen, Nachmittag, Abend) anhand der lokalen Gerätezeit

Alle Zahlen werden **ausschließlich aus bereits geladenen Wiedergabeereignissen** im Browser berechnet. Das ist kein Spotify-Jahresrückblick und keine vollständige Hörhistorie. Die Anzahl wiederholter Wiedergaben zählt jedes Playback-Event, nicht die gesamte tatsächlich gehörte Minutenzahl. Für Features werden die Spotify-Künstler-Credits zusammen behandelt, nicht fälschlich per Komma getrennt.

## Technik

- Kein neuer Spotify-Scope und keine zusätzlichen API-Endpunkte nötig.
- Keine Speicherung des privaten Verlaufs; Statistik entsteht mit `useMemo` beim Nachladen oder Aktualisieren.
- Responsives, touchfreundliches Layout, semantische Ranglisten und klare Zustände bei leerer Historie.
- V672 bleibt für den Verlauf bestehen; V673 ergänzt die Auswertung isoliert.

## Prüfung

`npm run test:v673`, `npm run test:v672`, `npm run check:syntax`, `npm run check:architecture`, `npm run typecheck` und `npm run build`.

Der vollständige Produktionsbuild darf nur dann als bestanden bezeichnet werden, wenn Next.js und alle installierten Abhängigkeiten tatsächlich verfügbar sind.
