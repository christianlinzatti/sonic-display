# Sonic Display V887 – Prüfprotokoll (03.11.2026)

## Nachweisbar erfolgreich

- **V887-Kern-Regression: 78/78** (`npm run test:v887`) nach finaler Abstimmung der Nebelstärke.
- `npm run test:v887:types` – strenger isolierter TypeScript-Check des V887-Kerns/Bridges erfolgreich.
- `npm run test:v887:ui-types` – isolierter TS/JSX-Check des Live-FX-Bedienfelds erfolgreich. Diese Prüfung verwendet lokale Test-Deklarationen, ersetzt keinen projektweiten TypeScript-Check.
- `npm run verify:v887:focused` – **Exit 0**, vor der letzten begrenzten numerischen Nebel-Anpassung ausgeführt. Prüfte V887 und vollständige V886→V880-Fokuskette sowie ältere Konzert-, LED-, Lyrics- und Bühnen-Regressionen.
- **Nach der letzten numerischen Abstimmung:** V887-Regression 78/78, beide isolierten TypeScript-Prüfungen und V814-Original-Nebelregression (11 Checks) erfolgreich.
- `npm run check:syntax` – 1.294 TS/TSX-Dateien erfolgreich.
- `npm run test:module-case` – 2.213 Quellen ohne case-insensitive TS/TSX-Modulkollisionen.
- `npm run check:architecture` – V887 mit 1.031 Code-Referenzen erfolgreich.
- V887 in `prebuild`/`build:preflight`, GitHub CI und `scripts/verify-v887-windows.ps1` eingebunden.

## Noch offen (keine Produktionsfreigabe)

- `npm ci --offline` – **Exit 1**, `zustand@5.0.16` ist nicht im lokalen Cache (`ENOTCACHED`).
- `npm run typecheck` – **Exit 2**: Abhängigkeiten wie Next.js/React/Node-Typdefinitionen fehlen. Deshalb kein gültiger produktiver Gesamt-Typecheck.
- `npm run build --ignore-scripts` – **Exit 127**, `next: not found`; kein gültiger Next.js-Produktionsbuild.
- Kein Browser-/WebGL-Compile, visuelles Rendering oder FPS-Benchmark in der Zielumgebung durchgeführt. Der V887-Shader ist durch statische Tests und die beibehaltene V814-Struktur geprüft, nicht auf einer realen GPU.
- Es ist kein Raspberry-Pi-Test erfolgt.

## Windows-Freigabe

Im entpackten vollständigen Projekt `npm ci`, `npm run verify:v887:focused`, `npm run check:architecture`, `npm run typecheck`, `npm run build` und danach `npm run dev` ausführen. Alternativ `scripts/verify-v887-windows.ps1` ausführen; es ergänzt den Node-PATH, um bekannte Windows-npm-Unterprozessfehler zu vermeiden. In der 3D-Bühne die V814-atmosphärischen Effekte aktivieren und V887 bei Deutschrap, Hardtekk, Deutschrock, Songwechsel, Lyrics-Fokus und Blackouts visuell kontrollieren.

**Status:** Vollständiges regressionsgeprüftes Quellcodepaket, **keine bestätigte Produktionsfreigabe**.
