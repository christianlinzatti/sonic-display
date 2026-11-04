# V590 — Real Concert Visual Benchmark 2.0

**Ausgangsbasis:** Sonic Display V589, 26.10.2026.

## Umsetzung

Ein dedizierter lokaler Benchmark-Viewer liegt unter `/benchmark/v590` und verwendet echte GLB-Assets mit Skinned-Mesh-/AnimationMixer-Rendering in React Three Fiber. Das Modell ist ein **lokaler URL-Pfad im laufenden Next.js-Projekt**, keine neue prozedurale Figur. Eingebettete Clips sind sofort vergleichbar; optional kann ein separates Motion-GLB über den vorhandenen Humanoid-Retargeter geladen werden. Inkompatible Animationen ohne anwendbare Tracks sind keine gültigen Messquellen. Clips werden an exakt angegebenen Zeitpunkten abgetastet, die Geometrie-/Pose-Projektion wird berechnet und ausschließlich die sichtbare WebGL-Canvas-Fläche fotografiert.

Der lokale Node-Runner `scripts/v590-real-concert-visual-benchmark.cjs` benutzt Chromiums DevTools-Schnittstelle ohne Puppeteer/Playwright-Paket. Er prüft, ob wirklich ein GLB mit sichtbarem Mesh, passenden Animationsclips und WebGL-Canvas bereitsteht, und speichert `original-...png`/`following-...png` zu den gleichen Zeitmarken. Der native PNG-Decoder liest Chromiums 8-bit RGB- und RGBA-Ausgaben einschließlich PNG-Filtern 0–4. `report.html` enthält einen direkt im Browser lesbaren Bildvergleich mit Original-/Folgeclip nebeneinander. `report.json` enthält Screenshot-Metadaten, Pixeländerungsraten (ab 22 Kanalwerten), grobe Hintergrund-Unterscheidung, konservative NDC-Bildausschnitthinweise, Draw-Call-/Dreiecksangaben sowie gemessene Browser-`requestAnimationFrame`-Kennzahlen (Mittelwert, p95, p99, lange Frames). Keine Interpretation von Bildunterschieden als gute Tanzqualität.

## Bedienung unter Windows oder auf dem Raspberry Pi

1. Mit einem laufenden Sonic Display und tatsächlich bereitgestellten GLBs arbeiten. Zum Beispiel eine eigene bereits vorhandene Datei nach `public/benchmark/performer.glb` kopieren. Die Originaldateien in deiner Avatar-Bibliothek bleiben dabei unverändert. Für einen Vergleich braucht der Clip zwei **wirklich kompatible** eingebettete Animationen, oder zusätzlich ein zweites GLB als `--motion` mit mindestens zwei durch den bestehenden Retargeter nutzbaren Clips.
2. Einmal `npm install --no-audit --no-fund`, `npm run typecheck`, `npm run build` im Projekt ausführen. Für die lokale Vorschau `npm run dev -- --hostname 127.0.0.1` starten.
3. Dann in einem zweiten Terminal:

```bash
npm run benchmark:v590:visual -- --model=/benchmark/performer.glb --original=0 --following=1 --times=0.1,0.5,1.1 --seconds=12 --out=artifacts/v590/visual
```

Wenn Motion-Clips separat vorliegen, etwa:

```bash
npm run benchmark:v590:visual -- --model=/benchmark/performer.glb --motion=/benchmark/performer-motions.glb --original=0 --following=1
```

Mit `--chromium="<lokaler Browser-Pfad>"` kann Chromium explizit gewählt werden. `--url=http://127.0.0.1:3000` gibt die lokal betriebene Instanz an. Standard ist Chromium **headless**; mit `--headed` wird ein sichtbares Browserfenster verwendet (für einen Raspberry Pi vorzuziehen). Die Szene lässt sich zur manuellen Prüfung direkt unter `http://127.0.0.1:3000/benchmark/v590?model=%2Fbenchmark%2Fperformer.glb` öffnen. Original- und Folgeclip müssen verschieden und die Zeitpunkte kürzer als **beide** Clipdauern sein.

Die Resultate liegen in `artifacts/v590/visual/` (PNG-Dateien, `report.json` und bei erfolgreicher Messung `report.html`). Bei nahezu unbewegten Clips zwischen den Aufnahmezeitpunkten wird das als zusätzliche Prüf-Warnung ausgewiesen. Dieser Ordner ist bewusst nicht im Projekt-ZIP enthalten: Es werden keine gemessenen FPS oder Bildresultate erfunden. **Ohne laufenden Webserver, Chromium oder tatsächlich ladbare Animationen endet der Befehl mit Exitcode ≠ 0 und `status: "blocked"`.** Ein fehlerhafter Lauf darf nicht als Qualitätstest gewertet werden.

## Schutz- und Qualitätsgrenzen

- Der Benchmark öffnet Chromium mit einem temporären Browserprofil: Bei externen Motion-GLBs wird der Standard-Retargeter verwendet, aber benutzerspezifische lokale Retarget-Kalibrierungen aus der normalen Sitzung werden **nicht** mitgenommen. Das muss separat in der V589-Vorschau geprüft werden.
- Browser und GLB-Quellen sind auf Loopback-Instanzen / gleich-originige `.glb`-Pfade beschränkt; keine entfernten URLs, keine Dateien aus dem Benutzerdateisystem über den Benchmark-Runner.
- Bildausschnitt aus projizierten GLB-Grenzen ist eine Heuristik: kein sicherer Gesichts-/Körperteile-Test und keine automatische Kollisionsprüfung. Ein sehr kleiner oder randnaher Avatar wird nur als **Warnung** geführt.
- Unterscheiden sich zwei Screenshots, zeigt das eine Pixeländerung. Es beweist keine natürliche Bewegung, Lippen-Synchronität oder einen guten Übergang. Auch `webglcontextlost` und lange UI-Tasks werden nur während der begrenzten rAF-Messphase beobachtet.
- Der 960×540-Canvas-Benchmark stellt eine **unabhängige Preview** dar, nicht die vollständige Spotify-Konzertshow mit echten Lyrics, aktuellen Sängern und intelligentem Kameradirektor. Eine künftige Live-Show-V590-Szenenerweiterung wäre gesondert zu prüfen.
- Auf Linux ARM ist eine reale Raspberry-Pi-Umgebung lediglich *möglich*, nicht nachgewiesen; der Runner erkennt kein Pi-Boardmodell und erfasst keine GPU-/CPU-Temperatur. Headless bleibt nur Diagnostik. Die reguläre V580-Pi-Benchmarkroutine bleibt separat.
- Die ursprünglichen GLBs, importierte Clips, GLB-Clip-Rotation, manuelle Choreografien, Foot-IK, Lip-Sync, Spotify und globale Einstellungen bleiben unverändert.
- **Echte visuelle Freigabe** erfolgt erst, wenn die PNGs und die bestehende V589-Sichtprüf-Checkliste mit den tatsächlichen Avataren beurteilt wurden.

## Tests

```bash
npm run test:v590
npm run test:v590:types
npm run test:smoke:v590
npm run verify:v590
npm run check:syntax
```

Der V590-Test deckt URL-Schutz, Missing-GLB-Blockade, beide Laufzeitimplementierungen des Bildausschnitts, PNG-Filter, identische Pixelbilder, Pixeländerungsmetrik, Browser-Wiring und 15.000 deterministische Prüf-Bounds ab. Er ist eine Offline-Regression, kein echter Chrome-/GLB-Durchlauf.
