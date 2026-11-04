# Sonic Display V654 – Intelligent Concert Flow

## Ziel

Eine zusammenhängende Show über den gesamten Titel, mit abgestimmten Übergängen zwischen Verse, Build, Hook, Drop und Break. Keine hektischen Kamerasprünge, zufällig erstellten Abschnitte oder Überdeckung der Lyrics.

## Umsetzung

- **Nachweisgebunden:** `planIntelligentConcertFlowV654()` aktiviert sich nur mit passender V600/V604-Analyse, bestätigtem Playback-Abschnitt und korrekter Track-ID. Ohne diese Signale bleibt V653/V604 unverändert.
- **Kameraregie:** V654 skaliert ausschließlich die bestehende, automatisch laufende R3F-Easingrate innerhalb eines verifizierten Acts. Manuelle Presets, gespeicherte Keyframes, Editor und explizite Cuts gewinnen. V351 bleibt der letzte Schutz für sichtbare Lyrics.
- **Licht und Tanz:** Bestehende V502/V604-Intensitätsmultiplikatoren werden minimal und begrenzt verändert. Vor und nach jedem Act ist die Zusatzintensität null. Lyric-Timing, Tanzclips und Lippensynchronisation bleiben unverändert.
- **Künstlerfotos:** V653/V652-Kuration und Bildlizenzen bleiben erhalten. Die vorhandenen V338/V348-Renderer zeigen höchstens so viele Fotos wie bisher und bewegen sie weniger. Bei Lyrics höchstens ein Foto. Manuelle V350-Cues bleiben unverändert.
- **Abwechslung:** Bereits valide V604-Motive differenzieren wiederholte Hooks, das Energiemodell unterscheidet Ruhemoment, Aufbau und Höhepunkt. Kein zusätzlicher globaler Zustand oder Renderloop.

## Technische Verknüpfung

`VisualizerStage` → `intelligentConcertFlowV654` → `concertDynamicsV654` / `VisualizerProps.concertFlowV654` → `ThreeAvatar` → `StageCameraDirectorV289`, `StageContentScreenV330` und `StageContentScreensV333`.

Zur Diagnose: `data-v654-flow`, `data-v654-act` und `data-v654-motif` auf dem Bühnencontainer.

## Prüfen

```powershell
npm run test:v654
npm run test:v654:types
npm run test:smoke:v654
npm run verify
```

`npm run verify` führt den Produktionsbuild und die historische Testsuite aus; ein grüner Test ohne installierte npm-Abhängigkeiten ist **keine** vollständige Build-Freigabe. Real-GLB-Browser- und Performanceprüfungen weiterhin separat.
