# Sonic Display V605 – Verifikation

**Stand:** 26.10.2026, Paket `0.1.0-v605`. Vollständiges Projekt auf Basis der V604-ZIP-Datei.

## Erfolgreiche, tatsächlich ausgeführte Prüfungen

- `npm run test:v605`: **25 Testgruppen; 22.728** deterministische Kamera-Samples, davon **18.885 zulässige Kamera-Pose-Verfeinerungen** in den synthetischen Tests. Tests umfassen vollständigen bestätigten Regieplan, mehrfach markierte Hooks, manuelle Priorität, Low-Tier, Pause, Reduced Motion, Song-/Cue-Identität, fehlende GLB-Anker, Lyrics-Randgeometrie, deterministisches Seek und die echte R3F-Kamera-Einbindung.
- `npm run test:v605:types`: Isolierter TypeScript-Check des V605-/V604-Kameraalgorithmus bestanden.
- `npm run test:v604` (65), `test:v603` (50), `test:v602` (40), `test:v601` (36), `test:v600` (50), `test:v599` (27), `test:v598` (23), `test:v597` (40), `test:v596` (47), `test:v595` (34), `test:v572` (69) und `test:v589` (25) separat erfolgreich. V589 führt bestehende V588-GLB/Langsong-Regression aus.
- `npm run test:v528`, `test:v540`, `test:v550`, `test:v585` erfolgreich; ältere exakte Strukturprüfungen wurden auf die neue V605-Position **nach** V585 und **vor** dem abschließenden V351-Lyrics-Guard aktualisiert, die ursprünglichen Mess- und Schutzprüfungen blieben bestehen.
- `npm run check:syntax`: **829 TypeScript-/TSX-Dateien**, inklusive Importbindungen, ohne Fehler.
- `npm run check:architecture`: **448** Code-Referenzen und 10 Architekturabschnitte bestätigt, V605-Dokumentationsstand.
- Der gemeinsame `npm run test:smoke:v605` wurde vor Abschluss der langlaufenden älteren V540-Prüfung am Befehls-Zeitlimit unterbrochen. Alle darin noch offenen Kernschritte wurden anschließend **einzeln** erfolgreich ausgeführt. Der unterbrochene Sammellauf ist **nicht** als insgesamt bestanden ausgewiesen.

## Nicht geprüft / nicht behauptet

- Kein vollständiger `next build`, keine installierten `node_modules` in dieser Quellcodeumgebung.
- Kein Browser-WebGL-Rendering mit echten GLB-Avataren und Spotify-Daten.
- Keine realen Raspberry-Pi-FPS-/GPU-/Temperaturwerte oder Langzeitmessungen.
- Die mathematisch geprüfte Projektionsgeometrie ist **keine** optische oder künstlerische Abnahme von Close-ups, Duettbildern und Hook-Kamerafahrten.

Die V605-Funktion erzeugt keine zusätzlichen Renderer, Timer, GLB-Clips oder Musikeridentitäten. Wenn V604 nicht über belegte Songabschnittsdaten verfügt oder eine manuelle Kameraregion Vorrang hat, ist die neue Kamerastufe wirkungslos.
