# V706 – Last.fm History: ausgeführte Nachweise und offene Grenzen

Stand: 29.10.2026. Das Projekt wurde aus der V705-Gesamtversion fortgeschrieben, ohne V701-/Spotify-Archive zu verändern.

## Ausgeführte Prüfungen

- `npm run test:v706`: **PASS**, 81 gezielte Tests mit 12.000 ungültigen Scrobble-Datensätzen. Enthalten: Last.fm-API-Normalisierung, nowplaying-Filter, Paginierung, UTC-Zeitstempel, sichere Bild- und Song-URLs, Server-API-Key-Schutz, Kontotrennung, Persistenz, JSON-Backup, Dubletten, Fehlercodes und 429/Retry-After.
- `npm run test:v706:types`: **PASS**, isolierter TypeScript-Datenkern.
- `npm run test:v706:ui-types`: **PASS**, isolierte React-/JSX-Typprüfung (Test-only-Typdeklarationen nicht produktiv eingebunden).
- Einzelne Versionsregressionen `test:v669` bis `test:v706`: **PASS**. Bei V695/696 sowie V669–V694 wurden diese nach dem Zeitlimit des Sammeltests separat ausgeführt; V697–V705 waren bereits im Sammeltest erfolgreich.
- `test:v694:types`, `test:v695:types`, `test:v696:types`: **PASS**.
- `npm run check:syntax`: **PASS**, 981 TS/TSX-Quellmodule.
- `npm run check:architecture`: **PASS**, 629 Quellreferenzen und Dokumentationsprüfung für V706.
- `npm run test:module-case`: **PASS**, 1.659 Quellpfade ohne problematische Groß-/Kleinschreibungskollision.
- `npm run check:test-types`: **PASS**, produktive Typdeklarationen nicht durch Test-Typen überschrieben.
- `npm run test:env:spotify-build`: **PASS**, Spotify-OAuth-/Cookie- und Session-Sicherheitsprüfungen.
- `npm run test:quick`: **unvollständig**. Nach fehlerfreien V706–V697-Tests und Typprüfungen beim Start von V696 wegen Zeitlimit beendet. Diesen Aufruf daher nicht als abgeschlossen oder Exit-Code-0 vermerken. Die verbleibenden Versionsregressionen wurden einzeln mit PASS nachgeholt; eine vollständige zusammenhängende `test:quick`-Ausführung wird weiterhin empfohlen.

## Produktive Freigabegrenzen

- `npm run typecheck`: **FAIL**. Im Testcontainer fehlen die meisten produktiven Module/Typdefinitionen (`next`, `react`, `@types/node` u. a.). Der isolierte V706-Check ersetzt das nicht.
- `npm run build`: **BLOCKIERT**, vor Next.js durch `check:dependencies`: **0/17 installierte npm-Abhängigkeiten** und **kein `package-lock.json`**. Es gibt keinen erfolgreichen Produktionsbuildnachweis in dieser Umgebung.
- **Kein echter Last.fm-Livetest**: Der Server besitzt hier keinen eingerichteten API-Key, und es stand kein bestätigter Last.fm-Benutzer mit realen Scrobbles für einen Browserlauf zur Verfügung.
- **Keine echte Spotify-/Browser-Abnahme** oder messbare Laufzeit-/FPS-Daten für diese neue UI. Die Last.fm-Serverroute wurde mit kontrollierten Fetch-/HTTP-Fixtures in V706-Regressionstests ausgeführt; das ist keine Live-API-Abnahme.

## Empfohlene Windows-Freigabe

```powershell
npm install
npm run typecheck
npm run build
npm run test:v706
npm run test:quick
```

Danach `.env.local` mit `LASTFM_API_KEY=...` anlegen, `npm run dev` starten, in **Zuletzt gespielt → Last.fm-History** den Last.fm-User konfigurieren, mindestens zwei Seiten importieren, einen Song wiederholt scrobbeln lassen, JSON exportieren/importieren sowie Kontowechsel und Offline-/429-Verhalten prüfen.
