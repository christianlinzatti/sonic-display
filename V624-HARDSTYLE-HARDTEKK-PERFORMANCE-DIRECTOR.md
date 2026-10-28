# V624 – Hardstyle & Hardtekk Performance Director

V624 erweitert die **vorhandene** V610-Genre-Regie für die automatischen Tanz-, Kamera- und Lichtbahnen. Es werden keine neuen GLB-Clips, Lichter, Audioquellen oder Shader angelegt.

- **Hardstyle:** stärkere, aber begrenzte Licht-Beam-Akzente bei gemessenen Kicks und dynamische Build-Steigerung.
- **Hardtekk:** etwas stärkere Dance-/Sweep-Impulse, aber keine ununterbrochene künstliche Kick-Erkennung.
- **Hooks:** abwechselnder Beam- bzw. Spotlight-Fokus bei wiederholten bestätigten Hooks.
- **Build:** Verlauf wird ausschließlich aus dem bestätigten Abschnitt und dessen Zeitgrenzen berechnet.
- **Drop:** zusätzliches Festival-Highlight nur bei *bestätigtem Drop* und tatsächlich gemessenem Kick-/Energie-Pegel.
- **Vorrang:** manuelle Motion, Kamera- und Lichteinstellungen; Lyrics-Schutz, Pausen, reduzierte Bewegung und Low-Tier.
- **Bewusst nicht Teil von V624:** neue Tanzanimationen oder neue Strobe-/Laser-Renderobjekte, Ermittlung von Sängerrollen, Vorhersage unbestätigter Drops.

Der Weg `planGenreConcertV610` versorgt bestehende `VisualizerStage`, `StageCameraDirectorV289`, `DynamicStage` und `ConcertAtmosphereRendererV308`. Die vorhandenen Renderer und der Kameraschutz V351 behalten ihre Grenzen.

## Tests

```powershell
npm run test:v624
npm run test:v624:types
npm run test:smoke:v624
npm run verify:v624
npx tsc --noEmit
npm run build
```

Eine tatsächliche visuelle Prüfung mit GLB-Avataren, Lyrics und mehreren kompletten Songs ist noch erforderlich.
