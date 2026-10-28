# V614 – Natural Motion Flow

**Basis:** V613 – Cinematic Concert Shot Pacing. **Ziel:** natürlicher wirkende Übergänge der bereits vorhandenen 3D-Tanzclips, ohne Sängerrollen, neue GLB-Clips, freie Animationssteuerung oder Änderungen am bestehenden Song-Director.

## Neu

- `components/visualizer/naturalMotionFlowV614.ts` verfeinert die Crossfade-Zeit **nur**, wenn der ursprüngliche V492/V537/V565-Plan eine automatische Änderung eines vorhandenen GLB-Clips vorbereitet hat. Die importierten Keyframe-Kurven und das bestehende Motion-Matching bleiben unangetastet.
- Abschnittsabhängige Übergänge: etwas längere Überblendungen bei Rap-Verse, Builds sowie ruhigen Breaks/Instrumentalpassagen. Drops werden nur bei tatsächlich gemessenem Kick-/Snare-Onset etwas direkter. Ein Section-Label ist ausschließlich ein Hinweis der bestehenden Regie, keine neue musikalische Erkennung.
- Fußkontakt: ein gemessener gepflanzter Fuß erhält einen vorsichtig längeren Crossfade; bestehende Foot-IK-Anker werden weder zurückgesetzt noch verschoben. Hohe Pose-Mismatch-Werte und schnelle Clip-Folgen erhalten zusätzliche Überlappung statt harter Schnitte.
- Tempo-/Clip-Schutz: Blendzeit höchstens 1,2 Sekunden und höchstens 42 % des kürzeren GLB-Clips. Ein zusätzlicher BPM-basierter Deckel verhindert schwammige Doppelbewegungen bei schnellen Genres.
- Trackgebundene, kleine `useRef`-Historie schützt vor falscher Übertragung einer Clip-Folge auf einen anderen Song. Beim Seek zurück wird die V614-Zusatzglättung ausgelassen. Kein zusätzlicher Browser-Clock oder Render-Loop.
- Die Funktion wählt **keinen** neuen Animationsclip und schätzt keine Sänger oder Phonem-/Silbenpositionen. Gerade bei Deutschrap bleibt die V612-Lippensynchronisation unabhängig.

## Unveränderte Vorrangregeln

Manuelle Motion-Timelines, gespeicherte Loops, explizite Dance-Overrides, Group-Presets, V493-Motion-Blends, Rap-Live-Sequenzen, Low-Tier, Pause, Reduced Motion, kurze oder ungültige GLB-Clips bleiben bei der vorherigen V492/V565-Logik. Die bereits vorhandenen V537-Clip-Entry-Seek-Positionen werden durch V614 **nicht** verändert.

## Prüfung

```powershell
npm run test:v614
npm run test:v614:types
npm run test:smoke:v614
npx tsc --noEmit
npm run build
```

**Grenze:** Timing-Unit-Tests prüfen keine reale visuelle Kontinuität von GLB-Skeletten. Echte Tänzer, Fußkontakt, Lyrics und Kamera müssen im Browser mit vollständigen Songs geprüft werden. Nur die GLB-Crossfade-Pipeline erhält V614; prozedurale Avatare nutzen weiterhin ihren vorhandenen separaten Flow-Controller.
