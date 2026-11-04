# Sonic Display V183 – Genre Insights & Safe Snapshots

Basiert vollständig auf V182.

## Neu
- Dashboard-Statistiken zu Korrekturen der vergangenen 30 Tage und zu älteren Einträgen.
- Artists mit widersprüchlichen Genre-Korrekturen werden sichtbar (keine automatische Anpassung).
- Bis zu zehn benannte lokale Sicherungen mit Zeitstempel und Eintragsanzahl.
- Sicherungen lassen sich nach Nachfrage wiederherstellen oder löschen.
- Sichere Validierung von Snapshot-Daten, maximal 250 Korrekturen je Snapshot.

Die JSON-Import- und Exportfunktionen aus V182 bleiben erhalten; lokale Snapshots ersetzen keinen Export auf ein anderes Gerät. Die Daten bleiben im lokalen Browserprofil.

## Tests
`npm run test:genre-insights`, `npm run verify:offline`, `npm run typecheck`, `npm run build`.
