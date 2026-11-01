# V763 – Verification (2026-10-30)

## Erfolgreich

- **V763 Kernregression** (`npm run test:v763`): 120.086 geprüfte Assertions für echte V761-Pläne, fehlende Evidenz, Song-Scope, Sprünge, Pausen und V354-Laufzeit-Cues aller sechs Spuren. Die wiederholten deterministischen Assertions sind kein Ersatz für einen Browser-Test.
- **V763 isolierte TypeScript-Prüfungen** (`test:v763:types`, `test:v763:ui-types`): beide erfolgreich; produktive Next-/React-Deklarationen werden dabei nicht vorgetäuscht.
- **V735–V762 Versionsregressionen**: 28/28 bestanden.
- **Statische Release-Prüfung** (`verify:v763:static`): V763/V762/V761 Kern- und Typchecks, Syntax, Architektur und Windows-/Linux-Moduldateinamen. Der vollständige statische Release-Zyklus verwendet keine Fake-Produktions-Typdefinitionen.
- **Lockfile-Integrität** (`check:lockfile:v752`): passendes `0.1.0-v763`-Manifest und package-lock, 18 direkte Abhängigkeiten konsistent.
- **CI**: Ubuntu/Windows-Workflow führt die neuen V763-Regressions- und isolierten Typchecks vor dem echten `npm run typecheck` und `npm run build` aus. Dies belegt nicht, dass der CI-Lauf bereits stattgefunden hat.
- ZIP-Konsistenz und CRC: nach Archivierung gesondert geprüft.

## Nicht erfolgreich oder nicht ausgeführt

- `npm ci --offline --no-audit --no-fund --ignore-scripts`: `ENOTCACHED` für `zustand-5.0.16.tgz`.
- `npm run typecheck`: wegen fehlender Next.js-/React-/Node-/Three-Typen nicht erfolgreich; zusätzlich wurde ein zuvor bestehender falscher Typverweis auf `StageLightingSettingsV762` entdeckt und in V763 durch einen kompatiblen Alias korrigiert. Kein belastbarer Gesamttypcheck ohne vollständiges `npm ci`.
- `npm run build`: während der Vorprüfungen gestoppt, bevor die Next.js-Kompilierung stattfand; die Vorprüfung zeigt **0/18** installierte direkte Abhängigkeiten. Produktionsbuild und Browser-/GLB-Tests daher **nicht verifiziert**.

## Reproduktion unter Windows

```powershell
npm ci --no-audit --no-fund
npm run verify:v763:static
npm run typecheck
npm run build
```

Hinweis: keine halb installierten `node_modules`, `.next`-Ausgaben oder externen npm-Cache-Dateien sind Bestandteil des V763-Projekt-ZIP.
