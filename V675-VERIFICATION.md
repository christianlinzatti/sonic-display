# Sonic Display V675 – Prüfprotokoll (28.10.2026)

## Umfang

Smart Music Profile im vorhandenen Spotify-Verlaufsdialog: die V672-Wiedergaben und vorhandenen, durch V674 erkannten Genre-Zuordnungen werden ausschließlich im Browser aggregiert. Genre-Familien, Hauptkünstler, Datenabdeckung und höchstens drei Bühnen-/Tanz-/Lichtempfehlungen. Vorschläge erfordern mindestens drei zugeordnete Wiedergaben von mindestens zwei **verschiedenen** Titeln je Genre-Familie. Die einzige Möglichkeit Einstellungen zu ändern ist ein expliziter Klick auf die jeweilige Empfehlung, DanceFX mit zusätzlicher Checkbox. Undo prüft, ob zwischenzeitlich zugehörige Einstellungen geändert wurden. Beim Schließen des Dialogs werden die Tracks und Genre-Zuordnungen aus dem React-State entfernt. Keine Änderung von Spotify-Rechten oder API-Routen.

## Erfolgreich ausgeführt

- `npm run test:v675`: **21 Prüfungen erfolgreich** (Genre-Evidenz, Duplikate, Hauptkünstler, Coverage, Unbekannte, Vorschlagsschwellen, optionales FX, erlaubte Setting-Keys, Rückgängig und UI-Einbindung).
- `npm run test:v674`: **16 Prüfungen erfolgreich**.
- `npm run test:v673`: **12 Prüfungen erfolgreich**.
- `npm run test:v672`: **12 Modell/UI-Prüfungen und 7 API-Szenarien erfolgreich**.
- `npm run test:v671`, `npm run test:v670`, `npm run test:v669`: **erfolgreich**; die Konzertregie ist strukturell nicht verändert.
- `npm run test:v671:types`, `npm run test:v670:types`, `npm run test:v669:types`: **erfolgreich** (isolierte TypeScript-Typprüfungen).
- `npm run check:syntax`: **erfolgreich**, 934 TS/TSX-Dateien.
- `npm run check:architecture`: **erfolgreich**, Architekturdokument auf V675 aktualisiert.
- `npm run test:module-case`: **erfolgreich**, keine TS/TSX-Dateinamenkollisionen unter Windows/Linux.
- `npm run check:test-types`: **erfolgreich**, Test-Deklarationen von der Produktionsprüfung isoliert.

## Nicht erfolgreich / offen

- `npm run typecheck`: ausgeführt, **fehlgeschlagen**; in dieser Arbeitsumgebung fehlen installierte React-/Next.js-Typen, Node-Types und weitere npm-Abhängigkeiten. Dadurch ist der vollständige TypeScript-Zustand nicht prüfbar; dies ist kein erfolgreich bestandener Produktiv-Typcheck. `components/ListeningProfileV675.tsx` zeigt infolge der fehlenden React-/JSX-Deklarationen ebenfalls nicht aussagekräftige JSX-Fehler.
- `npm run build`: gestartet; vor dem eigentlichen Next.js-Produktionsbuild erreichte die vorhandene umfangreiche Prebuild-Testkette das Zeitlimit. **Kein erfolgreich abgeschlossener Next.js-Produktionsbuild.**
- Eine Browser-/Touchscreen-/Spotify-Account-Live-Prüfung und reale Last.fm-Genre-Abfrage waren hier nicht möglich. Vor dem produktiven Einsatz nachholen.

## Lokal auf dem Windows-PC

1. `npm install` (falls keine Abhängigkeiten installiert sind).
2. `npm run test:v675`, danach `npm run typecheck` und `npm run build` **vollständig** ausführen.
3. Spotify anmelden; „Zuletzt gespielt“ → „Genre-Mix“ öffnen; mit konfiguriertem `LASTFM_API_KEY` Genres freiwillig prüfen.
4. „Mein Musikprofil“ öffnen und die Abdeckung/Genres plausibilisieren; Bühnen-Look anwenden, optional FX übernehmen und Rückgängig testen. Danach reguläre Songwiedergabe inklusive 3D-Avataren, Kamera, Lippenbewegungen und Lyrics im Browser auf 10-Zoll-Größe prüfen.

**Keine Freigabe als vollständig produktionsgetestete Version**, bis diese lokalen Prüfungen bestanden sind.
