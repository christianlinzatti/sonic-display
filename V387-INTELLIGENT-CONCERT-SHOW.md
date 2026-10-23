# Sonic Display V387 – Intelligent Concert Show 2.0

## Implementierung
V387 erweitert V386 um **einen gemeinsamen, deterministischen Show-Cue** aus der vorhandenen Musikstruktur-Erkennung (Break, Build, Verse, Hook, Drop). Alle beteiligten Darstellungen erhalten denselben Cue. Die Erweiterung ist standardmäßig deaktiviert.

- `components/visualizer/concertShowDirectorV387.ts`: `advanceConcertShowV387` liefert gedeckelte Intensitäts-, Licht-, Lichtkegel-, Haze-, Kamera- und Tanzwerte. Die Übergänge erfolgen mit geglätteten Ein-/Ausblendungen. Songwechsel und Rückwärtssprünge setzen den Zustand zurück. Kein künstlich generierter Beat, keine separate Sprecher- oder Drop-Erkennung.
- `VisualizerStage.tsx`: führt den Show-Cue synchron zur bestehenden Musiktimeline fort und gibt ihn an die vorhandene R3F-Bühne weiter.
- `DynamicStage.tsx`: steuert vorhandene Lampen, statt neue Spotlights/Schatten zu erzeugen. Gespeicherte Licht-Timelines, Blackouts und Quality-Tiers behalten die Oberhand.
- `ConcertAtmosphereRendererV308.tsx`: dynamisch stärkere/sanftere **bereits vorhandene** Lichtkegel und Nebel-Ebenen, begrenzt durch Shader-Opacity und gerätespezifische Qualitätsstufen. Keine zusätzliche volumetrische Simulation.
- `StageCameraDirectorV289.tsx`: nur automatische Einstellungen und nur dann, wenn keine Authored Camera, kein Live-Edit und keine geschützte Lyrics-Komposition aktiv ist; verändert FOV/Distanz nur leicht.
- `ThreeAvatar.tsx`: sanfte Skalierung prozeduraler Tanzakzente über das bestehende Overlay – **keine Veränderung importierter GLB-Keyframes** oder Fuß-IK. Priorität für manuelle Choreografien.
- `SettingsPanel.tsx`: unter **Avatar & Tanz → V387 Intelligent Concert Show 2.0** auswählbare Modi `Aus`, `Ausgewogen`, `Festival`, Stärke sowie unabhängige Schalter für Kamera, Licht und Atmosphäre. Zurücksetzen berücksichtigt V387.

## Sicherheit und Grenzen
- `reducedMotion`, Pause, deaktivierter Modus oder 0 % Stärke deaktivieren die Zusatzregie.
- Realen Drops zugeordnete Akzente werden mit vorhandenem Kick-Signal betont, ein einzelner Kick wird niemals als Drop behauptet.
- Effektkorridore: Licht 0.88–1.25x, Lichtkegel max. 1.35x, Haze max. 1.28x, Tanz 0.9–1.13x, Kamera max. 16 % Abstandskorrektur; nachgelagerte GPU-/Stage-Budgets begrenzen weiter.
- Vorhandene Atmosphäre muss in den V308-Einstellungen eingeschaltet bleiben; V387 erzwingt keine neuen Effekte.
- Manuelle Kamera-Presets, Show-Timelines, Licht-Cues und Lyrics-Sicherheitszonen haben Vorrang.

## Verifikation
- `npm run test:v387`: Tempo-/Songwechsel, reale Drop-Gates, Grenzen, manuelle Eingriffe und Integration.
- `npm run verify:offline` prüft Syntax und bisherige Tests.
- `npm run verify` umfasst zusätzlich Dependency-Preflight, Typecheck und Next.js-Produktion. Hier fehlten 16/17 npm-Abhängigkeiten und ein Lockfile. **Ein erfolgreicher Production-Build wurde nicht behauptet.**

## Lokaler Start
```bash
npm install
npm run verify
npm run dev
```
