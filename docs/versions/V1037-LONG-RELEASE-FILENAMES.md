# V1037 – Lange Release-ZIP-Dateinamen

## Hintergrund

Der GitHub Actions Workflow `.github/workflows/project-archive-import.yml` wurde
bereits durch `releases/SonicDisplay-V*.zip` ausgelöst. Die Python-Prüfung
akzeptierte aber bisher nur `SonicDisplay-V<nummer>.zip` ohne beschreibenden
Namenszusatz. Beispielsweise wurde
`SonicDisplay-V1037-Arena-Transformation-2.zip` deshalb nicht ausgewählt.

## Änderung

* `scripts/project-archive-import.py`: optionaler sicherer Zusatz nach `VNNN-`.
* `checked_name()` prüft unverändert die Version und erlaubt höchstens 255 UTF-8-
  Byte für einen Dateinamen. Der angeforderte Name muss direkt in `releases/`
  liegen. Verzeichnis-Traversal, Zeilenumbrüche, Shell-Metazeichen und verschachtelte
  Verzeichnisse werden abgewiesen.
* `select_archive()` verwendet denselben Validator wie der manuelle Aufruf;
  dadurch werden keine verschachtelten Unterordner oder ungültige Dateien
  versehentlich als Release ausgewählt.
* Der ZIP-Inhalt, CRC-Prüfung, Anzahl- und Größenlimits, Paket-Version,
  Rollback-Schutz und geschützte CI-Dateien bleiben unverändert abgesichert.
* `tests/test_project_archive_import.py` prüft alte und beschreibende Namen,
  255-Byte-Grenze, realen Import, Versionsmismatch, Auswahllogik und unsichere
  Pfade/Namen.

## Verwendung

Eine einzelne Datei `SonicDisplay-V1037-Arena-Transformation-2-Long-Filename-Support.zip`
nach `releases/` auf `master` laden. Der vorhandene Workflow kann sie anhand des
Dateinamens auswählen. Wenn der `master`-Stand mindestens V1037 enthält,
verhindert der Rollback-Schutz den Import einer älteren Versionsnummer.

Der geschützte `scripts/project-archive-import.py` und seine Tests werden
absichtlich nicht aus einem hochgeladenen Projektarchiv überschrieben. Diese
Änderungen wurden deshalb separat direkt im GitHub-Repository aktualisiert;
ein ZIP-Upload allein könnte den Fehler nicht reparieren.

Automatische GitHub-CI-Tests und ein vollständiger Next.js-Produktionsbuild sind
separat zu verifizieren. GitHub begrenzt außerdem die Größe einzelner
Repository-Dateien; längere Dateinamen vergrößern kein Upload-Limit.
