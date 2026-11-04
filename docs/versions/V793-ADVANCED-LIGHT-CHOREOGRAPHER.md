# V793 – Advanced Light Choreographer

**Basis:** V792. Ziel ist eine hörbar/visuell ruhigere Lichtregie in Versen und eine kräftigere, aber kontrollierte Dynamik für Hooks, Builds und Drops. V793 verwendet dieselbe **bestätigte Song-Zeitachse** wie V604/V761/V790 und verändert die vorhandene Bühnenbeleuchtung; es erfindet keine Beats, Songabschnitte oder Sängerrollen.

## Integration

- `components/visualizer/advancedLightChoreographerV793.ts`: pure, deterministische Szenenplanung; prüft Track-ID, Dauer, aktuelle Position, bestätigten V604-Act, V761-Szene, Grenzen und Energiewerte. Liefert `portrait`, `fan`, `rise`, `cross`, `rest` oder `wave` sowie begrenzte Sweep-, Tilt- und Helligkeitswerte.
- `components/visualizer/DynamicStage.tsx`: animiert **das bereits vorhandene SpotLight** über ein schattenfreies Three.js-Target. Das Target ist kein zusätzlicher Scheinwerfer und benötigt keinen Draw Call. Der Gain wird **vor** der bestehenden Helligkeitsbegrenzung in das Ziel eingerechnet und akkumuliert nicht über Frames.
- `components/visualizer/ConcertArchitectureV789.tsx`: verwendet die vorhandenen 100-ms-Instanzfarbupdates für gekreuzte Wellen, Fächer, vertikalen Aufbau und ruhige Porträts in der bestehenden Bühnenarchitektur. Ein InstancedMesh, keine zusätzlichen Lampen, Texturen oder Render-Pässe.
- V791 übernimmt weiterhin die Licht-Überblendung an Szenengrenzen, der V761-Blend dämpft die neue Animation auf null. V792 und manuelle Kamera bleiben unberührt.

## Varianten

- **Deutschrap:** zurückhaltende Performer-/Portrait-Gesten im Verse; breitere Ensemble-Wellen bei Hooks.
- **Hardstyle/Hardtekk:** stärkeres (aber begrenztes) gekreuztes Muster bei tatsächlich bestätigtem Drop, Kick und Energie.
- **Rock/Metal/Industrial:** ausdrucksstarke, langsamere Arena-Sweeps.
- **Pop:** ruhigerer LED-/Architektur-Fächer und subtile Spotlight-Bewegung.
- **Break:** kein Spotlight-Sweep, bewusstes Zurücknehmen.

## Schutzregeln

- Manuelle Licht-Timelines, manuelle Bühnenlichtsteuerung, ausgeschaltete Showbeleuchtung, Blackout/Strobe, Pause, `reducedMotion`, fehlende bestätigte Szenen oder Low-Tier: V793 ist vollständig aus.
- Schutz für sichtbare Lyrics und Sängerfokus reduziert die automatische Bewegung deutlich. Bestehende V386/V497-Sänger-Spotlight-Zuweisungen haben Vorrang und unterdrücken die V793-Spotlight-Bewegung.
- `balanced` schränkt die Intensität ein. Kein neues Licht, keine Schattenkarte, kein Stroboskop, keine zusätzliche Render-Schleife, keine behauptete exakte BPM-/Beat-Synchronisation.
- Die vorhandenen automatischen Lichtpläne (V749/V762/V621) und V788-Performance-Grenzen bleiben maßgeblich.

**Grenze:** Es ist ein real ausgerichteter vorhandener Spotlight mit virtuell choreografierten Balken; nicht mehrere physikalisch simulierte Moving Heads. Um echte Lichtkegel/Beam-Geometrie im Raum hinzuzufügen, wären separate visuelle Geometrie und Performance-/Sichtbarkeitstests nötig.

## Prüfen

```sh
npm ci
npm run test:v793
npm run test:v793:types
npm run check:syntax
npm run check:architecture
npm run test:module-case
npm run typecheck
npm run build
```

Die reale Wirkung sollte mit 1–4 eigenen GLB-Avataren, aktivem Sängerwechsel, Lyrics, Hardtekk-Drop und Blackout in einem Browser bewertet werden. Insbesondere tatsächliches Framing, Leistung und Kontrast können nur im Renderer geprüft werden.
