# V708 – Automatische Last.fm-Hörverlauf-Synchronisierung (Opt-in)

## Einrichtung

1. Auf dem Sonic-Display-Server `LASTFM_API_KEY` in `.env.local` konfigurieren. Das Passwort des Last.fm-Kontos wird **nicht** benötigt.
2. `Zuletzt gespielt → Last.fm-History` öffnen, den Last.fm-Benutzernamen eingeben und mindestens das lokale V706-Archiv anlegen. Bereits vorhandene ältere Scrobbles können vorher manuell importiert werden.
3. **„Automatische Sicherung einschalten“** auswählen. Erst danach fragt der Sammler in der normalen Sonic-Display-Ansicht die neuesten Last.fm-Scrobbles ab.
4. In demselben Bereich den letzten erfolgreichen Abgleich und die Anzahl neuer Einträge prüfen. Mit **„Automatische Sicherung ausschalten“** die Automatik stoppen, ohne das Archiv zu löschen. Für den Gerätewechsel das separate V706-JSON-Backup exportieren.

## Verhalten und Grenzen

- Standardmäßig **aus**, eigene Einwilligung je Last.fm-Konto im Browserprofil. Keine automatische Einwilligung allein durch Vorhandensein eines Archivs. Kein Scrobbling zu Last.fm, nur `user.getRecentTracks` über den bestehenden serverseitigen V706-GET-Endpunkt.
- Höchstens **alle 5 Minuten**, nur wenn die normale Sonic-Display-Ansicht geöffnet, der Browser-Tab **sichtbar und fokussiert** sowie online ist. Bei geschlossenem Tab/Browser, inaktiver Seite oder nicht verbundenem Sonic Display keine Garantie für Synchronisierung. Kein Service Worker oder serverseitiger Cronjob.
- Pro Abfrage **nur Seite 1** (bis zu 200 aktuelle Scrobbles). Bei langen Pausen mit mehr als 200 neuen Scrobbles können Lücken bleiben: zur rückwirkenden Ergänzung den manuellen Mehrseitenimport aus V706 verwenden. Last.fm muss die Scrobbles selbst bereits enthalten.
- `nowplaying` wird weiterhin nicht als gezählte Wiedergabe importiert. Gleiche Zeitstempel/Künstler/Song/Album werden nicht doppelt gespeichert; tatsächlich unterschiedliche Scrobble-Zeitpunkte bleiben erhalten.
- Die automatisierte Sicherung ergänzt **nur vorhandene, intakte** V706-Archive; sie erstellt keine neuen Archive und repariert keine kaputten Daten. Das vorhandene Limit von **8.000** lokal gespeicherten Last.fm-Scrobbles bleibt erhalten; bei Überschreitung werden ältere Ereignisse verdrängt. JSON-Backup empfohlen.
- Vor jeder Abfrage und vor dem Speichern werden gewähltes Konto, Einwilligung und Archiv erneut kontrolliert. API-Fehler, nicht plausible Seiten und Speicherfehler führen nicht zu künstlichen Einträgen. HTTP 429 mit `Retry-After` verursacht einen begrenzten Cooldown. Die letzte erfolgreiche Synchronisierung wird nur nach erfolgreichem gültigen Seitenabgleich angezeigt.
- Der V707-Quellenvergleich aktualisiert die lokale Auswertung nach erfolgreichem Auto-Abgleich, ohne Spotify-Archive zu verändern. Im „Gemeinsam“-Modus bleibt die bereits vorhandene Dublettenerkennung heuristisch.
- In mehreren Tabs können zeitgleiche Schreibvorgänge auftreten. Vor einem manuellen Import wird das aktuelle lokale Archiv erneut gelesen, damit neue Auto-Einträge nicht durch einen veralteten React-State überschrieben werden. Das ersetzt jedoch keine transaktionale Datenbank oder ein Cloud-Backup.

## Dateien

- `lib/automatic-lastfm-history-v708.ts`: sicherheitsorientierter, testbarer Consent-/Status-/Append-Datenkern.
- `components/AutomaticLastFmHistoryRecorderV708.tsx`: opt-in Poller, auch bei geschlossenem Dialog aktiv, aber nicht bei geschlossenem Browser.
- `components/LastFmHistoryPanelV706.tsx`: V708-Schalter, Status und aktualisierte Manuell-Import-Zusammenführung.
- `components/ListeningSourceDashboardV707.tsx`: lokale Reaktion auf erfolgreiche V708-Synchronisierungen.
- `components/RecentlyPlayedV672.tsx`: Poller außerhalb des Dialogs montiert.
- `tests/v708-lastfm-auto-sync-regression.cjs`, `tests/tsconfig.v708-core.json`, `tests/tsconfig.v708-ui.json`: isolierte Tests.

Tatsächlicher Prüfstatus: `V708-VERIFICATION.md`.
