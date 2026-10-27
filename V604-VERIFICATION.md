# Sonic Display V604 – technischer Prüfbericht

**Stand:** 26.10.2026 – Paket `0.1.0-v604`.

## Nachweislich erfolgreich

- `npm run test:v604`: **65 Testgruppen**, inklusive **40.000** deterministischer Playback-Zeitpunkte, Importvalidierung, mehrfacher Hooks, motivischer Kapitel, Endsegment-Beleg, sanftem Ein-/Ausblenden, manueller Priorität, Genrevarianten, Pause, Seek, Low-Pi-Tier, Lyrics-Priorität, automatischer Gruppenaufstellung und Real-Stage-Einbindung.
- `npm run test:v604:types`: isolierter TypeScript-Check der V604-/V600-Module bestanden.
- `npm run test:smoke:v604`: **komplett bestanden**, einschließlich V603 (50), V602 (40), V601 (36), V600 (50), V599 (27), V598 (23) und Architekturprüfung (445 Referenzen).
- Separat bestanden: `npm run test:v597` (40), `npm run test:v596` (47), `npm run test:v595` (34), `npm run test:v572` (69), `npm run test:v589` (25; ältere V588-Regression mit enthalten).
- `npm run check:syntax`: **828 TypeScript-/TSX-Dateien**, inkl. Importbindungen, bestanden.
- `npm run check:architecture`: Architekturstand **V604**, 445 existierende Code-Referenzen und 10 Strukturkapitel bestätigt.

## Einschränkung der Gesamtkette

Ein zusätzlich gestarteter `npm run verify:v604`-Sammellauf wurde durch das Ausführungs-Zeitlimit abgebrochen, nachdem die V604-/V603-/V602-Tests bereits erfolgreich waren. Die übrigen geplanten Schritte wurden anschließend **jeweils separat erfolgreich** durchgeführt (siehe oben). Deshalb wird der abgebrochene Sammellauf **nicht als erfolgreich abgeschlossen** ausgewiesen. Der V604-Smoke-Test und alle zugehörigen Einzelprüfungen sind hingegen erfolgreich.

## Nicht durchgeführt / nicht behauptet

- Kein vollständiger `next build` mit installierten Produktionsabhängigkeiten (`node_modules` fehlt in dieser Quellcodeumgebung).
- Keine tatsächliche Spotify-/Chromium-WebGL-Aufnahme mit echten GLB-Avataren.
- Keine realen Raspberry-Pi-FPS-/GPU-/Temperaturmessungen.
- Keine künstlerische/visuelle Freigabe der Show über einen ganzen Song.

V604 verändert nur bereits vorhandene automatische Tanz-/Kamera-/Licht-Intensität und verifizierte Auto-Gruppenformationen; es werden keine Songabschnitte, Sänger, Phoneme, Lyrics-Zeiten oder reale Kamerashots erfunden. Manuelle Einstellungen sowie vorhandene GLB- und Foot-IK-Assets bleiben geschützt.
