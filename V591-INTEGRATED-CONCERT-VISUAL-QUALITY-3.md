# V591 — Integrated Concert Visual Quality 3.0

**Basis:** Sonic Display V590 · **Stand:** 26.10.2026.

## Implementiert

- Eine **unabhängige lokale Multi-GLB-Konzert-Review-Szene** unter `/benchmark/v591`. Sie rendert **zwei bis vier echte lokale GLB-Dateien**, skinnte Meshes und je einen bereits eingebetteten kompatiblen `AnimationClip` mit `THREE.AnimationMixer`. Du kannst dasselbe echte GLB mehrmals in unterschiedlichen Slots verwenden. Die exakten Cues setzen eine Clip-Zeit durch `mixer.setTime(cue.at % clip.duration)`; es werden keine synthetischen Avatar-Clips erzeugt. Anders als V590 zeigt der neue Screenshot **den gesamten Bühnenbereich**, nicht nur WebGL: 3D-Avatare, einfachen LED-/Gobo-Bühnenhintergrund, Licht-Cues, Kamera-Perspektiven und eine wirklich im Browser gerenderte Lyrics-DOM-Ebene.
- Ein **deterministisches Konzert-Storyboard** kennt bis zu 16 explizite Cues (`id`, `at`, `line`, `focus`, `camera`: `wide|lead|duet`, `fx`: `calm|gobo|led|hook`). Es gibt fünf klar mit **DEMO** gekennzeichnete Standard-Cues. Alternativ kann eine JSON-Datei im Projekt unter `public/` bereitgestellt werden. Die JSON-Datei ist eine vom Nutzer **selbst autorisierte Abfolge**, keine angebliche Spotify-/Genius-Sänger- oder Zeitstempel-Erkennung. Ein Beispiel: `public/benchmark/v591-cues-example.json`.
- `scripts/v591-integrated-concert-visual-benchmark.cjs` öffnet Chromium per CDP an einem **lokalen Loopback-Webserver**. Es verlangt pro Avatar ein sichtbares GLB-Mesh und einen eingebetteten Clip, prüft jede gesetzte Pose auf tatsächliches Rendern, wartet auf zwei echte Browser-Compositor-Frames und speichert pro Cue ein PNG. Die Report-Auswertung ergänzt Browser-`requestAnimationFrame`-Zeiten (p95, p99, lange Frames), Pixeländerungen *zwischen Cues*, Draw Calls, Tris, mögliche Clip-Projektionsfehler und **geschätzte** Überschneidungen mit dem unteren Textbereich. `report.html` ist eine lokale Sichtprüf-Galerie, `report.json` enthält alle Einzelwerte.
- **Kein erfundener Qualitätsnachweis:** Ohne lokale GLBs, kompatible Animationen, Chromium oder laufendes Next.js entsteht `status: blocked` mit Fehler in `report.json`; es wird kein HTML- oder PNG-Erfolg erzeugt. Ein tatsächlicher Chromium-Lauf endet mit `measured-needs-human-review`, **niemals** automatisch mit „visuell bestanden“. Es gibt keinen Eingriff in die normale Spotify-Seite, gespeicherte Choreografie, Lip-Sync-, Animation-Library-, GLB-/IK- oder Performance-Einstellungen.

## Installation und lokaler Browser-Test

Im Projekt mit installierten Dependencies `npm run typecheck` und `npm run build` prüfen. Anschließend `npm run dev -- --hostname 127.0.0.1` starten. Für zwei eigene, bereits vorhandene GLBs oder zwei Kopien desselben echten Modells unter `public/benchmark/performer-a.glb` und `public/benchmark/performer-b.glb`:

```bash
npm run benchmark:v591:concert -- --models=/benchmark/performer-a.glb,/benchmark/performer-b.glb --clips=0,0 --seconds=15
```

Eigene, vorher manuell erstellte Song-/Lyrics-Zeitpunkte **ohne angebliche automatische Sprechererkennung**:

```bash
npm run benchmark:v591:concert -- --models=/benchmark/performer-a.glb,/benchmark/performer-b.glb --clips=0,0 --script=/benchmark/v591-cues-example.json --headed --seconds=30
```

Weitere Optionen: `--url=http://127.0.0.1:3000`, `--chromium=<lokaler Chrome/Chromium-Pfad>`, `--out=artifacts/v591/concert`. Ohne `--headed` läuft Chromium headless als **Diagnostik**, auf einem Raspberry Pi ist die sichtbare Sitzung vorzuziehen. Das HTML-Prüfblatt und alle PNGs liegen ausschließlich nach **tatsächlich erfolgreichen** Captures unter `artifacts/v591/concert/`.

Die interaktive Seite ist unter `/benchmark/v591?models=%2Fbenchmark%2Fperformer-a.glb%2C%2Fbenchmark%2Fperformer-b.glb&clips=0%2C0` erreichbar und bietet einen Cue-Selektor. Die Beispieldaten aus `v591-cues-example.json` sind ausdrücklich kein realer Songtext. Der Benchmark startet in einem temporären Chromium-Profil. Die normalen Avatar-Bibliothek-/Retargeting-Einstellungen sind darin nicht automatisch vorhanden. Für separate Motion-GLBs weiterhin V590 oder den GLB-Vorschaueditor verwenden; V591 setzt einen bereits **im jeweiligen Modell eingebetteten** Clip voraus.

## Grenzen gegenüber einer echten End-to-End-Show

V591 ist ein **echter Browser-Multi-GLB-Rendering-Test** einer **eigenständigen, reduzierten Konzert-Szene**. Es ist **kein** Screenshot der normalen `VisualizerStage`, keine Spotify-Web-API-Verbindung und keine Probe mit tatsächlicher Song-Audioquelle, Künstlerzuordnung, V585-Kameradirektor oder V555-Produktionsshadern. Die Testszene verwendet sichere vereinfachte LED-/Gobo-/Kameracues, damit der Browser-Test reproduzierbar ist. Der Test verifiziert nicht automatisch Gesichtsrig, Sänger-Lip-Sync, Fußkontakt, Audio-Korrelation oder choreografische Qualität. Zwei GLBs mit denselben Meshes sind zwei dargestellte Performer, nicht zwingend zwei unabhängige Artist-Rigs.

Die Lyrics-Überlagerung wird anhand projizierter **gesamter Avatar-Bounds** und eines vereinfachten unteren Textbereichs geschätzt, nicht per genauer Pixel-Segmentierung oder Körperteil-Rig. Ein Warnhinweis ist ein Grund zur manuellen Prüfung, ein fehlender Warnhinweis keine Freigabe. Framezeiten sind **rAF-Intervalle**, nicht GPU-Timing oder Temperaturen. `headless` belegt keine flüssige Darstellung auf einem physischen 10-Zoll-Display. Ein echter Raspberry-Pi-Check und das V580-Hardware-Benchmarking bleiben separat notwendig.

## Tests

```bash
npm run test:v591
npm run test:v591:types
npm run test:smoke:v591
npm run verify:v591
npm run check:syntax
```

V591 hat neue deterministische Eingabe-/Schema-/Pfad-/Kompositions-/CDP-/HTML-Regressionen. V590 wurde nicht verändert. Näheres zu tatsächlichen Prüfläufen und noch offenen Schritten: `V591-VERIFICATION.md`.
