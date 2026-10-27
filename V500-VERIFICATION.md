# V500 Verification – 24 October 2026

## Bestanden in dieser Umgebung

- `npm run test:v500` / `npm run test:v500:types`
- `npm run test:v499` / `npm run test:v499:types`
- `npm run test:v498` / `npm run test:v498:types`
- `npm run test:v497` / `npm run test:v497:types`
- `npm run test:v496` / `npm run test:v496:types`
- `npm run test:v495` / `npm run test:v495:types`
- `npm run test:v494` / `npm run test:v494:types`
- `npm run test:v493`
- `npm run test:v492` / `npm run test:v492:types`
- `npm run test:v491` / `npm run test:v491:types`
- `npm run test:v490` / `npm run test:v490:types`
- `npm run test:v489` / `npm run test:v489:types`
- `npm run test:v483`, `npm run test:v475` / `npm run test:v475:types`
- `npm run test:v476` / `npm run test:v476:types`
- `npm run test:v416`, `npm run test:v444`, `npm run test:v452`
- `npm run check:syntax`, `npm run check:architecture`

## Nicht verifiziert

Ein `npm run typecheck` des **gesamten** Next.js-Projekts wurde versucht, scheitert hier aber an **nicht installierten** Dependencies (`next/server`, Node-Typdefinitionen, React usw.). Ein `npm run build` ist deshalb hier **nicht nachgewiesen**; ebenso wenig die visuelle Qualität realer GLB-Avatare und Raspberry-Pi-FPS. Der vollständige Preflight umfasst weit über 100 historische Einzeltests und wurde hier nicht vollständig durchlaufen.

## Ausführung mit den Projekt-Abhängigkeiten

```powershell
npm install
npm run build
```

## Wichtig

Die Regressionstests V489–V492 und V499 wurden bei ihren **Versionsassertions** für die V500-Fortführung aktualisiert. Ihre ursprünglichen Feature-Verhaltensprüfungen blieben unverändert.
