# Sonic Display V601 – Advanced Concert Stage FX 4.0

## Zweck
Die existierende V555-Bühne erhält eine sparsame, kohärente Effektregie für Verse, Build, Hook, Drop und Break. Die Bewegungsgeschwindigkeit bleibt bei Deutschrap geringer und steigt für Hardstyle/Hardtekk nur moderat. **Die Musikabschnitte stammen ausschließlich aus dem bereits vorhandenen `cameraDirectorSection`-Kanal bzw. dem existierenden V555-Hook-Cue. V601 erkennt selbst keine Drops, Vocals oder Beats.**

## Implementierung

- `components/visualizer/advancedConcertStageFxV601.ts`: rein deterministischer, testbarer Cue-Plan. Modulation innerhalb der bisherigen V556-Lichtbudgets (0,35 normal bzw. 0,12 low). Verringerte Intensität in dichten Lyrics und aktiver Lyrics-Schutzlage.
- `components/visualizer/ConcertDetailStageV555.tsx`: dieselben **drei** V555-Mesh-/ShaderMaterial-Pässe für LED-Pixelwand, Gobo-Muster und flachen Nebel. LED-Wellen und geometrische Goboringe werden durch vorhandene Uniforms erweitert. Sanfte Dämpfung der Shader-Intensität in bestehendem `useFrame`, ohne weiteren Loop.
- Ein **schattenfreier**, moderat bewegter WebGL-Spotlight-Akzent nur, wenn V555 aktiviert und der Gobo- sowie Avatarlicht-Schalter an ist, keine manuelle Lichtregie aktiv ist, die Qualitätsstufe mindestens `balanced` ist und weder Reduced Motion noch dichte Lyrics das verhindern. In `low` wird kein zusätzliches Licht gerendert. Keine volumetrischen Beams, keine zusätzlichen Texturen, keine Partikel oder Laser.
- `components/visualizer/ThreeAvatar.tsx` führt die bestehende Sektion, manuelle Ensemble-/Timeline-Priorität, Lyrics-Schutz und den Lichtreaktivitäts-Schalter zum V601-Planer. Manuelle Lichtregie behält die alten V556-Shaderstärken, ohne neue Modulation oder Spotlight.
- Eigene Regieabschnitte sind **Hinweise der vorhandenen Stage Director Pipeline**, keine erneute Prüfung von importierten V318-Zeitstempeln. Wo die Stage Director Pipeline eine geschätzte Szene ausgibt, ist das keine nachgewiesene Songstruktur. Nutzer können mit dem bestehenden V318-Import die Evidenz verbessern.

## Schutzregeln

- Bestehende V555-/V556-Einstellungen und das Master-Enabled bleiben maßgeblich. Deaktivierte Einzelkomponenten bleiben aus. Auch bei `stageReactive=false` bleibt die alte statische V556-Beleuchtung erhalten; V601 schaltet nur seine zusätzliche Modulation und das Spotlight aus.
- Bei dicht gesprochenem Deutschrap treten LED-Wand, Gobo und Nebel zurück; keine zusätzlichen Spotlights über Lyrics.
- `Reduced Motion` friert die Effektanimation ein und entfernt das V601-Spotlight. Bei Pause dimmt der Stage-FX-Plan ab.
- Keine Änderungen an Lyrics-/Wortzeitstempeln, V597-Lip-Sync, V596-Fuß-IK, V599-Sängerzuordnung, V600-Kameraregie, importierten GLB-Clips oder Govee/Alexa-Hardware.

## Testen

```bash
npm run test:v601
npm run test:v601:types
npm run test:smoke:v601
npm run verify:v601
```

Für echten optischen Vergleich denselben Spotify-Songausschnitt vor/nach V601 mit `benchmark:v592:live` aufnehmen und `benchmark:v594:compare` sowie `benchmark:v595:regress` verwenden. Ein erfolgreicher Offline-Test beweist keine sichtbare Verschönerung oder bessere Pi-FPS. Volle Produktionsbuild- und echte WebGL-/Pi-Tests sind separat erforderlich.
