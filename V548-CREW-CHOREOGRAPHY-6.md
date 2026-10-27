# V548 – Multi-Avatar Crew Choreography 6.0

## Enthalten

- **Bühnenrollen:** Lead, Feature, Backing und Dancer anhand bestätigter Vocal-Timeline-Segmente oder einer explizit **rein visuellen** automatischen Gruppenformation; keine neue automatische Singer-Erkennung.
- **Selektive Hooks aus V547:** Für `singerSlotsV547=[0,2]` bleiben nur die beiden aufgeführten Avatare Vocal-Performer. Slot 1/3 werden Backing- bzw. Dance-Rollen. Historische V517-Group-Hook-Limits werden für diese neue Gestenebene nicht vorausgesetzt.
- **Phrasenversatz und Variationen:** Individuelle Gestenzyklen, kleine Blick- und Schulterreaktionen. Unveränderte AnimationMixer, Clips, Root-Koordinaten und Foot-IK.
- **Audio-Groove:** Gruppen-Slots modulieren nur vorhandene Beat-/Kick-Stärken im engen Bereich 0,90–1,08, bei aktiviertem Foot-Lock gar nicht. Ein stiller Frame bleibt still; es werden keine Beats erzeugt.
- **Sicherheit:** Manual Stage, eigene Choreografie, Reduced Motion, Low-Tier, Track-Mismatch, ungültige oder abgelaufene Cues und die V506/V508-Kollisionsrisiken bleiben maßgeblich.
- **Duo:** kleine rollenabhängige Gesten über dieselben bestehenden Partner-Kontexte; kein zusätzlicher Root-/Audio-Algorithmus.

## Technisch

Dateien: `components/visualizer/crewChoreographyV548.ts`, `GroupDancersV326SceneV492.tsx`, `DanceFormationActorsV492.tsx`.

Test: `npm run test:v548 && npm run test:v548:types && npm run check:syntax && npm run check:architecture` oder `npm run verify:v548`.

**Grenzen:** Die aktuelle Bühnen-Gruppenansicht unterstützt zwei bis vier gleichzeitig sichtbare Slots; die fünf gespeicherten GLBs sind weiterhin einzeln auswählbar. Es sind additive Motion-Akzente, kein neu erzeugter Motion-Capture-Clip und keine Zusage zu messbar natürlicheren Tänzen. Ohne lokale npm-Abhängigkeiten ist kein vollständiger Next.js-/WebGL-Build ausführbar. Browser- und Raspberry-Pi-Sichtprüfung bleiben ausständig.
