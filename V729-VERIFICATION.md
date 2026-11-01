# V729 – tatsächlicher Prüfstatus

Geprüft am 29. Oktober 2026 unter Windows, Node 24.19.0, Next.js 15.5.28. Abhängigkeiten wurden mit `npm install --no-audit --no-fund` installiert; der erzeugte `package-lock.json` ist enthalten.

## Bestanden

- V729: 33 Regressionstests, einschließlich Unicode, Duplikaten, Jahresgrenzen, Sommerzeit, 90-Tage-Grenze, zukünftigen/ungültigen Ereignissen, 20.000 Einträgen und unveränderter Eingabe.
- Tatsächliches React-Rendering der neuen Komponente: leeres Archiv, befülltes Profil, fehlendes Profil und HTML-Escaping von Metadaten.
- `test:v729:types` und `test:v729:ui-types`: erfolgreich. Der UI-Teil prüft auch die Hauptintegration.
- `npm run typecheck`: nach den unten dokumentierten Korrekturen **Exit 0** für das vollständige Projekt.
- `npm --ignore-scripts run build`: **Exit 0**, vollständige Next.js-Produktionskompilierung einschließlich Typprüfung und Erzeugung von 23 statischen Seiten. Vorhandene Autoprefixer-/Cache-Warnungen bleiben im Protokoll sichtbar.
- Produktionsserver gestartet; GET `/` lieferte **HTTP 200** (6.705 Bytes). Server danach beendet.
- Vorhandene History-Regressionen V697 bis V728 einschließlich der erneuten Prüfungen nach Versions-/Pfadkorrekturen bestanden. Das sind synthetische Tests, keine Live-Messung von Spotify oder GLB-Animationen.
- Zusätzliche gezielte Regressionen V641, V657, V667 sowie Metadaten V651/V652 bestanden.
- Syntax- und Architekturprüfung bestanden. Der Vergleich mit dem Original-ZIP fand keine fehlenden V728-Dateien.

## Grenzen der Freigabe

Der reguläre `npm run build` startet über `prebuild` die sehr umfangreiche vollständige `test:quick`-Kette. Dieser erste Lauf wurde beendet, um Vorprüfungen nicht doppelt auszuführen. Für die tatsächliche Produktionskompilierung wurde ausdrücklich `--ignore-scripts` verwendet; Typfehler wurden dabei nicht unterdrückt.

**Ein vollständig bestandener `npm run test:quick` oder regulärer `npm run build` mit allen Vorprüfungen wird nicht behauptet.** Die Regressionen wurden gebündelt separat ausgeführt. Der ältere V696-Test mit 12.000 dateibasierten Akzeptanzszenarien wurde vor Abschluss beendet. Seine Ergebnisse sind daher nicht grün. Die einzelnen Prüfprotokolle und Nachprüfungen liegen in `verification-v729/`.

Kein interaktiver Browsertest mit einem echten Last.fm-Konto, kein Spotify-OAuth-/Playback-Test und keine visuelle Browserabnahme. Die Spotify-Verknüpfung ist eine Suche, keine verifizierte Track-/Artist-ID-Zuordnung.

## Begrenzte Korrekturen aus der V728-Basis

Der erste Gesamt-Typecheck meldete neun Fehler außerhalb des Explorers. Vier Änderungen beseitigen diese:

- Konzertprüfung importiert `ConcertQualityHistoryPanelV694` aus der tatsächlich existierenden Panel-Datei. Das beseitigt auch Folgefehler und einen unter Windows problematischen Import mit abweichender Großschreibung.
- Optionaler Lip-Sync-Einstellungswert wird im Service-Status als `null` dargestellt, wenn er unbekannt ist.
- Metadaten-Fotoliste beschränkt den allgemeinen Foto-Ranking-Typ auf die tatsächlich zugelassenen Quellen `theaudiodb` und `flickr`.
- TAR-Manifestheader erhält für `BlobPart` einen eigenen ArrayBuffer.

Historische Versionsprüfungen akzeptieren V729 zusätzlich. Der V716-Kalendertest legt für seine UTC-Testdaten die UTC-Zeitzone fest; die V729-Tests prüfen ausdrücklich Europe/Vienna. V697/V698 verwenden den vorhandenen plattformunabhängigen TypeScript-Loader statt eines fest eingetragenen Linux-Pfads. Keine fachlichen Test-Erwartungen wurden entfernt.

## Lokal erneut prüfen

Nach dem Entpacken: `npm ci`, dann `npm run test:v729`, `npm run test:v729:types`, `npm run test:v729:ui-types`, `npm run typecheck`. Für die vollständige bestehende Freigabekette `npm run build` ausführen; dabei läuft auch der hier nicht abgeschlossene V696-Langtest erneut.
