# V461 Verification

## Erfolgreich

- `npm run test:v461`: Layoutdichte, Bühnenfokus, gültige Wortmarken, unsynchronisierte Lyrics, Long-Word-Fallback, Pause/Reduced Motion und Quellintegration.
- `npm run verify:v461`: gesamte gezielte Regressionstestkette bis V460 erfolgreich (einschließlich V423, V429, V442, V445–V460).
- `npm run check:syntax`: 628 TypeScript-/TSX-Dateien geprüft.
- `npm run test:imports`: 1.000 Projektdateien und 2.215 Imports geprüft.
- `npm run test:module-case`: keine Konflikte durch unterschiedliche Groß-/Kleinschreibung.
- Isolierter TypeScript-Kerncheck für V461 erfolgreich.

## Nicht hier ausgeführt

- `npm run typecheck` über das komplette Next.js-Projekt.
- `npm run build` (Next.js).
- Visueller Browser-/WebGL-Test mit echten Avatar-GLBs.
- Raspberry-Pi-FPS- und Langzeitmessung.

Die vollständigen Next.js-Abhängigkeiten (`node_modules`) liegen nicht im ZIP und sind in der Ausführungsumgebung nicht installiert. Ein bestandener Strukturcheck bedeutet nicht automatisch einen bestandenen Produktionsbuild.
