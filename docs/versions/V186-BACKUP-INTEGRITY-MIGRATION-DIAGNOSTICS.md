# Sonic Display V186 – Backup Integrity & Migration Diagnostics

V186 ergänzt die V184/V185-Browser-Einstellungssicherung um ein neues JSON-Envelope (`sonic-display-integrity`, Version 1) mit **SHA-256-Prüfsumme** der normalisierten V184-Sicherungsdaten. Der Export wird im Browser mit `crypto.subtle.digest` erstellt. Der Import berechnet die Prüfsumme erneut und **verweigert** das Importieren bei Abweichungen. Benötigt HTTPS oder localhost. Die Prüfsumme ist keine Signatur und schützt nicht vor absichtlich gefälschten Sicherungen.

Alte V184-JSON-Sicherungen lassen sich weiterhin öffnen und importieren, werden aber sichtbar **nicht verifiziert** angezeigt. Die V184-Import-Grenzen (erlaubte Schlüssel, Größenlimits, Auswahl, bestätigtes Überschreiben, best-effort Rollback) bleiben erhalten.

Im **Settings → Display → V186 Backup Integrity**-Panel kann man vor der Übernahme neue, identische und konfliktbehaftete Einträge prüfen, Kategorien auswählen, vorhandene Einstellungen standardmäßig behalten und nach ausdrücklicher Bestätigung importieren. Ein JSON-Migrationsbericht enthält die Zahl geschriebener Werte, Gruppenzahlen, Warnungen und einen Überblick über erkennbare Avatar- und Animation-URLs. Per HEAD überprüfte Dateien sind nur auf dem *aktuellen* Host erreichbar; externe/Blob-Referenzen und Dateien auf dem Ziel-Raspberry-Pi müssen separat geprüft werden. Die Assets selbst, Spotify-Zugangsdaten und Binärdateien gehören nicht zur Sicherung.

## Tests

`npm run test:backup-integrity`, `npm run verify:offline`, `npm run build:preflight`, `npm run typecheck`, `npm run build`.
