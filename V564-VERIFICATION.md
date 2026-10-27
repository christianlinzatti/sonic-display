# V564 – Verifikation

## Ausgeführte Prüfungen

- `npm run verify:v564` **PASS** (44 neue V564-Regressionen, gezielte TypeScript-Prüfung und Rückwärtsprüfkette V554–V563).
- `npm run test:v538` **PASS** (20.000 virtuelle Seek-/Rap-Frames; Alt-Test unterstützt den nachgelagerten V564-Refinement-Schritt unter dem bestehenden V515-Limiter).
- `npm run test:v545` **PASS** (7.200 synthetische Bewegungsframes).
- `npm run test:v551` **PASS** (12.150 Bühnen-/Besetzungsfälle).
- `npm run test:v552` **PASS** (43.200 deterministische Pi-Renderbudget-Frames).
- `npm run test:v553` **PASS** (9 Concert-Benchmark-Fixtures).
- `npm run test:v383` und `npm run test:v424` **PASS** (Gesichtsprofil-/Kalibrierungsregressionen).
- `npm run check:syntax` **PASS** (786 TS/TSX-Dateien).
- `npm run check:architecture` **PASS** (339 Codeverweise, 10 Architekturabschnitte).

## Geprüfte Schutzmechanismen

- Pausen, reduzierte Bewegung, manuelle Choreografie, fehlende Word-Timestamps, Song-/Slotfehler und nicht bestätigte Sänger verhindern V564-Zusatzbewegungen.
- Neue Winkel an Kopf, Nacken, Brust und Oberarmen sind begrenzt. Kein Kiefer-Override und keine Neuberechnung importierter GLB-Animationen; die additive Engine restauriert ihre vorherigen Knochenrotationswerte.
- GLB-Rap-Demo nur mit aktivierter Rap-Ansicht; im Low-Tier und im pausierten Modus deaktiviert.
- V563-Duett-Vorschau und V562-Gesichtskalibrierung unverändert angebunden.

## Noch nicht geprüft

Die Projektkopie enthält keine installierten `node_modules`. Ein vollständiger `next build`, Browser-/WebGL-Sichttests mit echten GLBs und Raspberry-Pi-FPS- bzw. Thermikmessungen konnten hier nicht ausgeführt werden. Laufzeitqualität und tatsächliche Natürlichkeit der Rap-Bewegungen sind daher noch nicht durch Sichtprüfung bestätigt.
