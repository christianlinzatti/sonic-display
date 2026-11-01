# V688 – Prüfprotokoll: Cinematic Lyrics 2.0

## Erfolgreich (in der aktuellen Quellcode-Arbeitskopie)

- `npm run test:v688`: **45 Prüfgruppen** mit **12.000 deterministisch gesampelten Song-Zeitpunkten**. Abgedeckt: bestätigte Wort-Zeitmarken und Hook-Cues, Kontrast und sichere Lesebreite bei 1–4 Avataren, unveränderte Nutzerposition, ungültige/überlappende Zeitmarken, lange Zeilen, Seek/Pause/Reduced Motion, unverändertes bestehendes Karaoke-Fill und keine zusätzlichen Audio-, Netzwerk- oder Render-Loops.
- `npm run test:v688:types`: **PASS**, isolierter strenger TypeScript-Check des neuen V688-Moduls.
- `npm run test:quick`: **PASS** (aktuelle V669–V688-Tests, Syntax-, Architektur-, Modul-Casing-, Typ-Isolations- und Spotify-Sicherheitsprüfung).
- Zusätzliche historische, gezielte Lyrics-Tests: **V461, V477, V501, V525, V541, V549, V598, V606, V619, V634** bestanden. Testverträge von V461, V525, V541, V549 und V606 wurden auf die seit V680 eingeführte Unterscheidung zwischen schnellem Build und explizitem historischem Release-Check beziehungsweise die zusätzliche, enger begrenzte 3D-Lyrics-Breite angepasst. Die fachlichen Assertions wurden dabei beibehalten.
- Der bestehende V634-Lyrics-Test bestätigt, dass echte Wort-Cues und Karaoke-Fill nicht überschrieben werden.

## Einschränkungen / nicht nachgewiesen

- `npm run check:dependencies`: **BLOCKIERT** – 17 npm-Abhängigkeiten in `node_modules` fehlen; `package-lock.json` fehlt ebenfalls. Daher konnten **kein vollständiger App-TypeScript-Check und kein Next.js-Produktionsbuild** erfolgreich durchgeführt werden.
- Kein realer Browser-/WebGL-Rendervergleich auf 10-Zoll-Zielgerät mit mehreren GLB-Avataren. Die V688-Layoutgrenzen sind konservative Reservierungen: Eine **pixelgenaue Null-Überlappung mit real projizierten Performern ist nicht nachgewiesen**. Der bestehende Layout-/Kamera-Schutz bleibt zuständig.
- Die alte eigenständige V378-ESM-Prüfung konnte unter der verfügbaren Node-22-Laufzeit ohne TypeScript-ESM-Loader nicht direkt gestartet werden (`ERR_UNKNOWN_FILE_EXTENSION: ".ts"`). Sie gehört nicht zu den ausgeführten und bestandenen historischen Einzeltests.
- Kein zusätzlicher Lyrics-Provider, keine automatische Vocal-Erkennung oder neu erratene Wortzeiten; V688 benutzt ausschließlich die vorhandenen bestätigten Zeitmarken.

## Windows-Abnahme

```powershell
npm install
npm run test:v688
npm run test:v688:types
npm run test:quick
npm run build
```

Für die visuelle Abnahme eine dicht getaktete Deutschrap-Strophe mit bestätigten Wort-Timestamps, einen Refrain mit realem Hook-Cue, ein 4-Avatar-Bühnenbild sowie eine nur zeilensynchronisierte Lyrics-Datei vergleichen. Die Nutzerposition darf nicht automatisch geändert werden. Die Overlay-Lesbarkeit muss bei unterschiedlichen Bühnenlichtern erhalten bleiben.
