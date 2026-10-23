# Sonic Display V412 — Build-Preflight-Hotfix

## Anlass

Bei `npm run build` liefen alle Regressionstests, danach zeigte `scripts/build-preflight.cjs`
`Dependencies available: 14/17` und meldete `three`, `@vercel/blob` und `ably` als fehlend,
obwohl `npm install` erfolgreich gewesen war.

## Ursache

Die ältere Prüfung verwendete `require.resolve(packageName + '/package.json')`.
Node.js blockiert diesen Pfad bei einigen installierten Paketen über deren `exports`-Konfiguration
(`ERR_PACKAGE_PATH_NOT_EXPORTED`). Das ist kein Beleg für eine fehlende Installation.

## Behebung

- Prüfen des tatsächlich installierten Paketmanifests unter `node_modules` ohne Import durch die Exportmap.
- Alternativ Auflösung des öffentlichen Paketeinstiegs für Workspaces/übergeordnete `node_modules`.
- npm-Version aus `npm_config_user_agent` lesen statt `npm` ohne Shell zu starten (Windows-freundlich).
- Fehlende Pakete weiterhin explizit als Fehler melden.
- Separater Regressionstest mit realistisch eingeschränkten Exportmaps (einschließlich scoped-Paket).

## Kontrolle

```powershell
node tests/v412-build-preflight-hotfix-regression.cjs
node scripts/build-preflight.cjs
npm run build
```

Erwartet bei 17 installierten direkten Abhängigkeiten:

```
Dependencies available: 17/17
PASS: all direct dependencies are installed.
```

Dieser Hotfix verändert keine Bibliotheksversionen oder Anwendungscode.
Ein vollständiger Next.js-Build muss noch auf einer Maschine mit installiertem `node_modules` ausgeführt werden.
Die `npm audit`-Warnungen sind unabhängig davon zu behandeln.
