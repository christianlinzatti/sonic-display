# V638 – Advanced Ensemble Choreography

## Zweck
Eine professionelle Mehr-Avatar-Show braucht nicht bloß dieselben Tanzclips bei allen Performern. Diese Version ergänzt die bereits vorhandene V495/V509/V517/V527/V539/V548-Choreografieregie um **langsame, musikalisch phasierte Gegenbewegungen und kontrollierte Formationstiefe**. Sie erzeugt weder neue GLB-Animationsclips noch behauptet sie, Sänger automatisch zu erkennen.

## Umsetzung im Live-Renderer
- `components/visualizer/advancedEnsembleChoreographyV638.ts`: reine, deterministische Planung aus dem **bereits aktivierten V517-Plan**, Genre, Song-Zeit, BPM, 2–4 realen Bühnenpositionen und den vorhandenen V506/V508-Risikowerten.
- `GroupDancersV326SceneV492.tsx`: Integration in die bereits bestehende `useFrame`-Regie; nach V548 und vor der bestehenden letzten Kollisions-Dämpfung werden Lead-, Support- und Ensemble-Gesten über V452 hinzugefügt.
- `DanceFormationActorsV492.tsx`: im editorseitig bestätigten Duo (V385/V416/V496) kleine versetzte Gegenbewegungen. Dabei werden **keine** Root-Positionen und keinerlei Vocal-/Lip-Sync-Rollen geändert.
- Der Begriff „Formation“ bedeutet in diesem Release eine **kleine versetzte Z-Tiefenstaffelung** unter Beibehaltung aller X-Lanes, nicht eine großräumige neue Bühne oder autonome Navigation. Die V494-Kontaktprüfung lässt nur wenige Millimeter bis höchstens 1,4 cm Zusatzversatz zu; bei gesperrten Füßen, unbekannter Kontaktlage, niedrigem Tier, handgeschriebener Choreografie oder Kollisionsgefahr gibt es **keine** Zusatzfahrt.

## Sicherheits- und Evidenzregeln
V638 wird nur aktiv, wenn das gesamte V517-Eingangssignal aktiv und zeit-/track-konsistent ist. Das heißt:
1. **Automatische 3/4-Personengruppe:** V495 muss bereits eine passende echte Bühnenformation liefern. Ihr Lead ist nur ein visueller Fokus, niemals eine identifizierte Gesangsstimme. Kein Vocal-Cue wird erfunden.
2. **Editorbestätigtes Duo oder Vocal-Ensemble:** `cueTrackId` muss zu `trackId` passen. Authored-Singer-Kandidaten bekommen niemals zusätzlichen Wurzel-/Tiefenversatz oder neue Gesangszuweisungen.
3. **Unterdrückung:** reduzierte Bewegung, Pause, Low-Tier, `manualPriority`, ungültige Positions-/Zeit-/Energiewerte, nicht korrespondierende Uhren, Fußkontakt und Kollisionsrisiken.
4. **Musikalische Phasen:** langsame, deterministische Gegenbewegungen; Haken-/Hook-Gruppen wechseln zwischen seitlich versetzter Betonung und unisono Phrasen. Die Wahl ist reproduzierbar nach Seek und behauptet keine bisher unbekannten Songabschnitte.
5. **Blickkontakt:** nur sehr geringe Verstärkung einer **schon vom V517-Plan genehmigten** Blickrichtung, niemals neues Blickziel.

Die bisherigen GLB-Clips und Motion Library, Lippen- und Gesichtsanimationen, V494-Fuß-IK, V506/V508-Kollisionskontrolle, alle Keyframes sowie V452-Limits bleiben maßgeblich. Es werden keine GPU-Meshes, keine Renderloops und keine Netzwerkverbindungen erzeugt.

## Prüfung
- `npm run test:v638` (gezielte Regressions- und Simulationstests)
- `npm run test:v638:types` (scoped TypeScript ohne Abhängigkeiten)
- `npm run test:smoke:v638` (Kette bis V616 + Syntax/Architektur)
- `npm run verify:v638` (jüngere und spezifische Ensembleschutz-Regressionen)

**Offen:** vollständiger Next.js-Produktionsbuild, visuelle Abnahme mit echten GLB-Avataren, Vergleiche mehrminütiger Deutschrap- und Hardtekk-Songs und Benchmarks auf vorhandener Hardware. Der Nutzer besitzt noch keinen Raspberry Pi; Hardwareoptimierung darf nicht als real vermessen gelten.
