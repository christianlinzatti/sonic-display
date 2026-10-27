# Sonic Display V602 – Real Raspberry Pi Concert Optimization 6.0

## Ziel
V602 ergänzt die **vorhandene** V479-Pi-FPS/p95-Hysterese um eine reine visuelle Budgetschicht. Sie sorgt bei gemessener, anhaltender Bildlast und bei drei oder vier GLB-Avataren für weniger GPU-Overdraw und niedrigere Renderauflösung, ohne die in V600 zusammenhängende Konzertregie, die V597-Lippensynchronität oder die V598-Lyrics-Synchronisation zu verändern.

## Tatsächliche Integration

- `components/visualizer/piConcertOptimizationV602.ts`: rein deterministische Policy. Bei ausgeschalteter Pi-Optimierung oder manuellem Renderprofil exakt passiv. Bei Pi **balanced** und >=3 Avataren begrenzt sie **Auto-DPR** auf 1,05 und reduziert ausschließlich die V601-Dekoration. Bei **eco** begrenzt sie Auto-DPR auf 0,8, dimmt Wand/Gobo/Nebel stärker und entfernt die zusätzliche, nicht schattenwerfende V601-Schwenkleuchte. Der begrenzte LED-/Gobo-Effekt bleibt erhalten und die Hook-FX-Regie setzt weiterhin nur bestehende Regiehinweise um.
- `components/visualizer/adaptivePerformance.tsx`: übernimmt die V602-DPR-Obergrenze in alle drei existierenden DPR-Pfade (Initialisierung, V355/V388-Display-/Stabilitätsänderung, adaptive Tieränderung). Reagiert auf Pi-Level-Wechsel aus dem vorhandenen `usePiConcertBudgetV479`; **keine** neue FPS-Abtastung, kein zweiter RAF, kein GPU-Timer. Hysterese und Cooldown bleiben exakt bei V479 (5 belastete Messfenster, 18 gute Messfenster, 30 s Cooldown; explizites Pi-Low bleibt stabil). Manuelle Qualität `high/balanced/low` umgeht die automatische DPR-Grenze.
- `components/visualizer/ConcertDetailStageV555.tsx`: legt die V602-Policy auf das V601-Effekt-Cue, nutzt dazu denselben bestehenden `useFrame` und die bereits vorhandenen drei ShaderMaterial-Pässe. Keine neuen Meshes, Texturen, Lichtpässe, Animationsloops oder Netzwerkanfragen. Erstellt keine Songstruktur- oder Sängererkennung.
- `components/visualizer/ThreeAvatar.tsx`: übergibt die echte 1–4-Avatar-Anzahl an die FX-Bühne. Bereits vorhandene manuelle Licht-Timelines haben Priorität; `reactive=false` behält seine bisherigen statischen Dekorationen.

## Schutzgrenzen

Keine Änderungen am Spotify-Transport, den Wortzeitstempeln, Projektionstext, GLB-Clips, Fuß-IK, V599-Sängerzuordnung, V600-Vollsong-Spannungsbogen oder vorhandenen ausgeschalteten Effekten. Bestehende off/low/balanced/high-Regler bleiben erhalten. Das Ausblenden zusätzlicher, automatisch erzeugter V601-Lichtakzente bei Pi eco wirkt **nicht** auf manuell angelegte Licht-Timelines.

## Nachvollziehbarkeit und Messgrenzen

- V479 verwendet **Browser-Framezeiten** aus echten Renderfenstern; dies ist kein direkter GPU-Auslastungs- oder Temperatur-Sensor.
- V602 bietet nur einen Policy-Cap, **keinen nachgewiesenen FPS-Gewinn**. Der reale Gewinn hängt von GLBs, GPU, Auflösung und der jeweiligen Bühnenlast ab. Die DPR-Senkung kann Schärfe reduzieren.
- Für messbare Ergebnisse benötigt man echte Raspberry-Pi-Messungen mit zwei reproduzierbaren Läufen desselben Songs, nach Möglichkeit über `benchmark:v592:live` und `benchmark:v594:compare`; wichtig sind FPS/p95, Renderauflösung, Draw Calls, GLB-Zahl, Thermik und Langzeittest. Temperatur wird nicht stillschweigend aus Browser-FPS abgeleitet.
- Keine Audio-/Kameradaten oder Spotify-Token werden von V602 versendet.

## Prüfung

```bash
npm run test:v602
npm run test:v602:types
npm run test:smoke:v602
npm run verify:v602
```

Der vollständige Next.js-Build, reale WebGL-Darstellung, visuelle Qualitätsbeurteilung und Raspberry-Pi-Messung sind getrennte, hier nicht belegte Tests.
