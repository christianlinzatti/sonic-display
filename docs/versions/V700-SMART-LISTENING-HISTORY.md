# V700 – Smart Listening History

## Bedienung

Im normalen **◷ Zuletzt gespielt**-Dialog den neuen Tab **◈ Smart History** öffnen. Er steht zusätzlich zu Chronik, Hör-Highlights, Cover-Galerie, Genre-Mix, Musikprofil und Konzert-Designer zur Verfügung.

- **14-Tage-Hör-Timeline:** Die letzten 14 lokalen Kalendertage (inklusive heute), mit interaktiver Tagesauswahl. Jeder Balken zählt nur tatsächlich **geladene Spotify-Hörereignisse**. Ein Klick/Tap öffnet die einzelnen vorhandenen Wiedergaben mit Uhrzeit. Tage ohne Treffer werden als 0 angezeigt.
- **Song-Rangliste:** Die zwölf am häufigsten vorkommenden Song-IDs in den aktuell geladenen und in der Suche/dem Zeitraum gefilterten Ereignissen. Anzeige von Wiederholungen, erstem und letztem geladenem Abspielzeitpunkt und Anzahl unterschiedlicher Hörtage. Der Schalter **Nur Wiederholungen** blendet einmalig vorkommende Songs aus.
- **Künstler-Credits:** Die zehn häufigsten Spotify-Künstler-Credit-Zeilen mit Anzahl geladener Wiedergaben, verschiedener Songs und letzter Wiedergabe. Duett- und Feature-Zeilen werden nicht in mutmaßliche Einzelkünstler aufgeteilt.
- **Zusammenfassung:** Geladene Wiedergaben, verschiedene Songs, zusätzliche Abspielereignisse derselben Songs, ihre Prozentquote und Hörtage. Es handelt sich **nicht** um eine Wiedergabedauer-, Skip-, oder vollständig-gehörte-Statistik.
- **Suche/Zeitraumfilter:** Die vorhandene V699-Suche und die Optionen Alle / Heute / 7 / 30 Tage gelten auch für Smart History. Der V699-Modus „Jeden Song einmal“ würde Wiederholungen entfernen; er wird deshalb nur für die Chronik angewandt. Das gleiche gilt für die Reihenfolgesortierung. Titel außerhalb des 14-Tage-Diagramms zählen weiterhin zu den Ranglisten, sofern sie zum ausgewählten Zeitraum passen.
- **Mehr laden:** Unten im Dialog weitere Spotify-Seiten anfordern. Die Auswertungen aktualisieren sich automatisch. Keine neue Spotify-API, kein Tracking oder Hintergrund-Polling.

## Grenzen und Privatsphäre

Es werden nur bis zu 600 freiwillig geladene Ereignisse aus Spotifys Endpoint `/me/player/recently-played` berücksichtigt. Die API ist **kein vollständiges Langzeitarchiv**. „Erstmals/zuletzt“ bezieht sich ausschließlich auf diese Auswahl, nicht auf das erste/letzte Hören im Leben. Die Timeline benutzt die lokale Gerätezeitzone (einschließlich Sommer-/Winterzeit). Nach Schließen des Dialogs werden die Hörereignisse wie bisher verworfen; keine neue Speicherung, kein Export und keine zusätzlichen Berechtigungen. Alle Gruppierungen sind reine Browserberechnungen ohne GPU-/3D-Zusatzlast.

## Prüfungen

- `npm run test:v700` – deterministische Statistik-, Datumsgrenzen-, Datenschutz- und Integrationsprüfungen.
- `npm run test:v700:types` – isolierter echter TypeScript-Check des Datenmodells.
- `npm run test:v700:ui-types` – isolierter JSX-/TypeScript-Check der neuen UI mit ausschließlich testseitiger React-Deklaration.
- `npm run test:quick` – Versions- und Architekturprüfungen. Der vollständige produktive `npm run typecheck` und `npm run build` benötigt zuvor sämtliche npm-Abhängigkeiten plus Lockfile und eine echte Browser-Abnahme.
