# Sonic Display V365 – echte Web-Push-Infrastruktur (bereit zum Deployen)

Aufbau auf **V364 PWA-Grundlage**. Die bestehende Musikvisualisierung, die Spotify-OAuth-Anbindung und die In-App-Release-Benachrichtigungen V363 bleiben vorhanden.

## Implementiert

- Installation als Android-PWA: PWA-Manifest sowie reale PNG-Icons mit 192 px und 512 px. Der Service Worker `/sw-v364.js` verarbeitet Push-Ereignisse, zeigt Systembenachrichtigungen und öffnet Sonic Display beim Antippen. Spotify-Daten werden ausdrücklich nicht offline zwischengespeichert.
- Touchfreundliche Push-Einstellungen im bestehenden PWA-Menü: echte Browserberechtigung, Web-Push-Abonnement über VAPID, Ein-/Ausschalten je Gerät, maximal drei Geräte, Löschen **aller** Geräte und serverseitiger Daten. Es wird erst "aktiv" angezeigt, wenn die Speicherung serverseitig erfolgreich war. Der öffentliche VAPID-Schlüssel wird ausschließlich bei vorhandener Server-Konfiguration ausgeliefert.
- Serverroute `/api/push/subscription` für Status/Anmeldung/Abmeldung. Authentifizierung über gültige Spotify-Session und `user-follow-read`, `GET /me` zur kontoscharfen Zuordnung, Origin-Prüfung für schreibende Requests, Eingabegrößenlimit, Push-Endpoint-Host-Allowlist gegen SSRF, `Cache-Control: private, no-store`.
- Persistente Upstash-Redis-Daten: SHA256-IDs für Endpunkte, HMAC für Spotify-Konto-ID, Spotify-Refresh-Token **verschlüsselt via AES-256-GCM mit einem eigenen 32-Byte-Schlüssel**, Push-Verschlüsselungsschlüssel der jeweiligen Browser-Abonnements, ausgewählte Künstlergenre-Filter, begrenzte Release-IDs und Spotify-Cursor. **Keine** Spotify-Access-/Refresh-Tokens im Browser-Storage. Die Registrierung ist ausdrücklich freiwillig.
- Serverseitiger Vercel-Cron täglich **09:00 UTC** via `vercel.json`, `GET /api/cron/release-push`, abgesichert mit `CRON_SECRET` im Authorization-Header. Token-Refresh wird serverseitig ausgeführt. Pro Cron maximal **zwei Spotify-Konten**, pro Konto **vier gefolgte Künstler** und **zehn Albumeinträge je Künstler**. Konten werden bei weiteren Läufen rotiert. Rate-Limits/Netzfehler führen zu einem übersprungenen Scan, nicht zu fingierten Erfolgsmeldungen.
- **Erster vollständiger Scan** für jeden Nutzer erstellt nur einen Ausgangsstand, statt direkt ältere Veröffentlichungen als neue Push-Meldungen zu verschicken. Spätere Scans benachrichtigen für maximal drei bisher unbekannte Singles/Alben innerhalb von 14 Tagen pro Konto/Scan. Bis zu 500 bereits erkannte Spotify-Release-IDs reduzieren Wiederholungen. Ein 404/410 vom Push-Service entfernt das ungültige Geräte-Abo.
- Genre-Filter sind `Deutschrap`, `Hardstyle`, `Hardtekk`. Keine Auswahl bedeutet **alle gefolgten Künstler**. Bei gesetztem Filter werden nur Artists berücksichtigt, deren **Spotify-Artist-Genre-Tags eindeutig zugeordnet** werden können. Da diese Tags unvollständig sein können, ist dies ein konservativer Filter und **keine** vollständige Klassifikation von Tracks oder Releases.
- Beim regulären Trennen der Spotify-Verbindung wird versucht, **alle** serverseitigen Abos samt Refresh-Token vorher zu löschen. Kann die Löschung nicht sicher bestätigt werden, wird das Trennen mit einem Fehler beendet, statt fälschlich Erfolg zu signalisieren.

## Unbedingt vor produktivem Betrieb

1. HTTPS-Domain für Next.js/Vercel konfigurieren, vorhandene Spotify-Redirect-URI aktualisieren und Spotify gegebenenfalls neu verbinden, damit `user-follow-read` gültig ist.
2. Eine Upstash Redis REST-Datenbank anlegen. `UPSTASH_REDIS_REST_URL` und `UPSTASH_REDIS_REST_TOKEN` als Server-Umgebungsvariablen setzen. Keine geteilte öffentliche Redis-Datenbank benutzen.
3. Einen separaten **32-Byte AES-Schlüssel** erzeugen und langfristig als `PUSH_ENCRYPTION_KEY` speichern. Beispiel: `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`. **Nicht ohne Datenmigration rotieren**: sonst können vorhandene Refresh-Tokens nicht entschlüsselt werden.
4. `npm install` und `npx web-push generate-vapid-keys`. Öffentlichen Key in `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, privaten in `VAPID_PRIVATE_KEY` und `VAPID_SUBJECT` auf eine gültige `mailto:`-Adresse setzen. VAPID-Keys nicht willkürlich ändern, sonst müssen Geräte erneut abonnieren.
5. `CRON_SECRET` als separaten ausreichend langen Zufallswert (`>=32` Zeichen) einrichten. Vercel sendet diesen bei Cron-Aufrufen automatisch im Header. Den Cron-Endpoint nicht öffentlich ohne Schutz einsetzen.
6. Nach dem Production-Deployment auf einem unterstützten Android-Browser die PWA installieren, Spotify verbinden und **Hintergrund-Push aktivieren**. Die Browser-Berechtigung muss ausdrücklich bestätigt werden.
7. Status/Logs über Vercel Cron prüfen. Die erste erfolgreiche Prüfung erzeugt einen Ausgangsstand und versendet noch keine Meldung. Erst folgende erfolgreiche Prüfungen können neue Releases melden.

Beispiel der benötigten Variablen steht in `.env.example`. Die Variablen `PUSH_ENCRYPTION_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET`, `UPSTASH_REDIS_REST_TOKEN` dürfen **niemals** mit dem Präfix `NEXT_PUBLIC_` angelegt werden.

## Betriebsgrenzen

- **Nicht live deployed und nicht Ende-zu-Ende mit einem echten Spotify-Konto/Android-Gerät getestet**. Der lauffähige Next.js-Produktionsbuild erfordert auf dem Zielsystem `npm install` und `npm run verify`.
- **Vercel Hobby Cron läuft höchstens täglich**, mit ungenauer Ausführungszeit. Pro täglichem Lauf werden maximal zwei Konten überprüft. Für mehr Nutzer müssen Batching/Task-Queues, Persistenztransaktionen, Rate-Limit-Behandlung und Hosting-Tarif entsprechend skaliert werden.
- Spotify-Artist-Album-Abfragen liefern nur einen Ausschnitt, nicht alle Features/Gastauftritte. Releases ohne tagesgenaues Datum werden übersprungen. Browser/OS können Push trotz bestehendem Abo drosseln, widerrufen oder verzögert zustellen; fehlgeschlagene Geräte können unter Umständen erneut abonniert werden müssen.
- Die doppelte Deduplizierung verhindert im Normalfall identische Meldungen; Push-Gateways können Netzwerkzustellung nicht exakt einmal garantieren. Die Speicherung erfolgt je Spotify-Konto in Redis, während die V363-In-App-Benachrichtigungen bisher browserlokal bleiben.
- Ohne ausdrückliche Push-Aktivierung werden **keine** zusätzlichen serverseitigen Spotify-Tokens gespeichert und die bisherigen In-App-Funktionen arbeiten weiterhin eigenständig.
- Push-Server benötigt Betriebswartung, Schlüssel-Backups, Überwachung, Rate-Limit-Monitoring und Lösch-/Datenschutzerklärung vor öffentlichem Multiuser-Einsatz.

## Tests

- `node tests/v365-web-push-regression.cjs`: Pure Crypto-/Input-/Genre-/Deduplizierungstests, strukturelle Checks für API/Service Worker/UI/Cron und Config.
- `node scripts/run-offline-regression-v352.cjs`: Gesamte vorhandene Offline-Suite, inklusive V365.
- `node tests/check-source-syntax.cjs`: TypeScript- und TSX-Syntax.
- Zusätzlich strenger isolierter TypeScript-Check der V365/Release-Radar-Datenmodelle und des Browser-VAPID-Decoders.
- Hier kein vollständiger Next.js-Produktionsbuild: Das Referenzprojekt wird ohne `node_modules` und `package-lock.json` geliefert. Echte Redis-/Push-/Spotify-Netzwerktests sind vor Deployment noch offen.

## Verwendete Referenzen

- Spotify API 2026: https://developer.spotify.com/documentation/web-api/references/changes/february-2026
- Spotify gefolgte Künstler: https://developer.spotify.com/documentation/web-api/reference/get-followed
- Vercel Cron-Tarife: https://vercel.com/docs/cron-jobs/usage-and-pricing
- Vercel Cron-Sicherheit: https://vercel.com/docs/cron-jobs/manage-cron-jobs
- Web Push npm: https://www.npmjs.com/package/web-push
