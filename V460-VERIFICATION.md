# Sonic Display V460 – Prüfprotokoll

## Ausgangsbasis

- Vollständiger Quellstand `0.1.0-v459`, erweitert auf `0.1.0-v460`.
- Keine entfernten Vorgängerdateien, keine zusätzlichen Secrets, Dienste oder Änderungen an importierten GLB-Animationsdateien.

## Erfolgreich ausgeführt

- `npm run verify:v460` **PASS / Exit-Code 0**, inklusive `npm run test:v460` und allen Regressionen aus `verify:v459`.
- V460-Regression: Szene Solo/Reply/Hook, echte Lyrics-Phrasengrenzen, Fallback ohne synchronisierte Lyrics, zwei bis vier Bühneplätze, gemeinsame Kamerasignale, Artist-Namensblasen, Spotlight und leichte Gruppen-Gesten.
- Manual-Override-Schutz und Quelle/Track/Stopp/Reduced-Motion-Grenzen, keine erfundene Sänger-Zuordnung; zusätzliche Detektion von Lippen/Phonemen wird nicht behauptet.
- Simulierte 30-Minuten-Abtastung der **reinen Planerfunktion**: begrenzte Zahlen und stabile Slots, **kein gemessener FPS- oder WebGL-Langzeittest**.
- `npm run test:v459`, `npm run test:v454`, `npm run test:v457` bestanden.
- `npm run check:syntax` – **PASS: 627 TS-/TSX-Dateien**.
- `npm run test:imports` – **PASS: 998 Projektdateien und 2.209 Imports**.
- `npm run test:module-case` – **PASS: 998 Dateien ohne Modulnamenkollisionen**.
- Die älteren V454- und V456-Quelltextprüfungen akzeptieren zusätzlich die neue V460-Kameraprioritätskette; die eigentlichen Kamera-/Manuell-Schutztests wurden nicht entfernt.

## Noch offen

- Vollständiger `npm run typecheck` für alle React-/Next.js-Dateien und `npm run build`: in dieser Umgebung keine lokal installierten `node_modules`. Die isolierte `tsc`-Prüfung ersetzt den vollständigen Build nicht.
- Echtes Rendering/Lip-Sync mit den importierten GLB-Avataren, manuelle Kamera-Projektdateien und tatsächliche Raspberry-Pi-GPU-/FPS-/Temperaturtests.

## Lokale Abschlussprüfung

```powershell
npm install
npm run verify:v460
npm run typecheck
npm run build
```
