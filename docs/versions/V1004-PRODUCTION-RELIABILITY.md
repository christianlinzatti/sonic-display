# V1004 – Production Reliability 2.0

## Ursache der aktuellen GitHub-Actions-Fehler

Die Jobs vom 5. November 2026 endeten vor dem vollständigen TypeScript- und
Next.js-Produktionsbuild. Die V908-, V910-, V925- und V929-Suiten erwarteten
unveränderlich die alte `prebuild`-Startreihenfolge beziehungsweise den
Dokumentationsstand V908. Spätere Releases setzen berechtigt neue Regressionen
vor die historischen Tests. Die betroffenen Tests wurden auf belastbare,
vorwärtskompatible Assertions umgestellt, **ohne** die eigentlichen Govee-,
Avatar-, Privatsphäre-, Origin- oder Sicherheitsprüfungen abzuschalten.

## Produktionsfreigabe

Die V1004-Gates verlangen:

1. Vollständigen Versions- und Lockfile-Abgleich vor der Installation;
2. Exakte Installation mit `npm ci --include=dev` auf Node 24;
3. Alle früheren konkreten regressionsgebundenen Sicherheitsprüfungen;
4. Vollständigen Projekt-Check `npm run typecheck` (`tsc --noEmit`);
5. Reales Next.js-Produktionsbuild `npm run build:next` (`next build`).

Die Node-24-Checks laufen in `.github/workflows/v1004-production-reliability-validation.yml`
unter Ubuntu 24.04 und Windows. Die Vercel-Gate-Sequenz behält `vercel-production-build.cjs`
mit Full-Typecheck und echter Next.js-Artefaktprüfung und fügt den V1004-Gate hinzu.

### Lokal verifiziert

- Alte CI-Blocker V908, V910, V925, V929 bestehen.
- V959 Regression Pool: 59/59 Suiten bestanden.
- V1004 9 Integritätsgruppen, V752-Release Integrity, Syntax und Architektur bestanden.
- Lokale Node 22/npm-Cache-Umgebung kann den Node-24-Produktionsbuild **nicht** zertifizieren:
  npm ci --offline benötigt `zustand@5.0.16`, das nicht im Cache liegt.

**Wichtig:** GitHub-Workflow-Dateien sind im ZIP-Importer geschützt und müssen
bei Bedarf separat ins Repository übernommen werden. Eine grüne Quellcode- oder
Regressionstestserie ist keine Produktionsfreigabe.
