# V440 – Verification

## Bestanden (lokal)

- `npm run test:v440`: Kernlogik, Feature-Credits, Auto-Duo, manuelle Priorität, Phrasen, Kamera, Clip-Priorität, React-Stage-Anbindung.
- `tsc -p tests/tsconfig.v440-core.json --noEmit`: isolierte V440-Kern-Typprüfung.
- Einzelregressionen: V429, V430, V431, V432, V433, V434, V435, V436, V437, V438, V439.
- Einzelregressionen: V423, V424, V425, V426 und V242.
- Motion-Library V190: 21 Prüfungen bestanden; V242: 10 Prüfungen bestanden.
- `npm run check:syntax`: alle relevanten TS-/TSX-Quellen.
- `npm run test:imports`: Projekt-Importstruktur.
- `npm run test:module-case`: Modulnamen-Kollisionen.
- Archivintegrität: `zipfile.testzip() == None`; Dateianzahl und `package.json`-Version kontrolliert.

## Nicht in dieser Umgebung nachgewiesen

- Der komplette Next.js-Produktions-Build und Projekt-weites TypeScript (`npm run typecheck`) mangels installierter Projekt-Abhängigkeiten.
- Live-WebGL-/Browser-Verhalten mit echten GLB-Avataren, insbesondere äußere Sichtbarkeit, Lip-Sync-Latenz, tatsächlich geladene Spotify-Metadaten und GPU-Performance.
- Vollständiger mehrstündiger historischer `build:preflight`-Regressionslauf.

## Wichtige Testgrenzen

V440 erkennt ausschließlich im Track-Datensatz gelistete Kollaborationen. Wechsel des visuellen Fokus ist rein hypothetische Bühnengestaltung und keine Sprechererkennung. Die derzeitige automatische Besetzung umfasst maximal zwei Avatar-Slots. Clips werden nicht verändert und vorhandene Einstellungen werden nicht gespeichert oder überschrieben.
