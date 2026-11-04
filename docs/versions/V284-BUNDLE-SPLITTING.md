# Sonic Display V284 – Route Bundle Splitting

Basis: V283. Alle vorhandenen Projektdaten und Funktionen bleiben erhalten.

## Was neu ist

- `components/SonicDisplay.tsx`: `KineticLyrics`, `AmbientStandby`, `TouchKioskControls` und `AutoApplyPerformanceProfile` werden per `next/dynamic` dynamisch importiert und beim Rendern bei Bedarf geladen. Ihre Hooks und der bestehende React-State bleiben unverändert eingebunden.
- Die vorhandene Lazy-Loading-Logik für Stage Modal, Stage Cards und Settings bleibt bestehen.
- `services/monitoring/performanceOptimizationImpactV265.ts`: Der bekannte TypeScript-Fehler bei `number | null` ist in der Projektbasis behoben.
- `scripts/report-route-js.cjs`: Bericht der JavaScript-Dateien für Route `/` aus `.next/build-manifest.json` (unkomprimierte Größen, **nicht** gleichzusetzen mit Next.js „First Load JS“).
- Regressionstest `tests/v284-bundle-splitting-regression.cjs`.

## Überprüfung

Hier erfolgreich:
- `npm run check:syntax`
- `npm run verify:offline` (alle enthaltenen Offline-Tests)

Hier nicht möglich: `npm run build` (fehlende installierte npm-Abhängigkeiten). Die tatsächlich gesparte Zahl an JS-kB ist **nicht gemessen**. Durch Code-Splitting kann sich die Gesamtgröße der Chunks anders verteilen; es ist keine bestimmte Einsparung garantiert.

## Lokal messen

```bash
npm install
npm run build
npm run analyze:route-js
```

Die *First Load JS*-Spalte von `npm run build` mit der V283-Baseline **361 kB** vergleichen. Zusätzlich im Browser-Network-Tab prüfen, ob die ausgelagerten Chunks erst beim Verwenden der jeweiligen Funktion geladen werden. Da die Settings beim Hover vorladen können, in einem frischen Browserprofil / Cache vergleichen.
