# V608 – Verifikation

**Release:** `0.1.0-v608` · 26.10.2026 · Grundlage V607.

## Tatsächlich ausgeführt und bestanden

- **PASS** `npm run test:v608`: 47 neue Testgruppen, 35.000 synthetische, deterministische Song-Lichtframes; validierter V604-Akt, Track-/Dauer-/Zeitabgleich, gestaffelte Hooks, Drop-Kick-Nachweis, bestätigter V551-Sängerwechsel, geschützter 10-Zoll-Lyrics-Bereich, unveränderte manuelle Licht-Timelines, Blackouts, Pi-Low-Tier, reduzierte Bewegung und Pausen.
- **PASS** `npm run test:v608:types`: isolierter TypeScript-Core-Typcheck.
- **PASS** `npm run test:smoke:v608`: gemeinsame V608-, V607-, V604-, V601-, V600- und Architektur-Regression.
- **PASS** `npm run verify:v608`: vollständiger Sammellauf einschließlich V606-Kamera/Lyrics, V599-Duette, V597-Deutschrap-Lip-Sync, V596-Fußarbeit, V595-visuelle Offline-Prüfung, V572-Lippenbewegungen, V589-GLB-Qualitätsregression und Syntaxscan.
- **PASS** `npm run check:syntax`: 832 TypeScript-/TSX-Dateien (Syntax und Importbindungen).
- **PASS** `npm run check:architecture`: 458 referenzierte aktuelle Codepfade, zehn Architekturabschnitte.

## Was die Tests nicht belegen

Alle angegebenen Frames sind **offline simulierte Eingaben der Regie**, keine gerenderten Live-Bilder und keine gemessene GPU-Laufzeit. Der neue Lighting-Plan verändert bewusst nur vorhandene WebGL-Lichter und Fog/Beam-Meshes; die visuelle Wirkung ist nicht automatisch abgenommen. Ein vollständiger Next.js-Produktionsbuild war mangels installiertem `node_modules` in dieser Laufzeitumgebung **nicht ausführbar**. Echte Spotify-/GLB-/Browseraufnahmen, visuelle Showabnahme sowie Raspberry-Pi-FPS- und Temperaturmessungen wurden **nicht** durchgeführt. Die V592-/V603-Liveaufnahmeverfahren stehen für diesen Schritt bereit.
