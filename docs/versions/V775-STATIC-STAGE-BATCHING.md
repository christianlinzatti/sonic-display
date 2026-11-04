# V775 - Static Stage Geometry Batching

## Implementierung

V774 dient als unveraenderte Ausgangsbasis fuer alle nicht genannten Effekte.
Wiederholte **statische** Buehnen-Props mit identischem Material werden in
`components/visualizer/stages/StageStaticBatchV775.tsx` als R3F-InstancedMesh gerendert.
Die urspruenglichen lokalen Positionen, Skalierungen und Rotationen liegen testbar in
`components/visualizer/stages/stageInstancePlansV775.ts`.

| Buehne | Vorher | Nachher | Betroffene Objekte |
| --- | ---: | ---: | --- |
| Vaporwave | 17 Draw Calls | 3 | 9 Sonnenstreifen, 2 Palmenstaemme, 6 Palmwedel |
| Rock | 11 Draw Calls | 3 | 2 Traversenpfosten, 6 Verstaerkerblenden, 3 Scheinwerfergehaeuse |
| Cyberpunk | 8 Draw Calls | 3 | 6 Turm-Akzentleisten, 2 Neon-Saeulen |

Diese Zahlen betreffen **nur die aufgefuehrten Meshes**, nicht den gesamten
Szenen-Renderer, die Avatare oder die FPS. Jede Buehne hat eine eigene
InstancedMesh-Gruppe pro Geometrie/Material. Die zwei Cyberpunk-Tuerme haben
unterschiedliche Farben und werden deshalb als zwei getrennte Draw Batches
behandelt. Die V635/V647-LED-Wand wird bereits mit einem Shader-Mesh gezeichnet;
eine Batching-Aenderung waere dort kontraproduktiv und wurde unterlassen.

## Ressourcen und Kompatibilitaet

Die Instanzenmatrizen werden einmalig per `useLayoutEffect` gesetzt;
frustum culling erfolgt mit aktualisierter Bounding Sphere. Keine Timer,
Framescheduler oder zweite Canvas/Renderer. Geometrien und Materialien
sind ausschliesslich im R3F-Scene-Tree angelegt, so dass R3F sie beim
Unmount entsorgt. Hauptlicht, adaptive V772-Lichtbudgets und
V774-Dance-FX-Instancing bleiben unveraendert.

## Ueberpruefung

- `npm run test:v775` testet alle Plaene, Positionen, Matrizen-Wiring und Licht-/LED-Regression.
- `npm run test:v775:types` ist die isolierte strenge TypeScript-Pruefung der statischen Plaene.
- Die bestehende V760-V774-Regression wird weiter ausgefuehrt.
- `npm run typecheck`, `npm run build` und echte Browser-FPS-Messungen sind fuer
die Produktionsfreigabe erforderlich. Sie sind hier ohne npm-Paketinstallation
nicht vollstaendig verifizierbar.
