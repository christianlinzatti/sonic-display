# V411 – Prüfbericht (20. Oktober 2026)

## Bestanden

- `npm run test:v411`: Neue pure Timeline-Funktionen und Integrationsschutzziele bestanden (Crossfade, zeitlich korrekte Verse-/Hook- und Rap-Akzente, Seek, Loop, ungültige Eingaben, pro-Avatar-Speicherung, mehrfach verwendete Clips).
- `npm run test:v410`, `npm run test:v409`, `npm run test:v404` (inklusive V405–V408): bestanden.
- `npm run doctor:quality`, `npm run test:imports`, `npm run test:module-case`: bestanden. 868 Projekt-Quelldateien/1.836 Imports geprüft, keine Windows-/Linux-Dateinamenkollisionen.
- `npm run check:syntax`: 552 TS-/TSX-Dateien auf Syntax geprüft, bestanden.
- Eigenständiger TypeScript-Check von `rapMotionTimelineV411.ts`: bestanden.
- Historische isolierte Regression: 144 Testausführungen bis einschließlich `test:v400` bestanden. Die Testumgebung beendete den langen Gesamtlauf am Zeitlimit nach V400; es wurde dabei kein fehlgeschlagener Test gemeldet. Die aktuellen `test:v401`, `test:v402`, `test:v403`, `test:v405` bis `test:v411` sowie `test:v404` wurden separat erfolgreich ausgeführt.
- `npm run build:preflight`: alle vorgelagerten Tests bestanden; der Dependency-Doctor hat 16 fehlende npm-Pakete erkannt und den Build bewusst blockiert.

## Einschränkungen

- Hier liegen keine installierten Node-Module und keine `package-lock.json` vor. Ein vollständiger `tsc --noEmit` wurde angestoßen, war wegen fehlender React-, Three.js- und anderer Typdefinitionen nicht auswertbar. Insbesondere kann ein **vollständiger Next.js-Produktionsbuild nicht als bestanden** gemeldet werden.
- Live-Test echter GLB-/GLTF-Modelle, WebGL-Darstellung, CORS und Retargeting unterschiedlicher Rig-Varianten konnte ohne Browser und Test-Avatare nicht durchgeführt werden.
- Ein Windows-/Linux-Build wird über `.github/workflows/production-quality-v405.yml` ausgeführt, sobald die npm-Abhängigkeiten beim Installationsschritt verfügbar sind.

## Verifizieren auf Windows

```powershell
npm install
npm run verify
```

Danach im Browser den Editor öffnen und mindestens zwei tatsächlich installierte Clips mit einer Überblendung bei 0 %, 50 % und 100 % Rap-Akzent sowie Verse/Hook-Wechsel testen. Außerdem Pause, Scrubbing, Clip-Reihenfolge, Avatarwechsel und Persistenz nach Seiten-Reload testen.
