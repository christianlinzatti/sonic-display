# V807 – Natural Multi-Artist Stage Interaction

Die neue Version ergänzt den bereits existierenden 2er- und 3/4er-Avatar-Bühnenrenderer um kleine, reproduzierbare Blick- und Oberkörperakzente für eindeutig **manuell zugeordnete und synchronisierte** Sängerabschnitte. Sie erweitert vorhandene Systeme und führt keine zusätzliche Tanz-, Sänger- oder Gesichtsengine ein.

## Verhalten

- **Solo:** der bestätigte Hauptsänger betont seine Phrase; übrige Bühnen-Performer reagieren dezenter und blicken zeitweise in seine Richtung.
- **Duett:** zwei bestätigte Sänger erhalten verschiedene, zeitlich gestaffelte Akzente und kurze, räumlich begrenzte Blicke zum Partner.
- **Antwort/Handoff:** der explizit vorherige Sänger bekommt eine eigene, zurückhaltende Übergabereaktion.
- **Gemeinsame Hook:** nur wenn die vorhandene Vocal-Timeline alle Performer ausdrücklich zuordnet, wird ein gemeinsamer, leicht variierter Akzent geplant; Partnerblicke werden dabei vermieden.

Die Akzente hängen ausschließlich an bestätigten V416-/V496-Vocal-Cues und Songzeiten. Sie stammen **nicht** aus Spotify-Feature-Credits, der Trackbezeichnung, aus beliebigen Beat-Spitzen oder aus einer behaupteten Stimmenisolierung. Songwechsel, fehlerhafte Vocal-Slots, nicht verfügbare Bühnenpositionen und Pausen schalten den neuen Director aus. Es werden nur Bühnenwurzeln der tatsächlich gerenderten Künstler herangezogen.

## Integration und Schutz

`components/visualizer/naturalMultiArtistStageInteractionV807.ts` berechnet einen reinen Plan ohne Browser- oder GPU-Zugriffe. `DanceFormationActorsV492.tsx` und `GroupDancersV326SceneV492.tsx` mischen die dezenten Werte in ihre bestehenden V144/V145-Kontexte ein. Bestehende **manuelle Choreografien**, Formationstimelines, Gesichts-/Lippensynchronisierung, Fuß-IK und Grounding werden nicht verändert. Der Kollisionsschutz V506/V508 wird nach zusätzlichen Gesten erneut berücksichtigt.

Bei `Reduced Motion`, niedriger Leistungsstufe, pausierter Wiedergabe, nicht übereinstimmender Track-ID oder fehlender expliziter Sängerzuordnung erfolgt kein Eingriff. Keine neue `useFrame`-Schleife, kein AnimationMixer, keine Kamera und keine zusätzlichen WebGL-Ressourcen.

## Abgrenzungen

Die Regie erzeugt keine neuen GLB-Animationsclips, keine automatische Sängererkennung und keine zuverlässige psychologische Emotionserkennung. Für eine tatsächliche visuelle Qualitätsfreigabe müssen passende echte GLB-Avatare, Lyrics- und Vocal-Timelines sowie die fertige Bühne im Browser beurteilt werden.

## Prüfungen

`npm run test:v807`, `npm run test:v807:types`, relevante Interaktions- und aktuelle Versionsregressionen sowie `npm run check:syntax`, `npm run check:architecture` und `npm run test:module-case`. Ergebnisse und Grenzen in `V807-VERIFICATION.md`.
