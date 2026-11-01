# V752 – Build & Integration Stability

## Ziel und wirkliche Änderung

Diese Version modernisiert den Releasepfad, ohne die Konzertregie oder das Rendering umzustellen. Wichtig: Ein erfolgreiches Lockfile-/Syntax-/Regressionsergebnis **ist keine erfolgreiche Next.js-Produktionskompilierung**.

### 1. Produktionstypen sauber isolieren

`tsconfig.json` schließt jetzt `tests` und `tests/**/*` aus dem **produktiven** `tsc --noEmit`-Projekt aus. Zuvor wurden Testdateien und test-only Ambient-Declarations über `**/*.ts` und `**/*.tsx` mit einbezogen; teilweise existierten spezielle Ausnahmen für einzelne Stubs. Die pauschale Trennung ist wartungssicherer, falls in künftigen Versionen neue Test-Stubs hinzukommen.

Die isolierten `tests/tsconfig.vXXX*.json` verweisen ausdrücklich auf ihre Fixtures und Anwendungsmodule. Ihre erfolgreichen Prüfungen werden nicht als Ersatz für den vollständigen TypeScript-Check verwendet. `strict`, `forceConsistentCasingInFileNames` und `noEmit` bleiben aktiviert.

### 2. Lockfile- und Release-Integrität vor dem Installieren

`scripts/release-integrity-v752.cjs` kontrolliert **ohne npm-Pakete oder Netzwerk**:

- Die Übereinstimmung von Projektname und Version an allen drei Stellen in `package.json` und `package-lock.json` sowie das Lockfileformat.
- Exakt passende deklarierte Versionsbereiche aller direkten Dependencies/DevDependencies und ihre Version-/Integrity-Einträge im Lockfile.
- Den unveränderten produktiven Buildpfad über `prebuild`, `typecheck` und `next build` sowie den Ausschluss der Test-Typdeklarationen.
- Die verbindlichen Windows-/Linux-CI-Stationen: `npm ci`, statische Prüfung, produktiver Typcheck, Next.js-Build.

Das Skript ist **read-only** und prüft nur Manifest- und Workflow-Metadaten; es lädt nichts herunter und garantiert **nicht**, dass das Paketarchiv im lokalen npm-Cache verfügbar ist. Für den kompletten transitiven `npm ci`-Korrektheitsnachweis sind ein erfolgreicher npm-Installationsvorgang und der echte Build notwendig.

### 3. Reproduzierbare CI auf Windows und Linux

`.github/workflows/concert-validation-v571.yml` validiert zuerst das Lockfile, führt dann **immer `npm ci --no-audit --no-fund`** aus, danach die V752-Regressionen, `npm run typecheck` und `npm run build`. Ein fehlendes Lockfile fällt auf; der CI-Workflow verwendet **kein `npm install`-Fallback** mit veränderten Versionen. Die bestehende historische Wochen-Regression verwendet nun ebenfalls `npm ci` ohne Fallback.

`check:fast` prüft die Metadaten und Abhängigkeiten **vor** den aufwendigen Animationstests. So endet ein Build bei fehlendem `node_modules` zügig mit einer konkreten Diagnose statt zunächst umfangreiche Tests auszuführen. Die TypeScript- und Next.js-Prüfung wurden **nicht entfernt**.

### 4. Befehle

```powershell
npm run test:v752                 # negative Lockfile-/CI-/TypeScript-Fixtures, kein npm install notwendig
npm run check:lockfile:v752       # read-only Release-/CI-Integrität
npm run verify:v752:static        # Architektur, Syntax, Modul-Casing, Test-Typisolation
npm ci --no-audit --no-fund       # benötigt Zugriff auf npm Registry
npm run verify:v752              # nur vollständig bestanden mit echten npm-Abhängigkeiten
```

### Grenzen

- Unter der vorliegenden Testumgebung scheitert `npm ci --offline` an `zustand-5.0.16.tgz` (`ENOTCACHED`); die Netzwerkinstallation ist hier nicht nachgewiesen.
- Der Produktions-Typcheck kann ohne Next.js-/React-/Node-/Three.js-Pakete nicht erfolgreich sein. Isolierte Tests verwenden teilweise test-only Stubs.
- Ein erfolgreicher TypeScript-Check und der echte Next.js-Build auf einem Rechner mit installiertem `node_modules` sowie Browser-/GLB-Szenentests bleiben Freigabevoraussetzungen.

Siehe `V752-VERIFICATION.md` für die hier ausgeführten Tests.
