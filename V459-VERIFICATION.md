# Sonic Display V459 – Prüfprotokoll

## Ausgangsbasis

- Vollständige V458-Arbeitsbasis (`0.1.0-v458`), Release V459 `0.1.0-v459`.
- Kein neuer API-Schlüssel, keine neuen Einstellungen, keine geänderten GLB-Clips.
- Alle Dateien des V458-ZIP wurden übernommen (Archivrevision separat abgeglichen).

## Erfolgreich ausgeführt

- `npm run verify:v459` – **PASS / Exit-Code 0**.
- Neue V459-Regression + isolierter TypeScript-Typcheck `tests/tsconfig.v459-core.json` – **PASS**.
- Konservative Tests für tatsächliche Wortzeitmarken, Rap/Gesang, verbundene/getrennte Wörter, Vokalübergänge, P/B/M-Verschluss, Hand-Edits, lokalen V423-Audio-Mundvorrang, manuell stillgelegte Sänger-Slots, Pause/Reduced Motion und handgesetzte Körperbewegung – **PASS**.
- Deterministische Langzeitabtastung der **reinen V459-Planerfunktion** über simulierte 30 Minuten und Grenzen aller Gesichts-/Kopfwerte – **PASS**, **kein echter Browser-Lauftest**.
- Wichtige Vorläufer für Lip-Sync, Vocal, Mimik, GLB und Keyframes: V384, V393, V406, V407, V419, V420, V421, V422, V423, V424, V425, V426, V453 – **PASS**.
- Gezielte neuere Regressionen von V445 und V446 bis V458 (einschließlich Genius, Rap-Automatik, 3D-Dance, Lyrics und Kamera), sowie V442 und V429 – **PASS**.
- `npm run check:syntax` – **PASS: 626 TS-/TSX-Dateien**.
- `npm run test:imports` – **PASS: 996 Projektdateien, 2.201 Imports**.
- `npm run test:module-case` – **PASS: 996 Quelldateien ohne Modulnamenkollisionen**.
- Der alte V458-Regressionstest akzeptiert nun Folgeversionen; V384 verwendet keine fest einprogrammierte frühere Versionsliste mehr. V393/V406/V407 kontrollieren nach wie vor die tatsächlichen Rap-/GLB-Overlays, berücksichtigen aber die neue zusätzliche V459-Kompositionsschicht.

## Nicht bestätigt

- Ein vollständiger `npm run typecheck` über **alle** React-/Next.js-Dateien und `npm run build` konnten hier mangels installierter npm-Abhängigkeiten nicht durchgeführt werden. Der isolierte Typcheck ersetzt sie nicht.
- Kein Live-Spotify, kein wirklicher WebGL-/Morph-Test mit importierten GLB-Dateien, keine Raspberry-Pi-FPS-/Temperatur-/Langzeitmessung.
- Der wortbezogene Visualisierungsalgorithmus erkennt **weder Phoneme noch tatsächliche Sänger**. Artist-Credits und Zeilentimestamps reichen dafür nicht aus.

## Lokale Abschlussprüfung

```powershell
npm install
npm run test:v459
npm run verify:v459
npm run typecheck
npm run build
```
