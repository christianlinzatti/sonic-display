# V336 – öTicket Concert Plugin (Österreich)

V336 ergänzt Ticketmaster um **öTicket/Eventim** als optionale österreichische Veranstaltungsquelle. Bandsintown wird **nicht** integriert. Alle Funktionen aus V335 bleiben erhalten.

## Konfiguration (`.env.local` / Vercel)

```env
STAGE_CONCERT_COUNTRY=AT
STAGE_OETICKET_ENABLED=true
TICKETMASTER_API_KEY=optional
```

`GET /api/stage-content/concerts?artist=…&country=AT` prüft zunächst die Spotify-Sitzung und lädt anschließend die aktivierten Quellen parallel mit Timeouts. Nur Künstler mit passendem Namen werden übernommen; vergangene Veranstaltungen werden ausgeschlossen. Gleiche Termine werden anhand von Datum, Ort und Spielstätte zusammengeführt, wobei der öTicket-Link bevorzugt wird.

Die Ausgabe bleibt zu V335 kompatibel (`title`, `events` mit `date`, `title`, `venue`, `city`, `url`) und ergänzt optionale Felder `source`, `status`, `country`, `alternatives`.

**Hinweis:** `public-api.eventim.com/.../productGroups` ist ein undokumentierter Endpunkt. Er kann sich ändern, durch Anbieterregeln eingeschränkt werden oder zeitweise nicht verfügbar sein. öTicket ist deshalb standardmäßig ausgeschaltet. Die Anfragen laufen serverseitig; ein fehlgeschlagener Anbieter darf keine fremden Suchtreffer erfinden oder gültige Ticketmaster-Ergebnisse unterdrücken.

Tests: `npm run test:v336`; gesamte Offline-Prüfung: `npm run verify:offline`.
