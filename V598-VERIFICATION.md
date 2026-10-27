# V598 – Test- und Releaseprüfung

**Datum:** 26.10.2026. **Release:** `0.1.0-v598`.

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v598` | PASS – 23 Testgruppen, 20.000 simulierte Wortpositionen |
| `npm run test:v598:types` | PASS – isolierte TypeScript-Typprüfung der neuen reinen Lyrics-Logik |
| `npm run test:smoke:v598` | PASS – inklusive V597, V549, V541, V477, Architektur |
| `npm run verify:v598` | PASS – zusätzlich V596, V595, V572, V589 und Syntax-/Importscan von 823 TS/TSX-Dateien |
| ZIP-Integrität | Wird nach dem Archivbau geprüft |

**Grenzen:** Eine globale TypeScript-Prüfung des gesamten React-Projekts, `next build`, Pixelvergleich echter Karaoke- und GLB-Szenen, Spotify-Live-Wiedergabe und ein Raspberry-Pi-Benchmark konnten mangels installierter `node_modules`/echter Medien nicht stattfinden. Die CSS-Änderungen sind in Quellcode-Regressionsprüfungen geprüft, aber noch nicht visuell abgenommen.

**Wichtig:** `verify:v598` ist eine gebündelte, selektive Regression, **nicht** die vollständige historische `build:preflight`-Kette aller Releases. Keine behauptete Bild- oder Laufzeitverbesserung ohne entsprechende Messung.
