# Sonic Display V701 – Persönliches Langzeit-Hörarchiv

## Zweck und Verwendung

Unter **◷ Zuletzt gespielt → ▣ Mein Archiv** gibt es eine freiwillige und lokal gespeicherte Spotify-Hörhistorie. Nach erfolgreicher Prüfung der Spotify-Kontokennung mit `GET /api/spotify/history-identity` den Schalter **Lokales Archiv aktivieren und geladene Einträge übernehmen** verwenden. Erst ab dieser aktiven Zustimmung werden bereits geladene Seiten sowie beim späteren Öffnen des Dialogs neu abgerufene Seiten automatisch in das Archiv übernommen. Ohne Aktivierung verhält sich der vorherige Verlauf wie bisher flüchtig.

Die neuen Statistiken können für **diesen Monat**, **dieses Jahr** oder **das gesamte Archiv** geöffnet werden. Sie zeigen tatsächliche gespeicherte Wiedergabeereignisse, unterschiedliche Song-IDs, aufgezeichnete Hörtage, die zwölf meistgespielten Songs, Künstler-Credits und die Anzahl pro Monat. Gleiche Song-ID mit verschiedenen Spotify-`played_at`-Zeitpunkten zählt als Wiederholung; identische Ereignisse erscheinen nur einmal. Es wird keine Spielzeit, Vollständigkeit, Skip-Rate oder historische Spotify-Aktivität erfunden.

## Datenschutz, Kontowechsel, Sicherung

- Die Wiedergaben bleiben in `localStorage`, getrennt nach der vom Spotify-Server bestätigten Kontokennung. Bei fehlender Kontozuordnung kann das Archiv weder gelesen noch aktiviert werden.
- Es gibt **keine Server-Speicherung**, keine Cloud-Synchronisation, keine Audiomitschnitte, keine Lyrics-Texte und keine Spotify-Tokens in diesem Archiv. Die einmalige Konto-Abfrage erfolgt nur während der geöffneten Verlaufssitzung. Spotify kann trotzdem während des Abrufs API-Anfragen sehen.
- Ein Archiv kann über **JSON-Sicherung exportieren** exportiert und beim gleichen Spotify-Konto auf einem anderen Gerät **importiert** werden. Neue und vorhandene Einträge werden zusammengeführt, nie durch den Import ungefragt ersetzt.
- Der Import validiert Formatversion, Spotify-Konto, Zeitstempel, Datentypen, Cover-URLs, Größenlimit und Dubletten. Nicht lesbare, beschädigte oder zukünftige Formate werden **nicht automatisch überschrieben**. Solche Daten können nach ausdrücklicher Bestätigung gelöscht werden.
- **Archiv löschen / deaktivieren** entfernt nur die Daten des aktuell verbundenen Spotify-Kontos auf diesem Browser. Ein anderer angemeldeter Account sieht diese Daten nicht in der Oberfläche.
- Browserdaten sind **nicht verschlüsselt** und können von Personen mit Zugriff auf das gleiche lokale Browserprofil eingesehen werden. Für Gerätewechsel oder Browserdaten-Löschung eine JSON-Sicherung erstellen.

## Grenzen

Das Archiv fasst höchstens **5.000 Ereignisse** und wird auf ungefähr 3,5 Mio. JSON-Zeichen begrenzt. Neue Ereignisse verdrängen bei Erreichen der Obergrenze die ältesten, die Anzeige nennt diese Anzahl. Browser-Speicherfehler werden angezeigt; kein Erfolg wird vorgetäuscht. Die Spotify-API liefert nur einen begrenzten, nicht rückwirkend vollständigen Verlauf. Das Archiv wächst nur durch **tatsächlich geladene Spotify-Seiten**, niemals durch Hintergrund-Tracing. Die bestehenden V699-/V700-Ansichten bleiben bei 600 flüchtigen Ereignissen.

## Prüfungen

- `npm run test:v701`: 62 deterministische Prüfgruppen, 12.000 negative Validierungstests, Kontotrennung, Import/Export, gespeicherter Zustand, Kapazitätsgrenzen und Integration.
- `npm run test:v701:types` / `npm run test:v701:ui-types`: isolierte TypeScript-/JSX-Prüfung ohne produktive Typdeklarationen aus Test-Stubs.
- `npm run test:quick`: Versionstests V669–V701, Syntax-, Architektur-, Modulnamen- und Spotify-Sicherheitsprüfung.
- Vollständige Produktion erfordert mit allen npm-Paketen/Lockfile: `npm run typecheck` und `npm run build`, anschließend echten Spotify-/Browser-Test (Konto A/B, opt-in, Neustart, Import, JSON-Backup, Storage-Quota). Diese Schritte sind hier **nicht** durch isolierte Typprüfung oder simulierte Daten ersetzt.
