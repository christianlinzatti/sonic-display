# V784 – Cinematic Camera Smoothness (lokaler GLB-Vergleich)

## Umfang

Aufbauend auf V783 wurde die V777-Konzert-Fixture um die optionale Kameratimeline `cameraV784=off|on` erweitert. Im normalen Konzertmodus und in allen älteren Benchmarkvarianten **ohne** diesen Parameter wird die bisherige Kamerasteuerung nicht verändert. Der produktive Live Camera Director ist noch nicht umgestellt.

Der neue Test steuert echte Three.js-Kamera-Transformationen über eine deterministische 240-Frame-Timeline: Totale, Lead-Nahaufnahme, Antwort-Nahaufnahme, seitliche Ensembleperspektive, lyricsfreundliche Totale und Abschlussfahrt. `off` springt direkt zur jeweiligen Kamerapose, `on` glättet Position, Blickziel und Sichtfeld (FOV) durch eine framebasierte Annäherung. Beim Wechsel von Szene/Avatarzahl/Pass werden die Übergangszustände zurückgesetzt. Die Bewegung ist bewusst kein vollständiger Liveregie-Algorithmus.

## Messungen

Für jede der sechs Szenen (Cyberpunk/Rock/Galaxy × 2/4 GLBs) werden echte Kameraposition, Kamera-Quaternion, FOV, projizierte Lyrics-Mitte und sichtbare Darsteller-Mittelpunkte aus dem WebGL-Canvas direkt nach der Aktualisierung gespeichert. Daraus entstehen:

- P95-Positions- und Rotationsschritt pro Frame
- P95 der Änderungen aufeinanderfolgender Schritte (Positions- und Rotations-Jerk-Indikatoren)
- Anzahl harter Kamerasprünge (positions- oder rotationsbasiert)
- Anteil von Frames, in denen der Lyrics-Mittelpunkt den definierten Safe-Bereich verlässt
- Minimalwert der sichtbaren Darsteller-Mittelpunkte
- FPS/P95-Framezeit aus dem gleichzeitig gemessenen WebGL-Renderbericht

**Grenzen:** Die Zentren-Projektion ist keine Prüfung auf textliche Lesbarkeit, Verdeckungen oder ästhetisch schöne Bildkomposition. Jerk ist eine abgeleitete Bewegungsheuristik, keine echte menschliche Bewertung. Die synthetische Timeline ersetzt keine echten Spotify-/Live-Track-Cues.

## Browserlauf

Abhängigkeiten installieren und einen Produktionsserver starten:

```bash
npm ci
npm run typecheck
npm run build
npm run start
```

Danach in einem zweiten Terminal:

```bash
npm run benchmark:v784:camera -- --url=http://127.0.0.1:3000 --glb=/benchmark/mein-avatar.glb
```

Das GLB muss vorher unter `public/benchmark/mein-avatar.glb` liegen und wie bei V777 Animation, Skinning und Mouth-Morph enthalten. Optional kann `--glb2=/benchmark/zweiter-avatar.glb` angegeben werden. Für eine funktionsfähige, nicht repräsentative Testfigur `--glb` weglassen.

Das Skript führt vier gegenläufige Messläufe `off → on → on → off` aus, jeweils **2 Messpässe × 6 Bühnen-/Avatar-Szenen × 240 Frames** nach einer Aufwärmphase von 60 Frames. Dateien in `artifacts/v784/`: `run-1-off.json` bis `run-4-off.json`, `runs.json`, `camera-review.json`, `camera-review.md`.

Offline-Auswertung vorhandener Dateien:

```bash
npm run benchmark:v784:camera -- --assess-only --input=artifacts/v784/runs.json
```

Lokale Diagnoseansicht: `/diagnostics/camera-smoothness` → `runs.json` auswählen. Die Datei bleibt im Browser und wird nicht hochgeladen.

Die Prüfroutine lehnt unvollständige, blockierte oder nicht vergleichbare Messreihen ab: falsche Kamerakennung, fehlende Szenen/Pässe, unterschiedliche GLB-SHA-256-Hashes, Browser/GPU/Viewport, Messparameter oder Software-Rendering. Sie gibt keine automatische Freigabe für die Live-Konzertkamera oder eine Hardwareentscheidung.

## Qualität und technische Grenzen

Regressionstest: `npm run test:v784`.
Isolierter Kern-TypeScript-Check: `npm run test:v784:types`.
Vollständige Projektprüfung auf einem Rechner mit installierten Abhängigkeiten: `npm run typecheck && npm run build`.

Ein echter Browserlauf mit den produktiven GLBs und einem laufenden Server ist für eine tatsächliche Performance-/Bildqualitätsaussage notwendig. Wenn kein Server erreichbar ist, erzeugt der Runner einen ausdrücklich als `blocked` gekennzeichneten Bericht und **keine erfundenen FPS-/Kamerawerte**.
