# Sonic Display V507 – Advanced Avatar Body Awareness

## Umsetzung

Die bisherigen V506-Körperhüllen basierten weitgehend auf konstanten Torso-Radien. V507 ermittelt nun **einmal beim Laden** eines GLB-Modells Größenangaben aus dessen *Restpose*, sofern identifizierbare Humanoid-Knochen existieren:

- Linke/rechte Schulter: Schulterabstand.
- Schulter–Ellbogen–Handgelenk: Armlänge (beide Seiten, wenn vorhanden).
- Hüfte–Knie–Fuß: Beinlänge.
- Kopf–Fuß: Höhe, ansonsten `Box3`-Höhe aus dem geladenen Modell.
- Keine geratenen Schultermaße aus einer T-Pose-Gesamtbreite: Fehlen passende Bones, ist die Geometrie nur eine **grobe Fallback-Information**.

`components/visualizer/measureGlbBodyV507.ts` wertet `useGLTF`-Modelle per `WeakMap`/Skalierungsfaktor gecacht aus. Es werden lediglich Weltpositionen gelesen, keine Bones oder Meshes verändert. `components/visualizer/avatarBodyAwarenessV507.ts` ist ein unabhängiger deterministischer Rechenkern mit endlichen Grenzwerten, plausibilisierten Knochenabständen und einem kleinen **stage-lokalen Registry** (maximal vier Slots).

Die jeweiligen `GltfAvatar`-Instanzen publizieren das Ergebnis bei Modell-/Scale-Wechsel über den `AvatarBodyContextV507` und entfernen es beim Unmount (Identitäts-Guard gegen alte Cleanup-Aufrufe). Duo und 3-/4er-Bühne besitzen jeweils **eigene** Registries; es gibt keinen globalen Modell- oder Personendatenspeicher und keine zusätzliche Dauerabfrage. Bei prozeduralen, unvollständigen oder ungültigen Modellen bleibt das V506-Fallback wirksam.

In `components/visualizer/DanceFormationActorsV492.tsx` und `components/visualizer/GroupDancersV326SceneV492.tsx` werden ausschließlich die V506-Parameter `torsoRadii` und `armReaches` aus den Messungen ersetzt. Die vorhandenen V506-Guards behalten alle Sicherheitsregeln: keine Duo-Root-Bewegungen, manuelle Priorität, kein weiteres IK, keine Lyrics-/Lip-Sync-Änderungen, keine neuen Gesten und Tiefenausweichbewegungen nur bei V494-Fußkontaktfreigabe und geeigneter Qualitätsstufe.

## Grenzen

Die Daten stammen aus der *Restpose* und können bei schlecht benannten oder unvollständigen GLB-Rigs fehlen. Mesh-Bounds können durch Jacken, Haare, Instrumente oder ausladende Accessoires beeinflusst sein. Messwerte werden daher in einen **konservativen V506-Sicherheitsbereich** eingepasst (Torso-Radius 0,30–0,58 Bühnen-Einheiten; Armreichweiten-Zuschlag 0,085–0,19). Die Rechenwerte sind keine garantierten anatomischen Längen, auch kein Ersatz für Laufzeit-Skinned-Mesh-/Hand-/Arm-Kollisionserkennung. Eine echte visuelle Prüfung mit unterschiedlichen GLB-Dateien bleibt erforderlich.

## Prüfungen

`npm run test:v507 && npm run test:v507:types && npm run check:syntax && npm run check:architecture`

Der V507-Regressionstest umfasst 30.000 deterministische Profile, ungültige und unvollständige Bones, Skalierung, Registry-Wechsel/Cleanup, unveränderte Prioritäten sowie die tatsächlichen Verbindungen der GLB-, Duo- und Gruppen-Wege. Die bestehenden V506-Tests und die älteren Versionsregressionen sollen weiter unverändert bestehen. Vollständiger `npm run build` erfordert die auf der Entwicklerseite installierten npm-Abhängigkeiten.
