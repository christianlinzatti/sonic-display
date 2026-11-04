# V795 – Dynamic Stage Evolution

Basis: Sonic Display V794. V795 entwickelt die vorhandene Bühnenarchitektur während eines bestätigten Songverlaufs sichtbar weiter.

## Umsetzung

- **Intimate / Verse:** Die V789-Lichtportale bleiben kompakter.
- **Build:** Seitenportale öffnen sich kontrolliert und die obere Traverse steigt leicht.
- **Hook:** Größerer Bühnenrahmen, dezente räumliche LED-Wand-Modulation.
- **Main Drop:** stärkster architektonischer Ausbau des Songs; Neben-Hooks bleiben bewusst kleiner.
- **Break:** ruhiger Rückzug auf die Grundbühne.
- **Finale:** Nur wenn V790 eine entsprechende bestätigte Schluss-Szene liefert, wird diese gemäßigt hervorgehoben.

Die Umsetzung verwendet **die bestehende V789-InstancedMesh-Lichtarchitektur**. An ihr werden Positionen der vorhandenen Balken weich verändert, maximal 20 Matrix-Uploads pro Sekunde; weiterhin ein einziger Batch, keine neuen Lampen, Schattenkarten oder zusätzlichen Render-Pässe. Die bestehende LED-Wand von V635 und vorhandene V622/V690-Farbflächen erhalten lediglich begrenzte additive Modulationswerte. V795 ersetzt weder die gewählte Bühne noch die vorhandene Szenenplanung.

## Regeln und Prioritäten

Der reine Szenenplaner `components/visualizer/dynamicStageEvolutionV795.ts` akzeptiert ausschließlich den bestätigten V790-Storyboard-Plan, den exakt dazugehörigen Szenen-Cue, Track-ID, Laufzeit und Wiedergabeposition. Pausen, unbekannte Abschnitte, falsche/alte Songdaten, invalide Werte, `reducedMotion` und Low-Tier deaktivieren den Ausbau. Der echte Renderer `DynamicStage.tsx` prüft zusätzlich die gespeicherte Licht-Timeline, manuelle Cues, Blackouts, die aktuelle Performance-Stufe, Wiedergabe und Bühne.

Für Lyrics, Sängerfokus sowie drei oder vier Avatare wird die Größe reduziert. V794 bleibt zuständig für Drop-/Hook-Lichtintensität; V795 steuert **Geometrie und visuelle Tiefe**, damit beide Effekte sich nicht gegenseitig hochregeln.

## Testhinweise

`npm run test:v795 && npm run test:v795:types && npm run check:syntax && npm run check:architecture && npm run test:module-case`

Zusätzlich nach vollständiger Installation der Abhängigkeiten: `npm ci && npm run typecheck && npm run build`. Danach echte visuelle Prüfung mit 1–4 GLBs, Galaxy, Festival, Rock und Cyberpunk, incl. Seek/Pause, Songwechsel, manueller Licht-Timeline, Blackout und Lyrics.
