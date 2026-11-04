# V860 – Prüfbericht · Artist Deep Dive

**Basis:** vollständige V859 ZIP (`sonic-display-v859-interactive-music-timeline.zip`).

## Erfolgreiche lokale Prüfungen

- `npm run test:v860`: Künstler-Normalisierung (inkl. Unicode und mehrfachen Leerzeichen), Song- und Album-Ranking, Ausschluss unbekannter Alben, erste/letzte Scrobble-Zeit, aktives/fehlendes Jahr, Jahresanteil an allen archivierten Scrobbles, invalid/future time, Wien/UTC-Monatsgrenze, immutables Archiv und kein zusätzlicher API-/Speicherzugriff, UI-Verdrahtung und Versionierung.
- `npm run test:v860:types` und `npm run test:v860:ui-types`: Strenger isolierter TypeScript-Check der reinen Datenlogik und der neuen React-Ansicht (nur testseitige Deklarationen aus `tests/stubs`, produktive Typen bleiben unberührt).
- Die bestehende History-Regression `test:v714`, `test:v855` bis `test:v859` sowie jeweils verfügbare gezielte TypeScript-/UI-Prüfungen V855–V859.
- Die Spotify-Regressionssuites V851–V854, einschließlich ihrer isolierten Typprüfungen, sowie die Konzert-Regressionssuites V849 (109 Gruppen) und V850 (135 Gruppen) mit ihren Typprüfungen.
- `npm run check:syntax`: 1251 TS-/TSX-Quelldateien und Importbindungen.
- `npm run check:architecture`: 983 überprüfte Codepfade, Dokumentationsstand V860.
- `npm run test:module-case`: 2118 Dateien, keine Windows-/Linux-Dateinamenskollisionen.
- `npm run check:lockfile:v752`: Lockfile, direkte Abhängigkeiten, CI-/Release-Prüfschranken, Isolierung der Testdeklarationen.

## Nicht bestanden / nicht durchgeführt

- **Vollständiger Produktiv-TypeScript-Check** (`npm run typecheck`) beendet mit Exit-Code 2, weil `node_modules` in dieser Containerumgebung fehlen. Unter anderem: `Cannot find module 'react' or its corresponding type declarations` und weitere Typdiagnosen. Das ist ausdrücklich **keine bestandene Gesamtprüfung**; zusätzliche produktive Fehler sind daher nicht ausgeschlossen.
- **Produktionsbuild** (`npm --ignore-scripts run build`, der direkte Next.js-Versuch ohne erneute Preflight-Kette) beendet mit Exit-Code 127: `next: not found`. Kein erfolgreicher Produktionsbuild.
- Kein Live-Last.fm-Login, kein echter Browser-/Touchscreen-Test, kein Laufzeit-Benchmark mit sehr großen echten Archiven. Berechnungen wurden anhand synthetischer, prüfbarer Daten getestet.

## Nachholen auf einem eingerichteten Rechner

```bash
npm ci
npm run test:v860
npm run test:v860:types
npm run test:v860:ui-types
npm run typecheck
npm run build
```

Der vollständige Build enthält die bestehende umfangreiche Projekt-Preflight-Kette; gezielte Tests ersetzen diese nicht. Bevor die Version produktiv freigegeben wird, müssen TypeScript, der gesamte Next.js-Build und die Browser-/Touch-Abnahme grün sein.
