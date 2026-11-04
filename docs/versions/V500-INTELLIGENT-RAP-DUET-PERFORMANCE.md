# Sonic Display V500 – Intelligent Rap Duet Performance

## Umsetzung

V500 integriert `components/visualizer/intelligentRapDuetPerformanceV500.ts` direkt in die bestehenden Duo- und 3-/4-Avatar-Rigs. Diese reine, zustandslose Funktion verwendet **ausschließlich bereits explizit vom Benutzer gesetzte V416- oder V496-Sängerrollen** für den **tatsächlich laufenden Spotify-Track**. Sie erkennt **weder reale Stimmen noch Sprecherwechsel automatisch**, analysiert keine Phoneme und verändert keinen Sänger oder Lip-Sync-Cue.

### Optische Inszenierung

- **Solo:** Sänger richtet sich weiterhin zum Publikum. Zuhörende Avatare werfen dezente Blicke zum Sänger und setzen zurückhaltende, zeitversetzte Rap-Reaktionen.
- **Call-and-Response:** Nur wenn der V416-Editor einen tatsächlichen Reply und `handoffFrom` markiert, reagiert der zuvor aktive Bühnen-Sänger mit einem kurzen Blick zum neuen Lead. Die optische Szene gilt nicht als automatische Singer-Diarization.
- **Duett:** Beide im Editor markierten Sänger erkennen einander in zeitlich kurzen Blicken an, ohne sich vollständig vom Publikum abzuwenden.
- **Hook:** Alle zugewiesenen Sänger folgen derselben dezenten Beat-Gestenphase und blicken nach vorn.
- **Übergänge:** Gesten und Blickbewegungen starten mit einer 270-ms-Smoothstep-Hüllkurve und laufen in den letzten 230 ms aus. Das Ergebnis ist vollständig deterministisch bei Seek, Pause, Trackwechsel und Wiedergabewiederholung.

### Schutzvorrang und Performance

V500 hat **keinen neuen `useFrame`, AnimationMixer, IK-, GLB-Bone-, Root- oder Audio-Worker-Pfad**. Es nutzt in `DanceFormationActorsV492.tsx` und `GroupDancersV326SceneV492.tsx` die bereits etablierten V144/V145-Partner-Kontexte und die sicheren V452-Bounded-Combiners. Die vorhandenen V385-Manual-Singer-Cues, benutzerdefinierte V325-/V326-Formationen, `avatarMotionMode='choreography'`, Pausen, reduzierte Bewegung, nicht zugehörige Songs und ungültige Positionen unterdrücken V500. Geringe Geräteleistung reduziert additive Gesten mittels vorhandener `getActivePerformanceTier()`-Einstufung, **ohne** die ursprünglichen Clips oder die Lip-Sync-Pose zu verändern.

Die Stärke folgt der bestehenden Einstellung `artistInteractionStrengthV444` (Standard bei fehlender Einstellung: 65). Eine neue lokale Speicherung oder Einstellungs-Migration ist nicht erforderlich.

### Tests

- `npm run test:v500`: deterministische Solo-/Reply-/Duett-/Hook-Posen; 2/3/4 Avatare; Lead/Guest-Blickrichtung; Track-Guards; manuelle Priorität; ungültige Eingaben; Lipsync-Integration über Quell-Anbindung; Signalgrenzen; Laufzeitsampling von 30 Minuten.
- `npm run test:v500:types`: isolierter TypeScript-Kerntest.
- `npm run check:syntax && npm run check:architecture` und V499/V498/V497/V496-Regressionsketten.

**Begrenzungen:** Für einen echten, optisch bestätigten Live-Test sind das reale GLB-/FBX-Avatar-Skelett, Musikabspielzeiten und das Zielgerät erforderlich. Die 30-Minuten-Simulation überprüft nur die reine Berechnung. Ein vollständiges `next build` setzt installierte Projekt-Abhängigkeiten voraus.
