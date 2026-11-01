# V841 – Professional Lighting Show 5.0

**Basis:** Sonic Display V840. **Version:** 0.1.0-v841.

## Umsetzung

- `professionalLightingExperienceV841.ts`: deterministische, budgetbegrenzte Lichtdramaturgie mit abgestimmten Verse/Hook/Build/Drop/Break-Looks auf Basis der verifizierten V604/V761/V793-Informationen. Keine künstliche Beat-Erkennung.
- Wiederverwendung von V762-Boden-Gobo: zwei neue Shader-Muster (Raster, ansteigende Bänder), musikalisch veränderte Skalierung, begrenzte Deckkraft. Explizite bestehende V762-Einstellungen behalten Vorrang.
- Wiederverwendung von V811-Laser-Backdrop: begrenzte Fächerbreite und weiche Fan-Bewegung. Schützt die Bühnenmitte; keine realen Laser, keine Stroboskope und keine zusätzlichen Draw Calls.
- Wiederverwendung des V793-Spotlights: vorsichtige, geglättete Sweeps und Winkeländerungen; singer-fokussierte Scheinwerfer gewinnen. Keine neuen Shadow Maps oder 3D-Lichter.
- `ConcertFxStudioPanelV810.tsx`: Aktivierung, Stärke und die Stile Cinematic/Balanced/Festival, persistent über bestehende Visualizer-Einstellungen und UI-Präferenzsicherung.
- Ausschaltbedingungen: fehlende V793-Bestätigung, reduzierte Bewegung, Tier low, Pause, FX deaktiviert, Blackout, manuelle Lichtregie und nicht valide Musik-/Renderwerte. V823-autorisierte Laser-Timeline bleibt erhalten.
- V841-Tests sind am Anfang von `check:fast`, `check:release` und `build:preflight` eingebunden. Die GitHub-Actions-Prüfungen aus V831/V832 bleiben erhalten.

## Tatsächliche Prüfungen in dieser Umgebung

- **PASS** – `npm run test:v841`: 92 neue Testgruppen.
- **PASS** – `npm run test:v841:types`: isolierter TypeScript-Check der V841-Logik.
- **PASS** – `npm run test:v793`, `npm run test:v793:types`, `npm run test:v762`, `npm run test:v810`, `npm run test:v810:types`, `npm run test:v811`, `npm run test:v636`, `npm run test:v789`, `npm run test:v825`.
- **PASS** – `npm run test:v800` bis `npm run test:v840`: 41/41 historische Regressionstestsuiten. Historische Versionsgrenzen wurden für V841 angepasst; fachliche Tests bleiben bestehen.
- **PASS** – `npm run check:syntax`: 1.212 TS-/TSX-Dateien.
- **PASS** – `npm run check:architecture`: 938 geprüfte Quellverweise.
- **PASS** – `npm run test:module-case`: 2.059 geprüfte Quelldateien ohne case-insensitive TS-/TSX-Dateikollision.
- **BLOCKIERT** – `npm run audit:production:v830` meldet fehlende Projektabhängigkeiten; `node_modules/next` und `node_modules/typescript` sind nicht installiert.
- **NICHT ABGESCHLOSSEN** – `npm run typecheck` (vollständiges Projekt): nach 20 Sekunden abgebrochen, keine erfolgreiche Gesamtprüfung; `tsc` aus globaler Installation verfügbar.
- **NICHT AUSGEFÜHRT** – tatsächlicher Next.js-Produktionsbuild aufgrund fehlender Projektabhängigkeiten. CI-Workflow muss auf dem aktualisierten GitHub-Projektstand laufen.
- **NICHT AUSGEFÜHRT** – Browser-/WebGL-/GPU-Langzeittest mit realen GLB-Avataren; eine visuelle Verbesserung ist noch nicht hardware-validiert.

**Freigabe:** Nur Integrations- und Regressionsteststand. Keine produktive Release-Freigabe, bis vollständiger TypeScript-Check, Next.js-Produktionsbuild und reale Bühnenabnahme erfolgreich sind.
