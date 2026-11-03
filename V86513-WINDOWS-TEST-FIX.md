# V865.13 – Windows smoke, release gate und CRLF-Regressionsschutz

Ausgangslage: GitHub-Actions-Run 41462959073, Windows-Job 125336411191. Der Job stoppte in `tests/v682-cinematic-camera-variety-regression.cjs` bei der V351-Sicherheitsprüfung des V848-Kameraframes. Der Textvergleich erwartete `\n`, während ein Windows-Checkout `\r\n` enthalten kann. Der Fehler ist mit CRLF in `StageCameraDirectorV289.tsx` reproduzierbar.

## Änderungen

- Quellcode-Textvergleiche in 10 betroffenen Regressionstests normalisieren die Zeilenenden vor dem Vergleich. Die eigentlichen Qualitäts- und Kamera-Assertions bleiben bestehen.
- `.gitattributes` erzwingt LF-Zeilenenden für JavaScript, TypeScript, JSON und Workflow-YAML in zukünftigen Git-Checkouts. Vorhandene Windows-Arbeitskopien profitieren unabhängig davon von den EOL-neutralen Tests.
- `scripts/v831-production-gate.cjs` ruft für die vollständige Release-Prüfung `check:release:flat` statt der tief rekursiven npm-Kette auf. Die drei unverzichtbaren Stufen (vollständige Regressionen, `typecheck`, tatsächliches `next build`) bleiben erhalten.
- `tests/v86513-windows-source-eol-regression.cjs` simuliert in beiden Betriebssystemen CRLF-Quelldateien und prüft 10 wichtige Tests ohne Dateien zu verändern.
- GitHub Actions führt zuerst die EOL- und Flat-Runner-Regression, unter Windows zusätzlich den vollständigen V665-Flat-Smoke-Test und danach weiterhin das unveränderte vollständige Production Gate aus.

## Ausführung unter Windows (PowerShell oder cmd)

```powershell
npm ci --no-audit --no-fund
npm run test:v86513:windows-eol
npm run test:smoke:v665:flat
npm run check:release:flat
npm run verify:production:v831
```

`check:release:flat` expandiert 422 historische Einzel-Skriptausführungen in Originalreihenfolge; `test:smoke:v665:flat` 102. Der Production-Gate-Runner startet nach allen Releaseprüfungen den TypeScript-Gesamtcheck und das echte Next.js-Produktions-Build. Tests werden nicht übersprungen, bei erstem Fehler erfolgt ein Exitcode ungleich Null.

Hinweis: Als unabhängige Freigabe müssen die neuen Änderungen erneut auf einem echten Windows-CI-Runner bestätigt werden. Die lokale CRLF-Simulation ersetzt keinen nativen Windows-Lauf.
