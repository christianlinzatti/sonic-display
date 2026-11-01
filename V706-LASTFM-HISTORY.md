# Sonic Display V706 – Last.fm Scrobble History

## Einrichtung

1. Erstelle auf https://www.last.fm/api/account/create einen Last.fm-API-Key (API Account).
2. Lege im lokalen Projekt, **niemals im Git/ZIP oder als `NEXT_PUBLIC_*`**, eine `.env.local` mit `LASTFM_API_KEY=DEIN_API_KEY` an. Auf Vercel muss derselbe Wert als **Server Environment Variable** gesetzt werden. Ein Last.fm-API-Secret ist für `user.getRecentTracks` **nicht nötig**.
3. Installiere die vorhandenen npm-Abhängigkeiten (`npm install`) und starte `npm run dev`.
4. Verbinde Spotify für die Sonic-Display-Hauptansicht. Öffne **Zuletzt gespielt → Last.fm-History**, gib deinen Last.fm-Benutzernamen ein und wähle **Scrobbles importieren**.
5. Importiere bis zu 200/1.000/2.000 Scrobbles pro Durchgang, um ältere Last.fm-Seiten einzulesen. Mit **JSON-Backup** sicherst du den lokalen Speicher für den Gerätewechsel; das Backup lässt sich für **dasselbe Konto** wieder einlesen.

## Fachliche Grenzen

- Last.fm `user.getRecentTracks` stellt bis zu **200 Scrobbles pro Seite** bereit, inklusive optionalem `nowplaying=true`, das **nicht** als abgeschlossene Wiedergabe importiert wird. Es werden nur von Last.fm bereits erfasste Scrobbles importiert. Sonic Display überträgt keine Wiedergaben an Last.fm und aktiviert **kein Scrobbling**.
- Der Lese-Endpunkt benötigt kein Last.fm-Login, sondern den **serverseitig** konfigurierten API-Key und einen **öffentlichen Last.fm-Hörverlauf**. Kein Passwort, kein Last.fm-Session-Key. Die Anwendung speichert den eingegebenen Usernamen lokal und ruft dessen öffentliche History nur nach Klick ab.
- **Spotify-Archiv und Last.fm-Archiv bleiben strikt getrennt**, da die Spotify-ID in Last.fm-Daten oft fehlt und dieselbe Wiedergabe von beiden Diensten vorliegen kann. Auch die V703-Statistiken bleiben Spotify-basiert; das Last.fm-Panel enthält eigene Statistiken.
- Das Last.fm-Archiv hält bis zu **8.000** Ereignisse je Benutzername im Browser-`localStorage`. Bei Überschreitung bleiben die neuesten erhalten; ein JSON-Backup ist sinnvoll. Browserdaten können gelöscht werden, und bei deaktiviertem/vollem Speicher misslingt der Import ohne Überschreiben. `nowplaying` wird nie archiviert.
- Die Erkennung doppelter Last.fm-Ereignisse verwendet **UTC-Zeitpunkt in Sekunden + normalisierte Künstler-, Song- und Albumnamen**. Wiederholungen zu unterschiedlichen Zeitpunkten bleiben getrennt; bei identischer Sekunde und identischen Metadaten kann die API keine feinere Identität liefern.
- Die API hält die Zugangsdaten serverseitig und prüft Benutzername, Seite, Antwortgröße und Last.fm-URL. Bei 429 wird eine begrenzte `Retry-After`-Angabe weitergereicht. Der Client gibt keine Tokens oder Archiv-Daten an Last.fm weiter.
- Die Last.fm-History ist derzeit nur über die Spotify-verbundene Sonic-Display-Hauptansicht erreichbar; ein eigenständiger Offline-Login ist nicht umgesetzt.

## Prüfung

```powershell
npm run test:v706
npm run test:v706:types
npm run test:v706:ui-types
npm run test:quick
npm run typecheck
npm run build
```

Für den realen Funktionstest werden ein gültiger Last.fm-API-Key, ein Last.fm-Benutzername mit Scrobbles, laufender Next.js-Server und ein browserfähiger Client benötigt. Ein bestandener isolierter Typcheck ist **kein** Nachweis eines vollständigen Produktionsbuilds.

## Referenzen

- https://www.last.fm/api/show/user.getRecentTracks
- https://www.last.fm/api/intro
- https://www.last.fm/api/authentication
