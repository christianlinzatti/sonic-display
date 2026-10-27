# V586 – Verifikationsbericht (26.10.2026)

## Ergebnis

**Offline-V586-Verifikation bestanden** auf Basis von `0.1.0-v585`, jetzt `0.1.0-v586`.

| Prüfung | Status | Nachweis |
| --- | --- | --- |
| `npm run test:v586` | PASS | 51 neue Funktionalitäts-, Sicherheits- und Integrationsprüfungen, einschließlich 12.000 deterministischer Zeitsamples |
| `npm run test:v586:types` | PASS | isolierter TypeScript-Core-Check einschließlich des neuen Plans und der Typabhängigkeiten |
| `npm run test:smoke:v586` | PASS | V586, V585, V584, V583, V582, V581, V580, V572 sowie Syntax-/Architekturprüfung |
| `npm run verify:v586` | PASS | obiger Smoke-Test plus V564, V567, V472, V473, V474, V515, V526, V569, V563, V500 |
| `npm run check:syntax` | PASS | 805 TypeScript-/TSX-Dateien auf Parsing, doppelte Imports und Client-Directives geprüft |
| `npm run check:architecture` | PASS | Dokumentationsversion 586 und 377 referenzierte Pfade |

Die älteren Testreihen umfassen unter anderem 30.000 variable-FPS-Bewegungsproben in V515, 32.000 Gesangs-/Tanz-Synchronisationsproben in V516 (eigenständig erfolgreich), 42.000 in V526, 43 GLB-Duett-Regressionen in V563 und 44 V564-Körpersynchronisationsprüfungen. Die in den früheren Releases eingeführten Wort-/Kamera-/Casting-Schutzregeln bleiben überprüft.

## Historische Tests nach tatsächlicher Pipeline aktualisiert

Einige strukturelle Regressionen prüften einen vor V583/V586 direkten Funktionsaufruf. Die Tests V472, V515, V516, V526, V564 und V567 akzeptieren nun **nur die echte Pipeline** und prüfen weiterhin deren Reihenfolge und Sicherheit: V472/V583 → V516/V526/V538/V564 → **V586** → V567 → V515. Die funktionsbasierten Assert-Suites bleiben erhalten, nicht übersprungen. V585 und V583 selbst bestanden unverändert.

## Nicht durchgeführt / keine Freigabe

- Es sind keine `node_modules` für Next.js/React/Three.js in der gelieferten Projektbasis installiert. Ein **vollständiger** Next.js-Produktionsbuild `npm run build` und vollständiger Projekt-`npm run typecheck` sind nicht nachgewiesen. Die isolierte V586-Typeprüfung und `check:syntax` sind kein Ersatz.
- Keine echte visuelle 3D-Vorschau mit geladenen GLB-Dateien, keine Audio-Abhörprüfung, keine GPU-FPS-Messung oder Chromium-Langlaufmessung auf einem Raspberry Pi.
- Die 12.000 Samples testen numerische Stabilität und reproduzierbare Zeitsteuerung, nicht wahrgenommene Natürlichkeit oder Bewegungsqualität.

## Empfohlener lokaler Windows-Check

```powershell
npm install --no-audit --no-fund
npm run test:smoke:v586
npm run verify:v586
npm run typecheck
npm run build
```

Danach mit Wort-Synchronisation und bestätigter Cast-Zuordnung eine Zwei-/Vier-Personen-GLB-Performance visuell vergleichen: einmal in ruhigeren Rap-Passagen, bei dichterem Flow und bei Hooks; bei Pause/Seek darf keine Pose hängen bleiben. Auf dem Raspberry Pi anschließend `npm run benchmark:v580:pi` gegen eine tatsächlich gestartete App durchführen.
