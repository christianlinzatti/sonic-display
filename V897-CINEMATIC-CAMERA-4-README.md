# V897 – Cinematic Camera 4.0

Aufbauend auf V896. V897 verwendet die **bereits vorhandene** Kamera und die
V895-Partitur aus verifizierten V604-Songabschnitten. Die Änderungen sind
absichtlich kleine, kontinuierliche Kamera-Modifikationen, keine zusätzlichen
Kameras, gefälschten Singer-Identitäten oder harten Schnitte.

| Perspektive | Wirkung |
|---|---|
| Portrait | Enges, ruhiges Bild und sehr dezente Blickhöhenänderung |
| Orbit | Langsame seitliche Kamerabewegung; Performer-Framing bleibt erhalten |
| Dolly | Dezenter Vorstoß in bestätigten Szenen |
| Kranfahrt | Leichte Erhöhung bei Builds oder Intros |
| Weite Bühne | Sanfte Ausweitung des Bildes bei Hooks, Drops und Finales |

`✦ LIVE FX → V897 Cinematic Camera 4.0`: Automatik ein/aus,
Kamerastil (Ruhig/Cinematic/Dynamisch), bevorzugte Perspektive, fünf
Einzeleffektschalter, Bewegungsstärke, Lyrics-Schutz, Duett-Schutz und
JSON-Export der bestätigten Kamera-Partitur. Einstellungen persistieren unter
`sonic-cinematic-camera-v897`.

Die Regie ist nur bei tatsächlich verifizierter V895/V604-Partitur, laufender
Musik, aktiviertem automatischem V895-Kamerakanal und gültigem Playback aktiv.
Manuelle Kameramodi, V400-Timeline, V290-Presets/Keyframes, V302-Editor,
Seek-Guard, Blackout, Reduced Motion, Low Tier, Lyrics und Vocal-Close-ups
sperren die neuen Änderungen. V848-Performer-Framing wird nicht ersetzt;
der bestehende V351-Projektionsschutz bleibt der letzte Schritt. Keine
Hardwaresteuerung und keine externe KI.

## Tests

`npm run test:v897` – deterministische Simulation, harte Schutzregeln,
Grenzwerte, 30.000 Frame-Proben und Integration. `npm run test:v897:types` –
isolierter Regiekern-TypeScript-Check. `npm run test:v897:ui-types` – erweiterte
UI-/Bridge-Typprüfung (erfordert vollständige npm-Abhängigkeiten).
`npm run verify:v897:focused` – V897 plus bestehende fokussierte Tests.
`npm run typecheck` und `npm run build` bleiben vor Produktivsetzung Pflicht.
