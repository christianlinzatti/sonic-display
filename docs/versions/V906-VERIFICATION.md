# V906 – Prüfbericht · Entwicklungsrelease

## Erfolgreich geprüft

- **1.150/1.150 V906 Regressionstests** – vorsichtige Empfehlungen und
  Messwertgrenzen, Lauf-/Profil-/Songtrennung, Mittelwerte/Median/IQR,
  JSON-/Markdown-Export ohne Track-IDs, Beschränkung auf echte V905-Durchläufe.
- **`npm run verify:v906:focused`: Exit 0**. Die fokussierte Kette
  umfasst V905–V880 mit den jeweils vorhandenen isolierten TypeScript-/UI-Gates
  sowie Syntax-, Architektur- und Modul-Casing-Prüfungen.
- **Alle 27 direkten Funktionstestgruppen V880–V906: Exit 0** (auch separat
  parallel kontrolliert). Alte Version-/Dokumentations- und Prebuild-Gates
  wurden lediglich für V906 erweitert; fachliche Assertions bleiben erhalten.
- **`test:v906:types` und `test:v906:ui-types`: Exit 0.**
- **Syntax- und Importprüfung: 1.322 TS/TSX-Dateien**, bestanden.
- **Windows/Linux-Modulnamen: 2.262 Quellmodule**, keine case-insensitiven
  TS/TSX-Kollisionen.
- **Architektur: 1.097 aktuelle Verweise und zehn Bereiche**, bestanden.
- CI `.github/workflows/v832-continuous-validation.yml` ergänzt; Windows
  Release-Gates unter `scripts/verify-v906-windows.ps1`.
- Manifest und Lockfile identisch **0.1.0-v906**.

## Nicht erfolgreich / noch offen

- `npm ci --offline --no-audit --no-fund`: **Exit 1 / ENOTCACHED** –
  `zustand@5.0.16` ist lokal nicht gecacht, daher kein installierter
  React-/Next.js-Abhängigkeitsbaum.
- `npm run typecheck`: **Exit 2**, zahlreiche fehlende Typmodule
  wie `next/server` und Node-Typen. **Kein erfolgreicher App-Gesamt-Typecheck**.
- `npm run build --ignore-scripts`: **Exit 127**, `next: not found`.
  **Kein erfolgreicher Next.js-Produktionsbuild**.
- Echter Browser-/WebGL-Test, reale Benchmarkaufnahme mit mehreren GLB-Avataren
  und hardwarebezogene FPS-Messungen: **nicht ausgeführt**.

## Aussagekraft der Messungen

- V906 nutzt ausschließlich echte, von V905 validierte abgeschlossene
  V826-Renderer-Fenster aus dem RAM-Verlauf. Die Tests setzen synthetische
  **Test-Fixtures** ein; sie sind **keine echten Hardware-Benchmarks**.
- Ein FPS-Median oder V826-P95-Fenstermittelwert ist keine GPU-Zeit,
  Bildqualitätsmessung, Strommessung oder kausaler Nachweis.
- Drei ähnliche Durchläufe sind eine vorsichtige Vergleichbarkeitsprüfung,
  keine wissenschaftlich abgesicherte Konfidenzaussage.
- V906 kann die Leistung eines Raspberry Pi oder Mini-PC nicht von einem
  anderen Gerät aus prognostizieren. Vor der Hardwarewahl sind dieselben
  realistischen GLB-Konzertszenen **auf der Zielhardware** auszuführen.
- Export enthält keine Songkennung, Zeitstempel, eindeutigen Lauf-IDs,
  Wiedergabepositionen oder einzelnen V826-Rohfenster.

**Status: getestete Entwicklungsfassung – keine Produktionsfreigabe.**
