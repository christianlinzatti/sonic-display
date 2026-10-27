# Sonic Display V493 – Intelligent Motion Preset Director

V493 baut auf dem vollständigen V492-GLB-Hook- und Object3D-Hotfix auf.

- Musikphasenabhängige Auswahl gespeicherter GLB-Arm-/Brust-Blends (Verse, Hook, Drop, Break).
- BPM, Energie und Tänzer-Slot beeinflussen die deterministische Auswahl; unterschiedliche Slots können unterschiedliche Kombinationen erhalten.
- Mindestens 10 Sekunden Wechselabstand, Entscheidungen in 16-Sekunden-Phrasen.
- Bei Songwechsel, Rückwärtssprung, Pause, reduzierter Bewegung, niedrigem Qualitätsprofil und manuellem Override keine veralteten Presets.
- Nur bereits validierte und zum Modell/Animationsclip gehörige V492-Presets werden verwendet. Basistanz, IK, Head und Face bleiben bei der vorhandenen Animation.
- Ein Mixer: Wechsel zwischen Presets erfolgt durch sanftes Ausblenden des alten und Einblenden des neuen Overlays.
- V273/V318: Testverträge erlauben die erhaltene V437-Rap-Hook-Fallback-Form der Section-Erkennung. Keine Änderung am Produktivcode `VisualizerStage.tsx`.

## Verifikation

`npm run test:v493`, `npm run test:v493:types`, `npm run test:v492`, `npm run check:syntax`, `npm run check:architecture`. Vollständiger Next.js-Build auf einem Rechner mit installierten npm-Abhängigkeiten.
