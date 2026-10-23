# Sonic Display V435 – Prüfprotokoll (21.10.2026)

**Ausgangsbasis:** vollständig entpackte und übernommene V434, `0.1.0-v434`.
**Zielversion:** `0.1.0-v435`.

## In dieser Umgebung erfolgreich durchgeführt

- `npm run verify:v435` – PASS:
  - `npm run test:v435`: reine, deterministische Qualitätsmetrik, kurze Lyrics-Zeilen, Parametervorschlag, häufige Wechsel, Unveränderlichkeit, V434-A/B-UI und kein Eingriff in den Live-Kamerapfad.
  - `npm run test:v435:types`: PASS, TypeScript-Strict-Prüfung des isolierten Kerns.
  - `npm run test:v434`: PASS, A/B-Vorschau unverändert.
  - `npm run check:syntax`: PASS, 590 TypeScript-/TSX-Quellen.
  - `npm run test:module-case`: PASS, 934 geprüfte Quelldateien ohne Case-Kollision.
- `npm run test:v433`, `test:v432`, `test:v431`, `test:v430`, `test:v429`: PASS.
- `npm run test:v426`, `test:v425`, `test:v424`, `test:v423`: PASS.
- `npm run test:imports`: PASS, 934 Projektdateien / 2024 Importe.
- ZIP-Integrität und enthaltene Release-Dateien: durch erneutes Öffnen des finalen ZIP geprüft.

## Nicht abschließend bestätigt

- `npm run build`: mit 45-Sekunden-Limit gestartet. Die lange historische `build:preflight`-Testsuite erreichte innerhalb dieser Grenze den V404-QA-Block; der eigentliche `next build` wurde **nicht** erreicht. Die bis dahin angezeigten Prüfungen waren erfolgreich, der vollständige Preflight-Abschluss steht aus.
- `npm run typecheck` / `tsc --noEmit`: auf 15 Sekunden begrenzt, ohne abschließende Meldung. Hier sind außerdem keine `node_modules` installiert. **Keine Behauptung eines erfolgreichen vollständigen Projekt-Typchecks.**
- Browser-Sichttest mit React/Next.js und echtem GLB-Avatar sowie eine tatsächliche Kamera-/Sichtbarkeitsanalyse: nicht durchgeführt.

## Wichtig für die Bewertung

Die V435-Punkte und Warnungen sind **editorielle Heuristiken** auf V433/V434-Samples. Keine nachgewiesene physikalische Kamera-/Szenen-, Geometrie-, Verdeckungs- oder Beat-Onset-Analyse. Der Optimizer verarbeitet eine einzelne in der V431-Timeline ausgewählte Szene; er verändert nicht eigenständig mehrere Lyrics-Zeilen. Die vorhandenen Live-Prioritäten, manuelle Keyframes, V430-Szenen und Spotify-Zeit bleiben unberührt.

## Empfohlene abschließende Prüfung auf dem Entwicklungsrechner

```powershell
npm install
npm run verify:v435
npm run test:imports
npm run typecheck
npm run build
```
