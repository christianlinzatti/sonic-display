# Sonic Display V720 – Music Discovery Timeline

## Nutzerfunktion

Im Last.fm History Explorer (Bereich **Discovery Timeline**, vor dem V719-Jahresvergleich) zeigt eine anklickbare Jahres-Zeitachse, in welchen Jahren Künstler erstmals in den gespeicherten Scrobbles beobachtet wurden. Die Sortierung im Jahresüberblick ist nach der Anzahl aller archivierten Scrobbles, nicht nach künstlicher Genre-Zuordnung. Die Künstler-Suche erlaubt bis zu zwölf Treffer (bei leerem Suchfeld die zwölf meistgehörten); ein Klick öffnet das Künstlerporträt.

Das Porträt zeigt das **erste archivierte Datum** und den letzten Scrobble, den ersten Monat mit mindestens fünf erfassten Wiedergaben, den **ersten messbaren Favoritenmoment** und den Monat mit den meisten archivierten Scrobbles für diesen Künstler. Die persönliche Monatsansicht bietet zwölf Balken je wählbarem Kalenderjahr und zeigt auf Knopfdruck die Chronik des gewählten Monats **mit diesem Künstler als Filter**. Die fünf häufigsten archivierten Songs dieses Künstlers werden mit Zählwert und Anteil an seinen archivierten Scrobbles angezeigt; Songklicks öffnen den Künstler- und Songfilter im Jahr des letzten archivierten Scrobbles.

## Messregeln

* „Erstmals im Archiv“ ist **nicht** automatisch das Datum der ersten tatsächlichen Wiedergabe oder der ersten Beschäftigung mit einem Künstler.
* „Erster Monat mit ≥5“ ist der erste chronologische **lokale Kalendermonat** mit mindestens fünf gültigen Scrobbles des Künstlers.
* „Favoritenmoment“ ist der **erste lokale Kalendermonat** mit mindestens 20 gültigen Scrobbles im gesamten Archiv dieses Monats, mindestens fünf für den Künstler, mindestens **10 % Anteil** und Platz **1 bis 3** nach Scrobble-Anzahl im Monatsranking. Ein fehlender Treffer wird ausdrücklich als „Schwelle nicht erreicht“ dargestellt. Gleichstände werden deterministisch nach kanonischem Namen aufgelöst.
* „Stärkster Monat“ ist der Monat mit den meisten archivierten Scrobbles des Künstlers; bei Gleichstand entscheidet erst der relative Monatsanteil, dann der ältere Monat.
* „Prägende Songs“ bedeutet lediglich **Top-Songs nach Scrobble-Anzahl**; es handelt sich weder um eine Kausalaussage über Geschmack noch um Hörzeit.
* Fehlende Daten, nur teilweise importierte Jahre, Archivlücken und ein laufender Monat dürfen **nicht** als Inaktivität fehlinterpretiert werden. Zukunftsdaten und ungültige ISO-Zeitstempel werden ignoriert. Der lokale Browser-Kalender bestimmt Tag, Monat und Jahr; DST-Übergänge werden korrekt behandelt.

## Technik und Datenschutz

`lib/lastfm-discovery-timeline-v720.ts` ist ein reines, seiteneffektfreies Datenmodul. Es liest ausschließlich das bestehende, bereits in `components/LastFmHistoryPanelV706.tsx` geladene `archive.events`-Array aus V713. Identitäten von Künstlern und Titeln werden mit NFKC, Trimming und Casefolding zusammengeführt; Künstler und Titel unterscheiden gleiche Songnamen verschiedener Interpreten. Die Jahresauswahl mit Lücken behält Jahre ohne Scrobbles sichtbar.

`components/LastFmDiscoveryTimelinePanelV720.tsx` verwendet `useMemo`, ohne zusätzliche Netzaufrufe, Cookies, Speicherwrites, automatische Importvorgänge, Last.fm-API-Requests oder zusätzliche Spotify→Last.fm-Scrobbles. Die bisherige V706–V719-Funktionalität bleibt unverändert. Der kontogebundene React `key={user}` setzt lokale Auswahl beim Kontowechsel zurück.

## Qualitätssicherung

`npm run test:v720` / `npm run test:v720:types` / `npm run test:v720:ui-types` prüfen Rechenlogik, Integration, Typen, DST, Sprungfunktionen, Suchlimits, undefinierte Jahre, ungültige Daten und Archive mit über 12.000 Einträgen. Die vollständige historische Regression bleibt in `npm run test:quick` und `npm run build:preflight` integriert. Mit `npm install && npm run test:quick && npm run typecheck && npm run build` lässt sich der vollständige Next.js-Produktionsbuild auf einem Rechner mit vollständigen Dependencies prüfen.
