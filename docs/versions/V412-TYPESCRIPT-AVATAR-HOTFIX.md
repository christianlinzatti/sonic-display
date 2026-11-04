# V412 – TypeScript Null-Guard Hotfix

Build-Fehler: `RapRealAvatarPreviewV409.tsx:51:40` (`TS18047: 'external' is possibly 'null'`).

Das Laden eines installierten GLTF-Clips prüfte zwar `external?.url`, griff im positiven Zweig aber ohne Null-Guard auf `external.clips[0]` zu. Die Laufzeitlogik war korrekt, aber TypeScript konnte die Beziehung in dieser Schreibweise nicht nachweisen.

**Korrektur:** `external?.clips[0]` verwendet jetzt ebenfalls Optional Chaining, mit derselben `null`-Fallback-Logik.

**Test:** `npm run test:v412` führt zusätzlich `tests/v412-avatar-preview-nullguard-regression.cjs` aus. Der Test extrahiert die wirkliche `useMemo`-Selektion und kompiliert sie isoliert mit TypeScript `strict: true` und `noEmit: true`. So tritt derselbe TS18047-Fehler bei einer Regression erneut auf.

**Installation:** Einzelne Datei `components/visualizer/RapRealAvatarPreviewV409.tsx` ersetzen. Der vollständige Hotfix enthält außerdem die Regressionserweiterung. Danach `npm run typecheck` und `npm run build`.

**Hinweis:** Dies ist ein punktueller TypeScript-Hotfix, kein Nachweis eines vollständigen Next.js-Produktions-Builds in dieser Umgebung.
