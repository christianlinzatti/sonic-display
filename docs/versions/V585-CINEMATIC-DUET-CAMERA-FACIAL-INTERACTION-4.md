# Sonic Display V585 – Cinematic Duet Camera & Facial Interaction 4.0

Release: 26.10.2026. Basis V584, vollständiges Projekt – keine zusätzlichen Audio-/GPU-/Netzwerkprozesse.

## Umsetzung

- **Autorisierter Sängerwechsel:** Die bestehende V528-Konzertszene enthält Song-ID, geprüfte Sängerrollen, Zeitintervall und den übergebenden Performer. Innerhalb der vorhandenen `StageCameraDirectorV289`-Pipeline ergänzt V585 eine playback-synchronisierte, fließende Fokusverschiebung von höchstens 0,22 Welt-Einheiten. Die bisherige V550-Duett-/Konzertkamera bleibt Hauptregie.
- **Gemeinsame Hooks:** Nur bei vollständig verifizierter Hook-Besetzung aller sichtbaren Bühnenrollen weitet V585 die bestehende Kamera minimal. Keine synthetisch zugeordneten Sänger, keine harten Cuts.
- **Mimik/Blick-Koordination:** Nur bei einer ausdrücklich bestätigten **Reply-/Antwortpassage** erhalten *der neue und der bisherige* Sänger einen kurzen wechselseitigen Blick. In Solo-Passagen schaut der aktive Lead weiterhin zum Publikum. Dies geschieht über die bereits vorhandenen `LookAtCue`-Kanäle der V500/V575/V584-Planung, nicht über direkte manipulative GLB-Morph- oder Lippenzugriffe. Weitere Tänzer und Sängerrollen bleiben unverändert.
- **Bildschutz:** Vor und nach der Ergänzung werden die vorhandenen V540- und V550-Messungen zu Köpfen, Ganzkörper, Bühnenbereich und Lyrics-Sicherheitszone verglichen. Jede Verschlechterung verwirft den Zusatz vollständig. V351 schützt anschließend die Lyrics weiter.
- **Priorität und Sicherheit:** Live-Kameraedit, Keyframes, gespeicherte Presets, manuelle Studio- und Konzertkameras, choreografierte Show-Cues und Timeline, Pause, `reducedMotion`, Low-Tier, ungültige / fremde Song-ID, fehlende Avatar-Roots sowie unpassende Zeitmarken deaktivieren die jeweilige Erweiterung. Keine neuen 3D-Modelle oder Kamera-Layers.

## Für den Windows-PC

```powershell
npm install --no-audit --no-fund
npm run test:smoke:v585
npm run verify:v585
npm run typecheck
npm run build
```

## Visuelle Abnahme (noch ausständig)

1. Zwei GLB-Avatare + **manuell bestätigte** Rollen; Übergabe, Seek rückwärts/vorwärts und Pause testen. Keine Blicksprünge oder doppelte Kameratracks.
2. Drei und vier Avatare während bestätigter Hook überprüfen; Gesichter/Füße sichtbar, Lyrics links/rechts und unten lesbar halten.
3. Manuelle Kamera-Presets, Keyframes und Live-Edit nacheinander einschalten; V585 darf die manuelle Pose nicht verändern.
4. 10-Zoll-Raspberry-Pi: reale Chromium-WebGL-FPS, Frametimes und Langlauf messen (Benchmark: `npm run benchmark:v580:pi`). Offline-Tests sind **keine Hardwarefreigabe**.

V585 erkennt weder Sänger noch Phoneme automatisch. Kamerarahmenberechnungen sind konservative Geometrie-Näherungen und ersetzen keinen visuellen Test auf echtem Gerät.
