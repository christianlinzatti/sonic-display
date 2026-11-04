# V467 – Verification

## Bestanden

- `npm run test:v467`: **PASS**. Drei aufeinanderfolgende Messungen als Mindestbasis; Einbruch einzelner Frames führt zu keinem falschen dauerhaften Tipp; stale/ungültige Werte; GLB-Ladezustand, Kamera-/Lyrics-Projektionen und geschätzte Köpfe; Prioritäten (höchstens drei); Low-Qualitäts-Hinweise; deterministische 30-Minuten-Logik-Simulation. Isoliertes TypeScript (`tsc -p tests/tsconfig.v467-core.json --noEmit`) erfolgreich.
- `npm run verify:v467`: **PASS** einschließlich V466, V465, V464, V463, V462, V461, V460, V459, V458, V457, V456, V455, V451, V446, V441 und Strukturprüfungen. Die bisherigen V465-/V466-Versionsprüfungen wurden für nachfolgende Releases geöffnet; deren eigentliche Schutz- und Verhaltensprüfungen bleiben bestehen.
- Quelltext-Strukturprüfung: **638** TS-/TSX-Dateien und **2.257** Imports aus **1.016** Projekteinträgen, keine erkannten Import-Casing-Kollisionen.
- Chromium-/Playwright-Fixture: **PASS** bei 800×480, 1024×600 und 1280×800. QA-Fenster innerhalb der Bühne, V467-Hinweisblock korrekt enthalten, scrollbar. **Nur statische Testdaten.**

## Nicht als bestanden ausgewiesen

- `npm run typecheck` der *gesamten Anwendung*: nicht erfolgreich, da dieser Offline-Laufzeitumgebung `node_modules` mit Next.js/React und `@types` fehlen. Das Kernmodul mit isoliertem TS wurde dagegen geprüft.
- `npm run build`: Der `prebuild`-Hook startet zunächst `build:preflight` und eine lange historische Regressionstestkette. Der hier versuchte Gesamtlauf erreichte innerhalb des verfügbaren Laufzeitfensters nicht den eigentlichen `next build`. Ohne npm-Abhängigkeiten könnte der Next-Build anschließend ohnehin nicht ausgeführt werden. **Kein bestätigter Next-Produktionsbuild.**
- Echte WebGL-Sichtbarkeit / Gesichtsausleuchtung, GLB-Rig-Kompatibilität, Spotify-Songwechsel und Raspberry-Pi-Hardware-FPS: nicht getestet. Die Browser-Fixture beweist keine realen GPU-Metriken.

## Release-Abgleich

Das V467-ZIP muss alle Dateien aus dem bestätigten V466-ZIP enthalten. ZIP-CRC-Test, Dateizahl und Versionsnummer werden beim Packen geprüft. Für echte Geräteabnahme siehe die Checkliste in `V467-INTELLIGENT-SHOW-QUALITY-ADVISOR.md`.
