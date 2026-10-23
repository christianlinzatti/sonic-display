# V443 – Verification

## Erfolgreich ausgeführt

- `npm run test:v443`: Pure Testfälle für 4er-/Hook-Regie, Ausrichtung, Begrenzungen, Umschalt-/Manual-/Pause- und Reduced-Motion-Gates, 3D-Renderer- und UI-Integration; isoliertes `tsc --noEmit`.
- `npm run verify:v443`: V443 + V439–V442, Check-Syntax (606 TypeScript/TSX-Dateien), V404-Import-Check (959 Projektdateien/2109 Imports), Module-Case-Check (959 Projektdateien), V190-Motion-Library-Regression (21 Checks).
- Zusätzlich einzeln bestanden: V423, V424, V425, V426 und V429–V438.

## Nicht bestätigt

- Gesamter Next.js-Produktions-Build `npm run build`, vollständiger Projekt-Typecheck `npm run typecheck` und visuelle Browser-/WebGL-E2E-Tests mit mehreren realen GLBs sind **offen**; Node-Pakete fehlen in dieser Umgebung.
- Die testbare Richtungsplanung garantiert keine universell optimale Körperhaltung für alle importierten Avatare. Rotationen gelten nur für Bühnenwurzeln, nicht Augen-/Kopf-Bones.

## Lokal ausführen

```powershell
npm install
npm run verify:v443
npm run typecheck
npm run build
```
