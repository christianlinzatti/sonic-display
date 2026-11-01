# V805 – Multi-Performer Visibility Studio

## Funktion

Unter **Einstellungen → Bühne → Concert Quality Dashboard → V802 Improvement Assistant → V803–V805 3D-Vergleich** können zum aktiven Avatar ein zweiter und optional ein dritter Avatar aus der vorhandenen vollständigen Avatar-Bibliothek ausgewählt werden. Die Gruppenprüfung wird nur angezeigt, wenn diese GLB-/GLTF-Modelle ausdrücklich ausgewählt wurden; es gibt **keine automatische Sängererkennung oder vorgetäuschte Vocal-Timeline-Zuordnung**.

Die vorhandene isolierte `frameloop="demand"`-Vorschau verwendet weiterhin **eine DynamicStage, einen WebGL-Canvas und zwei mit Scissor-Tests gerenderte Vergleichskameras**. Bis zu drei tatsächlich geladene GLB-Modelle werden als getrennte Skeleton-Clones aufgebaut und in einer statischen Probeaufstellung positioniert. Der erste eingebettete Animationsclip wird pro Modell zur gleichen Songposition als Poseprobe gesampelt; **keine echte, live verifizierte Gruppen-Choreografie**.

V805 wertet bei beiden Kamerawinkeln aus:

- die projizierten Körpergrenzen sämtlicher ausgewählter Performer (Rand und Clipping),
- vorhandene Kopfknochen mit Sicherheitsrand und tatsächlich vorhandene Fußknochen,
- starke Überlappungen der **2D-Bounding-Rectangles** verschiedener Performer (Hinweis, keine nachgewiesene Okklusion),
- Konflikte mit einer **angenommenen unteren Lyrics-Reserve**; deren tatsächliche Zeichen werden nicht gemessen.

Das UI zeigt getrennt Vorher/Nachher, geladene Performerzahl, Kopfrisiken, Fußrisiken, mögliche Überlagerungen und Lyrics-Hinweise. Fehlende, ladende und fehlerhafte Modelle sowie fehlende Kopf-/Fußinformationen sind **nicht verifiziert**. Ein einzelner Avatar führt nicht zu einem positiven Gruppenbefund.

## Sicherheits- und Laufzeitgrenzen

- Read-only: keine Live-Kamera, kein Schreiben von V354-/V802-Cues, kein Songwechsel, keine Timelines verändert.
- Keine zusätzlichen Kameraobjekte pro Performer, WebGL-Canvas, Lichter, Render-Targets oder Timer. Einzelne GLB-Modelle benötigen natürlich zusätzliche Polygon-/Textur-/Animationsspeicher; V805 begrenzt die freiwillige Vorschau auf drei Modelle und öffnet den Canvas nur auf Knopfdruck.
- Das Ergebnis ist **nur eine geometrische Bildkompositionsprobe**, keine nachgewiesene Gesichtssichtbarkeit, Lippenbewegung, Personenidentität, Kamerapose der Live-Show, Occlusion-/Z-Buffer-Abfrage, echtes Lyrics-Overlay oder Performance-Benchmark. Für Endabnahme reale GLB- und Browser-Tests durchführen.
- Bei fehlender oder abweichender Song-Timeline gilt weiterhin die V802/V803-Sicherheitsregel: kein Kameravergleich.

## Technische Dateien

- `components/visualizer/multiPerformerVisibilityV805.ts` – konservativer, deterministischer Audit pro Gruppe.
- `components/visualizer/CameraComparisonCanvasV803.tsx` – gemeinsames 3D-Rendering, eigene Bone-/Bounds-Projektionen und V805-Overlays pro Avatar und Blickwinkel.
- `components/visualizer/VisualConcertComparisonPanelV803.tsx` – optionale zweite/dritte Modellauswahl.
- `components/visualizer/ConcertImprovementAssistantPanelV802.tsx`, `components/visualizer/ConcertQualityDashboardV751.tsx`, `components/SettingsPanel.tsx` – Modelldatenweitergabe.
- `app/globals.css` – responsive read-only-Gruppenmarkierungen.
- `tests/v805-multi-performer-visibility-regression.cjs` – 40 Testgruppen, 2.400 reproduzierbare Gruppensamples.

## Prüfen

`npm run test:v805`, `npm run test:v805:types`, `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`, `npm run check:lockfile:v752`.

Auf der Zielmaschine unbedingt `npm ci`, `npm run typecheck`, `npm run build` und reale Browser-/GLB-Tests mit zwei oder drei verschiedenen Modellen durchführen.
