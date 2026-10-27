# Sonic Display V552 – Raspberry Pi Performance 5.0

## Ziel

Die V551-Konzertshow wird auf schwächeren Raspberry-Pi-GPUs entlastet, ohne Sängerzuordnung, Song-Uhr, Karaoke-Zeitpunkte, Gesichter, natürliche Tanzbewegungen oder manuell gesetzte Show-Cues herunterzutakten. V552 verwendet **weiterhin V479/V518/V522 für adaptive Pi-Qualität und echte FPS-/P95-/P99-Messungen**. Kein konkurrierender neuer Auto-Tuner, neue RAF-Schleife, Shader oder zusätzlicher WebGL-Renderer.

## Änderungen

- `components/visualizer/piConcertDrawBudgetV552.ts`: deterministische, allokationsfreie Schwellen und Hysterese für nahezu unsichtbare transparente Oberflächen. Off bzw. manuell kontrolliertes Licht nutzt nur den sehr kleinen Null-Alpha-Grenzwert; das vorhandene Pi-Profil `balanced`/`eco` kann unbedeutende Alpha-Beiträge zusätzlich einsparen.
- `ConcertAtmosphereRendererV308.tsx`: vier vorhandene Beam-/Haze-Meshes bleiben montiert, aber sind bei unsichtbarer bzw. nahezu unsichtbarer Opazität `visible=false`. Dies verhindert **potenzielle unnötige Draw-Calls und transparentes Overdraw**. Die zuvor ohnehin von V542 verbotenen Laser-Meshes werden ebenfalls auf nicht sichtbar gesetzt. Shader-/Spotlight-Farb- und Intensitätswerte aktualisieren sich weiterhin mit der Musik; beim Wiedererscheinen sind die vorhandenen Materialien sofort verwendbar.
- Spotlight-Ziele: `updateMatrixWorld` wird nur aufgerufen, wenn die Zielposition tatsächlich geändert wurde. V551-Sängerfokus, Bühnenkoordinaten und 3D-Kamera bleiben erhalten.
- `DanceFX.tsx`: bei inaktiven Effekten wird der bestehende Pool beim Übergang einmalig leergeräumt und danach nicht mehr in jedem Frame über seine 24 Meshes iteriert. Die Beat-Flankenerkennung bleibt aktiv, damit die Wiederaufnahme nicht einen alten Kick auslöst.
- `StageVisualEffectsV353.tsx`: die vorhandene Geometrie wird nur bei einer tatsächlichen Änderung der Draw-Range neu konfiguriert.
- `AdaptivePerformanceSettings`: neue Hinweiszeile zur sparsamen V552-Ausführung. Das Performance-Menü verwendet weiterhin dieselbe DPR-Kalibrierung.

**Nicht** verändert: Original-GLB-Dateien, AnimationMixer, Fuß-IK, Lippen-Morphs, Karaoke-Füllung, Spotify-Uhr, V550-Kamera, Light-/Show-Timeline-Prioritäten, Pi-Geräteidentifikation oder bereits gespeicherte Settings. Sichtbare Alpha-Beiträge bleiben durch eine Hysterese gegen Flackern geschützt.

## Bewertung auf einem echten Raspberry Pi

1. Mit vollständiger Installation den lokalen Produktionsbuild und die Bühne starten; unter dem Pi-Displayprofil das passende Gerät auswählen.
2. V522/V543-Benchmark jeweils dreimal mit **identischen Einstellungen und vier Avataren** für Deutschrap-Feature, Hardstyle-/Hardtekk-Drop und Langzeitshow durchführen.
3. Mittlere FPS, Frame-P95/P99 und `drawCalls` vor/nach der Änderung vergleichen. Bei stark leuchtenden Nebel-/Lichtpassagen sind **keine garantierten** Einsparungen zu erwarten, da sichtbare Effekte normal gerendert werden.
4. Zusätzlich visuell prüfen: sanftes Wiedererscheinen der Lichtkegel, keine Zuckler, Lippen-/Lyrics-Synchronisation, klare Gesichter, kein Laser, keine durchbrochenen Blackouts.

Die 43.200 synthetischen V552-Opazitätsframes prüfen ausschließlich die Entscheidungspolitik, **keine echten 43.200 Raspberry-Pi-Renderframes**. Der Erfolg der Optimierung auf der Hardware ist noch nicht nachgewiesen.

## Verifikation

`npm run verify:v552`, `npm run test:v552`, `npm run test:v552:types`, `npm run test:performance`, `npm run check:syntax`, `npm run check:architecture`. Produktionsbuild und vollständiger Projekt-Typecheck benötigen die fehlenden React-/Next.js-Abhängigkeiten.
