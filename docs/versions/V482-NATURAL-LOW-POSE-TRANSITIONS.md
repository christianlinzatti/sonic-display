# Sonic Display V482 – Natural Low-Pose Transitions & Ensemble Weight Shift

**Basis:** vollständiges V481-Projekt. **Schwerpunkt:** Hocke und Aufrichten sichtbar geschmeidiger, leicht versetzte Rap-Reaktionen mehrerer Tänzer, vorhandene GLB-Motions sicher weiterbenutzen.

## Funktionsumfang

- **Gekoppelter Übergang:** `naturalLowPoseTransitionsV482.ts` berechnet pro Avatar eine kritisch gedämpfte Tiefenposition. Genau derselbe Wert steuert die Absenkung des prozeduralen Beckens und die Hüft-/Kniewinkel aus V481. Damit entstehen keine zusätzlichen unabhängigen Glättungsverzögerungen zwischen Becken und Knie.
- **Weiches Ein- und Aussteigen:** Absenken und Aufrichten verwenden unterschiedliche, begrenzte Reaktionsgeschwindigkeiten. Nach Unterbrechung durch Pause, Reduced Motion, Lyrics-Vordergrund oder manuelle Regie geht die prozedurale Figur weich in den neutralen Stand zurück.
- **Rap-typische Gewichtsschwerpunkte:** Kleine, zeit- und avatarabhängige Oberkörperneigungen sorgen für dezente Gegenbewegungen; die Beinwinkel bleiben bewusst symmetrisch, um nominale Fußhöhe und V481-Foot-IK-Schutz zu erhalten. Es handelt sich ausdrücklich **nicht** um physikalische Schwerpunkt- oder Kollisionssimulation.
- **GLB-Clip-Stabilität:** Ein Hock-/Knieclip wird nur dann benutzt, wenn V481 ihn im importierten Animationsmaterial wirklich findet. V482 hält einen aktiven Clip bei kurzzeitig konkurrierenden **anderen** Low-Pose-Wünschen mindestens 0,58 Sekunden, bevor er einen anderen übernimmt. Bei Stand, Pause, manuell gesteuertem Clip und Songwechsel wird sofort freigegeben. Der existierende Three.js-Mixer verwaltet die Überblendungen; V482 erstellt keine eigenen AnimationClips.
- **Raspberry Pi:** Die Berechnung liegt im existierenden `useFrame`, verwendet je Tänzer wenige Zahlen und einen kleinen, stabilen Ref; kein zusätzlicher Audio-Analyzer, keine History, kein Netzwerk und kein Render-Loop.

## Technische Stellen

- `components/visualizer/naturalLowPoseTransitionsV482.ts`: `stepNaturalLowPoseV482`, `stepLowClipV482`, stabile Slot-Zustände, Delta-/Amplitude-Limits.
- `components/visualizer/ThreeAvatar.tsx`: prozedurale `naturalLowV482` und `baseRootYV482`; gekoppelte V481-Beinlösung; GLB-Clip-Latch auf V481s `findLowPoseClipV481`.
- `components/visualizer/intelligentLowPoseV481.ts`: unveränderte musik- und gruppenabhängige Low-Pose-Policy für 3–4 Avatare.
- `components/visualizer/LowPoseControlsV481.tsx`: vorhandene Bedienelemente bleiben gültig, keine Datenmigration.

## Vorrang und Genauigkeitsgrenzen

Eine gespeicherte Choreografie, ein bewusst gewählter GLB-Clip, eine manuelle Sängerrolle, eine visuelle Lyrics-Vordergrundszene, Pause, Reduced Motion und das vorhandene Leistungsbudget behalten Vorrang. Keine automatische Sängererkennung; Spotify-Feature-Credits definieren keine Vocal-Zeitfenster. Bei GLB-Avataren sind besonders tiefe Posen **nur** mit geeigneten importierten Squat-/Kneel-Clips möglich; V482 kann deren Fußkontakt nicht eigenständig garantieren. Die prozeduralen Figuren erfüllen eine vereinfachte, symmetrische Zweiglied-Kinematik. Tatsächliche Bodenkollision, anatomische IK und die visuelle Wirkung auf importierten Rigs müssen in der laufenden Anwendung getestet werden.

## Tests

```powershell
npm run test:v482
npm run test:v482:types
npm run test:v481
npm run check:architecture
npm run check:syntax
npm run build
```

`tests/v482-natural-low-pose-transitions-regression.cjs` prüft Ein- und Ausblendungen, Oberkörperunterschiede, Übergänge bei Pause/manueller Priorität, begrenzte Werte bei ungültigen Eingaben, GLB-Clip-Hysterese und einen simulierten 30-Minuten-Verlauf. `tests/tsconfig.v482-core.json` prüft die reine TypeScript-Policy. Ein vollständiger Next.js-Produktions-Build benötigt installierte npm-Abhängigkeiten; reale Framezeiten und Fußkontakte auf dem Raspberry Pi werden nicht durch Offline-Tests bewiesen.
