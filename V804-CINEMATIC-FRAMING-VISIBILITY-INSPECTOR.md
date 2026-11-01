# V804 – Cinematic Framing & Visibility Inspector

## Neue Funktion

Im bestehenden **Einstellungen → Concert Quality Dashboard → V802 Improvement Assistant → V803/V804 3D-Vergleich** wird nach ausdrücklichem Öffnen zusätzlich die V804-Bildkompositionsprüfung angezeigt. Die beiden Perspektiven teilen sich weiterhin eine DynamicStage, ein GLB-Modell und einen einzigen WebGL-Canvas. V804 greift ausschließlich lesend auf die bereits gerenderte Szene zu.

V804 projiziert die aktuellen Weltkoordinaten der **acht GLB-Bounding-Box-Ecken** in jede der beiden tatsächlichen Vorschaukameras. Zusätzlich werden, wenn vorhanden, Kopf- und linker/rechter Fußknochen aus dem geladenen Skeleton verwendet. Eine Diagnose je Kameraseite erklärt:

- **Gesamter Avatar im Bild?** Projektion einschließlich Blickfeld und Sicherheitsrand.
- **Kopfposition im Bild?** Nur bei vorhandenem Kopfknochen belastbar, sonst „nicht verifiziert“.
- **Beide Füße im Bild?** Nur mit beiden tatsächlich vorhandenen Fußknochen; fehlende Knochen lösen keinen künstlichen Erfolg aus.
- **Gruppenaufnahme?** Explizit „nicht verifiziert“, da die V803-Vorschau derzeit nur einen Performer lädt. Zusätzliche Personen werden nicht behauptet.
- **Möglicher Lyrics-Konflikt?** Projiziert die Avatar-Grenzen gegen eine angenommene untere 23-%-Reserve, horizontal den mittleren Textbereich. Das ist nur eine **Risikoanzeige**, keine tatsächliche Text- oder Pixel-Überdeckungsmessung.

Auf den zwei Vorschauhälften erscheinen die projizierten Körpergrenzen, Kopfmarkierungen und die Lyrics-Reserve als **nicht interaktive** Overlays. Darunter stehen nachvollziehbare Befunde mit den Zuständen „im Bild“, „prüfen“ und „nicht verifiziert“. Demo-Avatare gelten nicht als echte GLB-Messung.

## Einschränkungen und Schutz

- Die isolierte V803-Vorschau ist **nicht die tatsächliche Live-Kameraposition**. Sie nutzt aus V790 abgeleitete Kameraabsichten und den ersten eingebetteten GLB-Animationsclip als eingefrorene Pose. Keine exakte Live-Choreografie.
- Die geometrische Projektion prüft **keine Sichtverdeckung durch Bühne, Haare, Arme oder Effekte**. Ein sichtbarer Kopfknochen bedeutet nicht, dass das Gesicht unverdeckt ist.
- Die Körper-Bounding-Box ist eine geometrische Annäherung (insbesondere bei Skinning). V804 ist **keine Pixel- oder 3D-Occlusion-Engine**, keine Gesichts- oder Fußkontaktanalyse und kein Ersatz für den V754-Inspector.
- Die markierte Lyrics-Zone ist ein **angenommener Bereich**, nicht die gemessene Position der tatsächlichen Lyrics. Auch die Gruppenlesbarkeit lässt sich mit einem GLB nicht überprüfen.
- Es werden keine Kamerafahrten, Licht-Cues, Show-Timelines oder gespeicherten Einstellungen verändert. Manuelle V354-/V802-Bestätigungen behalten Vorrang.
- Keine neuen Renderdurchläufe, Audiozugriffe, Timer oder zusätzlichen WebGL-Kontexte. Projektionsprüfungen laufen beim Invalidieren der ohnehin vorhandenen `frameloop="demand"`-Vorschau.

## Technische Dateien

- `components/visualizer/cinematicFramingInspectorV804.ts` – reiner, deterministischer Geometrie-Inspektor, konservativ bei fehlenden Daten.
- `components/visualizer/CameraComparisonCanvasV803.tsx` – V804-Pose-/Bounds-Ermittlung, Legende, Statuskarte und Screen-Overlays im bestehenden Canvas.
- `components/visualizer/VisualConcertComparisonPanelV803.tsx` – Zugang und Bezeichnung im vorhandenen Dashboard.
- `app/globals.css` – responsives, nicht interaktives Overlay.
- `tests/v804-cinematic-framing-visibility-regression.cjs` – feste Beispiele, Schutzfälle und 2.200 reproduzierbare Geometrieprüfungen.

## Prüfung / Inbetriebnahme

`npm run test:v804`, `npm run test:v804:types`, `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`.

Auf einem Rechner mit installierten Abhängigkeiten zusätzlich den vollständigen TypeScript-Check `npm run typecheck`, den Produktionsbuild `npm run build` und einen **manuellen 3D-/GLB-Test** durchführen. Diese drei Schritte sind hier nicht erfolgreich nachgewiesen.
