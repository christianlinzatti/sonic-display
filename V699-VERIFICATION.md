# V699 – Prüfbericht (29. Oktober 2026)

## Erfolgreich ausgeführt

- `npm run test:v699`: **PASS**, 44 neue Prüfgruppen und 12.000 synthetische CSV-Formelinjektionsfälle. Neu: Filter Heute / 7 / 30 Tage / alle geladenen Daten, Suche ohne Akzentpflicht, häufige oder einmalige Songs, Sortierung, unverfälschte Wiederholungen bei Paging, maximal 600 geladene Hörereignisse, CSV-Datenformat, Spaltenescaping und Schutz vor Formelinjektion; außerdem UI-/Privatsphäre- und Release-Vertragsprüfungen. Die Testdaten sind **synthetisch**, keine echten Spotify-Wiedergaben.
- `npm run test:v699:types`: **PASS**, isolierter echter TypeScript-Check für `recently-played-v672.ts` und `recently-played-tools-v699.ts` ohne produktive `.d.ts`-Überlagerung.
- Historische Regressionen `npm run test:v672`, `test:v673`, `test:v674`, `test:v675` und `test:v696`: **PASS**, inklusive V672-Spotify-API-Simulation und V696-Release-Vertrag.
- `npm run test:quick`: Versions-/Modultests **V699–V670 erfolgreich**, dann Tool-Zeitlimit **während V669**. `npm run test:v669` anschließend **separat PASS**. Die kombinierte Suite wurde nicht vollständig als ein einzelner Durchlauf abgeschlossen und wird nicht so bezeichnet.
- Separat **PASS**: `npm run check:syntax` (965 TS/TSX-Dateien), `npm run check:architecture` (611 aktuelle Referenzen), `npm run test:module-case` (1634 Source-Dateien, keine case-insensitiven TS-/TSX-Kollisionen), `npm run check:test-types` (8 nur in Tests erlaubte Ambient-Typdeklarationen isoliert), `npm run test:env:spotify-build` (OAuth- und Cookie-Sicherheit).

## Tatsächlich gestartet, aber blockiert

- `npm run check:dependencies`: **Exit 1** – 0 von 17 direkten npm-Abhängigkeiten vorhanden, `package-lock.json` fehlt.
- `npm run build`: **Exit 1** bereits beim Prebuild-Abhängigkeitscheck. **Es wurde kein Next.js-Produktionsbuild ausgeführt.**
- `npm run typecheck`: **Exit 2** – projektweit fehlende React-/Next-/Three-/Node-Module und Typen; zahlreiche Sekundärfehler wegen fehlender Deklarationen. Der vollständige Projekt-TypeScript-Check ist **nicht bestanden**.
- Kein echter Spotify-Login, keine echte Netzwerk- oder Browser-Sichtabnahme des neuen Dialogs, keine mobile Touch-Abnahme und keine tatsächliche Chromium-Testaufnahme. Die Quellcodeprüfungen sind keine Belege für eine erfolgreiche produktive Browserdarstellung.

## Abnahme auf dem eigenen Windows-Rechner

1. ZIP entpacken, `npm install` durchführen und das erzeugte `package-lock.json` zur Versionsverwaltung hinzufügen, danach `npm run typecheck` und `npm run build`.
2. Spotify verbinden (ggf. neu wegen `user-read-recently-played`), im Dialog **Zuletzt gespielt** die ersten 30 Events laden, weitere Seiten laden und Kontrollzeitpunkte überprüfen.
3. Zeitfenster (Heute / letzte 7 / letzte 30 / alle), alle/mehfach/einmalige Songs und beide Sortierungen testen. Suche mit Umlauten, Features, Track-/Album-Teilen; Anzahl der Treffer stets nur als **geladene** Einträge interpretieren.
4. Gefilterten CSV-Export explizit starten, in Excel/LibreOffice/Editor öffnen und Spalten, Sonderzeichen, Uhrzeit in ISO-UTC sowie Sicherheitsescaping prüfen. Kein automatisches Speichern im Browser.
5. Dialog mit `Esc`, Tab und Klick außerhalb testen. Nach Schließen und Neuöffnen werden die Daten wieder von Spotify angefordert, nicht aus einem gespeicherten privaten Verlauf restauriert.
6. `npm run test:quick` und `npm run check:release` auf dem Rechner einmal vollständig ausführen.

**Freigabe: Datenkern/Regressionen bestanden; vollständiger Produktionsbuild und echte Browser-/Spotify-Abnahme noch nicht nachgewiesen.**
