# V616 – Verification (27.10.2026)

## Abgesicherte Ergebnisse

- `npm run test:smoke:v616`: **PASS**. Einzeltests von V616, V615, V614, V613 und der gesamten V612-Smoke-Testkette sowie V607/V539, Syntax und Architektur erfolgreich.
- `npm run test:v616`: **16 PASS-Gruppen** für 2–4 Performer, redaktionell bestätigte Sänger-Cues, V416/V496-Reply-Grenzen, Hook-Publikumsfokus, zeitlich versetzte Support-Reaktionen, manuelle/reduced/low-Priorität, Seek-/Replay-Deterministik, Rückwärtskompatibilität und Rig-Grenzen.
- `npm run test:v616:types`: **PASS**, TypeScript 5.8.3, Core-Konfiguration `tests/tsconfig.v616-core.json`.
- Zusätzliche Tests: V584, V599, V517, V475, V588, V493 und V565 erfolgreich.
- `npm run check:syntax`: **PASS**, 840 TypeScript-/TSX-Quelldateien.
- `npm run check:architecture`: **PASS**, 480 Projektdatei-Verweise und 10 Architekturabschnitte.

## Nicht in dieser Umgebung verifiziert

- Vollständiger `npx tsc --noEmit`-/Next.js-Produktionsbuild: Es liegen hier keine installierten `node_modules` für die gesamte Anwendung vor. Der vollständige Build muss auf dem Windows-Entwicklungsrechner wiederholt werden.
- Visuelle Qualität und Framerate mit realen GLB-Modellen, Spotify-Lyrics und 2–4 live gerenderten Avataren im Browser.

## Lokal ausführen

```powershell
npm run test:smoke:v616
npm run test:all
npx tsc --noEmit
npm run build
```

`test:all` führt sämtliche in `package.json` vorhandenen atomaren Test-Skripte aus. Aufgrund der Projektgröße kann es deutlich länger dauern.
