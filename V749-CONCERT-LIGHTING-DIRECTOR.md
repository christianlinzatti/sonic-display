# V749 – Concert Lighting Director

## Ziel

V749 verbindet die vorhandenen Bühnenlichter mit *geprüften* Sängerrollen, Songabschnitten und Kick-Signalen. Die Regie ist eine zusätzliche, begrenzte Schicht auf der schon bestehenden Lichtsteuerung (V462 → V542 → V551 → V608/V621) und verwendet ausschließlich die vorhandenen Key-/Fill-/Beam-Leuchten. Es entstehen keine neuen Renderobjekte, Spotlights, Schattenkarten, Timer, Lasereffekte oder Stroboskope.

## Funktion

- **Sängerporträt / Übergabe:** V551 prüft die Sängerrollen aus V528. Nur bei gültigen Slots darf V749 die vorhandene Key- oder Fill-Position als *Fallback* auf echte Avatar-Weltkoordinaten ausrichten. Schon gewählte V557-Porträtziele bleiben vorrangig.
- **Gruppen-Hook:** Bei einer Gruppe mit mindestens zwei Avataren werden Fill und Bühne dezent verstärkt. Es wird weder ein weiterer Sänger noch eine bestimmte Gesangsrolle erfunden.
- **Build-up:** Ein begrenzter, von tatsächlich vorliegenden Energiesignalen abhängiger Lichtaufbau.
- **Drop:** Nur wenn Kick und Energie die Mindestschwellen erreichen, wird der vorhandene Beam etwas kräftiger. Kein künstlicher Flash nur wegen einer `drop`-Markierung.
- **Lyrics:** Bei geschützter Lyrics-Anzeige werden Sweep und Beam weiter abgeschwächt, die Vordergrundbeleuchtung dagegen erhalten. Die strengeren bisherigen Regeln von V542/V551/V608 bleiben zusätzlich aktiv.
- **Manuelle Priorität:** Gespeicherte Light-Timelines, Blackouts, manuell deaktivierte Show-Beleuchtung, niedrige Leistungsstufe, Pause und Reduced Motion deaktivieren die automatische V749-Schicht. Bei Deaktivierung/Blackout werden ihre Anteile sofort auf neutral zurückgesetzt.
- **Übergänge:** Die vier Licht-Multiplikatoren werden sanft, ohne per-frame GPU-/JS-Allokationen in der V749-State-Funktion, an neue Cues angeglichen.

## Einstellungen

`Einstellungen → Dynamic Stage → V749 · Concert Lighting Director`

`avatarPerformanceLightingV749` wird wie andere UI-Präferenzen gespeichert. Optionen: Aktivierung, Stärke, Sänger-Spotlights, Gruppen-Hooks, Drop-Akzente, zusätzlicher Lyrics-Schutz und Übergangsdauer. Die bevorzugte Konfiguration ist standardmäßig aktiv, jedoch durch die vorhandenen Sicherheits- und Prioritätsregeln begrenzt.

## Dateien

- `components/visualizer/performanceLightingDirectorV749.ts`: pure Planung und Übergangssimulation.
- `components/visualizer/DynamicStage.tsx`: Integration nach V551; Key-/Fill-/Beam-/Sweep-Gains; V557-Fallback auf bestätigte Performer-Slots.
- `components/visualizer/ThreeAvatar.tsx`, `components/visualizer/registry.tsx`, `components/visualizer/VisualizerStage.tsx`: Weiterleitung der Präferenzen.
- `components/SettingsPanel.tsx`, `types/music.ts`, `context/UiPreferencesContext.tsx`: Einstellungen.
- `tests/v749-concert-lighting-regression.cjs`, `tests/tsconfig.v749-core.json`: Regressionen und isolierter strenger Typcheck.

## Einschränkungen

V749 erkennt **keine** neuen Sänger, singenden Wörter oder Audio-Stems. Kamera und Licht verwenden dieselben validierten Performance-Hinweise, aber V749 liest keine final gerenderte Kameraposition aus; eine pixelgenaue Kamera-Licht-Kopplung benötigt gesonderte Browser- und Bildtests. Ein vollständiger Next.js-Produktionsbuild und Rendering mit echten GLBs konnten in der aktuellen Umgebung mangels npm-Paketen nicht bestätigt werden.
