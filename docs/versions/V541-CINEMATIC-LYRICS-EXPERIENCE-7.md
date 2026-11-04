# V541 – Cinematic Lyrics Experience 7.0

## Verhalten

* Neue reine Darstellungsfunktion `cinematicLyricsExperienceV541.ts`: validierte Wortzeiten steuern kontinuierliche Füllung auf der vorhandenen Wiedergabeuhr. Die Wortfüllung wird nicht durch Animationseffekte zeitlich verschoben.
* Sehr schnelle Rap-Passagen werden anhand der tatsächlichen Wortstart-Abstände erkannt (Median ≤215 ms, mindestens vier Wörter), nicht anhand von Sänger-/Audio-Schätzungen. Die Bewegungsstärke wird für die Lesbarkeit reduziert.
* Bühnentexte über drei/vier Avatare bekommen eine maximal 4,5% erhöhte Leseskalierung und ein dunkleres Overlay. 10-Zoll-Layouts respektieren den von V540 geschützten Raum.
* 3D-Textmeshes sind nach Qualitätsprofil auf 0/14/26 Wörter (für schnelle Passagen 0/10/16) limitiert; darüber bleibt das volle Textzeilen-Mesh sichtbar. Kein Abschneiden oder verstecktes Weglassen der Lyrics.
* Benutzerdefinierte Font-/Positionseinstellungen, Crossfades, V540-Kamera, Sängerzuordnung sowie Lip-Sync bleiben unverändert.
* Ein Wort ohne bekannten Endzeitpunkt erhält ausdrücklich **keinen** synthetischen V541-Karaoke-Fortschritt. Nur bereits vorher vorhandenes Zeilen-Fallback bleibt außerhalb dieser Schicht erhalten.

## Prüfungen

`npm run test:v541 && npm run test:v541:types` prüft echte Wortmarken, Suche nach Rap-Dichte, monotonen Füllstand, Pausen und Suchen, Reduced Motion, feste 3D-Meshbudgets, vorhandene DOM-/WebGL-Anbindungen. `npm run check:syntax && npm run check:architecture` prüfen Code und Dokumentation. Produktionsbuild ist nur mit installierten NPM-Abhängigkeiten möglich (`npm install && npm run build`). Reale Lesbarkeit muss auf dem Raspberry Pi geprüft werden.
