# V446 – Verifikation (21. Oktober 2026)

## Bestanden

- `npm run verify:v446`: V446 bis V429 (inkl. V445-Kerntypen), V426–V423, V190, V242, Syntaxprüfung, Importintegrität, Modulnamenkonsistenz erfolgreich.
- V446-Regression: deterministische Szenen und Seeks, 1–4 Avatar-Slots, gemeinsame Hooks aufgrund wiederholter Lyrics, ruhiger Mindestabstand, Tempo-Fallback, fehlende Metadaten, manuell geschützte Formationen und Kamerazuweisungen, Reduced Motion, Pausen, ungültige Zeiten, integrierte UI- und Stage-Verkabelung.
- Neue reine V446-Szenenberechnung: strenge isolierte TypeScript-Kernprüfung (`tsc -p tests/tsconfig.v446-core.json --noEmit`).
- `npm run check:syntax`: 609 TS-/TSX-Dateien.
- `npm run test:imports`: 965 Quelldateien / 2.124 Imports.
- `npm run test:module-case`: 965 Quelldateien ohne case-insensitive Modulkonflikte.
- ZIP: CRC-Prüfung, Dateianzahl, Manifestversion, Pflichtdateien und komplette V445-Dateiabdeckung beim Packaging überprüft.

## Nicht ausgeführt

- Kein vollständiges `npm run typecheck` und `npm run build`, da die Projektabhängigkeiten (`node_modules`) nicht mitgeliefert werden und in der Prüf-Umgebung nicht installiert sind. Die isolierten Kernprüfungen ersetzen **keinen** vollständigen Next.js-Build.
- Kein praktischer WebGL-, Spotify- oder realer GLB-Motion-End-to-End-Test. Die Synthesetests beweisen die Auswahlregeln, nicht eine perfekte Gesangs-/Bewegungssynchronität mit einem echten Song.

## Auf Windows ausführen

```powershell
npm install
npm run verify:v446
npm run typecheck
npm run build
```
