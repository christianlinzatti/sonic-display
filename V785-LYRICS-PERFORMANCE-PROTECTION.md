# Sonic Display V785 – Lyrics Performance Protection

## Umfang

V785 erweitert **nur** die lokale V777-GLB-Konzert-Benchmark-Fixture. Die produktive Live-Lyrics-Darstellung, die Kamera, die Spotify-Integration und die Konfiguration des Nutzers bleiben unverändert.

- `lyricsV785=off`: bisherige 3D-Lyrics der Fixture (feste Bühnenposition, minimaler vertikaler Bob).
- `lyricsV785=on`: 3D-Drei-Lyrics werden kamerabezogen in einem unteren NDC-Sicherheitsbereich positioniert und zum Kamerablick ausgerichtet. Mehrere NDC-Anker werden anhand von **geschätzten Darstellerpositionen** ausgewählt; Wechsel werden geglättet. Die echte Textgeometrie bleibt 3D.
- Während des Renderns werden die Bounding-Boxen der tatsächlichen Drei-Textobjekte in den normierten Bildausschnitt projiziert. Gemessen werden Anteil außerhalb des sicheren Bildbereichs, Überdeckung mit Darsteller-**Proxies**, Verzögerung beim Zeilenwechsel und große Positionssprünge.
- Der Browserbericht enthält außerdem FPS und P95-Bildzeit aus der realen GPU-/WebGL-Fixture.
- Ein **Proxy ist keine tatsächliche Gesichtserkennung**. Gesichtssichtbarkeit und ästhetische Komposition erfordern eine visuelle Prüfung. Hier werden außerdem synthetische Lyrics und vorgegebene Kamera-/Audio-Cues verwendet, keine echten Spotify-Lyrics. Es werden weder Wortzeitpunkte noch echte Singer-Zuordnung gemessen.

## Messung mit eigenen GLBs

Die Datei muss unter `public/benchmark/mein-avatar.glb` liegen. Sie benötigt ein SkinnedMesh, mindestens einen Animationsclip und ein benanntes Mouth-/Jaw-/Viseme-Morph-Target. Bei zwei unterschiedlichen Figuren optional `--glb2=/benchmark/zweites-modell.glb` verwenden.

```bash
npm ci
npm run typecheck
npm run build
npm run start
```

In einem zweiten Terminal:

```bash
npm run benchmark:v785:lyrics -- --url=http://127.0.0.1:3000 --glb=/benchmark/mein-avatar.glb
```

V785 führt vier Durchläufe mit `lyricsV785=off,on,on,off` durch und fixiert dabei `profileV779=balanced`, `cameraV784=on`, zwei Messpasses, 60 Aufwärm- und 240 Messframes. Jede der drei Bühnen Cyberpunk, Rock und Galaxy wird mit zwei und vier GLBs getestet. Das heißt **6 Szenen je Browserlauf**, 24 Browser-/Szenenpaare über vier Läufe (jeweils zwei Messpasses).

Berichte:

- `artifacts/v785/runs.json` – vollständige Browsernachweise.
- `artifacts/v785/lyrics-review.json` – validierter Vergleich; `status=blocked` bei unzureichendem Material.
- `artifacts/v785/lyrics-review.md` – lesbarer Ergebnisbericht.
- `artifacts/v785/run-*-*.json` – vier einzelne Browserberichte.

Die Ergebnisdatei lässt sich ohne Upload unter `/diagnostics/lyrics-protection` im lokalen Dashboard öffnen. Bestehende Messungen erneut auswerten:

```bash
npm run benchmark:v785:lyrics -- --assess-only --input=artifacts/v785/runs.json
```

## Strenge Nachweisprüfung

Eine **Vergleichsauswertung** wird ausschließlich bei vier vollständig erfolgreichen Browserläufen, gleicher GLB-SHA-256-Signatur, identischem Browser/Renderer/DPR, gleicher Testkonfiguration, jeweils sechs vollständigen FPS-Szenen, zwölf vollständigen projizierten Lyrics-Szenen pro Lauf und ohne Software-Renderer zugelassen. Starke FPS-/P95-Verschlechterungen sowie clipping/verspätete Zeilen und mehr Proxy-Überschneidungen erscheinen als Warnungen. **Ein grüner Testlauf ist keine automatische visuelle Qualitätsfreigabe.**

## Verifikation

```bash
npm run test:v785
npm run test:v785:types
npm run verify:v785:static
npm run typecheck
npm run build
```

`verify:v785:static` enthält auch die umfangreiche historische Regression (kann viel Laufzeit benötigen). Die isolierte Typprüfung wird ohne Drittanbieter-Abhängigkeiten durchgeführt. Ein echter produktiver TypeScript-/Next.js-Build setzt `npm ci` voraus. Echte FPS-/GPU-/Bildnachweise können ausschließlich mit einem laufenden Next.js-Server und einem Chromium-WebGL-Browser erstellt werden.
