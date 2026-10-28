# V649 – Prüfbericht (28.10.2026)

## Umfang

- Basis V648; neue, ausschließlich im Touch-/Kioskmodus sichtbare Steuerzentrale mit fünf Bereichen, neun vorhandenen Stage-Themes, Kamera, Lyrics, Avatar- und Lichtparametern.
- Neue Dateien: `components/concertControlPolicyV649.ts`, `components/ConcertControlCenterV649.tsx`, `tests/v649-control-center-regression.cjs`, `tests/tsconfig.v649-core.json`, `tests/v649-ui-preferences.d.ts`, zwei Release-Dokumente.
- Bestehende Preferences bleiben die einzige persistent genutzte Einstellung; die Komponente merkt sich nur die vorherige letzte Änderung für Undo. V648-Ansichten/Lesbarkeit werden ohne neue Speicherung wiederverwendet.
- Auf die bisherige V648-Version fest kodierter Versionsvergleich in einem alten Regressionstest wurde in eine versionsübergreifende Prüfung umgebaut. Keine alte Touch-Funktion wurde deswegen verändert.

## Ausgeführte Tests

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v649` | PASS – 126 Gruppen, 12.000 synthetische numerische Steuerzustände |
| `npm run test:v649:types` | PASS – isolierter TS-Kern mit leichtgewichtigen Testtyp-Deklarationen |
| `npm run test:smoke:v649` | PASS – V649, V648, V647, V646, V635, V622, V616, Syntax und Architektur (vor vier zusätzlichen Testgruppen; diese danach einzeln PASS) |
| `npm run verify:v649` | PASS – V649 bis V640 selektiv sowie V635, V388, Syntax, Architektur (vor vier zusätzlichen Testgruppen; diese danach einzeln PASS) |
| `npm run test:v558`, `test:v568`, `test:v571`, `test:v580` | PASS – historische Build-Vertragsprüfungen |
| `npm run check:syntax` | PASS – 879 TS/TSX-Quelldateien |
| `npm run check:architecture` | PASS |
| `npm run build` | NICHT erfolgreich – nach PASS des Prebuilds `next: not found` (Exitcode 127, Projektabhängigkeiten nicht installiert) |
| `npx tsc --noEmit` | Nicht durchgeführt, da Next/React/Three-Typen in `node_modules` fehlen |
| Echte Touch-/WebGL-Visualisierung auf 10 Zoll | Nicht durchgeführt: keine laufende Next.js-Umgebung / kein physisches Display |

## Prüflimits

Syntax, TypeScript-Kerntests und Regressionen prüfen nicht die tatsächliche React-Interaktion, Touch-Zielflächenerkennung, die Qualität der Live-Kamera oder Renderleistung auf Zielhardware. Besonders manuelle Kamera-/Lyrics-Einstellungen und andere automatische Regisseure sollten mit GLB-Avataren im Browser kontrolliert werden. Bühnenwechsel können GPU-Arbeit auslösen; die neue Oberfläche verspricht keine garantierte nahtlose WebGL-Reinitialisierung. Kein Mikrofon- oder Spotify-Zugriff wurde hinzugefügt.

## Windows-Prüfung

```powershell
npm install
npm run test:v649
npm run test:smoke:v649
npm run verify:v649
npx tsc --noEmit
npm run build
npm run dev
```

Bei 1024×600, 1280×800, 1366×768 und optional 800×1280: Touchmodus aktivieren, Steuerzentrale öffnen, alle fünf Tabs bedienen, Sänger-Kamera und Bühne mehrfach wechseln, Lyrics auf Klar/Groß stellen, Undo bedienen, Escape/Fertig testen und Spotify-Lauf weiter beobachten. Eingriffe in manuell gesetzte Kamera-/Vocal-Zeitmarken müssen ausbleiben.
