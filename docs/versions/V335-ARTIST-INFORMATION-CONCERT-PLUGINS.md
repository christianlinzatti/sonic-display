# V335 – Artist Information & Concert API Plugins

## Neu

- **Biografie:** `/api/stage-content/bio?artist={artist}` (deutsche Wikipedia-Zusammenfassung mit englischem Fallback); die angefragte Artikelüberschrift muss zum Künstler passen, und Begriffsklärungen werden ausgeschlossen. Kein API-Schlüssel erforderlich.
- **Künstlerfoto:** `/api/stage-content/artist?artist={artist}` (existierende Spotify-Künstlersuche, bestehende Spotify-Session).
- **Konzerte:** `/api/stage-content/concerts?artist={artist}` (Ticketmaster Discovery API, `TICKETMASTER_API_KEY` nur serverseitig). Optional `STAGE_CONCERT_COUNTRY=AT` oder Query `country=AT`. Nur zukünftige Events mit namentlich passendem Künstler in `_embedded.attractions`; sortiert, dedupliziert, max. 12.
- **Plugin-Scheduler:** V330–V334 unverändert verwendbar. Inhalte werden bei einem Trackwechsel neu geladen; keine Fake-Daten, wenn die Anbieter nichts liefern.

## Konfiguration

`.env.local` (oder Vercel Environment Variables):

```env
TICKETMASTER_API_KEY=dein-ticketmaster-discovery-api-key
STAGE_CONCERT_COUNTRY=AT
```

`STAGE_CONCERT_COUNTRY` ist optional. Ohne Country-Filter erfolgt eine globale Suche.

Unter **Settings → Dynamic Stage → Stage Content Plugins** Hauptleinwand, *Text*, *Fotos*, *Konzerte* aktivieren. Die Pfade sind neu voreingestellt; vorhandene selbst konfigurierte Pfade bleiben erhalten. Bereits gespeicherte leere Text- und Konzertpfade werden auf die Standardadapter migriert.

## Verhalten und Grenzen

- Spotify-Login ist für die Routen erforderlich; keine Zugangsdaten im Browser.
- Wikipedia-Zusammenfassungen sind keine verifizierten Biografien. Wenn die Titelzuordnung fehlschlägt, bleibt die Quelle leer.
- Ticketmaster deckt nur die dort erfassten Veranstaltungen ab; nicht jedes Konzert ist enthalten. Keine Garantie für vollständige Tourdaten.
- Bei fehlendem API-Key oder fehlenden Treffern liefert die Konzert-Route `events: []`, die Leinwand überspringt sie automatisch.
- Externe Anbieter können temporär nicht verfügbar sein.
- API-Resultate werden serverseitig mit Next.js Fetch-Revalidierungsfenstern abgerufen; Ergebnisse erscheinen beim nächsten Trackwechsel, nicht live als Push. V331/V332 bleibt für Push-Nachrichten erhalten.
- Die bisherigen Quellen, Mehrfach-Leinwände, Prioritäten und manuellen Endpunkte bleiben verwendbar.

## Prüfen

`npm install && npm run verify`

Die projektweite Offline-Suite und die neue V335 Regression laufen ohne Netz. Ein echter API-/WebGL-Test benötigt Zugangsdaten und Onlinezugriff.
