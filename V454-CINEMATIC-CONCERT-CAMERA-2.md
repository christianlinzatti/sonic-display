# Sonic Display V454 – Cinematic Concert Camera 2.0

V454 stimmt die **bereits vorhandene** 3D-Kamera mit dem automatischen V446-Rap-Show-Szenenplan ab. Das Ziel ist, schnelle Rap-Passagen klarer, Feature-Hooks weiter und Übergänge zwischen Einzel- und Gruppenperformance ruhiger darzustellen. **Keine neue Kamera, keine zusätzlichen APIs, keine Konfigurationspflicht.**

## Umsetzung

- Der `SmartShowCueV446` wird direkt über die existierenden `VisualizerProps.lipSync`-Daten bis zum bestehenden `StageCameraDirectorV289` weitergegeben. Das zusätzliche stabile `concertCameraArmedV454` hält die bereits verwendete Regie auch dann bereit, wenn die alte optionale V429-Rap-Kamera abgeschaltet ist.
- V454 plant **Portrait** bei einer Verse mit visuellem Hauptavatar und **Ensemble** bei Hook, Intro oder Outro. Ein Fokus-Slot bezeichnet ausschließlich die V446-Bühnenchoreografie, **keine erkannte Rapperstimme**.
- Ein Wiedergabezeit-abhängiger Hold von mindestens 2,1 Sekunden schützt vor sprunghaften, kurz aufeinanderfolgenden Kamerawechseln. Bei Pause, Seek, Trackwechsel, fehlenden Daten oder manuellen Kameraeingriffen wird der V454-Zustand zurückgesetzt.
- Beim Ensemble schützt eine konservative Mindestdistanz bei **2/3/4 Avataren** (5,25/7,1/8,25 Szeneneinheiten) vor übermäßig engen Aufnahmen. Die Gruppe erhält einen breiteren FOV. In Portraits sind der Dolly und ein optionaler gemessener Gesichtsanker subtil. Eine vorhandene V442-Fokussierung wird nicht doppelt zur Seite verschoben.
- Die Komposition erfolgt **nach** den bisherigen automatischen Kamera-Layern V369–V442 und V432, **vor** dem vorhandenen Lyrics-/Display-Sicherheitsfilter V351. Bei aktivem Lyrics-Schutz wird ihre Stärke auf 40 % begrenzt. Die bestehende React-Three-Fiber-Kamera fährt die Zielpose sanft an.
- Gespeicherte Kamera-Presets, Live-Editor, manuelle Kameramodi, V354-Show-Timelines, V400-Authored-Timelines, V430-Kameraedits und aktive V432-Keyframes bleiben unangetastet. Auch aktive ältere V377/V397/V401-/Konzert-/Festival-Kameraregien werden nicht konkurrierend überschrieben.
- Reduzierte Bewegung, pausierte Wiedergabe, fehlender V446-Szenenplan und manuell festgelegte Vocal-Rollen deaktivieren den neuen Auto-Layer.

## Dateien

- `components/visualizer/cinematicConcertCameraV454.ts`: zustandsarmer Shot-Planer, holdbarer Szenenwechsel und defensiver Pose-Composer.
- `components/visualizer/StageCameraDirectorV289.tsx`: Integration in die einzige bestehende R3F-Kamera; alternative Kameraregie behält Vorrang.
- `components/visualizer/VisualizerStage.tsx`, `components/visualizer/registry.tsx`, `components/visualizer/ThreeAvatar.tsx`: sichere Weitergabe von Szenencue/Cast und stabiles Mounting.
- `tests/v454-cinematic-concert-camera-regression.cjs`, `tests/tsconfig.v454-core.json`: Tests für 1–4 Slots, Gruppendistanzen, Lyrics, Pausen/Seek, Schutz bestehender Keyframes und Mounting.

**Grenzen:** Die Szene kennt keine tatsächliche Stimme. Das Ergebnis nutzt automatische musikalische Abschnittsheuristiken aus verfügbaren synchronisierten Lyrics oder Tempo (V446). Die realen Bildausschnitte hängen von den GLB-Größen und Kamera-Konfigurationen ab; ein WebGL-Realtest auf dem Zielgerät bleibt erforderlich.

## Lokale Prüfung

```powershell
npm install
npm run verify:v454
npm run typecheck
npm run build
```

Siehe `V454-VERIFICATION.md` für die tatsächlich ausgeführten Tests und noch offenen Prüfungen.
