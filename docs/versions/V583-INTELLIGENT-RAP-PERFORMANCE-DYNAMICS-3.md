# Sonic Display V583 – Intelligent Rap Performance Dynamics 3.0

Stand: 26.10.2026. Vollständiger, direkt auf V582 aufgebauter Projektstand.

## Implementierung

- Eine rein funktionale dynamische Regie `components/visualizer/rapPerformanceDynamicsV583.ts` ergänzt bestehende V472-Gesangsakzente **nach** dem aktuellen V473-Flow-Hinweis und der V474-Motivwahl. Dadurch folgen *beide* Live-Renderpfade denselben verifizierten Lyrics-Zeitmarken.
- Für echte zeitmarkierte Wortdichte: `relaxed` für <=1,85 Wörter/s, `dense` für >=4 Wörter/s; ein Übergang wird **nur** bei zwei aufeinander folgenden Zeilen mit belegten, ausreichend dichten Wortdaten erkannt (bestehende V473-Regel). Ansonsten eine zurückhaltende `verse`-Variante. `hook` gilt nur mit vorhandener Section-Zuordnung; `adlib-text` nur bei ausdrücklich markierten Text-Kandidaten, nicht anhand isolierter Audio-Stimmen.
- Sanfter 260-ms-Phrasen-Ein-/Ausstieg und, bei nachgewiesenem Flow-Wechsel, 550-ms-Dynamik-Aufbau; sieben abwechslungsreiche, pro Track und Performer deterministische Mikrogesten ohne direkte Motivwiederholung in benachbarten Zeilen.
- `components/visualizer/useGltfVocalMotionV492.ts`: additive, stark begrenzte Kopf-/Brust-/Armgewichte, nachgeschaltet von V515 weich gefiltert; *keine* Transformation importierter Animations-Clips.
- `components/visualizer/ProceduralDancerAvatarV492.tsx`: derselbe Akzent vor V526; zusätzliche minimale, zielsynchronisierte Kopf-/Rumpfimpulse (je <=0,007 rad). Hüfte und Fuß-IK bleiben unberührt.
- Harte Schranken: kein Cue für Pause, `reducedMotion`, kein Rap, unbekannten Song, keine gültigen synchronisierten Lyrics, Hintergrundrollen, gespeicherte Choreografien oder Low-Performance-Tier. Kein erneutes Sprechererkennen, kein synthetischer Beat und keine Netzwerk-/GPU-Nebenarbeit.

## Prüfungen

```bash
npm run test:v583
npm run test:v583:types
npm run test:smoke:v583
npm run verify:v583
```

Bei vorhandenen npm-Abhängigkeiten auf Windows/Entwicklungs-PC zusätzlich `npm run typecheck` und `npm run build`. **Abnahmekriterium auf echtem Gerät:** denselben Track mit ruhiger Strophe, schnell wortmarkiertem Part, Hook und einem ausdrücklich markierten Adlib prüfen; feste Kamera, mindestens zwei zugewiesene Avatare und Playback-Seek verwenden. Die UI muss lesbare Lyrics beibehalten, hör-/sichtbarer Rollenwechsel darf nicht erfunden werden. Langzeit-FPS mit `npm run benchmark:v580:pi` separat messen. Ein mathematischer Offline-Test beweist keine Bildqualität.
