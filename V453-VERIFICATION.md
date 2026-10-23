# V453 – Verification

## In der bereitgestellten Umgebung erfolgreich

- `npm run test:v453`: deterministischer Wort-Planer, Schnell-Rap/Gesang, Grenzen, Lippenverschluss, ausgeschaltete Optionen, Pause, Reduced Motion, fehlende Lyrics, invalides Timing, manuelle Rollen, V420-Wort-Keyframes, V423-Audio-Vorrang, zwei Renderer, Morph-Overlay-Erhalt; strenge TypeScript-Kernprüfung mit `tsc -p tests/tsconfig.v453-core.json --noEmit`.
- `npm run verify:v453`: V453 und gezielte Vorgängertests V423–V452, V242 Tanzkombination, Syntax, Projektimporte, Case-Safety; zusätzlich V393, V406 und V407 zur Sicherung des gemeinsamen Body-/Gesichts-Cue-Pfads.
- Zusätzliche funktionale Tests: V367, V374–V376, V385, V390, V392, V405, V415, V419–V424 sowie V393/V406/V407 erfolgreich.
- Die rein strukturellen und versionsgebundenen historischen Tests V368–V373, V383–V384 und V386 enthalten teilweise längst überholte exakte Quelltext-/Versionsannahmen und schlagen in dieser weiterentwickelten Codebasis unabhängig vom V453-Funktionskern fehl. Die konkrete alte Testlogik wurde nicht pauschal abgeschwächt oder als grün gemeldet.
- Abschließender Dateivergleich zur V452-ZIP und `zipfile.testzip()` siehe Releaseprüfung.

## Offen

- Vollständiges `npm run typecheck` und Next.js `npm run build`: `node_modules` nicht vorhanden, daher in dieser Umgebung nicht abschließend ausführbar.
- Realer Browser-/WebGL-/GLB- und Spotify-Praxistest mit echten Avataren und Lyrics.

Windows-Prüfung: `npm install; npm run verify:v453; npm run typecheck; npm run build`.
