# V636 – Verifikation (27.10.2026)

## Prüfungen

- `npm run test:v636`: **PASS**, 61 Testgruppen; 12.000 simulierte, belegte Song- und Lichtzustände; aktive und passive Sicherheitsgates, Genre, Gobo-Varianten, Drop-Evidenz, Budget und Songgrenzen.
- `npm run test:v636:types`: **PASS**, fokussierter TypeScript-Kern.
- `npm run test:smoke:v636`: **PASS** (vor letzter Budget-Härtung).
- `npm run verify:v636`: **PASS** (vollständig vor letzter Budget-Härtung; erneuter vollständiger Lauf folgt im Release-Prozess).
- `npm run test:v601`, `npm run test:v602`, `npm run test:v621`, `npm run test:v308`: **PASS** nach letzter Budget-Härtung.
- `npm run check:syntax`: **PASS**, 860 TS/TSX-Quellcodedateien.
- `npm run check:architecture`: **PASS**, 517 Referenzen.

## Wichtige Schutzregeln

- Bestehende V462/V542/V551/V608/V621 und V556/V601/V602 Budgetgrenzen bleiben maßgeblich.
- Die zweite V636-Komposition erhöht das vom vorherigen Renderer erlaubte Spotlight und Sweep nicht. Sie teilt nur das vorhandene Gobo-/LED-Budget neu auf.
- Keine selbstständige Erkennung von Drops oder Sängern, keine erfundenen Timestamps, keine separaten Timer oder neue Bühnenlichtobjekte.
- Bei Pause, manuellem Licht, Blackout, reduziertem Bewegungsmodus, schwacher Hardware oder Dateninkonsistenz neutral.

## Grenzen

- Ein vollständiger Next.js-Produktionsbuild und Browser-Rendering mit echten GLBs wurden in dieser Umgebung **nicht** durchgeführt (`node_modules`/Next.js fehlen). Der Nutzer prüft sie lokal mit `npm install && npm run build`.
- Die synthetischen Testfälle sind keine Echtbildqualitäts- oder FPS-Zertifizierung.
