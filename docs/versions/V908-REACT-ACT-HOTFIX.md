# V908 – React.act-Hotfix für den V734-Buildfehler

## Ursache

Der Test `tests/v734-request-lifecycle-regression.cjs` und fünf ältere React-UI-Regressionstests importierten `act` aus `react-test-renderer`. Beim in `package-lock.json` festgehaltenen React-19.3.1-Setup kann dieser Export fehlen. Das erklärt `TypeError: act is not a function` beim Einstieg in `photos()`; die zuvor ausgegebenen PASS-Meldungen betreffen nur die bereits erfolgreich abgeschlossenen Teiltests.

## Anpassungen

- In V730, V731, V732, V733 (UI + Async) und V734 wird `act` aus `react` bezogen (`{act}=React`); `create` stammt weiterhin aus `react-test-renderer`.
- Ein neuer, rein statischer Regressionstest `npm run test:react-act-compat` kontrolliert alle entsprechenden Testdateien und wird am Anfang von `prebuild` ausgeführt.
- Keine Änderungen an Produktionskomponenten oder an den Dependency-Versionen.

## Überprüfung

Ausführbar ohne Abhängigkeiten: `npm run test:react-act-compat` und `node --check` der betroffenen CJS-Dateien. Für den vollständigen V734-Test und den Next.js-Produktionsbuild müssen die Versionen aus `package-lock.json` über `npm ci` installiert sein. Hier im Paket liegt kein `node_modules`; die Paket-Registry war in der Bearbeitungsumgebung nicht erreichbar, deshalb sind der vollständige Testlauf, der TypeScript-Check und der Next.js-Produktionsbuild **nicht verifiziert**.

Die zusätzliche npm-Warnung `Unknown env config "cache-dir"` ist getrennt vom Absturz. Die Einstellung stammt üblicherweise aus einer npm-Umgebungsvariable oder benutzerspezifischen npm-Konfiguration; sie muss im Deployment-Setup entfernt bzw. durch eine unterstützte Konfiguration ersetzt werden. Das Projekt enthält keine `.npmrc` mit `cache-dir`.
