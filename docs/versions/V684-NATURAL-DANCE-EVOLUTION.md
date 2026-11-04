# V684 – Natural Dance Evolution

## Was neu ist

V684 nutzt **vorhandene** automatische GLB-Bewegungswerte. Es werden weder Animationen
neu erstellt noch bestehende GLB-Clipdaten, Imported Motions oder Sängerzuordnungen umgeschrieben.

- **Rap / Deutschrap:** kleine, versetzte Links-/Rechts-Arm-Akzente auf **bereits** aktiver
  automatischer Armbewegung; langsame Variation über ca. acht Sekunden.
- **Hardstyle / Hardtekk / Hardcore:** engerer, gleichmäßigerer Akzentverlauf mit ca.
  6,4 Sekunden Dauer; keine angeblich aus Spotify erkannte musikalische Phrase.
- **Andere Genres:** neutrale, zurückhaltende Variationen.
- **Automatisches Ensemble mit 3/4 Tänzern:** pro Performer unterschiedlich phasierte
  Dämpfung bestehender automatisch erzeugter Schritte. Aufgesetzte Füße behalten
  die originale Null-Schritt-Anforderung. Unbekannte Kontakte werden nicht erfunden.
- **Besseres Bodengefühl:** bei validiert beidseitig aufgesetzten Füßen werden bereits
  vorhandene Hip-/Weight-Shift-Overlays sofort weiter reduziert. Die eigentliche
  Fußposition bleibt beim vorhandenen Foot-IK-System.

## Vorrang und Grenzen

Die GLB-Verfeinerung läuft nur bei automatisch spielenden Clips, aktivem Track,
bekanntem Foot-IK-Status, nicht reduzierter Bewegung und geeigneter Qualitätsstufe.
Sie verändert weder GLB-Motion-Mixer, originale Clips, Root-Positionen, Kameras, Lyrics,
Lip-Sync noch manuell ausgewählte Choreografien. Die Gruppenverfeinerung kann nur
bestehende V524/V587/V596-Schritte abschwächen; sie erzeugt keine neuen Schritte,
Kontakte oder Szenenschnitte.

V684 ist **keine neue Physiksimulation** und besitzt keine KI-Bewegungserkennung.
Die Animation muss weiterhin auf der tatsächlichen GLB-Vorschau geprüft werden,
insbesondere bei Modellen mit unbekannten Rig-Proportionen.

## Integration

- `components/visualizer/naturalDanceEvolutionV684.ts` – pure, deterministische Algorithmen.
- `GltfDancerAvatarV492.tsx` – nach V666 und vor dem bestehenden Rig-/Foot-IK-Pfad.
- `GroupDancersV326SceneV492.tsx` – nach V524/V587/V596 vor V487/V494.

## Tests

`npm run test:v684` prüft die Funktionen inklusive simulierten Zeitpunkten;
`npm run test:v684:types` führt die isolierte strenge TypeScript-Prüfung aus;
`npm run test:quick` enthält weiterhin alle aktuellen Pflicht-Regressionen.
Mit installierten npm-Abhängigkeiten `npm run build` auf der Zielmaschine ausführen.
