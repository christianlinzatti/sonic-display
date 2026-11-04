# Sonic Display V484 – Expressive Dance Performance 4.0

**Basis:** V483. **Paket:** `0.1.0-v484`. **Datum:** 23.10.2026.

## Neue Funktionen

- `components/visualizer/expressiveLowPosePerformanceV484.ts`: einfacher deterministischer, begrenzter zusätzlicher Ganzkörper-Akzentplan **nach** den bereits sicheren V481/V483-Posenentscheidungen.
- **Deutschrap:** asynchrone, linke/rechte Armreaktionen für Hock- und Low-Bounce-Posen; Lead bleibt bei stehender Pose zurückhaltend. Keine automatische Erkennung realer Rap-Punchlines, Feature-Sänger oder Ad-lib-Zeitstempel.
- **Hardstyle / Hardtekk:** kleinere gemeinsame Drop-Akzente bei vorhandener Beat-/Kick-Evidenz. Nur mit aktivierter automatischer Dreier-/Vierer-Formation.
- **Hock-Arm-Balance:** prozeduraler Avatar dreht seine bereits existierenden Arme beim Tiefgehen leicht nach vorne (höchstens 0,11 rad) – ohne Fuß-IK oder Bodenhöhe anzufassen.
- **Qualitätsprofile:** Bei `balanced` und `low` werden die optionalen Gesten reduziert. Kein neuer Timer, keine neue Audioanalyse, keine GPU-Objekte, keine neuen GLB-Clips oder Bone-Retargeting.
- **Manuell hat Vorrang:** keine zusätzlichen Akzente bei manuellen Motion-/Vocal-Zuordnungen, Pause, Seek vor Cue-Beginn, `reducedMotion`, Lyrics-Vordergrund oder fehlenden verlässlichen Werten. Bestehende V452-Clamps begrenzen die Summe aller Gesten.

## Nutzung

Im Multi-Avatar Stage Studio die bestehenden **Low-Pose-Choreografie**-Einstellungen aktivieren. Für die neue automatische Performance sind keine weiteren Einstellungen erforderlich. Bei GLB-Avataren funktionieren Hockposen weiterhin nur mit passend benannten **realen** importierten Squat-/Crouch-/Kneel-Animationsclips. GLB-Face-Rig, Dance-Mixer und Clip-Keyframes werden nicht ersetzt.

## Prüfen

```powershell
npm install
npm run test:v484
npm run test:v484:types
npm run build
```

Der V484-Test prüft begrenzte Arme/Schultern, Rap- und Drop-Varianten, Pausen und manuelle Vorrangregeln, Seek-Verhalten, Profil-Abstufung, Determinismus sowie eine simulierte 33-Minuten-Wiedergabe. Ältere Tests und `npm run build:preflight` prüfen weitere Vertragsgrenzen. Der Produktions-Build und das Verhalten konkreter GLBs müssen mit installierten npm-Abhängigkeiten bzw. auf echter Hardware bestätigt werden.
