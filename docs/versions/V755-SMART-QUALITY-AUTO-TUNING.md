# V755 – Smart Quality Auto-Tuning

## Ziel und Bedienung

V755 verbindet die vorhandene **V753-WebGL-Telemetrie** und die **V754-Geometrieprüfung** mit den *zusätzlichen automatischen Effekten* von V750. Die Funktion ist **standardmäßig ausgeschaltet**. Im bestehenden **Einstellungen → Dashboard → V755 Smart Quality Auto-Tuning** wird sie für die **aktuelle Browser-Registerkarte** eingeschaltet. Gleichzeitig muss die **V466-WebGL-Probe auf der laufenden 3D-Bühne** aktiviert werden; ohne aktuelle Messwerte erfolgt **kein Eingriff**.

V755 verändert weder die Avataranzahl noch die WebGL-Auflösung, LOD-Stufen, Hardwareprofile, Audioanalyse, GLB-Clips, Foot-IK, Vocal-Identität, Phoneme, gespeicherte Choreografien noch gespeicherte Kamera-/Licht-Timelines. **Keine Änderung an persistenten Einstellungen**, kein Upload/Tracking, kein zusätzlicher `useFrame`-/GPU-Abfrage-/Animationsloop. Der Opt-in-Schalter und die Tunerhistorie existieren nur im Speicher und werden nach Neuladen zurückgesetzt.

## Regelung

- Quelle: tatsächliche frische V466-WebGL-Renderer-Messfenster (FPS, Frame-Time, P95, Samples, Messzeit) und optionale geometrische V754-Bildhinweise. V754 misst keine echte Pixelverdeckung oder Luminanz.
- Die Messung muss höchstens 3,5 Sekunden alt sein und mindestens 10 Frames repräsentieren; alle tatsächlich geladenen Avatar-Slots (1–4), Renderpixel und Qualitätsprofil müssen konsistent sein. Fehlende P95-Werte, alte Samples, ungeladene Avatare oder Profil-/Auflösungswechsel verhindern die Anpassung.
- Nach drei aufeinanderfolgenden kritischen FPS/P95-Fenstern wird die Dämpfung höchstens **um eine Stufe** erhöht (max. Stufe 3). Erst nach fünf guten Fenstern und mindestens acht Sekunden Haltezeit kann sie **um eine Stufe** zurückgehen. Bei Zwischenwerten wird gehalten. Kein hektisches Hoch-/Herunterschalten aufgrund eines einzigen Frames.
- Kamera und zusätzliche Bühnenlichtakzente werden zuerst gedämpft; optionale Lyrics-Glows und prozedurale Körperbewegungen folgen in kleineren Grenzen. Manuelle Kamera, manuelles Licht, eigener Hip-Tanz und GLB-Animationen behalten Vorrang. Lesbarkeit, vorhandene Lyrics-Layout-Werte und das bereits existierende Face-Rig bleiben erhalten.
- Bei V754-Hinweisen werden die *zusätzlichen* Kamera-/Lichtakzente vorsichtig reduziert. Es wird **nicht behauptet**, dass damit Kopf-/Lyrics-Konflikte automatisch behoben werden.
- Bei Pause, Trackwechsel, schlechter Messqualität, deaktivierter Probe und veralteten Daten wird der Zusatzfaktor **neutral**. Auch FPS, GPU-Zeit und Leistungsverbesserung werden nie vorgetäuscht.
- **V753 Benchmarks sind während aktivem Tuning gesperrt**, laufende Messreihen werden abgebrochen. Vergleichsreihen müssen mit unverändertem Qualitätsprofil und abgeschaltetem V755 aufgenommen werden.

## Module und Tests

- `components/visualizer/qualityAutoTunerV755.ts`: Reine deterministische Regelung, Validierung, Hysterese, Stale-Failsafe, begrenzte zusätzliche Multiplikatoren.
- `components/visualizer/qualityAutoTuneStoreV755.ts`: Registerkartenlokaler Opt-in- und Diagnosezustand via `useSyncExternalStore`.
- `components/visualizer/QualityAutoTunePanelV755.tsx`: Ein-/Ausschalter, aktueller Stufenstatus, gemessene FPS/P95 und Dämpfungswerte.
- `components/visualizer/VisualizerStage.tsx`: Greift nach V750 in die bereits vorhandenen automatisch abgeleiteten Kamera-/Licht-/Lyrics-/Hip-/Vocal-Stärken ein; alle gespeicherten Präferenzen bleiben unverändert.
- `components/visualizer/RealConcertBenchmarkPanelV753.tsx`: verhindert verfälschte Messvergleiche.
- `tests/v755-smart-quality-auto-tuning-regression.cjs` sowie `tests/tsconfig.v755-core.json`, `tests/tsconfig.v755-ui.json`.

## Einschränkungen

Die V755-Regelung kann nur **optionale, automatisch erzeugte Zusatzakzente** begrenzt dämpfen; das garantiert keine höhere Bildrate bei GPU-/CPU-Engpässen durch GLB-Meshes, Schatten, Postprocessing oder den Browser. Für eine echte Reduktion von Renderlast sind gemessene und gezielte Optimierungen dieser Systeme in späteren Versionen notwendig. Die aktuelle Testumgebung erlaubt keinen vollständigen Next.js-Build oder optischen GLB-Browsertest ohne npm-Pakete; die Wirkung auf tatsächliche FPS ist noch nicht experimentell bestätigt.

## Vollständige Prüfung lokal

```powershell
npm ci
npm run verify:v755:static
npm run typecheck
npm run build
```
