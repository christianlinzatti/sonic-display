# Sonic Display V506 – Realistic Multi-Avatar Collision Avoidance

## Ziel und Grenzen

V506 verhindert keine geometrisch vollständigen Kollisionen sämtlicher GLB-Meshes und animierter Arme: In dieser Projektversion gibt es weder für alle installierten GLBs kalibrierte Schulterbreiten noch laufend abgetastete Skinned-Mesh-Bounds. Stattdessen berechnet V506 **konservative horizontale Torso- und Armreichweiten-Zonen** und prognostiziert den minimalen Abstand zweier gleichzeitig bewegter Bühnen-Roots. Die Lösung soll riskante automatische Animationen deutlich beruhigen und kleine Formationskonflikte ohne neue Render-Schleifen vermeiden.

## Neu

1. `components/visualizer/multiAvatarCollisionAvoidanceV506.ts` – reiner deterministischer O(n²)-Planer für 2–4 Avatare. `sweptDistanceV506` prüft den kleinsten X/Z-Abstand **während** der synchronen Annäherung an die nächsten Bühnenziele. Ausgangs- und Zielposition können einzeln weit auseinanderliegen, obwohl sich die Wege kreuzen.
2. **Konservative Hüllkörper:** Standard-Torso-Radius 0,42 Bühnen-Einheiten pro Avatar, optional skalierbar auf 0,30–0,58 nach vorhandener Kalibrierung. Der Planer bezieht bei automatisch erzeugten Gesten eine kleine zusätzliche Armreichweite ein; das ist keine Mesh-/Handgeometrie und keine Messung der tatsächlichen Animation.
3. **Vorhersagende Sicherheit:** Bei riskanten Begegnungen werden kleine automatische Gesten, Formations-Yaw und Root-Akzente kontinuierlich reduziert; es gibt keine neuen Zwangsbewegungen oder Neuzuordnung von Sängerrollen.
4. **Kleine Z-Ausweichabsicht nur bei Auto-Gruppen:** V506 bewertet zunächst, ob ein sehr kleiner Tiefenversatz den vorhergesagten kleinsten Paarabstand tatsächlich vergrößert. Selbst dann gilt der bisherige `V494`-Fußkontakt-Guard: gepflanzte Füße, gesperrte Hock-/Aufstehphase und zu große Bodendrift erlauben keine Ausweichbewegung. Für den „low“-Tier bleibt die Root-Korrektur vollständig deaktiviert.
5. **V505-Integration:** Bei einer starken Gefährdung ersetzt V506 eine möglicherweise ungünstige V505-Mikrostaffelung, statt unkontrolliert mehrere Root-Offsets zu addieren. Wo keine starke Gefährdung besteht, gilt weiterhin die bisherige V505-Staffelung.
6. **Duo-Integration:** Der bestehende 2er-Bühnenweg schwächt bei tatsächlicher enger Nähe nur optionale obere Körpergesten ab, niemals Roots oder den V145-Handkontakt. Die V505-Blickregie bleibt unverändert.

## Sicherheit

- In V326 manuell positionierten Formationen oder bei Choreografie-/V385-Sänger-Overrides sind sämtliche V506-Änderungen deaktiviert; importierte Motion-Clips, Knochen-IK, Phoneme, Mouth-Morphs und GLB-Modelle bleiben unangetastet.
- Pause und Reduced Motion deaktivieren die V506-Pläne. Kleine Ausweichmaßnahmen auf Low-Tier sind aus, die Kollisionswahrnehmung darf weiterhin die optionalen automatischen Gesten reduzieren.
- Der Planer darf niemals eine Verschiebung freigeben, die den prognostizierten **swept path clearance** verschlechtert. Er entscheidet jedoch **nicht** über den tatsächlichen vollständigen Mesh-Kontakt oder dynamische Arm-Bone-Pfade.
- Wenn die Beine nicht freigegeben sind, bleibt die Körperposition unangetastet und automatische Gestik wird stattdessen gedämpft. Es gibt keine versteckten Pose- oder Skelettänderungen.

## Tests

`npm run test:v506 && npm run test:v506:types && npm run check:syntax && npm run check:architecture`

Der Regressionstest prüft zusätzlich 28.000 deterministische Durchläufe mit 2–4 Schauspielern, 3D-Positionsdaten, Szenen-Seek, Kreuzungswegen, niedriger Qualität, Custom-Avatar-Radien, manueller Priorität, V494-Guard sowie Integration in beide existierenden Render-Pfade.

**Offen:** Vollständiger Next.js-/React-Produktions-Build und visuelle Kollisionserprobung auf echten GLB-Modellen / Raspberry Pi erfordern eine lokale Installation der direkten npm-Abhängigkeiten. Mit `npm install && npm run build` prüfen. Echte Mesh-/Arm-/Handkollisionen und das saubere Ausweichen an Körperteilen sind Gegenstand einer späteren Geometrie-/IK-Stufe.
