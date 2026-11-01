# Sonic Display V754 – Prüfbericht (30. Oktober 2026)

## Grün – hier tatsächlich ausgeführt

- `npm run test:v754`: **140.146 Assertions** für Kopf-/Fuß-/Hüftprojektionen, 1–4 Avatare, Lyrics-DOM-Geometrie, Grenzwerte, fehlende Evidenz, Stale-Snapshots, Verlauf und read-only Dashboard-Wiring.
- `npm run test:v754:types`: strikte isolierte TypeScript-Prüfung des V754-Analysemoduls.
- `npm run test:v754:ui-types`: isolierte React-/Dashboard-Typprüfung (nur Test-Stub-Typen; **kein** Ersatz für volle React-/Next-Typen).
- `npm run verify:v754:static`: V754-, V753- und V752-Testkette, Lockfile-Integrität, Syntax, Architektur, Windows-/Linux-Dateinamen und Testtyp-Isolation bestanden.
- Einzelregressionen **V735–V753: 19/19 bestanden**; zusätzlich die älteren WebGL-/QA-Regressionen V466/V467 und V513, V542, V598, V633, V634, V655, V682, V688, V689.
- Die V510–V512-Regressionen sind erfolgreich; ihre älteren Quellcode-Strukturprüfungen wurden auf den V754-Buildpfad angepasst, die numerischen/inhaltlichen Prüfungen bleiben erhalten. `build:preflight` enthält die V512→V511→V510-Testkette.
- V754 nimmt keine Pixelproben, installiert keine neuen Abhängigkeiten, ändert keine Kamera-, Licht-, Lyrics-, Foot-IK- oder Choreografieeinstellungen. Keine Screenshots, Titel oder Lyrics werden gespeichert.

## Nicht grün – zwingend nachinstallieren bzw. am Browser prüfen

- `npm ci --offline --ignore-scripts --no-audit --no-fund`: **ENOTCACHED** (`zustand-5.0.16.tgz` nicht im Cache).
- `npm run typecheck`: **nicht erfolgreich** wegen fehlender React-/Next.js-/Node-Pakete und Typdefinitionen; kein valider vollständiger Produktiv-Typcheck.
- `npm run build`: `prebuild` hat V754-Regressionen/Typprüfungen bestanden, stoppt jedoch beim `check:dependencies` mit **0/18** direkt erforderlichen Paketen, bevor `next build` kompiliert.
- Kein tatsächlicher WebGL-/GLB-Browserlauf in dieser Umgebung; Kamera-, Fuß- und Lyrics-Projektionen wurden mit Testdaten geprüft, nicht durch visuelle Browserabnahme bestätigt.
- **Keine optische Messung** von Kontrast, Luminanz, Schatten, Nebel, GPU-Last oder verdeckten Pixeln: explizit als nicht gemessen ausgewiesen.

## Vollständige lokale Freigabe unter Windows

```powershell
npm ci --no-audit --no-fund
npm run verify:v754:static
npm run typecheck
npm run build
```

Anschließend auf echtem Browser mit einem bis vier geladenen GLB-Avataren, Lyrics im Bühnenbild sowie mehreren Kamera-/Licht-Cues die Projektion visuell kontrollieren. Die V466-WebGL-Probe muss aktiv sein; ohne frische Quelle zeigt das Dashboard korrekterweise „Keine aktuelle Messung“.

**Freigabestatus:** Geprüfter Quellcode-Buildkandidat, **nicht produktionsverifiziert**.
