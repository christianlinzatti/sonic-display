# V732 – Kalender, Vergleiche und persönliche Sammlung

Alle sechs Erweiterungen liegen im bestehenden Last.fm Artist & Track Explorer.

1. **Musikkalender:** Monatsraster mit Montag als Wochenbeginn und Wiedergabezahl pro lokalem Kalendertag. Ein Tagesklick zeigt Songs, Künstler, Albumnamen und Uhrzeiten; Songs öffnen das bestehende Detailprofil.
2. **Erweiterter Zeitraumvergleich:** Im vorhandenen Werkzeugbereich einen Monat oder ein Jahr als Zeitraum A eingeben. Zeitraum B ist der bestehende Profilzeitraum oben. Der Vergleich zeigt Scrobblezahlen pro Künstler, Aufsteiger, seltener gehörte Künstler und Künstler ohne Wiedergabe in A. „Neu in B“ bedeutet nicht automatisch neu entdeckt oder als Favorit gespeichert. Unterschiedliche Zeitraumlängen beeinflussen absolute Zahlen.
3. **Persönliche Rückblicke:** Monat oder Jahr wählen. Angezeigt werden Scrobbles, aktive Tage, verschiedene Künstler/Songs, aktivster Tag und Top-5-Listen. Der CSV-Export enthält Kennzahlen sowie vollständige Künstler- und Songranglisten. Keine Bild- oder PDF-Karte.
4. **Albumfavoriten und Merkliste:** Im geöffneten Albumprofil ein Album als Favorit oder für später speichern. Die Wiederentdeckungsliste bietet „Für später merken“ für Künstler und Songs. Sammlungen sind lokal an das Last.fm-Konto gebunden, maximal 300 Einträge. Entfernen und Sammlungsbackup sind im neuen Bereich verfügbar. Albumfavoriten werden anhand Künstler und Albumname unterschieden; Songversionen mit anderem Titel bleiben getrennt.
5. **Datenqualität:** Zeigt ungültige Einträge, mögliche Dubletten, fehlende Albumnamen und die 30 größten Abstände zwischen archivierten Hörtagen. Keine automatische Reparatur oder Löschung. Die Anzeige erfasst nur die an den Explorer übergebenen Daten; beim Import schon entfernte Dubletten sind dort nicht mehr erkennbar. Fehlende Tage sind kein Beweis einer Importlücke oder Hörpause.
6. **Bequemer Backup-Import:** Dateiauswahl und Drag-and-drop für genau eine Datei bis 200 KB. Das Laden übernimmt lediglich den Inhalt ins Textfeld. Erst nach Prüfung und Klick auf Zusammenführen wird gespeichert. Ungültige Inhalte, unbekannte Formatversionen und Kapazitätsüberschreitungen werden abgelehnt.

## Daten und Backups

Künstler-/Songfavoriten behalten ihr V731-Backupformat. Albumfavoriten und Merkliste haben ein separates V732-Sammlungsbackup. Beide können über die Dateiauswahl geladen werden, jeweils im passenden Bereich. Es gibt keine automatische Cloud-Synchronisierung. Bei fehlendem Konto oder nicht lesbarem Speicher bleiben Sammlungsänderungen gesperrt. Fehlgeschlagene Schreibvorgänge verändern den sichtbaren gespeicherten Sammlungsstand nicht.

Kalender, Rückblicke, Datenqualität, Album-Explorer und Wiederentdeckungen verwenden das gesamte verfügbare Archiv. Bestehende Detailprofile berücksichtigen weiterhin den Profilzeitraum. Leere Tage und Zeiträume bedeuten keine archivierten Scrobbles. Alle neuen Berechnungen erfolgen lokal ohne neue API-Berechtigungen.

## Start und Prüfung

Nach dem Entpacken im Projektordner `npm ci` und `npm run dev` ausführen. Neue Regressionen: `npm run test:v732`. Gesamt-Typecheck: `npm run typecheck`. Der reguläre Build enthält weiterhin die umfangreiche historische Vorprüfung. Tatsächlich ausgeführte Prüfungen und Einschränkungen stehen in V732-VERIFICATION.md.
