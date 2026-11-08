# V1110 Release- und Testhinweise

- `npm run test:v1110` – echte zeitliche Energiemuster, Fehlersignale, Intensitätsgrenzen und Story-Synchronisierung
- `npm run test:v1110:types` – isolierte Kern-Typenprüfung
- `node scripts/v959-source-preflight.cjs` – bestehende Source- und Release-Gates
- `node tests/production-workflow-regression.cjs` – YAML- und Workflow-Gates (benötigt npm-Abhängigkeiten)
- GitHub Actions: vollständiger Ubuntu-Produktionsbuild/Playwright/Soak; Windows TypeScript und Next-Build.
- Kein Aussenden von Audio an OpenAI; V1110 prüft nur die bestehenden RAM-Messpunkte.
- Drop-Phase `impact-observed` ist ein bereits gemessener Einschlag, keine Vorhersage.
