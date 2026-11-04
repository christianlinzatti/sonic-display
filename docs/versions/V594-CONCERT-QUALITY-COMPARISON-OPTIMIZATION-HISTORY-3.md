# V594 – Concert Quality Comparison & Optimization History 3.0

## Was hinzugekommen ist

Der lokale Offline-Vergleich verbindet **zwei echte V592-Livebühnen-Messberichte** zu einem Vorher-/Nachher-Bericht. Er beurteilt Browser-rAF, p95-/p99-Framezeiten, Draw Calls, Dreieckszahlen und **nur heuristische** Kamera-/Lyrics-/Avatarwarnungen. Die Aufnahmen werden anhand der tatsächlichen Spotify-Songposition zeitlich ausgerichtet; originalgetreue PNG-Dateien werden nur für vergleichbare Runs auf Pixelunterschiede untersucht. Jede Schlussfolgerung benötigt manuelle Sichtprüfung. Die Analyse verändert weder Spotify noch Avatar-Animationen, Kamera, Lyrics, GLB-Assets oder gespeicherte Einstellungen.

### Aufnahme A (vor einer bewusst gewählten Änderung)

Der Original-V592-Benchmark bleibt unverändert. Es ist wichtig, **verschiedene Ausgabeordner** zu verwenden; sonst überschreibt ein zweiter Durchlauf die erste Aufnahme.

```bash
npm install
npm run dev -- --hostname 127.0.0.1
# Separater Chromium-Browser mit lokaler Spotify-Sitzung und echten GLBs, siehe V592
npm run benchmark:v592:live -- --debug-port=9222 --seconds=15 --min-glb=1 --out=artifacts/v594/runs/before
```

### Aufnahme B (nach der bewusst gewählten Änderung)

Denselben Track an möglichst denselben Songstellen, mit derselben Auflösung, demselben Browsermodus und derselben Avatarzahl aufnehmen:

```bash
npm run benchmark:v592:live -- --debug-port=9222 --seconds=15 --min-glb=1 --out=artifacts/v594/runs/after
```

### Offline vergleichen

```bash
npm run benchmark:v594:compare -- --before=artifacts/v594/runs/before/report.json --after=artifacts/v594/runs/after/report.json --out=artifacts/v594/comparison
npm run benchmark:v594:history
```

Das Ergebnis sind `artifacts/v594/comparison/comparison-v594.json`, `artifacts/v594/comparison/report-v594.html`, `artifacts/v594/history.json` sowie `artifacts/v594/history-v594.html`. Ein eigener Verlaufspfad ist mit `--history=PFAD` möglich, `--no-history` deaktiviert das Speichern. Ein zweiter Vergleich desselben Berichtspaars überschreibt nur seinen eigenen Verlaufseintrag. Maximal 100 Einträge werden verwaltet. Die Verlaufsliste speichert nur gekürzte Track-Hashes, niemals volle Track-IDs oder Authentifizierungsdaten. Auf Original-PNGs wird **verwiesen**, die Quelldateien werden nicht kopiert; sie müssen am selben Ort bleiben.

### Einordnung und Grenzen

- Ein **direkter Vergleich** benötigt denselben Track, dieselbe Bildauflösung, Chromium-/WebGL-Identität, Browsermodus, gleiche GLB-Zahl, mindestens 2,5 Sekunden Songpositions-Überlappung und mindestens zwei zeitlich ausgerichtete Aufnahmen innerhalb ±1,8 Sekunden.
- Weichen diese Merkmale ab, erscheint `limited-needs-human-review`, sämtliche technischen Änderungen bleiben `not-comparable`, und Bildpixel werden nicht als direkt vergleichbar ausgewertet.
- Unterschiedliche Tracks, gesperrte, fehlende oder gefälschte V592-Messberichte erzeugen `blocked` und **keinen** gültigen Vergleichsbericht.
- Pixeländerungen bei echten GLBs können durch Bewegung, Lyrics oder Beleuchtung entstehen: sie sind **keine automatische Qualitätswertung**.
- Weniger Kamerawarnungen bedeutet lediglich weniger Warnungen in den beobachteten Einzelbildern, nicht nachgewiesene filmische Qualität.
- Bessere Browser-rAF-Werte beweisen keine GPU-Optimierung oder Raspberry-Pi-Temperaturstabilität. Auch bei sonst gleichen Bedingungen sind Hintergrundlast und unterschiedliche musikalische Momente mögliche Störfaktoren.
- V594 passt keine Bühnenparameter automatisch an, führt keine Spotify-Seeks durch, greift nicht auf das Netzwerk zu und speichert keine Zugangsdaten.

## Dateien und Tests

- `scripts/v594-concert-quality-comparison.cjs`: strenge Vergleichbarkeit, Metrikdeltas, Heuristiken, zeitliche Paarung.
- `scripts/v594-concert-quality-cli.cjs`: zwei lokale JSON-Dateien, optionale echte PNG-Paare, HTML/JSON und lokale Vergleichshistorie.
- `scripts/v594-concert-quality-report.cjs`: statische, HTML-escaped Vorher-/Nachher- und Verlaufsansichten.
- `tests/v594-concert-quality-comparison-regression.cjs`: Echtmessungs-Guards, Sicherheitsfälle, Kamera-/Frame-/PNG-Paarung, Historie, CLI-Verhalten.

**Nicht behauptet:** echtes WebGL-Screenshot-Ergebnis, garantierte höhere FPS, visuelle Qualitätsfreigabe oder Raspberry-Pi-Hardwaremessung. Diese setzen die tatsächlichen lokalen V592-Aufnahmen voraus.
