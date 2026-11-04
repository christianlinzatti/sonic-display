# Sonic Display V639 – Intelligent Motion Library

## Ziel
Mehr glaubwürdige musikalische Abwechslung über ganze Songs hinweg, mit bereits geladenen Animationen – **keine** generierten GLB-Motions, kein neuer Avatar-Layer, kein zusätzlicher Mixer oder Frame-Loop.

## Runtime-Pfad
Im existierenden React-Hook `components/visualizer/useGenreAwareMotionDirectorV536.ts` wird die Reihenfolge V536 → V588 → V615 → **V639** verwendet. Der finale Name wird weiterhin an `GltfDancerAvatarV492.tsx` gemeldet; manuelle Sequenzen, Motion-Loops, Blend-Presets, Timeline, V492-Pose-Matching, V630-Übergänge und V494-Fußkontakt behalten ihre bestehenden Zuständigkeiten.

Neue Datei: `components/visualizer/intelligentMotionLibraryV639.ts`. Für jeden Song und jedes Avatar-Modell gibt es eine begrenzte **acht Clips** umfassende Historie, clipgebundene Nutzungswerte und 10 Sekunden Schutzintervall. Es wird nur innerhalb der musikalisch nahezu gleich geeigneten, validen und bereits geladenen V536-Kandidaten rotiert. Wenn möglich wird Root-Locomotion aus dem Pool herausgehalten. Clipdauer und Trackanzahl wirken lediglich als kleine, konservative Qualitätshinweise, **nicht** als Nachweis natürlicher Bewegung. Eine einzelne gültige Animation bleibt gültig. Favoriten, Quellen und importierte GLB-Dateien bleiben unverändert.

Für stabile Fenster wird nicht erneut gerankt. Ein blockierter Wechsel wird aufgeschoben, um nicht 60-mal pro Sekunde hunderte Clips neu zu sortieren. Beim Clip- oder Songwechsel werden Referenzen und Nutzungswerte aktualisiert; bei Seek, Modelländerung, Pause, manuellem Vorrang oder Reduced Motion wird alte Historie zurückgesetzt. Es gibt keine harte Begrenzung der Größe importierter Bibliotheken.

## Grenzen und Tests
Automatisierte Simulationen belegen deterministische und zeitlich begrenzte Clip-Auswahl, nicht die echte 3D-Bewegungsqualität. Visuelle Inspektion echter GLB-Animationen, LOD, Kollisionen, echtes Chrome-Rendering und Next.js-Produktionsbuild müssen auf dem Zielsystem geprüft werden. V639 ermittelt keine zusätzlichen Gesangs-, Audio- oder Phonemdaten.

`npm run test:v639` · `npm run test:v639:types` · `npm run test:smoke:v639` · `npm run verify:v639`
