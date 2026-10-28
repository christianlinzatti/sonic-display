# V641 – Verifikation

## Prüfbereiche

- Gültige und manipulierte Live-Messwerte, Monotonie, Trackwechsel, Seek-Sprünge, Pausen und Datenlücken.
- Beobachtete Abdeckung (nicht aus Anzahl Screenshots oder geplanten Songpositionen geschätzt), Start-/Endnachweis.
- FPS-, P95-, Avatar-, Kopf- und Lyrics-Geometrie-Indikatoren; konservative Kameramotiv-Hinweise.
- Keine automatische Qualitätsfreigabe, keine Audio-/Lyrics-Aufzeichnung, kein Raspberry-Pi-Leistungsversprechen.
- Bisherige QA- und Konzertprüfungen V627, V603, V592 und V640 sowie die vollständige V640-Smoke-Kette.

## Reproduzierbare Befehle

```bash
npm run test:v641
npm run test:v641:compare
npm run test:v641:types
npm run check:syntax
npm run check:architecture
npm run test:smoke:v641
npm run verify:v641
npx tsc --noEmit
npm run build
```

### Messgrenzen

Die Skripttests simulieren Prüfprotokolle, **keine echten Konzertaufnahmen**. Die Oberfläche muss zusätzlich mit Spotify-Song und real geladenen GLB-Avataren auf dem Zielsystem geprüft werden. Insbesondere 1-/2-/4-Avatar-Browser-Benchmarks und ein gesamter Live-Track liegen hier noch nicht vor. Der vollständige Next.js-Produktionsbuild erfordert die Projektabhängigkeiten (`npm install`).

## Ergebnis in dieser Arbeitsumgebung (27. Oktober 2026)

- **PASS** `npm run test:v641`: 68 Regressionstest-Gruppen und 12.000 simulierte Datensätze.
- **PASS** `npm run test:v641:compare`: 17 Regressionstest-Gruppen; GLB-Mesh-Nachweis über V592 explizit verlangt.
- **PASS** `npm run test:v641:types`: isolierte TypeScript-Kernprüfung.
- **PASS** `npm run test:smoke:v641`: vollständige vorgelagerte Testkette bis V616 sowie Syntax und Architektur (`v641-smoke-detached.log`, Exitcode 0).
- **PASS** `npm run verify:v641`: V640–V635, V627, V603, V592 sowie Syntax- und Architekturprüfungen (`v641-verify-final.log`, Exitcode 0).
- **PASS** Syntax/Import-Bindings aller 866 TS-/TSX-Dateien; 521 referenzierte Architekturpfade.
- **NICHT MÖGLICH** `npm --ignore-scripts run build`: `next: not found` (kein installiertes `node_modules`).
- **NICHT MÖGLICH** vollständiges `tsc --noEmit`: fehlende Framework-/Node-Abhängigkeiten und Typdefinitionen, z. B. `next/server`. Die isolierte V641-Typeprüfung dagegen ist grün.
- **NICHT GEMESSEN** echte GLB-Avatare in Live-Songwiedergabe, Browser-FPS-Verlauf und tatsächliche visuelle Qualität. Kein Raspberry-Pi-Leistungstest.

Diese Testdaten sind kein Ersatz für Live-Aufnahmen und berechtigen nicht zu einer künstlerischen Qualitätsfreigabe.
