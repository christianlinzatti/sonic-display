# V731 – Album-Explorer, Wiederentdeckungen und Favoriten-Backup

Alle drei Erweiterungen befinden sich im bestehenden Last.fm Artist & Track Explorer.

## Album-Explorer

Nach Album oder Künstler suchen und ein Album öffnen. Das Profil zeigt Scrobbles, erste/letzte archivierte Wiedergabe, Jahresstatistiken, Top-Titel und einen erweiterbaren Hörverlauf. Ein Top-Titel öffnet das bestehende Songprofil. Albumidentität besteht aus normalisiertem Künstler und Albumnamen; Deluxe-/Live-Versionen mit unterschiedlichem Namen bleiben getrennt. Künstler mit gleichnamigen Alben werden nicht zusammengeführt. Fehlende oder als unbekannt markierte Alben werden ausgelassen. Dies sind Scrobble-Auswertungen, keine verifizierten Release-Metadaten; verschiedene Künstler eines Samplers erscheinen separat.

## Erweiterte Wiederentdeckungen

„Lange nicht gehört“ zeigt Künstler oder Songs mit einem einstellbaren Abstand seit ihrem letzten archivierten Scrobble und einer einstellbaren Mindestzahl früherer Wiedergaben. Standard: 90 lokale Kalendertage und drei Wiedergaben. Die Liste ist nach längstem Abstand sortiert. Ein Treffer öffnet sein bestehendes Profil.

Album-Explorer und Wiederentdeckungsliste nutzen das gesamte Archiv unabhängig vom V730-Profilzeitraum. Das danach geöffnete Künstler-/Songprofil berücksichtigt weiterhin den dort gewählten Zeitraum. „Lange nicht gehört“ ist eine Beschreibung der vorhandenen Archivdaten, kein Beweis einer tatsächlichen Hörpause. Anders als die bisherigen Rückkehrereignisse zeigt die neue Liste Kandidaten, die noch nicht wieder im Archiv erschienen sind.

## Favoriten-Backup

Im Favoritenbereich „Favoriten sichern und importieren“ öffnen. „Favoriten-Backup herunterladen“ erzeugt eine JSON-Datei mit den aktuell geladenen Künstler-/Songfavoriten. Zum Import die Datei als Text öffnen und ihren JSON-Inhalt in das Eingabefeld auf dem Zielgerät einfügen. „Import prüfen“ zeigt die Gesamtzahl nach der Zusammenführung. Erst „Favoriten zusammenführen“ schreibt in das aktive Last.fm-Konto.

Bestehende Favoriten bleiben erhalten; normalisierte Duplikate werden zusammengeführt. Format, Version, Einträge, Dateigröße und die Grenze von 100 Favoriten werden geprüft. Fehlerhafte Daten oder ein Speicherfehler ersetzen keine vorhandenen Favoriten. Ein beschädigter bestehender Favoritenspeicher blockiert den Import. Das Backup enthält keine Scrobbles, Kontozugangsdaten, Albumfavoriten, Notizen oder gespeicherten Ansichten. Notizen und gespeicherte Ansichten gehören nicht zum Funktionsumfang dieser Version.

## Betrieb

`npm ci`, `npm run test:v731`, `npm run test:v731:types`, `npm run typecheck`. Der reguläre `npm run build` enthält weiterhin die umfangreiche historische Vorprüfung. Tatsächlicher Prüfstatus und Einschränkungen: V731-VERIFICATION.md. Keine neue API-Berechtigung und keine Archivmigration erforderlich.
