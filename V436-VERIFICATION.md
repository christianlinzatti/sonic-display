# Sonic Display V436 – Prüfbericht · 21.10.2026

**Basis:** V435 (`0.1.0-v435`), als vollständiger Dateibaum übernommen.
**Ziel:** `0.1.0-v436`.

## Bestätigt in dieser Umgebung

- `npm run test:v436` – PASS, automatische Lyrics-Grundregie ohne V416, Hook-Wiederholungen, explizite Rollenpriorität, `auto-lyrics`-Quellenmarkierung, V429-Live-Kameraplan, kurze Lyrics-Zeilen, dichte Schnitte, Hook-Schutz, V430-/V432-Schutz, Track-Isolation, Grenzen (5.000 Zeilen, 128 Auto-Fixes), zustandsfreie deterministische Berechnung, keine zusätzlichen Kamera-Renderer.
- `npm run test:v436:types` – PASS, strikter TypeScript-Check der V436-Kernlogik und ihrer Vorgänger-Module ohne Browser/React/Next.js.
- Einzelne Regressionstests V429, V430, V431, V432, V433, V434, V435 – jeweils PASS.
- Einzelne Regressionstests V423, V424, V425, V426 – jeweils PASS.
- `npm run check:syntax` – PASS, 593 TS-/TSX-Dateien.
- `npm run test:imports` – PASS, 938 Projektdateien und 2.047 Importe.
- `npm run test:module-case` – PASS, 938 geprüfte Quelldateien ohne Groß-/Kleinschreibungs-Kollisionen.
- `node scripts/build-preflight.cjs` – Umgebungsdiagnose erfolgreich, **Build wegen fehlender Dependencies blockiert**.
- ZIP-Datei: nach Erstellung mit `zipfile.testzip` und Pflichtdateienvergleich geprüft (siehe tatsächliches Archiv).

## Nicht vollständig bestätigt

- `npm run verify:v436` wurde begonnen, erreichte aber beim nacheinander laufenden V434-Test das Ausführungszeitlimit. Derselbe V434-Test sowie alle anderen betroffenen Regressionen wurden **danach einzeln erfolgreich** ausgeführt. Daher ist der **gesamte verkettete `verify:v436`-Aufruf selbst nicht als vollständig erfolgreich** zu betrachten.
- **`npm run build` / Next.js-Produktion / vollständiges `npm run typecheck`: nicht bestätigt.** Es fehlen `node_modules` und der Lockfile; `node scripts/build-preflight.cjs` meldete nur 1 von 17 Hauptdependencies verfügbar (u. a. Next, React, R3F und Three fehlen). Vor Freigabe auf dem Entwicklungsrechner nach `npm install` erneut prüfen.
- **Browser-/echter GLB-/Spotify-Live-Test:** in dieser Laufzeit nicht möglich. Kein belegter 3D-Sichttest.

## Sicherheit und fachlicher Umfang

V436 ist **deterministische heuristische Automatik**, keine KI-Erkennung echter Rapper. Die generierten Shots sind nur bei V429- und V436-Freigabe live wirksam. Manuell gespeicherte V416-Rollen, V430-Shots, V432-Posen und vorrangige Kamera-Regien behalten Vorrang. Auto-Fixes bleiben normalerweise flüchtig; Festschreiben in V430 ist eine separate explizite Aktion. Ohne synchronisierte Lyrics und mindestens zwei Avatare bleibt die Kamera unangetastet. Ein geschätzter Qualitätswert ist **kein Beweis** für einen guten gerenderten Bildausschnitt.

## Windows-Abnahme

```powershell
npm install
npm run verify:v436
npm run test:imports
npm run typecheck
npm run build
```
