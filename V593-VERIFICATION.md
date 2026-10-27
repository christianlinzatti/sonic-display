# V593 – Prüfbericht (26.10.2026)

## Implementierungsstatus

Die bestehende `scripts/v592-live-stage-benchmark.cjs`-Pipeline auf der **echten** Spotify-`VisualizerStage` schreibt nach erfolgreicher Messung pro Screenshot neben den bisherigen Werten jetzt GLB-Actor-Bounds, `stageRect` und `lyricRect`. Die neuen CommonJS-Module `scripts/v593-concert-quality-advisor.cjs`, `scripts/v593-concert-quality-cli.cjs` und `scripts/v593-concert-quality-report.cjs` erstellen `advice-v593.json` und `report-v593.html`, inklusive belegter, vorsichtiger Empfehlungen (Avatar-Framing, Formation, Lyrics-Überlappung/Sync, Browser-rAF und optionale VFX, Geometry-Overdraw, Bildabdeckung).

`autoApplied:false` und `humanReviewRequired:true` sind unveränderliche Ausgabegrundsätze. Die Anwenderoberfläche und gespeicherte Show-Konfiguration bleiben unverändert. Ohne tatsächlichen, gültigen V592-Messstatus werden keine Vorschläge/HTML erstellt. Bestehende V590/V591-Benchmarks funktionieren weiterhin.

## Tatsächlich bestandene lokale Tests

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v593` | **PASS** – 23 neue Testgruppen (gute/fehlende Evidenz, Wiederholungen, Sicherheit, DOM-Lyrics, Formation, Frames, XSS, blocked-CLI, relative Screenshot-Pfade) |
| `npm run test:v593:types` | **PASS** – isolierter V592-TypeScript-Kern; V593-Skripte sind CommonJS, keine zusätzliche TS-Laufzeitoberfläche |
| `npm run test:smoke:v593` | **PASS** – beinhaltet V592 (10 Gruppen), V591 (10 Gruppen, 15.000 Szenarien), V590 (14 Gruppen, 15.000 Szenarien), Architektur |
| `npm run verify:v593` | **PASS** – zusätzlich V589 (25 Gruppen, 10.000 Proben), V588 (16 Gruppen, 20.000 Proben), V580 (79 Checks + 12.000 Proben), V572 (69 Regressionen + 16.000 Wortproben), Syntax |
| `npm run check:syntax` | **PASS** – 820 TypeScript-/TSX-Dateien auf Syntax und Importbindungen geprüft |
| `npm run check:architecture` | **PASS** – 409 überprüfte Quellcode-Referenzen, Dokumentationsstand V593 |

Die 23. Regression wurde nach der vollständigen Verifikation ergänzt und mit `npm run test:v593` erneut erfolgreich ausgeführt. Die übrigen Verifikationsschritte blieben unverändert.

## Nicht in dieser Umgebung ausgeführt

- **Kein vollständiger Next.js-Produktionsbuild**: `node_modules` und das lokale `next`-Binary waren nicht installiert.
- **Kein tatsächlicher V592-/V593-Browser-GLB-Messlauf** mit angemeldeter Spotify-Sitzung und laufenden echten GLB-Avataren. Die Offline-Fixtures sind Testdaten und kein Nachweis realer visueller Probleme oder besserer FPS.
- **Keine Raspberry-Pi-Hardwaremessung** und keine manuelle visuelle/künstlerische Freigabe.

Der Browser-rAF-Wert ist kein GPU-/Thermik-Benchmark. Bei fehlendem Text-Rechteck oder großen transparenten Lyrics-Hintergründen werden Überschneidungen nicht behauptet. Die empfohlenen Kamerafaktoren 1,08/0,94 und optionale VFX-Reduktion um 15 % sind **nur Startwerte für manuell kontrollierte Wiederholungsmessungen**, keine bestätigten Verbesserungen und werden **nicht automatisch angewandt**.

## Lokaler Anschluss-Test

```bash
npm install
npm run dev -- --hostname 127.0.0.1
# In separater Shell nach lokalem Chromium-/Spotify-/GLB-Setup aus V592:
npm run benchmark:v592:live -- --debug-port=9222 --seconds=15 --min-glb=1
# Optional alte gemessene Berichte erneut auswerten:
npm run benchmark:v593:advise -- --report=artifacts/v592/live/report.json
```

Bei Erfolg die neue Datei `artifacts/v592/live/report-v593.html` öffnen, Empfehlungen im echten Renderer manuell gegenprüfen, passende Änderungen bewusst in den vorhandenen Einstellungen vornehmen und den Benchmark erneut ausführen.
