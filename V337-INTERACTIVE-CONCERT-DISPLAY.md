# V337 – Interactive Concert Display

## Überblick
- Integration in bestehende V336/V335 Konzert-Quellen und V334 Scheduler.
- Ticketmaster-Bilder (`images[]`) und optionale öTicket-Bilder (`imageUrl`, `image`, `images`) werden auf sichere HTTPS-URLs begrenzt.
- Zwei Vorlagen: Spotlight mit prominentem nächsten Event und Agenda-Liste.
- Ticketstatus wird nur für bekannte Werte angezeigt; unbekannte Statuswerte nicht als Verfügbarkeit interpretieren.
- Fehlende oder nicht ladbare Bilder führen zu einer reinen Textdarstellung.
- Konfiguration unter Settings → Dynamic Stage → Stage Content Plugins → V337 Konzertanzeige.
- Animierte Einblendung und `prefers-reduced-motion` Unterstützung. Keine interaktiven Ticket-Buttons auf der WebGL-Leinwand, da die Fläche `pointerEvents: none` benutzt.

## Konfiguration
Die Einstellungen werden lokal im Browser in `sonic-concert-display-v337` gespeichert. Keine neuen API-Schlüssel erforderlich; Ticketmaster wie bisher serverseitig über `TICKETMASTER_API_KEY`, öTicket optional mit `STAGE_OETICKET_ENABLED=true`.

## Grenzen
- Die öTicket-Suche verwendet weiterhin einen nicht dokumentierten Eventim-Endpunkt und kann ausfallen.
- Poster sind bei der Quelle nicht immer vorhanden; Ticketmaster liefert in der Regel Bilder, öTicket nur sofern im Antwortschema enthalten.
- Keine bestätigte Live-API-Abfrage oder Browser-End-to-End-Prüfung in der Offline-Umgebung.
- Konzertbilder und Ticketstatus basieren auf den Daten des Anbieters, nicht auf einer eigenständigen Prüfung der Verfügbarkeit.
