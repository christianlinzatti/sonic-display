# V685 – Advanced Rap Performance

## Ziel und Funktionen

Für Deutschrap, Hip-Hop, Trap und Drill werden ausschließlich **bereits aktive automatische GLB-Gesten** vorsichtig rhythmisch variiert. Strophe und Hook erhalten unterschiedliche, deterministische Bewegungsphrasen. Die Song-ID und der Performer-Slot variieren die Bewegung, damit nicht alle Tänzer gleich gestikulieren.

Bestehen valide **synchronisierte Lyrics** und stimmen der lokale Playback-Timer und das Lyrics-Timing überein, erhalten vorhandene Arm- und Schulterakzente dezente Betonungen bei Zeilen- bzw. Wort-Zeitmarken. Dabei wird weder Rap-Flow aus Audiosignalen behauptet noch eine Person als singender Künstler identifiziert. Ohne passende Lyrics bleiben nur zurückhaltende, zeitbasierte Variationen.

## Integrations- und Schutzregeln

- `components/visualizer/advancedRapPerformanceV685.ts`: pure, deterministische Ergänzung; nur `leftArmAccent`, `rightArmAccent`, `torsoTwist`, `shoulderRoll`. Alle anderen Rig-Felder bleiben identisch.
- `GltfDancerAvatarV492.tsx`: nach V684, vor Debug-Motion und dem weiterhin autoritativen Vocal-/Foot-IK-Pfad. Keine zusätzliche `useFrame`-Schleife.
- Keine Original-GLB-Clipänderungen, keine neuen Clips/Beats, keine Root-Translation, keine Änderungen an Gesicht, Lippen, Kopf, Füßen oder Sängerzuordnung.
- Manuelle Clips, Choreografie, Sequenzen, Loop-/Blend-Editor, Smart-Overrides, Rap-Live-Presets, Pause, reduzierte Bewegung, Low-Quality und fehlender Foot-IK-Nachweis deaktivieren diesen Pass.
- Optionaler Lyrics-Impuls gilt nur bei aktiven synchronisierten Lyrics und einer Timer-Abweichung unter 1.800 ms. Er ist kein Nachweis eines echten Vocal-Stems oder einer Sängerrolle.

## Qualitätssicherung

`npm run test:v685` / `npm run test:v685:types` / `npm run test:quick`. Mit installierten npm-Abhängigkeiten `npm install`, danach `npm run build` und manuelle WebGL-Browserprüfung mit 1–4 echten GLB-Avataren.
