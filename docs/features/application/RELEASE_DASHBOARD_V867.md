# V867 – Release-Dashboard und Fehlerdiagnose (Windows + Linux)

## Nutzung auf Windows 11

```powershell
npm ci
npm run test:v867
npm run verify:production:v867
```

Der letzte Befehl ruft das bisherige **unveränderte** V831-Production-Gate auf
und führt dessen vollständige Release-Regressionskette, TypeScript-Check und
Next.js-Produktionsbuild aus. Kein Test wird übersprungen. Die Ausgabe des
Originalprozesses bleibt im Terminal sichtbar. Im Projektverzeichnis entstehen
`v867-release-dashboard.html` (zum Öffnen im Browser) und
`v867-release-dashboard.json` (maschinenlesbar).

Ein fehlender Gate-Report, fehlende Dependencies oder ein fehlgeschlagener
Teilschritt führen zum technischen Status `blocked`. Eine vorherige grüne Datei
kann keinen neuen Lauf grün färben. Die HTML-Datei enthält keine aktiven
Scripts, lädt keine externen Ressourcen und wird unabhängig von Next.js erzeugt.

### Bereits vorhandenen V831-Report anzeigen

```powershell
npm run dashboard:release:v867
```

Achtung: Dieser Modus **prüft nicht erneut**, sondern zeigt ausschließlich
bereits gespeicherte Ergebnisse an. Für aktuelle Resultate stattdessen
`npm run verify:production:v867` verwenden.

## GitHub Actions

Der Workflow `V832 Continuous Technical Validation` prüft weiterhin
Ubuntu 24.04 und `windows-latest`. Beide OS-Jobs veröffentlichen ihre
V831-Reports und V867-HTML/JSON-Dashboards, auch bei Fehlschlägen.
Ein abschließender Job `V867 Windows + Linux release overview` lädt beide
OS-Berichte und schreibt eine gemeinsame `v867-release-matrix.html`.
Fehlende OS-Berichte, unvollständige Prüfungen oder gemeldete Fehler
blockieren das Gesamtergebnis. Alle Dateien liegen in den Artifacts des
jeweiligen GitHub-Actions-Laufs.

## Diagnosekategorien

- `REACT_TYPES`: fehlende React-Hooks, R3F-JSX-Elemente, Stub-Kollisionen.
- `WINDOWS_EOL`: nicht normalisierte Windows-/Unix-Zeilenumbrüche.
- `WINDOWS_PROCESS`: Windows-CMD-/Prozess- oder Pfadlängenprobleme.
- `MODULE_CASE`: unterschiedlich großgeschriebene bzw. doppelte Moduldateien.
- `TYPESCRIPT`: sonstige TS-Fehler.
- `ASSERTION`: fehlgeschlagene funktionale Regression.
- `DEPENDENCIES`: nicht verfügbare oder unvollständige Dependencies.
- `NEXT_BUILD`: ein sonst nicht spezifisch klassifizierter Produktionsbuild-Fehler.
- `TIMEOUT`: Zeitüberschreitung oder abgebrochener Prozess.
- `UNKNOWN`: keine verlässlich erkennbare Fehlerkategorie.

Die Diagnose ist eine *Heuristik*, nicht die verifizierte Ursache. Der erste
konkrete Fehler im GitHub-Actions-Protokoll ist für die Fehlerbehebung
maßgeblich. Reports verwenden kurze, HTML-escaped und an typischen Stellen
redigierte Textauszüge; sensible Rohlogs bitte nicht in öffentliche Artefakte
hochladen.

## Sicherheitsgrenze

`technical-gates-passed` heißt lediglich, dass die drei technischen Gate-
Stufen tatsächlich erfolgreich waren. `productionReleased` bleibt **false**:
Neun reale Konzerte, manuelle Lyrics-/Lip-Sync-/Kamera- und GPU-/Browser-Tests
bleiben offen. Der Dashboard-Generator kann weder eine Freigabe erzwingen
noch reale Hardwaretests simulieren.
