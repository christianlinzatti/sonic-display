# Sonic Display V464 – Automatic Concert Experience 3.0

## Ziel

V456 hat eine gemeinsame Show-Regie für Rap-Szenen, Kamera, Lyrics-Budget, Licht und Tanz. V457 glättet Szenenübergänge; V460 koordiniert visuelle Feature-Antworten. V464 ergänzt eine **langfristige, deterministische Dramaturgie**, damit diese Effekte über den gesamten Song abwechslungsreicher und weniger aufdringlich wirken.

## Umsetzung

1. **`services/show/automaticConcertExperienceV464.ts`** liest die *bereits validierten* Phrasen aus `smartAutomaticRapShowV446.ts`. Vier **visuelle** Akte (`opening`, `development`, `climax`, `finale`) leiten sich aus dem relativen Abspielzeitpunkt ab. Diese Bezeichnungen sind **keine gemessene Musikstruktur** und identifizieren keine Sänger.
2. **Spannungsbogen:** Spätere, anhand wiederholter und zeitlich synchronisierter Lyrics vorsichtig abgeleitete Gruppen-Hooks dürfen etwas stärkere, aber begrenzte automatische Licht-/Gestenakzente erhalten. Ohne valide Gesamtdauer wird kein Finale behauptet. Die visuellen Akzente sind am Beginn und Ende einer Phrase sanft eingeblendet.
3. **Ruhigere Zwischenmomente:** In geeigneten längeren Verse-Abschnitten dämpft ein kurzer „Breathing“-Bereich zusätzliche automatische Akzente. Keine GLB-Clips werden angehalten, keine erstellten Choreografien ersetzt und keine Lippenbewegung verändert.
4. **Geteilte Steuerung:** `VisualizerStage.tsx` speist den bestehenden V457-Score und die V460-Feature-Direction in **einen gemeinsamen V464-Plan**. Dadurch verwenden automatische Licht-/Motion-Gewichtung, Feature-Gesten, Rapper-Sprechblasen, Spotlight und die bestehende V454-Kamera nach wie vor denselben Zeitplan. Kamera-Schusswahl und Künstler-Credits werden nicht künstlich übersteuert; V464 verändert nur Intensitätsmultiplikatoren und ein kleines additives Motion-Energiesignal.
5. **Sicherheitsgrenzen:** Keine Anwendung bei Pause, Reduced Motion, fehlender/ungültiger Song-Timeline, manuell abgeschalteter Show oder manueller Vocal-Regie. Kamerakeyframes behalten dieselbe Priorität wie in V456/V460. Die V451-Lyrics-Priorität dämpft die Showakzente, die vorhandenen High/Balanced/Low-Qualitätsstufen begrenzen sie zusätzlich. Die tatsächliche Live-Audioenergie wird nie abgesenkt.
6. **Raspberry Pi:** Nur eine kleine, reine Berechnung anhand der höchstens 63 bereits vorhandenen Phrasen. Keine neuen GPU-Lichter, WebGL-Canvas, Netzwerkaufrufe, Worker, Audiozugriffe, zusätzlichen React-States, Timer oder lokalen Konfigurationen.

## Grenzen

V464 erzeugt keine neuen Tanz-Clips, keine Sängeridentifikation, keine Phonem-Timestamps und keine neue Kamera-Rig-Technologie. „Spannungsbogen“ und „Hook“ sind heuristische visuelle Bühnenentscheidungen. Ein echter GLB-/Next.js-/Raspberry-Pi-Test wurde mangels installierter `node_modules` nicht durchgeführt; es liegen Logik- und Quelltext-Regressionstests vor. Keine FPS-Verbesserung wird versprochen.

## Lokale Prüfung

```powershell
npm install
npm run verify:v464
npm run typecheck
npm run build
```
