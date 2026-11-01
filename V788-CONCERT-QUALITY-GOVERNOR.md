# V788 – Intelligent Concert Quality Governor

## Zweck und Schutzprioritaet

Diese Version fuegt einen **rein diagnostischen, lokalen und explizit aktivierten** Performance-Regler fuer die echte 3D-GLB-Benchmark-Buehne (V777) hinzu. Der normale Spotify-/Live-Konzertmodus bleibt unveraendert.

Der Regler reduziert **nicht** die GLB-Animation, die Skelett-Updates, den Lip-Sync, den fokussierten Saenger, die Kamera oder die Lyrics. Er verringert der Reihe nach nur weniger wichtige Hintergrundobjekte und Effekte:

| Budget | Buehnenstaerke | Reaktive Beleuchtung | DanceFX | Geschuetzt |
|---|---:|---|---|---|
| 0 Full | 72 | ja | Schockwellen, Fussspuren, Trails | Avatare, Mund, Kamera, Lyrics |
| 1 Decor reduced | 52 | ja | reduzierte Schockwellen; keine Fussabdruecke/Trails | dito |
| 2 Background minimal | 32 | nein | aus | dito |

**Keine automatische LOD-Modellerzeugung oder automatische Live-LOD-Freigabe.** Bereits vorhandene V787-LOD-Dateien werden im V788-Governor bewusst nicht ungeprueft aktiviert. Weiter entfernte Taenzer behalten ihr Rig und ihre Aktualisierungsrate; die Einsparungen kommen zunaechst aus der dekorativen Umgebung.

## Algorithmus

- Reale `useFrame`-Bildintervalle des Three-/R3F-Canvas werden gruppiert (24 Frames je Fenster). Sie werden nicht aus geschätzten CPU-/GPU-Kosten erfunden.
- Bei P95 > 112 % des nominellen Zeitbudgets fuer zwei aufeinanderfolgende Fenster: eine Dekostufe reduzieren.
- Bei P95 < 78 % des nominellen Budgets fuer fuenf aufeinanderfolgende Fenster: eine Stufe zurueckschalten.
- Mindestens 72 Frames Abstand zwischen zwei Stufenwechseln. Der Regler kann maximal Stufe 2 erreichen.
- V788 arbeitet an React-Props fuer `StageEnvironment`, `DynamicStage` und `DanceFX`. Er verwendet **keinen zusaetzlichen `requestAnimationFrame`-Loop**, keine Hintergrundtimer und keine neuen GPU-Materialien. Nur Stufenwechsel verursachen React-Neurenders.
- Standardeinstellung 45 FPS; einstellbar auf 30 oder 60 FPS. Ein 60-FPS-Ziel ist eine Testanforderung, **keine Garantie**.
- Beim Wechsel zur naechsten Testsituation startet der Zustand bei 0. Ungueltige Messpunkte werden gezaehlt statt stillschweigend ignoriert; ein solcher Datensatz wird vom Audit blockiert.

**Wichtige Messgrenze:** `useFrame(delta)` ist die Browser-/Renderloop-Framezeit, nicht eine unabhaengige, hochaufloesende GPU-Timestamp-Query. Die Daten sagen nichts ueber Render-Latenz des vollstaendigen Spotify-Workflows aus.

## Messung mit eigenem GLB

1. `npm ci`
2. `npm run typecheck`
3. `npm run build`
4. `npm run start`
5. Lege eigene Avatar-GLBs unter `public/benchmark/` ab.
6. In einem zweiten Terminal:

```bash
npm run benchmark:v788:governor -- --url=http://127.0.0.1:3000 --glb=/benchmark/mein-avatar.glb --target=45
```

Optional: `--glb2=/benchmark/zweiter-avatar.glb` und `--chromium=...`. Nur explizite lokale URLs erlaubt.

Der Runner fuehrt **off → on → on → off** mit 6 Szenen (Cyberpunk, Rock, Galaxy × 2/4 GLBs), 2 Durchlaeufen und 240 Messframes aus. In der V788-Fixture laufen V782, V783, V784 und V785 alle im `on`-Diagnosemodus und das Basisprofil ist stets `cinematic`. Sie ist kein Realzeit-Audio-/Spotify-Test. Fuer aussagekraeftige Hardwarewerte die mitgelieferte kleine GLB-Referenz durch echte, komplexe Modelle ersetzen.

Die `run-1-off.json` ... `run-4-off.json` enthalten die Originalberichte. `artifacts/v788/runs.json`, `governor-review.json` und `governor-review.md` enthalten die Vergleichsbelege. Die Datei `runs.json` kannst du unter `/diagnostics/concert-governor` lokal laden (kein Upload).

Vorhandene Runs erneut auf einem anderen FPS-Ziel auswerten:

```bash
npm run benchmark:v788:governor -- --assess-only --input=artifacts/v788/runs.json --target=45
```

Die Zielwertkonfiguration muss exakt zu den aufgezeichneten Messungen passen, andernfalls wird der Vergleich blockiert. Ein lokaler Serverausfall fuehrt zu `blocked` und **null erfundenen FPS-Daten**.

## Vergleichsregeln und Aussagekraft

- Vier vollstaendige GPU-Laeufe und sechs Szenen in jedem Lauf erforderlich; auch die V788-Transitions werden auf Identitaet, Anzahl und Frame-Summen geprueft.
- Gleiche GLB-SHA-256-Pruefsummen, Renderer, User-Agent, Viewport, DPR, Passzahl und Renderkonfiguration erforderlich. SwiftShader/Software-Rendering wird blockiert.
- Keine automatische Release-Freigabe allein aus mehr FPS; der Bericht zeigt auch P95, Draw Calls und wie oft die Optik reduziert wurde. Die visuelle Qualitaet muss unter V780 weiterhin geprueft werden.
- Die dynamische Reduktion kann die Auslastung verbessern, muss es aber nicht: Vulkan/OpenGL-Treiber, Shader-Kompilierung und CPU-Kosten unterscheiden sich.
- Keine ungepruefte Uebernahme in die echte Live-Show; der naechste sinnvollere Schritt ist der volle Song-Benchmark V789 und eine manuelle Freigabe anhand repräsentativer GLBs.

## Tests

```bash
npm run test:v788
npm run test:v788:types
npm run verify:v788:static
npm run typecheck
npm run build
```

Die letzten beiden Schritte setzen **vollstaendig installierte npm-Abhaengigkeiten** voraus. Die Browser-/GPU-Tests erfordern zudem einen lokalen Next.js-Server und Chromium.
