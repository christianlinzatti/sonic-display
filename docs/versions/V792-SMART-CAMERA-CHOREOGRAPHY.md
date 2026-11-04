# V792 – Smart Camera Choreography

Die automatische Bühnenkamera erhält dezente, fortlaufende **Kamerafahrten** anstatt weiterer zufälliger Schnitte:

- Verse/Portrait: kontrollierte Dolly-in-Bewegung.
- Dialoge und wechselnde Hooks: sanfte seitliche Fahrten mit Variation der V761-Szenen.
- Ensemble und Builds: leichte Kranfahrten.
- Weite Bühnenbilder und Breaks: ruhige Dolly-out-Fahrten.
- Drops/Payoffs: stärkere, aber weiterhin kontrollierte Bühnenfahrten.

V792 verwendet **ausschließlich die bestätigten V790-Szenen und ihre Playback-Zeit**. Übergänge starten und enden mit genau 0 Gewicht; V791 übernimmt weiterhin die Interpolation zwischen den Szenen. Keine behauptete Audio-/Vokal-Analyse, keine synthetischen Beat-Zeiten, kein zweiter Canvas oder Renderloop. Die finale Kameraposition bleibt in der vorhandenen StageCameraDirectorV289 und V351.

## Vorrang und Grenzen

- Gespeicherte Kamera-/Keyframe-Presets, manuelle Timeline, Editor/Live-Pose, harte Schnitte und vorhandene Performance-Regie gewinnen immer.
- Bei `reducedMotion`, pausiert, `low`-Tier oder unbestätigtem Plan bleibt V792 vollständig aus; bei `balanced` deutlich abgeschwächt.
- Lyrics-Schutz reduziert die Bewegungsstärke und unterbindet horizontale Seitwärtsfahrten. V550 und V540 vergleichen die tatsächlichen sichtbaren Performer-Anker sowie Bildschirm- und Lyrics-Sicherheitsgrenzen *vor* dem Eingriff; verschlechterte Aufnahmen werden verworfen.
- Vorhandene V655-Sängerrollen bleiben erhalten; V792 errät keine Stimmen. V670/V750 regeln weiterhin Kamera-Budget/Qualität.
- Die Bewegung ist an die bestätigte Szenenzeit gebunden und daher bei Seek, Replay und Reload deterministisch.

## Prüfen

`npm run test:v792` und `npm run test:v792:types`; zusätzlich `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`. Danach bei installierten Abhängigkeiten `npm ci && npm run typecheck && npm run build` und reale Browser-GPU-Tests mit den eigenen GLB-Avataren durchführen.

Live-Diagnose: `data-v792-move`, `data-v792-scene`, `data-v792-evidence` auf `.immersive-stage`.
