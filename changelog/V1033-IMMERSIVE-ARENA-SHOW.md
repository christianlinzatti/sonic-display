# V1033 – Immersive Arena Show (2026-11-06)

## Neue Features

- **Publikumswellen:** In der bestehenden V1032 Instancing-Pipeline wandert eine musiksynchrone Welle um die stillstehende Zuschauertribüne. Maximal ein Start pro fünf Sekunden. Die Transformationsupdates sind je nach Leistungsstufe auf ca. 8–15 Hz gedeckelt. Keine Avatar-Rigs, neuen Timer oder Remote-Assets.
- **Handylichter:** Drei separat auswählbare Modi (Lichtwelle, Beat-Puls, umlaufendes Lauflicht); die Palette ist leise und gekappt. Kein Hardware-Smartphone-Sync; es handelt sich um virtuelle Handylichter der 3D-Figuren.
- **Schwebende LED-Kuppel:** 56 / 108 / 172 Instancing-Pixel (low / balanced / high) auf ansteigenden, konzentrischen Trägerringen. Kein Shader-Postprocessing, kein dynamischer Schatten, adaptive GPU-Last, ruhige Grundfarbe bei Pause.
- **Drop-Flyover:** Zeitlich begrenzter 3,4-Sekunden-Kameraflug über das Publikum zur Bühne und zurück, minimal 13 Sekunden Abstand. Komponiert direkt in beide bestehenden Kamera-Owner (SmartStageCameraV236/StageCameraDirectorV289). Manuelle Keyframes, Timeline-Cues, Lyrics-/Vocal-Schutz, Pause und reduzierte Bewegung sperren den Flug.
- **Touch-Einstellungen:** Alle neuen Teile separat schaltbar. Bereits gespeicherte V1032-Einstellungen bleiben gültig; V1033 nutzt Standardwerte bei alten Präferenzobjekten.

## Dateipfade

- `lib/arena360ImmersionV1033.ts`: deterministische Rechenfunktionen, ohne Browser-/Audio-Abhängigkeiten.
- `components/visualizer/stages/ArenaLedDomeV1033.tsx`: LED-Instancing in der feststehenden Arena.
- `components/visualizer/stages/ArenaAudienceV1032.tsx`: sanft animierte bestehende GPU-Instanzen.
- `components/visualizer/stages/Arena360StageV1031.tsx`: feste Lichtkuppel und Publikum um weiterhin gemeinsame Drehplattform der Avatare.
- `components/SettingsPanel.tsx`: UI.
- `tests/v1033-immersive-arena-regression.cjs` und `tests/tsconfig.v1033-core.json`: Node-Regression und pure TS-Typen.

## Prüfungen

`npm run test:v1033`, `npm run test:v1033:types`, `npm run test:v1032`, `npm run test:v1031`, `npm run check:syntax`, `npm run check:architecture` und `node scripts/v959-source-preflight.cjs`.
Die vorhandene V1032-GitHub-Actions-Push-Prüfung führt V1033 mit aus; V1033 besitzt nur einen optionalen manuellen Workflow, um keine zusätzlichen automatischen Builds pro Push zu erzeugen.

**Noch ausstehend:** Vollständiger Next.js-/TypeScript-Produktionsbuild sowie GPU-/Browser-Prüfung mit echten GLB-Avataren und Lyrics, sobald vollständige npm-Abhängigkeiten installiert sind. Die Effekte werden nicht als auf echter Hardware verifiziert bezeichnet.
