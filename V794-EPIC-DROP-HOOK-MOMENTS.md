# V794 – Epic Drop & Hook Moments

**Basis:** V793. V794 inszeniert verifizierte Hooks und Drops mit einem klaren Spannungsbogen, ohne zufällige Beats, Stroboskop oder harte Blackouts zu erzeugen.

## Implementierung

- **Build:** Kontinuierlicher Anstieg ausschließlich vor einer unmittelbar folgenden, bestätigten Hook-/Drop-Szene.
- **Suspend:** In den letzten 720 ms wird die automatische Lichtkulisse kurz und weich abgedunkelt – kein vollständiger Blackout.
- **Impact:** Die Intensität steigt über ca. 420 ms an. Der eine V790-Haupthöhepunkt ist stärker als eine unterstützende Hook.
- **Release:** Ein natürlicher Ausklang innerhalb von maximal 4,3 Sekunden, statt Dauerfeuer während der gesamten Hook.
- **Variationen:** Wiederholte Neben-Hooks bekommen einen anderen Intensitätsverlauf.

## Integration und Sicherheit

`components/visualizer/epicPeakMomentsV794.ts` nutzt ausschließlich den bestätigten V790-Szenenplan und die tatsächliche Wiedergabeposition. `VisualizerStage.tsx` ergänzt begrenzte Auto-Gains für Tanz/Kamera/Licht; die V670-Schutzlogik wird anschließend wie bisher angewendet. Die neue V794-Cue wird über `ThreeAvatar.tsx` zur `DynamicStage.tsx` weitergereicht. Dort werden tatsächliche gespeicherte Licht-Timelines, Track-ID, Blackouts, Pause, Reduced Motion und Performance-Tier geprüft.

Das visuelle Highlight verwendet das existierende Spotlight und die Instanzfarben der V789-Lichtarchitektur (maximal 10 Updates pro Sekunde). Es werden keine zusätzlichen Lampen, Schattenkarten, Shader-Pässe oder Animations-Timer erzeugt. Bei geschützten Lyrics oder Sängerfokus bleibt der zusätzliche Spotlight-Akzent aus; dezente Hintergrundakzente sind weiterhin möglich.

**Hinweis:** Die Zeitfenster werden relativ zu *bereits bestätigten* Szenengrenzen gestaltet. V794 erkennt keine neuen Songteile und ist nicht beat-genau ohne bestätigte Songdaten. Ein manueller Show-Timeline-Blackout wird niemals überschrieben.

## Prüfen

`npm run test:v794 && npm run test:v794:types && npm run check:syntax && npm run check:architecture && npm run test:module-case`

Zusätzlich lokal nach `npm ci`: `npm run typecheck && npm run build`, danach echte visuelle 3D- und FPS-Tests mit 1–4 GLBs und Lyrics durchführen.
