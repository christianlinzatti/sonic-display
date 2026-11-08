# V1104 · Playwright Visual QA & Screenshot Reports

**Sonic Display 0.1.0-v1104** – aufbauend auf dem vollständigen V1103-Projekt.

## Neu

- **Screenshots auch für erfolgreiche UI-Tests:** gemeinsamer Playwright-Fixture-Hook hängt echte, komprimierte JPEG-Aufnahmen an jeden Test mit tatsächlich besuchter App-URL; Fehler-Screenshots und Traces bleiben erhalten.
- **Offline-Screenshot-Galerie:** `reports/playwright-production/visual-gallery/index.html` zeigt Bildvorschauen, Szenarien, Browserprojekt und Ergebnis. HTML-, JSON- und JUnit-XML-Berichte stehen zur Verfügung.
- **Sieben neue Browser-Tests pro Browserprojekt:** Visualizer-Persistenz, 360°-Arena, Govee ohne Geräte, Such-/Audio-Settings, Acceptance-Formular, responsive Ansicht und Spotify-Login-Link ohne OAuth.
- **Produktions-Gate:** eine Freigabe verlangt mindestens zwei echte Screenshots und mindestens eine Aufnahme für Chromium Desktop und Chromium Touch. Fehlende Bildnachweise erzeugen keinen falschen PASS.
- **Sicherheitsprüfung der Galerie:** nur Bilddateien aus dem jeweiligen Test-Ordner; Pfad-Traversal/Symlinks/HTML-Einschleusungen werden abgefangen.
- **GitHub-Bericht:** Der Job-Zusammenfassung enthält Anzahl der Bilder und den Pfad zum herunterladbaren Artefakt. Der vorhandene Upload (`reports/playwright-production/`) umfasst Galerie, HTML, JSON, Trace und Screenshots auch bei Fehlschlägen.

## Lokal prüfen

```bash
npm ci
npm run test:v1104
npm run test:v1104:types
npm run test:v1005
npm run check:syntax
npm run check:architecture
```

Für einen echten Browser-Nachweis sind Node 24, ein frischer Next.js-Produktionsbuild, Chromium und die vollständige E2E-Suite erforderlich. Die Bildgalerie wird erst beim tatsächlichen Playwright-Lauf erzeugt; es werden keine Platzhalter-Screenshots in das Quell-ZIP gepackt.

Die GitHub-Upload-Artefakte enthalten `playwright-production/visual-gallery/index.html` (Bildübersicht) und `playwright-production/html/index.html` (Playwright Details). Zum Öffnen das CI-Artefakt herunterladen und entpacken.
