# Sonic Display V895 – AI Concert Director 3.0

**Funktion:** Eine zusammenhängende, bewusst begrenzte Konzertregie auf Basis der *bestätigten* V604-/V885-Szenen. Die Bezeichnung „AI“ steht in V895 für einen **regelbasierten, deterministischen Show-Planer**, nicht für eine LLM-Anbindung, Vocal-Separation oder automatische Künstlererkennung. Eine solche Analyse wird weder behauptet noch simuliert.

## Die fünf Konzert-Schwerpunkte

| Fokus | Auslöser (nur bestätigte Abschnitte) | Ziel |
|---|---|---|
| Bühnenaufbau | Intro / Build | LED-Wall und Bühne hervorheben, Tanz zurücknehmen |
| Künstlerfokus | erste Verse / bestätigter Portrait-Part | Ruhigere Kamera, Sänger vor LED-Wall |
| Lyrics & Ruhe | zweite Verse / Break / Outro | Bühne und LED zurücknehmen, Text priorisieren |
| Ensemble | Hook | Gruppenwirkung, Tänzer und Bühne subtil verstärken |
| Show-Höhepunkt | Drop / Finale | Bestehende LED-/Bühnen-Effekte gezielt verstärken |

Die Fokuszuordnung während einzelner Verse *ist keine Bestimmung des tatsächlich singenden/rappenden Künstlers*. Die 3D-Kamera kann weiterhin nur vorhandene, bestätigte Performer-Daten nutzen.

## Bedienung

**✦ LIVE FX → V895 AI Concert Director 3.0**. Wählbar sind *Cinematic*, *Ausgewogen* und *Festival*, eine Intensität von 0–100 % und getrennte Kanäle für Kamera, Tänzer, vorhandene Lichtkegel, LED-Wall und 3D-Bühne. Die Song-Partitur lässt sich als JSON exportieren. Einstellungen werden mit Fehlerbehandlung im lokalen Browser-Storage gespeichert.

## Implementierung

- `components/visualizer/aiConcertDirectorV895.ts`: Pure Szenenvalidierung, Fokusplanung, normierte Einstellungen, sanfter Zeitverlauf, begrenzte Multiplikatoren und Export.
- `components/visualizer/concertStageSyncV882.ts`: Trackgebundenes Signal mit Quellenprüfung und referenzstabilem Publish.
- `components/visualizer/LiveFxDeckV881.tsx`: Settings, Timeline-Vorschau und Export.
- `components/visualizer/DynamicStage.tsx`: Bereits aktive LED-Wall, Ring-/Beam-Akzente und V894-Architektur werden subtil skaliert.
- `components/visualizer/StageCameraDirectorV289.tsx`: Nur automatische Kamera-Easing-Rate, keine manuellen Kameras, Keyframes oder Shot-Ziele werden umgeschrieben.
- `components/visualizer/VisualizerStage.tsx`: Bestehende automatische Tanz-Akzente; vorgegebene Choreografie und manuelle Tanz-Editoren bleiben unverändert.

V895 aktiviert **keine** abgeschalteten Effekte und erzeugt **keine** neuen WebGL-Geometrien, Shader, Scheinwerfer, Hardware-Kommandos oder Netzwerkanfragen. Alle Multiplikatoren sind auf 0,75–1,12 begrenzt und am Szenenrand neutral. Pausen, Spulen, Blackouts, Reduced Motion, Low-Tier und manuelle Bearbeitung haben Vorrang. Bei fehlender bestätigter Timeline bleiben die bisherigen Systeme unverändert.

## Test und Start unter Windows

```powershell
npm ci
npm run test:v895
npm run verify:v895:focused
npm run typecheck
npm run build
npm run dev
```

Alternativ `powershell -ExecutionPolicy Bypass -File scripts/verify-v895-windows.ps1`. Die vollständige Freigabe erfordert die Installation aller npm-Abhängigkeiten und reale WebGL-/GLB-Durchläufe auf Zielhardware; siehe `V895-VERIFICATION.md`.
