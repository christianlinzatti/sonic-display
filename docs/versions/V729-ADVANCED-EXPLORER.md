# V729 – Advanced Artist & Track Explorer

Basis: vollständiges `sonic-display-v728-on-this-day.zip`.

## Bedienung

Last.fm History öffnen und im Advanced Artist & Track Explorer nach Künstlern oder Songs suchen. Der Profiltyp schaltet zwischen beiden Katalogen um. Alternativ führt jeder Chronikeintrag über „Künstlerprofil“ oder „Songprofil“ direkt zum Profil. Bestehende Künstlerfilter und Last.fm-Titellinks bleiben verfügbar.

Profile enthalten erste und letzte archivierte Wiedergabe, Scrobblezahl, verschiedene Songs, Jahresstatistiken, Top-Songs, beobachtete Wiederentdeckungen und einen schrittweise erweiterbaren Hörverlauf. Im Songprofil führt der Künstlername zum zugehörigen Künstlerprofil. „Auf Spotify suchen“ öffnet eine kodierte Spotify-Websuche. Es wird keine verifizierte Spotify-ID oder Abspielberechtigung behauptet.

## Auswertungsregeln

- Profile verwenden das gesamte aktuell geladene Archiv, unabhängig von Chronikfiltern.
- Künstler und Titel: Unicode-NFKC, getrimmt, ohne Groß-/Kleinschreibung. Unterschiedliche Titelversionen bleiben getrennt.
- Gleicher Zeitpunkt, Künstler und Titel zählt einmal, auch bei abweichendem Album. Spätere Wiedergaben bleiben erhalten. Das gespeicherte Archiv bleibt unverändert.
- Ungültige Zeitstempel, leere Namen, Zeitpunkte vor 2000 und zukünftige Wiedergaben werden nicht ausgewertet.
- Jahresgrenzen und Rückkehrabstände verwenden lokale Kalenderdaten. Eine Wiederentdeckung bedeutet mindestens 90 Kalendertage zwischen benachbarten erfassten Wiedergaben dieses Künstlers bzw. Songs.
- Fehlende Daten belegen keine Hörpause. „Erstmals im Archiv“ ist keine Behauptung über die erste tatsächliche Entdeckung.
- Keine neuen API-Aufrufe, Speicherformate, Migrationen oder Schreibvorgänge. Kontowechsel entfernt die Profilauswahl.

## Entwicklung

`npm ci` installiert den enthaltenen Lockfile-Stand. `npm run test:v729`, `npm run test:v729:types` und `npm run test:v729:ui-types` prüfen die neue Funktion. Alle drei sind dem bestehenden `test:quick` vorangestellt. `npm run typecheck` und `npm run build` bleiben die vollständigen Projektprüfungen. Tatsächlich ausgeführte Prüfungen und Einschränkungen stehen in `V729-VERIFICATION.md`.
