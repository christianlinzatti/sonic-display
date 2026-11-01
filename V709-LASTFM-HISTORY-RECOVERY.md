# Sonic Display V709 – Last.fm History Recovery

## Worum es geht

Die V708-Automatik holt höchstens 200 aktuelle Scrobbles pro Abfrage. Wenn Last.fm seit der vorherigen Sicherung mehr als 200 neue Scrobbles gesammelt hat, kann das lokale V706-Archiv eine **mögliche Lücke** haben. V709 erkennt einen konkreten Indikator: eine **volle** aktuelle Seite mit 200 Ereignissen, deren ältester Zeitstempel **neuer** als das jüngste bisher archivierte Ereignis ist. Dies ist kein Beweis für fehlende Wiedergaben; es ist nur ein begründeter Anlass, ältere Seiten zu prüfen. Die Erkennung passiert nur bei gültigem, aktivem V708-Auto-Abgleich; sie erzeugt keine eigenen Last.fm-Abfragen.

## Bedienung

1. `Zuletzt gespielt → Last.fm-History` öffnen und den Last.fm-Benutzernamen wählen. `LASTFM_API_KEY` muss bereits serverseitig vorhanden sein. Ein intaktes, gespeichertes Last.fm-Archiv ist erforderlich (bei einer Ersteinrichtung zunächst den normalen V706-Import verwenden).
2. Unter **History Recovery** erscheint ggf. die Warnung mit den zwei beobachteten Scrobble-Zeitpunkten. Der Abschnitt ist auch ohne Warnung sichtbar – zum Nachladen nach einer längeren Pause oder zur Ersteinrichtung. **Ohne erkannte Lücke wird kein Stopp-Anker gesetzt**: Die Suche läuft dann bis zum Last.fm-Ende oder zur Sicherheitsgrenze.
3. **„Mögliche Lücke nachladen“** bewusst anklicken. V709 lädt höchstens **5 Seiten = 1.000 Scrobbles je Durchgang**. Anschließend ggf. **„Weitere ältere Scrobbles nachladen“** anklicken; die Zeitgrenze bleibt für diese Sitzung konstant.
4. Nachholen endet, wenn bei vorhandener Lückenwarnung der **Scrobble von vor der erkannten Lücke** erneut gefunden wird, die letzte API-Seite erreicht ist oder die Sicherheitsgrenze von **100 Seiten** greift. Mit **„Suche neu beginnen“** kann eine neue Sitzung gestartet werden. Vor sehr langen Nachholvorgängen wird ein JSON-Backup empfohlen.

## Technische und Datenschutz-Grenzen

- **Kein unkontrolliertes Backfill**: Die V708-Automatik bleibt auf Seite 1 begrenzt. Der zusätzliche Mehrseiten-Import läuft nur nach deinem Klick, während der Browser offen ist. Keine Last.fm-Schreib-API, keine Last.fm-Anmeldeinformationen, keine neuen Spotify-Scopes.
- Die serverseitige `user.getRecentTracks`-Abfrage erhält einen optionalen und strikt geprüften `to`-Zeitstempel in UNIX-Sekunden. Damit werden neue Scrobbles nach dem Sitzungsbeginn grundsätzlich nicht in die rückwirkend abgefragten Seiten einsortiert. Last.fm-Nachträge und andere Änderungen an alten Daten können eine Seitenverschiebung dennoch auslösen.
- Das gewählte Last.fm-Konto und jede Seite werden vor der lokalen Speicherung geprüft. Der Datenkern verwirft manipulierte Einträge und speichert nicht über einen Kontowechsel oder ein beschädigtes Archiv hinweg.
- Der Nachholvorgang fügt vorhandene Scrobbles zusammen, behält echte Wiederholungen und **ändert das Spotify-Archiv nicht**. Bei Browser-Speichergrenzen oder Fehlern stoppt die Suche mit einer Meldung.
- Bestehende V706-Begrenzung: **8.000 Scrobbles** pro Last.fm-Konto. Wird sie überschritten, werden die ältesten verdrängt. V709 kann daher keinen unbegrenzten oder vollständigen Hörverlauf garantieren.
- Die Lückenwarnung wird nur gelöscht, wenn der Nachholvorgang den vor der Lücke gespeicherten Anker oder die letzte verfügbare API-Seite erreicht. Ein abgebrochener Lauf oder das 100-Seiten-Limit gilt nicht als vollständig geprüft. Benutzerwechsel setzt die in der Oberfläche gehaltene Suchsitzung zurück.
- Fehlende Scrobbles, die **nie bei Last.fm angekommen** sind, kann Recovery nicht rekonstruieren. Ohne echten Last.fm-API-Schlüssel und ein echtes Browserprofil ist keine Live-Funktionsabnahme möglich.

## Dateien

- `lib/lastfm-recovery-v709.ts`: rein lokale, testbare Gap-Warnung, Seitenvalidierung, Sitzungssteuerung und Archiv-Zusammenführung.
- `components/AutomaticLastFmHistoryRecorderV708.tsx`: prüft bei erfolgreichen V708-Abfragen auf mögliche Lücken und meldet den Zustand ans UI.
- `components/LastFmHistoryPanelV706.tsx`: explizite, in 5er-Seitenbatches fortsetzbare Recovery-Oberfläche.
- `app/api/lastfm/recent-tracks/route.ts`: optionaler, geprüfter `to`-Parameter; API-Key weiterhin serverseitig.
- `tests/v709-lastfm-history-recovery-regression.cjs`, `tests/tsconfig.v709-core.json`, `tests/tsconfig.v709-ui.json`: Funktions-, Sicherheits- und isolierte Typprüfungen.

Ergebnis der ausgeführten Prüfungen: `V709-VERIFICATION.md`.
