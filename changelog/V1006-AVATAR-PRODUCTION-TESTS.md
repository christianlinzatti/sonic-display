# V1006 – Avatar- und Bedienungstests

Das vollständige ZIP `SonicDisplay-V1006.zip` unter `releases/` auf `master` hochladen.
Der vorhandene Importer startet den bereits zusammengeführten Workflow **Sonic Display ·
Production & Playwright** mit Versionsnummer und exaktem importiertem Commit.
Keine zusätzlichen Workflow-Dateien und keine Spotify-/Admin-Zugangsdaten nötig.

Die Suite umfasst 16 Testfälle jeweils auf Desktop und Touch (32 Tests):

- Bestehende Tests: Startseite/Reload, Produktions-CSS/JS und Hydration, Settings-Dialog,
  Speichern/Export, Spotify ohne Sitzung, PWA-Manifest/Icons und 404.
- Procedural-Avatar: sichtbares WebGL-Bild, Tanz starten/pausieren und Tempo ändern.
- Echter GLB: identische SHA-256 zum mitgelieferten Referenzmodell, Laden über die echte
  Avatar-Bibliothek/API, aktivierte eingebettete Animation, Scrubbing, fortschreitende
  Abspielzeit und gespeicherte Auswahl nach Neuladen. Screenshots dokumentieren das Bild.
- Avatar-Filter und Wechsel vom GLB zurück zu Procedural.
- Settings-Suche einschließlich leerer Trefferliste und Wiederherstellung; Escape, Fokus
  und Öffnen per Tastatur.
- Ungültiger JSON-Import erhält Eingaben; beschädigte lokale Daten werden gemeldet und
  erhalten; bestätigtes Löschen leert den gespeicherten Zustand.
- Manipulierte Spotify-Cookies bleiben unauthentifiziert; fremder Origin wird beim
  Admin-Endpunkt vor der Verarbeitung von Zugangsdaten zurückgewiesen.

Der vorhandene 38-KB-Referenzavatar ist ein kleines Modell mit Skin und Animation, kein
fotorealistischer Charakter. Die Tests simulieren keine App- oder API-Antworten. Sie laden
keine externen Modelle und verändern keine Konten oder Geräte.

Der Test-Runner kopiert das Modell ausschließlich während des Testlaufs nach
`public/avatars/sonic-playwright-reference.glb`. Er überschreibt dort keine vorhandene
Datei und entfernt danach nur seine unveränderte Kopie. Dies wird zusätzlich durch
`npm run test:v1006` geprüft. Das Modell gehört bereits unter `public/benchmark/` zum Projekt.

Chromium nutzt Software-WebGL, damit die Prüfungen auch auf GitHub-Runnern ohne physische
GPU laufen. Touch bedeutet Geräteemulation. Die Ergebnisse beweisen funktionales Laden,
Rendering und Bedienung, keine Echtzeit-Konzertqualität oder Hardware-FPS.

Lokal:

```sh
npm ci --include=dev
npx playwright install --with-deps chromium
npm run test:e2e:production
npx playwright show-report reports/playwright-production/html
```

`test:e2e:browser` ist nun ein Alias desselben vollständigen Test-Runner-Aufrufs, damit auch
hier der Referenzavatar sicher vorbereitet und bereinigt wird. Ein direkter Aufruf von
`playwright test` allein bereitet diese Datei nicht vor.

GitHub sichert HTML/JSON, Avatar-Screenshots, Fehler-Screenshots/Traces und die vollständigen
Produktionsnachweise in `sonic-V1006-<Betriebssystem>-production`.
