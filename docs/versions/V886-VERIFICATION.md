# Sonic Display V886 – Prüfprotokoll (03.11.2026)

## Erfolgreich ausgeführt

- `npm run test:v886` – **127/127** neue Regressionen erfolgreich.
  Abgedeckt: vier neue Visuals, Genre/Abschnitte, deterministische Timing-/Audio-Bindung,
  reduzierte Bewegung, Blackout, Pausen, manuelle LED-/Lichtsteuerung, Lyrics-/Kameraschutz,
  GPU-Budget, Leistungslimits, Shader-Vererbung, Uniform-Reset, Bedienfeld, Version und CI.
- `npm run test:v886:types` – isolierter strenger TypeScript-Check des Planers
  und der Shader-Komposition erfolgreich (`types: []` wegen fehlender lokaler Pakete).
- `npm run test:v886:ui-types` – isolierter TS/JSX-Check des bestehenden Concert-FX-Panels
  einschließlich neuer V886-Kontrollen erfolgreich. Die Testkonfiguration verwendet
  **nur testlokale React-Stubs** und deaktiviert `noImplicitAny` für das alte,
  umfangreiche Panel. Dies ist **kein vollständiger produktiver UI-Typecheck**.
- `npm run verify:v886:focused` – **Exit 0**, vollständig erfolgreich. Schließt
  alle relevanten V885 bis V880-Prüfketten und ältere Konzert-, 3D-, Lyrics-,
  Kamera-, Crowd-, Performance- und Bühnenregressionen ein.
- `npm run test:v870`, `test:v842`, `test:v822`, `test:v821`, `test:v812`,
  `test:v647` – erfolgreich. Historische Shader-Integrationstests wurden so
  aktualisiert, dass sie die neuen V886→V842→V821→V812→V647-Abhängigkeiten
  wirklich prüfen, statt nur den alten Shader-Dateinamen zu verlangen.
- `npm run test:module-case` – **2.210** Quellen ohne case-insensitive Modulkonflikte.
- `npm run check:syntax` – **1.292** TS/TSX-Dateien geprüft.
- `npm run check:architecture` – bestanden, Dokumentationsstand 0.1.0-v886.
- `package.json` / `package-lock.json` auf V886 synchronisiert. V886-Tests sind
  in `prebuild`, `build:preflight`, der GitHub Actions CI (Ubuntu/Windows) und
  `scripts/verify-v886-windows.ps1` eingebunden.

## Offene Freigaben und Einschränkungen

- `npm ci --offline` – **Exit 1**, `zustand@5.0.16` ist nicht im lokalen
  npm-Cache vorhanden (`ENOTCACHED`).
- `npm run typecheck` – **Exit 2** wegen fehlender `next`, React, Node und weiterer
  produktiver Typdefinitionen. Der projektweite TypeScript-Check ist **nicht freigegeben**.
- `npm run build --ignore-scripts` – **Exit 127**, `next: not found`.
  Der Next.js-Produktionsbuild ist **nicht freigegeben**.
- Ein Chromium-/WebGL-Lauf war nicht möglich, da in dieser Umgebung EGL/ANGLE
  keine GPU-Display-Initialisierung bereitstellen konnte. Deshalb sind der
  vollständige GLSL-Compile-Test und ein realer 3D-Show-Durchlauf **offen**.
- Keine FPS- oder GPU-Lastmessung und keine Raspberry-Pi-Hardwareprüfung.

## Freigabe auf dem Ziel-PC (Windows)

Im entpackten Projekt `npm ci`, `npm run verify:v886:focused`,
`npm run check:architecture`, `npm run typecheck`, `npm run build` und
`npm run dev` ausführen. Anschließend in der 3D-Bühne alle vier LED-Muster,
manuelle Prioritäten, Songwechsel, Lyrics-Fokus und Reduced Motion testen.
Der integrierte Windows-Qualitätslauf `scripts/verify-v886-windows.ps1`
setzt den lokalen Node-PATH für untergeordnete npm-Prozesse explizit.

**Status:** Regressionsgeprüftes Quellcodepaket, **keine bestätigte Produktionsfreigabe**.
