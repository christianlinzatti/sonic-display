# V462 – Prüfbericht

## Erfolgreich

- `npm run test:v462`: Genre-Klassifikation, Hook/Verse/Build/Drop, begrenzte Licht-/Nebel-/Schwenk-Multiplikatoren, Kick-Evidenz, Blackouts, manuelle Lichtabläufe, Pausen und Low-Qualität. 20.000 deterministische Eingabefälle.
- `npm run verify:v462`: V462 und gezielte Regressionstestkette bis V461 erfolgreich.
- Historische relevante Lichttests für Spotlights, Atmosphären-/Nebelsteuerung, Licht-Timelines, Genre-Presets und Festival-Regie separat erfolgreich; alte starre Versions-/Quelltextannahmen wurden aktualisiert, ohne Funktionsprüfungen zu entfernen.
- `npm run check:syntax`: 629 TypeScript-/TSX-Dateien erfolgreich.
- `npm run test:imports`: 1.002 Projektdateien / 2.220 Imports erfolgreich.
- `npm run test:module-case`: keine Modulnamenskollisionen.
- Das Release-ZIP wurde auf CRC und auf vollständige Übernahme der Dateien aus V461 geprüft.

## Noch offen

- Vollständiger Next.js-`npm run typecheck` und `npm run build` mit installierten Projekt-Abhängigkeiten (`node_modules` sind im Quellarchiv nicht enthalten).
- Ein echter Browser-/WebGL-Test mit mehreren installierten GLB-Avataren sowie eine Raspberry-Pi-Messung von FPS, Renderlast und Dauersicherheit.

**Hinweis:** Ein erfolgreicher isolierter TypeScript- und Strukturtest ersetzt keinen vollständigen Next.js-Produktionsbuild.
