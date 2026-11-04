# V620 – Intelligent Concert Camera Composition (27.10.2026)

## Ziel

Professioneller wirkende automatische Bildkomposition ohne zusätzliche R3F-Kameras oder neue Renderloops. Die Version nutzt bereits vorhandene tatsächliche Bühnen-Root-Positionen sowie Song- und Sänger-Cues.

## Integration

- **Solo/Porträt**: ausschließlich bei einem bestätigten `ConcertSceneV528.focus='lead'` für den aktuellen Track und das aktive Cue-Zeitfenster.
- **Duett/Feature**: nur bei bestätigten, voneinander verschiedenen Lead-/Handoff-Slots.
- **Ensemble**: nur bei tatsächlich bestätigten Gesangsslots für den gesamten sichtbaren Cast.
- **Bühne ohne Sängerbeweis**: ausschließlich wenn der V604-Songabschnitt und V600-Beleg vollständig gültig sind; keine optischen Hinweise werden zu Vocal-Rollen umgedeutet.
- **Bildgestaltung**: wenige kleine mögliche horizontale/vertikale Einstellungen mit sanftem Song-Cue-Fade, jeweils auf der bereits existierenden R3F-Kamerapose.
- **Sicherheit**: Vollständige sichtbare Besetzung muss innerhalb der konservativen V550-/V540-Messgrenzen mindestens genauso gut bleiben. Negative Kandidaten werden ignoriert. Es werden **keine tatsächlichen Pixelbilder/GLB-Extrema** vermessen, nur bestehende, konservative Performer-Projektionen.
- **Lyrics**: Seitenpanel begrenzt das verfügbare Bildfeld; bei geschützter Lyrics-Zeile ohne Seitenpanel sind zusätzliche Seitenschwenks verboten. Der V351-Sicherheitsguard bleibt letzte Instanz.
- **Prioritäten**: Live-Camera-Editor, manuelle Timeline, gespeicherte Kamera-Cues, Reduced Motion, Pause, Low-Tier und falsche Trackbindung deaktivieren die V620-Korrektur.

## Technische Änderung

Neue rein funktionale Datei: `components/visualizer/intelligentCameraCompositionV620.ts`; einmaliger Aufruf innerhalb der existierenden `components/visualizer/StageCameraDirectorV289.tsx` pro bestehendem Frame. Keine neuen Animationsdateien, keine erweiterten Berechtigungen und keine zusätzlichen Audio-/Kamera-Sensoren.

## Tests

`tests/v620-intelligent-camera-composition-regression.cjs` (41 Testgruppen einschließlich 10.000 synthetischen Simulations-Samples), `tests/tsconfig.v620-core.json`, `npm run test:smoke:v620` und `npm run verify:v620`.

## Offene Abnahme

Echte GLB-/Lyrics-Browserprüfung auf verschiedenen Seitenverhältnissen und vollständiger lokaler Next.js-Build. Die statischen Projektionsgrenzen können reale Haare, Gesten, frei ausschwingende Arme oder tatsächliche Textüberlagerungen nicht vollständig garantieren.
