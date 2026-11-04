# V730 – tatsächlicher Prüfstatus

Prüfumgebung: Windows, Node 24.19.0, Next.js 15.5.28. Grundlage ist das vollständige V729-Projekt. Der aktualisierte Lockfile enthält auch React Test Renderer als reine Entwicklungsabhängigkeit.

## Erfolgreich geprüft

- **68 V730-Prüfungen**: inklusive lokaler Tages- und Sommerzeitgrenzen, offener/ungültiger Datumsbereiche, zwölf Monatswerten, Jahresdifferenzen, Nullbasis, Profiltypen, gemeinsamer Kalendertage, 20.000 Einträgen und unveränderter Eingabe.
- Tatsächliche React-Interaktionen: Monats- und Jahresauswahl, gleicher Jahresvergleich abgewiesen, Profile A/B übernehmen, Filter ändern, Profil-/Vergleichs-CSV auslösen, CSV-Inhalt auf beide Profile und korrekte Grenzen prüfen, Favoriten speichern/nachladen, Kontowechsel, Vergleich zurücksetzen, Speicherfehler und Schutz beschädigter Favoritendaten.
- CSV-Prüfungen umfassen Formelabsicherung, Anführungszeichen, Zeilenumbrüche, UTF-8-BOM, negative Zahlen sowie einen Export mit 35 Songs ohne Begrenzung auf die sichtbare Top-Liste.
- **`npm run test:v730:types` und `npm run test:v730:ui-types`: Exit 0**. Die UI-Prüfung enthält den bestehenden Explorer und seine History-Hauptintegration.
- **29 bestehende History-/Projektprüfstufen bestanden**: Last.fm V706–V729, Syntax, Architektur, Dateinamen unter Windows, isolierte Test-Typdeklarationen und Spotify-Buildumgebung. V729 enthält weiterhin 33 erfolgreiche Regressionstests; V728 enthält 126.
- Zusätzliche V704-/V705-Regressionen bestanden, einschließlich je 12.000 adversarialer Eingaben.
- **`npm run typecheck`: Exit 0** für das vollständige Projekt.
- **`npm --ignore-scripts run build`: Exit 0**. Vollständige Next.js-Produktionskompilierung einschließlich Typprüfung und 23 statischer Seiten erfolgreich.
- Die gebaute Anwendung wurde lokal gestartet; **GET `/`: HTTP 200**, 6.705 Bytes. Der Testserver wurde danach beendet.
- Beim Vergleich mit dem V729-ZIP fehlte keine Originaldatei. Das vollständige Quellprojekt wird ausgeliefert; installierte Abhängigkeiten, `.next` und TypeScript-Zwischenspeicher gehören nicht ins ZIP.

Die Protokolle liegen im Projekt unter `verification-v730/`. Vorherige V729-Dokumentation und ihre Protokolle bleiben erhalten.

## Grenzen

**Die gesamte historische `test:quick`-Kette wurde für V730 nicht erneut vollständig ausgeführt.** Insbesondere der ältere V696-Langtest war nicht Bestandteil der gezielten Prüfungen. Ein erfolgreiches reguläres `npm run build` einschließlich seiner vollständigen `prebuild`-Kette wird daher nicht behauptet. Der oben genannte Build mit `--ignore-scripts` überspringt diese Vorprüfungen, nicht die Typprüfung innerhalb von Next.js.

Es gab keinen visuellen Browser-, Touch-Geräte- oder echten Spotify-/Last.fm-Livetest. React-Interaktionen verwenden React Test Renderer; dessen Deprecation-Warnung ist im Testprotokoll sichtbar. Bestehende Autoprefixer-/Webpack-Cache-Warnungen blieben beim erfolgreichen Build erhalten.

Favoriten sind lokal pro Last.fm-Konto gespeichert und nicht Bestandteil des bisherigen History-JSON-Backups. Ein Browser-Speicherfehler wird angezeigt; Änderungen gelten dann nur für die laufende Sitzung. CSV ist ein Statistikexport, kein vollständiges Archiv-Backup. Die Spotify-Verknüpfung bleibt eine Suche.

## Änderungen an bestehenden Tests

Historische Tests mit auf V729 begrenzten Versionsmustern verwenden jetzt die vorhandene monotone Versionsprüfung `assertProjectVersionAtLeast`. Damit bleiben ihre fachlichen Erwartungen für spätere Versionen unverändert gültig. Der V729-Renderingtest lädt zusätzlich die neue verschachtelte Oberfläche über einen gemeinsamen TypeScript-Modullader. Keine fachlichen Test-Erwartungen wurden entfernt.

## Erneut ausführen

Nach dem Entpacken `npm ci`, dann `npm run test:v730`, `npm run test:v730:types`, `npm run test:v730:ui-types`, `npm run typecheck`. `npm run build` führt die vollständige bestehende Vorprüfung einschließlich des älteren Langtests aus. Für den separat geprüften Next.js-Build lautet der Befehl `npm --ignore-scripts run build`.
