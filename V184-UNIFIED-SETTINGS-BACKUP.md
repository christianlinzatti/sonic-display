# V184 – Unified Settings Backup & Restore

Eine zentrale Sicherung für im Browser gespeicherte Einstellungen. Einstieg: **Settings → Display → V184 Gesamteinstellungen sichern**.

## Export

`createUnifiedBackup` erfasst ausschließlich explizit freigegebene lokale Schlüssel (Genre-Korrekturen und Snapshots, Licht-Presets, Lernwerte, Song-Timelines, Avatar/Choreografie-Kalibrierungen, UI und Raspberry-Pi-Einstellungen). Spotify-Tokens, Cookies, Autorisierungsdaten, Passwörter, Uploads und Server-Konfigurationen sind ausgeschlossen. Die Datei ist JSON, **nicht verschlüsselt**; sie enthält persönliche Einstellungen und sollte vertraulich behandelt werden. Es gibt keine Cloud-Übertragung.

## Import

Datei (maximal 2 MiB) auswählen → Format und Schlüssel prüfen → Vorschau mit neu/identisch/konfliktbehaftet und Kategorien → Kategorien auswählen → standardmäßig nur neue Werte übernehmen. Bestehende Werte werden nur bei explizitem Häkchen und erneuter Bestätigung überschrieben. Fehler beim Schreiben lösen einen best-effort Rollback aus. Danach die Seite neu laden, damit alle React-Kontexte die importierten Einstellungen einlesen.

## Grenzen

Nur die dokumentierten clientseitigen Schlüssel werden exportiert; die Liste muss für künftige Schlüssel erweitert werden. Browser-eigene Spotify-Anmeldedaten, serverseitige Umgebungsvariablen, auf Servern oder in Vercel Blob gespeicherte Avatardateien werden **nicht** gesichert. Avatar-Referenzen können nach Gerätewechsel ins Leere zeigen. Einzelne Einträge sind auf 150.000 Zeichen und das Archiv auf 2 MiB begrenzt. Es findet keine semantische Validierung jedes älteren Einstellungsformats statt. Das Importieren unbekannter Versionen wird abgelehnt.

## Test

`npm run test:unified-backup`, `npm run verify:offline`, `npm run typecheck`, `npm run build`.
