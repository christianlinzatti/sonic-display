# V651 · Release-Sperre gegen TypeScript- und Windows-Importfehler

Für alle künftigen Builds den **vollständigen** Release-Check nutzen. Einzelne Versionstests reichen nicht: Sie kompilieren nur isolierte Typteile.

- `npm run check:release`: prüft Windows-/Linux-Dateinamenkollisionen, isolierte Test-Module und alle Projekt-Typen (`tsc --noEmit`).
- `npm run build`: startet automatisch `test:smoke:v651`, danach `check:release` und erst bei Erfolg `next build`.
- `npm run verify`: startet die bestehenden Regressionen und den echten Produktionsbuild.
- GitHub Actions `concert-validation-v571.yml`: prüft die volle Release-Sperre auf Windows und Linux bei jedem Push/PR.

Die UI-Komponenten `FullConcertQualityAuditPanelV641.tsx` und `ConcertTimelineOverlayV646.tsx` sind bewusst anders benannt als die gleichnamigen `.ts`-Rechenmodule, damit Windows nicht die falsche Datei importiert.

**Wichtig:** Ein erfolgreicher lokaler Typecheck allein beweist weder echte GPU-/Browser-Performance noch den vollständigen Next.js-Build. Erst `npm run build` grün bedeutet technisch erfolgreich kompiliert.
