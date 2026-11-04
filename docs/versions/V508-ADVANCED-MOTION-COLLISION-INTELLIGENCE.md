# Sonic Display V508 – Advanced Motion Collision Intelligence

## Umsetzung

Auf Grundlage von V507 werden **animierte** GLB-Bone-Positionen als vereinfachte 3D-Kapseln betrachtet. Das System prüft den Abstand zwischen Arm- und Oberkörpersegmenten verschiedener Avatare und dämpft bei realer Nähe zusätzliche, automatisch erzeugte Bühnen-/Rap-Gesten. Wichtig: Die GLB-Daten werden **nur gelesen**. Es werden weder Bones verändert noch importierte Animationsclips, Handkontakt, V494-Fuß-IK, manuelle Choreografien oder der Spotify-/Lyrics-Flow überschrieben.

- `components/visualizer/measureAnimatedGlbV508.ts`: Findet beim Modellwechsel aus der **geklonten GLB-Instanz** vorhandene Humanoid-Schulter-, Ellbogen-, Handgelenk- und Hüftknochen. Das Bone-Matching wird aus V507 wiederverwendet. Ein kleiner bestehender `useFrame`-Callback in `components/visualizer/GltfDancerAvatarV492.tsx` tastet aktualisierte Weltkoordinaten mit maximal 12 Hz (`high`) beziehungsweise 7 Hz (`balanced`) ab; `low`/Paused/Reduced-Motion deaktivieren zusätzliche Samples. Die Kapselstärke wird aus dem V507-Körperprofil abgeleitet und begrenzt.
- `components/visualizer/animatedCollisionV508.ts`: Deterministische **dreidimensionale Segment-Abstandsrechnung** (auch parallele/degenerierte Segmente), Kapsel-Oberflächenabstand, weiche Gefahren-Dämpfung, 2–4 Slots und Abweisung von veralteten Snapshots (> 420 ms). Kein Pixel-/Mesh-Solver, kein weiterer Netzwerk- oder Arbeitsthread. Eine lokale Registry verwaltet die zuletzt gelesenen Frames; beim Modellwechsel wird mit Identitätsprüfung aufgeräumt.
- `components/visualizer/ThreeAvatarContextsV492.tsx`: Bühnenlokaler Mutable-Context ohne React-State-Updates pro Frame.
- `components/visualizer/DanceFormationActorsV492.tsx`, `components/visualizer/GroupDancersV326SceneV492.tsx`: Lesen den zeitlich gültigen gemeinsamen Snapshot, fusionieren seinen Gesten-/Dreh-Abschwächungsfaktor mit dem **bestehenden** V506-Plan und führen die V506-Gesten-Schutzfunktion aus. Duo-Roots erhalten keine neuen Translations. Bei automatisch aufgebauten Gruppen bleibt jede optionale Z-Verschiebung ausschließlich vom bisherigen V506-Plan und der V494-Fußkontaktfreigabe abhängig. V508 kann nur über die Sicherheitsdämpfung vorhandene Bewegung **verringern**.

## Sicherheitsgrenzen

Es werden lediglich **fünf vereinfachte Kapseln** pro ausreichend riggtem Avatar erstellt: Torso plus beide Ober- und Unterarme. Fehlende oder ungültige Bones, sehr kleine/unsichtbare Gruppen und veraltete Daten aktivieren keinen neuen V508-Eingriff; die vorhandene V506-Vorsorge bleibt erhalten. Bei `manualPriority`, Pause, Reduced Motion oder geringer Qualitätsstufe ist der V508-Plan inaktiv. Die Daten sind Weltkoordinaten im lokalen Bühnenkontext – sie werden nicht noch einmal mit der Avatar-Skalierung multipliziert.

**Keine exakte Kollisionsgarantie:** Skinned Meshes, Jacken, Finger, bewegliche Accessoires und schnelle Bewegungen zwischen zwei Samples können sich weiterhin überschneiden. Unterschiedlich benannte, unvollständige GLB-Rigs können gar keine V508-Kapseln liefern. Die Analyse dient der *Risikoreduktion*, nicht einem Constraint-/IK-Solver. Praktische visuelle Testläufe mit zwei und vier echten GLB-Modellen bleiben notwendig.

## Tests und Build

```powershell
npm run test:v508
npm run test:v508:types
npm run check:syntax
npm run check:architecture
npm install
npm run build
```

Die V508-Regression testet 32.000 synthetische Vier-Avatar-Frames, mathematische 3D-Segmentfälle, Kapsel-Nähe und sichere Distanz, dynamisch geänderte Handgelenke, fehlerhafte/stale Snapshots, Slot-Lebenszyklus und die tatsächlichen Duo-/Gruppenpfade. `npm run build` erfordert vollständig installierte Next.js/React/Three-Abhängigkeiten und die lokale Entwicklungsumgebung.
