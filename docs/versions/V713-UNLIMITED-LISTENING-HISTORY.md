# V713 – Unlimited Listening History (IndexedDB)

## Ziel und Bedienung

- **Langzeitarchiv:** Last.fm-Scrobbles werden in IndexedDB unter `sonic-display-lastfm-longterm-v713`, Object Store `scrobbles`, gespeichert. Primärschlüssel = kanonischer Last.fm-Benutzername + normalisierter Song-/Künstler-/Album-/Zeitstempelschlüssel. Ein Re-Import desselben Scrobbles legt keinen zweiten Eintrag an; echte Wiederholungen mit anderem Zeitpunkt bleiben erhalten.
- **Migration:** Beim Öffnen des Last.fm-Verlaufs wird das bisherige V706-JSON geprüft und atomar mit IndexedDB zusammengeführt. Das alte Archiv wird **nie gelöscht**. Wiederholte Migrationen sind idempotent und werden bei unverändertem Quellstand übersprungen.
- **Manueller Import:** In „Zuletzt gespielt → Last.fm-History“ importierst du weiterhin paginiert von Last.fm. Neue Seiten werden zuerst in IndexedDB gespeichert. Ein lokaler Spiegel mit maximal 8.000 jüngeren Ereignissen versorgt weiterhin die vorhandene V708-Automatik und V709/V710-Recovery. Seine Beschränkung begrenzt **nicht** den IndexedDB-Bestand. Nach dem Browserstart kann die Seitennummer erneut bei Seite 1 beginnen; bereits archivierte Scrobbles werden dadurch nicht dupliziert. Für sehr viele historische Scrobbles sind mehrere „Weitere … importieren“-Durchgänge nötig.
- **Automatik:** Änderungen der bisherigen V708-/V710-Automatik werden auch bei geschlossenem Verlaufsdialog aus dem Kompatibilitätsspiegel in IndexedDB übernommen, sofern die Anwendung offen ist. Last.fm wird dadurch **nicht** zusätzlich gescrobbelt; Spotify Scrobbling bei Last.fm bleibt allein für die Erfassung zuständig.
- **Jahresauswertungen:** „Dein Musikjahr“ (V712), „Deine Hörmuster“ (V711), Statistik und Entdeckungen (V707) erhalten die gesamte im Browser geladene IndexedDB-Historie, nicht nur 8.000 Einträge.
- **Backup/Wiederherstellung:** „JSON-Backup ↓“ exportiert die vollständigen im IndexedDB-Archiv gespeicherten Ereignisse im neuen Format `sonic-display-lastfm-longterm-v713` (Version 2). „JSON-Backup einlesen“ akzeptiert dieses Format und das frühere V706-Format und führt nur fehlende Ereignisse ergänzend hinzu. Fremde Last.fm-Benutzer und beschädigte Ereignisse werden zurückgewiesen. Maximal 100 MB bzw. 250.000 Ereignisse pro Importdatei als Sicherheitsgrenze; **kein festes 8.000er-Limit für das Archiv**.

## Sicherheit und realistische Grenzen

1. IndexedDB ist **nicht unbegrenzt**: Quota, Speicherbereinigung, privater Modus oder Nutzeraktionen können Daten entfernen. Regelmäßig JSON-Backups **außerhalb** des Browsers aufbewahren.
2. Die Migration ist ergänzend und atomar; ein beschädigtes altes Archiv wird nicht stillschweigend überschrieben. Bei einem Schreibfehler bleibt die bisherige lokale Kopie erhalten; der Browser meldet einen Fehler.
3. Das System ist nicht geräteübergreifend synchronisiert. Geräteaustausch erfolgt per JSON-Export/-Import.
4. Ein vorhandenes Last.fm-Scrobble beweist nicht, dass ein Song vollständig abgespielt wurde. Fehlende Last.fm-Wiedergaben können nicht rekonstruiert werden.
5. Die bisherige automatische Lückenreparatur verwendet den jüngeren Legacy-Spiegel als ihren Suchanker. Der Langzeitimport selbst ist unabhängig von dieser Grenze.
6. Bei Browserabsturz zwischen einem alten Legacy-Schreibvorgang und seiner IndexedDB-Spiegelung kann zunächst nur der jüngere Legacy-Bestand als Quelle dienen; bei der nächsten Initialisierung wird erneut gemergt. Die neue Speicherung ist nicht mit Last.fm-Serverdaten live validiert.
7. Die neue IndexedDB-Funktion benötigt Unterstützung des tatsächlichen Browsers; bei Sperrung/Fehlen wird ein Warnhinweis ausgegeben. Keine serverseitige Speicherung des Hörverlaufs.

## Freigabe

`npm run test:v713`, `npm run test:v713:types`, `npm run test:v713:ui-types`, `npm run test:quick`, `npm run build`, `npm run typecheck`. Siehe `V713-VERIFICATION.md` für die tatsächlich erreichten Prüfstände.
