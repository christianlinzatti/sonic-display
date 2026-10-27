# V595 – Automated Live Concert Visual Regression 2.0

## Ziel

V595 erweitert V594 um einen konservativen **visuellen Regressionstest der echten V592-VisualizerStage**. Er setzt eine bereits laufende Spotify-Wiedergabe mit tatsächlichen GLB-Avataren voraus und erfindet weder Tracks, Lyrics noch Szenen. Nur die neue Auswertung und Berichtserzeugung laufen offline. Die bestehende produktive Show bleibt unverändert.

## Aufnahme und Vergleich

1. Sonic Display lokal starten, Spotify verbinden und echte GLB-Performer anzeigen. Ein eigener Chromium-Debug-Browser wird wie in `V592-LIVE-CONCERT-STAGE-QUALITY-VALIDATION-4.md` beschrieben benötigt.
2. **Denselben Track und dieselben Songabschnitte** vor und nach einer bewussten Änderung in **unterschiedliche** Verzeichnisse aufnehmen (niemals denselben `--out`-Pfad verwenden):

```bash
npm run benchmark:v592:live -- --debug-port=9222 --seconds=20 --min-glb=2 --out=artifacts/v595/baseline
# Manuelle Änderung testen, danach zur gleichen Spotify-Songstelle zurückkehren
npm run benchmark:v592:live -- --debug-port=9222 --seconds=20 --min-glb=2 --out=artifacts/v595/candidate
npm run benchmark:v595:regress -- --baseline=artifacts/v595/baseline/report.json --candidate=artifacts/v595/candidate/report.json --out=artifacts/v595/review
```

3. `artifacts/v595/review/report-v595.html` öffnen und **selbst** die Original- und Folgebilder vergleichen. Für jede Szene steht im Bericht, ob sie tatsächlich aufgenommen wurde, ob eine neue geometrische Warnung erschien und wie viele Pixel außerhalb beweglicher Bildbereiche voneinander abweichen.
4. Separate Runs für Solo-, Duett-, Hook- und Drop-Passagen aufnehmen, falls sie nicht alle in der Zeitspanne liegen. **Nicht beobachtet** bedeutet **nicht getestet**, keinesfalls bestanden. Ein 20-Sekunden-Lauf deckt nicht zwingend alle vier Kategorien ab.

### Optional: explizit geprüfte Szenenlabels

Sind vom aktuellen Stage-Director keine eindeutigen Solo-/Duett-/Hook-/Drop-Labels dokumentiert, kannst du **manuell** einen Marker für die gewünschte Songstelle anlegen. V595 unterscheidet im Ergebnis die Quellen `two-confirmed-stage-cues` und `manual-review-annotation`:

```json
{
  "checkpoints": [
    {"kind": "solo", "progressMs": 43000},
    {"kind": "duet", "progressMs": 46500},
    {"kind": "hook", "progressMs": 49800},
    {"kind": "drop", "progressMs": 53000}
  ]
}
```

`progressMs` ist **die tatsächliche Spotify-Songposition**, nicht die seit Start des Browserbenchmarks vergangene Laufzeit. Marker gelten nur innerhalb ±900 ms von **beiden** erfassten Bildern, maximal 16 pro Vergleich; widersprüchliche Marker blockieren den Bericht.

```bash
npm run benchmark:v595:regress -- --baseline=artifacts/v595/baseline/report.json --candidate=artifacts/v595/candidate/report.json --marks=artifacts/v595/marks.json --out=artifacts/v595/review
```

## Schutz der Bildqualität

- V594 muss den Vergleich als tatsächlich **vergleichbar** akzeptieren: identischer Track, Chromium/WebGL, Auflösung, aktiver GLB-Count und Browsermodus. V595 akzeptiert nur zeitlich ausgerichtete Bilder mit maximal ±1,2 Sekunden Unterschied und mindestens zwei zuverlässige Bildpaare.
- Der PNG-Test maskiert die **Vereinigung** der real projizierten Avatar-Rechtecke aus Basis- und Folgebild sowie den relevanten kleinen Lyrics-Bereich, jeweils mit konservativem Abstand. Große unbekannte DOM-Overlays gelten als nicht zuverlässig maskierbar. Bei weniger als 22 % verwertbarer unmaskierter Bildfläche erfolgt keine Pixelbewertung.
- Ein anderer Hintergrund, ein Gobo-/LED-/Nebelwechsel oder eine Kamerafahrt kann außerhalb der Masken echte Pixeländerungen erzeugen. Hohe Bildänderung ist deshalb nur eine **manuelle Prüffrage**, kein automatischer Defekt.
- Wiederholt neue Hinweise zu abgeschnittenen GLBs, fehlenden Lyrics-Sync-Belegen, Textüberlagerungen oder ungewöhnlich leerem Bild werden hervorgehoben. Ein einzelner auffälliger Frame gilt nicht als gesicherter Regressionserfolg oder -fehler.
- Der Bericht hat immer `status: review-required`, `approved: false`; nicht getestete oder fehlende Szenen werden **niemals als pass** bewertet. Der JSON-Bericht speichert keine Klartext-Spotify-Track-ID.
- Diese Prüfungen messen Browser-rAF aus V592, **keine** Pi-Hardwareleistung oder eigentliche GPU-Zeit. Es gibt keine Änderungen an GLBs, IK, Lip-Sync, Spotify, Benutzerprofilen oder Bühnenkameras.

## Dateien und wiederholbare Tests

- `scripts/v595-visual-regression.cjs`: Song-Zeit-Gates, Szenenklassifikation, animierte Bereiche maskieren, wiederholte Warnungen.
- `scripts/v595-visual-regression-cli.cjs`: liest zwei gemessene lokale V592-Berichte und echte PNGs, schreibt `report-v595.json` und `report-v595.html`.
- `scripts/v595-visual-regression-report.cjs`: XSS-geschützter Bericht, relative Links auf Original-PNGs.
- `scripts/v592-live-stage-benchmark.cjs`: archiviert zusätzliche vorhandene Stage-Labels pro Foto (`sceneEvidence`), rückwärtskompatibel.
- `tests/v595-automated-live-visual-regression.cjs`: neue Offline-Testfälle, einschließlich Test-PNGs (KEINE echte Spotify-/GLB-Browseraufnahme).

```bash
npm run test:v595
npm run test:v595:types
npm run test:smoke:v595
npm run verify:v595
```
