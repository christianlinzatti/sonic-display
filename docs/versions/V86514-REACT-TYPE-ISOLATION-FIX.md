# V865.14 – React/R3F Type Isolation Fix

## Ursache

`tests/tsconfig.v751-ui.json`, `tsconfig.v753-ui.json`, `tsconfig.v754-ui.json` und `tsconfig.v755-ui.json` importieren über den Concert Quality Dashboard-Graphen auch den echten 3D-Renderer (`ThreeAvatar.tsx`). Gleichzeitig banden sie `stubs/v701-react-jsx.d.ts` und `stubs/v751-react-external-store.d.ts` ein. Diese `declare module 'react'`-Typmocks definieren nur Teilmengen der React-API und überschatteten die offiziellen React-Typen innerhalb der jeweiligen Test-Compilation. Das verursachte Folgefehler TS2305 (fehlende Hooks), TS2345 (`useRef<T>(null)`), TS2339 (R3F-Elemente wie `<mesh>`/`<group>`) und TS2786.

## Umsetzung

- In den **vier** betroffenen UI-Typechecks beide React-Teststubs entfernt.
- `../global.d.ts` aufgenommen, damit die produktiven CSS-Moduldeklarationen erhalten bleiben.
- Die isolierten Tests behalten `include: []`, `exclude: []` und `incremental: false`; der Produktions-Typecheck wird **nicht** aufgeweicht.
- Regressionstest `tests/v86514-react-type-isolation-regression.cjs` deckt sämtliche `tests/tsconfig.*ui.json` ab, die über lokale Imports den echten `ThreeAvatar.tsx`-Renderer erreichen, und verbietet dort ambient React-Teststubs.
- `npm run check:test-types` ruft die neue Regression zusätzlich auf.

## Lokal/CI prüfen (mit installierten Abhängigkeiten)

```powershell
npm ci
npm run test:react-type-isolation:v86514
npm run check:test-types
npm run test:v751:ui-types
npm run test:v753:ui-types
npm run test:v754:ui-types
npm run test:v755:ui-types
npm run typecheck
npm run test:smoke:v665:flat
npm run check:release:flat
npm run build:flat
```

`npm run build:flat` führt zunächst die bisherige Prebuild-Kette aus und startet anschließend `next build`.

## Verifizierung in der Bearbeitungsumgebung

Bestanden: neue Typisolierungs-Regressionsprüfung; `check:test-types`; funktionale Tests V751/V753/V754/V755; `check:syntax` (1261 TS/TSX); `check:architecture`; `test:module-case`; Windows-CRLF-Simulation der 10 Regressionstests.

**Noch offen:** `tsc`-UI-Checks, vollständiger `npm run typecheck` und `next build`, weil die npm-Pakete nicht installiert sind und die npm-Registry aus dieser Umgebung per DNS nicht erreichbar war. Daher wird kein verifizierter Windows- oder Production-Build behauptet.
