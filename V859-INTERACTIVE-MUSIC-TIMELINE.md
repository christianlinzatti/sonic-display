# V859 · Interactive Music Timeline

## Was neu ist

- Mehrjahreszeitachse des tatsächlich gespeicherten Last.fm-/V713-Langzeitarchivs; jedes Kalenderjahr zwischen erster und jüngster Aufzeichnung bleibt sichtbar, auch bei fehlenden Einträgen.
- Ein Jahresklick zeigt 12 Monate. Ein Monatsklick zeigt die acht häufigsten Künstler dieses Monats. Ein Künstlerklick öffnet dessen mehrjährigen Verlauf.
- Künstler-Zeitreise mit Unicode-normalisierter Künstlerzuordnung, erstem/letztem aufgezeichneten Scrobble, stärkstem Monat, Jahresbalken und mehreren Rückkehr-Zeitpunkten ab 90 Tagen Abstand.
- Suchfunktion für Künstler; Verknüpfung zum bestehenden Artist Explorer und zum V858 Music Discovery Dashboard.
- Freie Wahl zwischen Wiener Lokalzeit und UTC. Einträge vor dem Jahr 2000, aus der Zukunft oder mit ungültigem ISO-Datum werden nicht berücksichtigt.
- Keine zusätzlichen Datenabrufe, keine Last.fm-/Spotify-API-Änderungen, kein erneutes Scrobbeln, keine Datenbankmigration, kein Löschen alter History.
- Optimierung für Touchbedienung und kleinere Displays, Tastatur-Navigation, `aria-pressed` und Reduced Motion.

## Fachliche Grenze

Alle Zählungen beziehen sich ausschließlich auf die aufgezeichneten Scrobbles. Weder ein leerer Monat noch eine 90-Tage-Lücke beweisen, dass tatsächlich nicht gehört wurde. Der Künstler „erstmals“ meint den ersten *im vorhandenen Archiv* aufgezeichneten Eintrag. Für den Monatsverlauf werden 12 Monate des gewählten Jahres angezeigt; ältere Jahre bleiben im Jahresüberblick erreichbar. Nicht erkannte Künstler und Musik außerhalb des erfassten Last.fm-Verlaufs können nicht einbezogen werden.

## Testen

```bash
npm ci
npm run test:v859
npm run test:v859:types
npm run test:v859:ui-types
npm run check:syntax
npm run check:architecture
npm run typecheck
npm run build
```

Für die produktive Freigabe sind der *vollständige* TypeScript-Check sowie der Next.js-Produktionsbuild nötig. Isolierte Tests ersetzen diese nicht. Siehe `V859-VERIFICATION.md`.
