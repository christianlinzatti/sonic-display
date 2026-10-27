# V550 – Cinematic Concert Camera 4.0

## Funktionen

Die bereits vorhandene R3F-Bühnenkamera bekommt **einen einzigen reinen Kompositionsschritt** `components/visualizer/cinematicConcertCameraV550.ts` **nach V540 und vor V351**. Es werden keine zusätzlichen Kameras, Render-Loops, GPU-Ressourcen, GLB-Keyframes oder Sprecher-Zeitstempel erzeugt.

- **Rap-Solo / Lead:** Die Kamera nähert sich sehr vorsichtig einem mit V528 gültig bestätigten Sänger und gewichtet dessen Kopfposition etwas höher, **nur wenn die geprüfte volle Körperansicht und die Lyrics-Sicherheitsränder nicht schlechter werden**.
- **Feature-Handoff:** Aus zwei vorhandenen, sichtbaren V377-Bühnenankern wird ein gewichtetes Zentrum berechnet. Die Gewichtung bewegt sich beim neuen Cue allmählich vom alten zum neuen Lead; die bestehende R3F-Kamera glättet den Übergang weiterhin.
- **Bestätigte Gruppen-Hooks (zwei bis vier Sänger):** Die vorhandene Crew wird leicht breiter ins Bild genommen. Teilweise zugeordnete Hooks, für die V528 keine vollständige Bestätigung liefert, werden **nicht** zu einem erfundenen Ensemble umgedeutet.
- **Kopf- und Fußschutz:** Die pure Messfunktion `measureConcertFrameV550()` projiziert die tatsächlich beprobten Bühnenwurzeln samt einer konservativen, *geschätzten* Kopf-/Körpergröße perspektivisch. Vorgeschlagene Einstellungen werden strikt verworfen, wenn sich Kopf-, Körper- oder bisherige V540-Lyrics-Margin-Überläufe verschlechtern.
- **Live-Einstellungen zuerst:** Gespeicherte Kamerapresets, manuelle Live-Kamera, Kameratimelines, Show-Timelines, 3D-Prioritäten und Reduced Motion sperren diese Ergänzung. Identität, Musik-Track, Cue-Zeit, Vorzeichen der Kamerablickrichtung und 2–4 Sänger werden vor der Berechnung geprüft. Kein versteckter Zustand für zeitliche Kamerapositionen; die bestehende Kamera-Interpolation übernimmt den zeitlichen Übergang.

## Tests

- `npm run test:v550`: **9.720 deterministische** Kombinationen aus zwei, drei und vier Avataren, Rollen Lead/Handoff/Hook, Hoch-/Querformat und Lyrics-Bereichen; zusätzlich Null-/NaN-/Grenzfälle, fehlende Wurzeln, falsche Track-ID und manuelle Prioritäten.
- `npm run test:v550:types`: reine TypeScript-Kernprüfung ohne React-Installationszwang.
- `npm run verify:v550`: V549/V548/V547/V540 + Syntax und Architektur.
- Bisherige Regressionen V522–V549 je nach Testumgebung direkt mit `npm run test:vNNN` und `npm run test:vNNN:types`.

## Grenzen

Die Messpunkte sind **projektierte Wurzelanker mit angenommener Körpergeometrie**, keine echten 3D-Skinned-Mesh-Bounds, Screenshots oder ein Nachweis vollständiger Okklusionsfreiheit. Ein Browser-/Raspberry-Pi-WebGL-Test, visuelle A/B-Beurteilung und vollständiger Next.js-Produktionsbuild müssen separat mit installierten Abhängigkeiten erfolgen. Die fünf Original-GLBs sind nicht Teil des Projekt-ZIPs. Maximal vier gleichzeitig sichtbare Crew-Avatare, obwohl mehr Modelle in der Bibliothek liegen dürfen.
