# V861 — Song Rediscovery Intelligence 2.0

- Schaltbare Mindestabstände von 90, 180 und 365 Tagen (jeweils volle 24h in UTC) zwischen archivierten Wiedergaben **desselben normalisierten Künstler-/Song-Paares**.
- Comebacks: Die jüngste erneut erfasste Wiedergabe mit entsprechendem Abstand zum vorherigen archivierten Scrobble. Zusatzanzeige: alle archivierten Wiedergaben und seit dem Comeback erfasste Wiedergaben.
- Frühere Favoriten: Mindestens zweimal erfasste Songs, deren **letzter Archiv-Scrobble** mindestens 90/180/365 Tage her ist. Absteigend sortiert nach historischer Häufigkeit.
- Durchsuchbar nach Künstler, Song oder Album; Seitenansicht begrenzt die DOM-Knoten auf zehn Songs. Ein Klick öffnet den bestehenden History Explorer, ohne Spotify-Wiedergabe auszulösen.
- Zeitgleiche doppelte Scrobbles desselben Songs werden nicht doppelt gezählt; Schreibweisen, NFKC-/Whitespace-Abweichungen werden normalisiert. Gleichnamige unterschiedliche Aufnahmen können zusammenfallen.
- Ausschließlich das bereits geladene, kontogebundene Last.fm-Langzeitarchiv wird verwendet; weder API-Abfragen noch IndexedDB-Schreibvorgänge hinzugefügt. Die Anzeige wird pro Konto via React-Key zurückgesetzt.
- **Wichtige Grenze:** Scrobble-Lücken beweisen keine echte Hörpause. „Nicht erfasst“ ≠ „nicht gehört“.

## Tests

`npm run test:v861`, `npm run test:v861:types`, `npm run test:v861:ui-types`, Rückwärtsregressionen und bestehende Projektchecks. `npm run typecheck` und `npm run build` bleiben obligatorische Freigabeprüfungen, wenn Projektabhängigkeiten installiert sind.
