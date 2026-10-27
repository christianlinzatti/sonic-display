# V607 – Natural Multi-Artist Concert Interaction 5.0

**Grundlage:** V606 · **Datum:** 26.10.2026 · **Status:** implementiert, offline überprüft; visuelle GLB-/Spotify-Abnahme offen.

## Ziel

Sonic Display soll bei ausdrücklich zugewiesenen Deutschrap-Feature-Songs weniger wie eine Reihe unabhängiger Avatare wirken. Bei 2–4 Performern werden kurze Gesten und bereits bestehende Blickbewegungen aufeinander abgestimmt, statt die komplette Choreografie zu ersetzen. Die Konzertdramaturgie aus V604, Kamerakomposition aus V605/V606 und FX-Budget aus V601/V602 bleiben unverändert.

## Tatsächliche Integration

- Neu: `components/visualizer/naturalMultiArtistInteractionV607.ts`, mit `refineNaturalMultiArtistV607(...)` sowie `multiArtistEvidenceV607(...)` für eine überprüfbare, nur lesende Erläuterung der Cue-Herkunft.
- Pipeline: `V500 → V575 → V584 → V585 → V599 → V607`. Die letzte Stufe arbeitet ausschließlich mit denselben `RapDuetPlanV500`-Slots und wird in `components/visualizer/duetResponseV575.ts` ausgeführt. Der zentrale V500-Planer wird bereits von `DanceFormationActorsV492.tsx` (zwei Performer) und `GroupDancersV326SceneV492.tsx` (drei/vier Performer) verwendet.
- **Duett:** Zwei manuell zugewiesene und im Bühnenraum ausreichend getrennte Sänger erhalten zeitlich versetzte, kleine Schulter-/Arm-Akzente. Ist ein Partner-Blick bereits durch V500 korrekt vorbereitet, werden dessen Gewicht und Blickwinkel ganz leicht verstärkt. Ein neuer Blick zu einem unzugewiesenen Künstler wird nicht generiert.
- **Sängerwechsel:** V416s explizit vorgegebene In-Zeile-Antwort beginnt erst an der hinterlegten 62%-Schwelle; bei V496 beginnt sie direkt am gespeicherten Zeitsegment. Der bisherige Sänger reagiert kurz auf den neuen Lead. Ohne gesetzten `handoffFrom` wird keine ausgehende Stimme behauptet.
- **Zuhörer und Hooks:** Die Begleitfiguren bekommen unterschiedliche, deutlich schwächere Bewegungsakzente. Bei bestätigten Vollensemble-Hooks bleiben alle zum Publikum ausgerichtet, doch Arme, Timing und Ausdruck unterscheiden sich anhand eines stabilen Track-/Zeilen-/Slot-Motivs. Das ist keine neue Musikabschnittserkennung.
- **Alle Änderungen** sind reine additive Upper-Body-Overlays in bestehenden `LookAtCue`-/`PartnerGestureCue`-Werten. Nicht verändert werden `role`, echte Singer-Timestamps, `morphTargetInfluences`, GLB-Clips, Fuß-IK, Wurzelpositionen, Kamera, Lighting oder Lyrics.

## Sicherheit und Performance

- Cue muss zum laufenden Track gehören und innerhalb eines gültigen, vom Nutzer belegten V416-/V496-Intervalls liegen. Kein Erkennen von Sängern aus Lyrics, Audio, Spotify oder Genius.
- Deaktivierung bei Pause, manuell priorisierter Regie, Reduced Motion, Low-Tier oder ungültiger Sängerbesetzung. Partnerbewegungen nur in sicheren **0,85–6 m** Abstand.
- V452-Grenzen bleiben: `leftLift/rightLift ≤ 0.13`, `shoulder ≤ 0.065`, `intensity ≤ 0.28`, `lean ±0.028`, `look.weight ≤ 0.46`, `yaw ±0.42`, `eyeYaw ±0.11`. Die Grenzen sichern nur numerische Werte, nicht tatsächlich elegante Animation.
- Deterministisch relativ zur Songzeit; keine Timer, neuen `useFrame`-Callbacks, WebGL-Objekte, zusätzlichen AnimationMixer, neuen Renderpasses oder Dependencies. Bei Rückwärtssuche und Replay entsteht dieselbe gewählte Pose.

## Reproduzierbare Tests

```bash
npm run test:v607
npm run test:v607:types
npm run test:smoke:v607
npm run verify:v607
```

Testfälle: 2/3/4 Performer, bestätigter Sängerwechsel, V416 62%-Antwortgrenze, V496-Zeitsegment, Duettpartner-Blick, Gang/Timing-Unabhängigkeit, Gruppen-Hook-Varianten, ungültige oder doppelte Singer-Zuordnungen, manuelle Schutzregeln, Abstandsgrenzen, obere Amplitudenlimits, Trackwechsel, Seek/Replay, echte Integration über V500 und Quelle der Bühnen-Actors.

**Nicht verifiziert:** reale GLB-Gestenqualität, korrekter Blickpunkt an den tatsächlichen importierten Knochen, wahrnehmbar natürliches Feature-Singing, Spotify-Browserlauf, vollständiger Next.js-Build, mehrstündige Pi-Performance und FPS. Dafür sind V592-/V603-Liveaufnahmen und echte manuelle Sichttests notwendig.
