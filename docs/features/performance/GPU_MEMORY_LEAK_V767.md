# Sonic Display V767 – automatischer GPU-Memory-Leak-Stresstest

## Was genau gemessen wird

- Ein echtes Three.js/R3F-Canvas mit den Original-`StageEnvironment`-Komponenten.
- Umschalten zwischen sechs Bühnen, darunter die in V766 optimierte Galaxy-Bühne.
- Zwei prozedurale Avatarvarianten; auf Wunsch zusätzlich **echte eigene GLB/GLTF**
  (lokale same-origin URLs aus dem Webserver). Die GLB-Clones haben eigene Skeletons,
  aber teilen die GLTF-Caches; beim Unmount werden Clone-Skeletons freigegeben.
- Zwei vollständige Warm-up-Runden zur Cache-/Shader-Erwärmung. Anschließend
  30 Messrunden (anpassbar 8–100), pro Wechsel `renderer.info.memory.geometries`,
  `.textures`, `renderer.info.programs?.length`, Draw Calls und Dreiecke.
- Ein identischer Messanker (Classic/Procedural-A) **nach jeder vollständigen Runde**.
  So ist eine Variation zwischen verschiedenen Bühnen kein falscher Leak-Alarm.
- Anhaltender Zuwachs von >2 Geometrien, >1 Textur oder >2 Shader-Programmen
  nach Warm-up führt zu `suspect`; unzureichende Messungen/Kontextverlust zu
  `inconclusive`, statt fälschlich `stable`.
- Ein optionaler Live-Probe sammelt im echten `ThreeAvatar`-Canvas im Sekundentakt
  höchstens 120 Messwerte (ca. 2 Minuten), wenn die Seite mit `?gpuLeakV767=1`
  auf localhost geöffnet wird. Er läuft **nicht** im normalen Betrieb.

## Ausführen unter Windows / macOS / Linux

1. Abhängigkeiten installieren: `npm ci`.
2. Next.js starten: `npm run dev` (oder `npm run build && npm start`).
3. Browser-Stresstest: `npm run test:v767:browser`.
   Mit 2 lokalen Modellen zum echten GLB-Umschalten z. B.:

   ```bash
   node scripts/v767-gpu-memory-browser.cjs --url=http://127.0.0.1:3000 --cycles=30 --model=/models/avatar1.glb --model=/models/avatar2.glb
   ```

   Die Modelle müssen vom lokalen Sonic-Display-Webserver unter diesen Pfaden
   erreichbar sein. Der Runner nutzt ein **frisches Browserprofil** und benötigt
   Chromium (`--chromium=...` oder Umgebungsvariable `CHROMIUM_PATH`).
4. Bericht: `artifacts/v767/gpu-memory.json`; Skript beendet sich mit Exit-Code
   ungleich 0 bei `suspect`, `inconclusive` oder `blocked`.
5. Zur manuellen Ansicht:
   `http://127.0.0.1:3000/diagnostics/gpu-memory?gpuLeakV767=1`
   (optional `&model=/models/avatar1.glb`). Dort gibt es einen JSON-Download.

## Echte Konzert-App beobachten

Die normale App lokal mit `http://127.0.0.1:3000/?gpuLeakV767=1`
öffnen und Bühnen/Avatare über die UI wechseln. Im Browser-Console-Fenster:

```js
window.__sonicV767Live?.samples // letzte 120 WebGL-Snapshots, 1 Hz
window.__sonicV767Live?.reset() // Baseline vor einem neuen Test zurücksetzen
window.__sonicV767Live?.download() // JSON-Bericht für Detailanalyse
```

## Grenzen / Einordnung

`renderer.info.memory` meldet **Ressourcenanzahlen, nicht VRAM-Bytebedarf**. Browser,
Treiber und WebGL dürfen intern Speicher behalten. `useGLTF` bewahrt bekannte Quellen
absichtlich im Cache auf; deswegen werden alle verwendeten Bühnen und Modelle vor der
Baseline zweimal besucht. Sind keine eigenen GLBs angegeben, testet der automatische
Stresstest **keine echten GLB-Avatare**. Ebenso testet der isolierte Stresstest weder
komplette Lyrics-/Kamera-Kompositionen noch stundenlange vollständige Konzertshows.
Ein `stable`-Ergebnis bedeutet nur, dass die definierten GPU-Ressourcen in diesem
begrenzten Test nicht fortlaufend wachsen. Ein persistierender Anstieg muss im
Kontext von GLTF-Cache, Shader-Varianten und App-Zustand untersucht werden.

## CI / Offline

`npm run test:v767` prüft mit deterministischen Fixtures die Anomalie-Auswertung,
Kontextverlust, Messmindestmenge und die Instrumentierung anhand des Quellcodes.
Dies ist **kein** WebGL-Integrationstest. `npm run verify:v767:static` ist ebenfalls
nur eine statische Prüfung. Der echte Chromium-Test muss separat mit laufendem
Next.js-Server gestartet werden und darf bei Nichtverfügbarkeit nicht als PASS
bewertet werden.
