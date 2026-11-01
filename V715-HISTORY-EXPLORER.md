# Sonic Display V715 – History Explorer 2.0

## Bedienung

1. **Zuletzt gespielt → Last.fm-History** öffnen und das Last.fm-Konto wie bisher auswählen.
2. Oben **Chronik durchsuchen** auswählen oder unterhalb der Langzeitstatistik zum **History Explorer** scrollen.
3. **Zeitraum** (`Gesamtes Archiv`, `Letzte 30 Tage`, `Letzte 365 Tage`, `Eigener Zeitraum`) und optional **Suche** auswählen. Bei `Eigener Zeitraum` sind die beiden Datumsgrenzen jeweils einschließlich; eine leere Grenze ist offen. Ein ungültiger Zeitraum wird ohne Ergebnisexport angezeigt.
4. Mit **50/100/200 Einträge pro Seite**, **Erste / Zurück / Weiter / Letzte** in der gesamten gefilterten Chronik blättern. Unter jedem Kalendertag sind alle Wiedergaben auf der aktuellen Seite gruppiert. Mit Klick auf einen Künstlernamen einen **exakten Künstlerfilter** aktivieren; der Filter ist separat entfernbar.
5. **Gefilterte CSV** exportiert die jüngsten maximal 25.000 Wiedergaben aus dem aktuellen Filter. Der komplette accountgebundene **JSON-Backup**-Export aus V713 bleibt für die verlustfreie Archivmitnahme erhalten.

## Datenverträge

- Das vollständige Last.fm-Archiv aus V713-IndexedDB wird lediglich ausgelesen; die Chronik hat **keine 150-Ereignisse-Anzeigegrenze** mehr. Nur eine überschaubare Anzahl aktueller Seiteneinträge wird gerendert; Kennzahlen und CSV-Grenze beziehen sich auf die gesamte gefilterte Ereignismenge.
- Suche via Unicode-NFKC und Unicode-Kleinschreibung; Künstlerfilter prüft den gesamten normalisierten Künstler-Credit, nicht Titel-/Album-Teiltreffer. Die Quelldaten und ihre Identitäten werden weder umgeschrieben noch dienstübergreifend dedupliziert.
- Datumsintervalle beziehen sich auf die **lokale Browser-Zeitzone**, einschließlich der 23-/25-Stunden-Tage bei der Sommer-/Winterzeitumstellung. 30/365 Tage sind gleitende Zeitfenster mit 24 h pro Tag, **keine** Kalenderintervalle.
- CSV wird in UTF-8 mit BOM, Semikolon-Trennung und UTC-ISO-Scrobble-Zeitstempel erstellt. Das Escape für Tabellenformeln ist auch bei Zeichen wie `=`, `+`, `-`, `@`, vorangestelltem Whitespace und Zeilenumbrüchen aktiv. Aus Sicherheits- und Speichergründen begrenzt auf maximal 25.000 der *jüngsten* passenden Einträge. Die UI weist **vor dem Export** auf die Grenze und danach bei tatsächlicher Kürzung noch einmal hin.
- Last.fm-Events bleiben bereits von Last.fm bestätigte Scrobbles. V715 sendet **keine** zusätzlichen Scrobbles, benötigt keine zusätzlichen OAuth-Rechte und führt keine weiteren Netzwerkabfragen aus. Spotify→Last.fm-Scrobbling bleibt bei der bereits verknüpften Last.fm-Anwendung.
- Die vollständige Datenabdeckung ist nicht garantiert. Lokale Daten können gelöscht oder durch Gerätespeicherquoten eingeschränkt werden; auch die alte 8.000er-Anzeigegrenze des localStorage-Kompatibilitätsspiegels bleibt getrennt von der vollständigen IndexedDB-History.

## Technische Änderungen

- `lib/lastfm-history-explorer-v715.ts` – reines Modul für Validierung von Datumsgrenzen, Suche, Pagination, lokale Tagesgruppierung und CSV-Schutz.
- `components/LastFmHistoryPanelV706.tsx` – neuer Explorer mit Navigation und Export; bestehende Import-/Recovery-/Backup-/Analysefunktionen beibehalten; History-Suchfilter werden beim Benutzerwechsel zurückgesetzt.
- `app/globals.css` – responsive, touchfähige Suche, Tagesgruppen und Seitennavigation.
- `tests/v715-history-explorer-regression.cjs`, `tests/tsconfig.v715-core.json`, `tests/tsconfig.v715-ui.json` – Regression, Kern- und UI-Typecheck.
- V706–V714-Versionstests wurden für die Versionsanhebung auf `0.1.0-v715` vorwärtskompatibel gemacht.

## Prüfen

```powershell
npm install
npm run test:v715
npm run test:v715:types
npm run test:v715:ui-types
npm run test:quick
npm run typecheck
npm run build
```

**Hinweis:** Der echte Next.js-Produktionsbuild und die reale Browserverifikation mit importierten Last.fm-Daten müssen nach Installation der Abhängigkeiten erfolgen. Details im `V715-VERIFICATION.md`.
