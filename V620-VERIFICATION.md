# V620 – Verifikation (27.10.2026)

## Offline-Prüfungen – bestanden

- `npm run test:v620`: **41 Regressionstest-Gruppen**, inklusive **10.000** synthetischen Szenen/Seitenverhältnissen/Zeiten; Songbindung, authentisierte Lead-/Duett-/Ensemble-Rollen, all-cast-/Gesichts-/Fuß-Grenzen, Lyrics-Pan-Sperre und manuelle Prioritäten.
- `npm run test:v620:types`: TypeScript-Kernprüfung bestanden.
- Gezielt ausgeführt und bestanden: `test:v619`, `v618`, `v617`, `v616`, `v615`, `v614`, `v613`, `v612`, `v611`, `v610`, `v605`, `v585`, `v550`, `v540`, `v528`, `v351`.
- Weitere Tests aus der verschachtelten V620-Smoke-Testkette liefen erfolgreich, u.a. V598, V606, V581, V572, V607, V539 sowie frühere Vollketten bis V612.
- `npm run check:syntax`: **844 TS/TSX-Quelldateien** erfolgreich geprüft.
- `npm run check:architecture`: 10 Dokumentationsabschnitte, **492 referenzierte Quellpfade**, Releasekennung V620 geprüft.

## Einschränkungen

Die einzelne vollständige Ausführung von `npm run test:smoke:v620` erreichte in der Ausführungsumgebung das Zeitlimit, nachdem alle bis dahin erreichten Prüfungen erfolgreich waren; **daher ist eine vollständige grüne Ausführung dieses Kommandos nicht belegt**. Sämtliche oben ausdrücklich genannten individuellen Versionstests sind dagegen grün.

Der vollständige Next.js-Produktionsbuild (`npm run build`) und das Projekt-`tsc --noEmit` können ohne die vollständigen lokalen `node_modules`-Abhängigkeiten in dieser Umgebung nicht verifiziert werden. Eine reale Sichtprüfung mit den GLB-Avataren auf der 10-Zoll-Zielansicht bleibt ebenfalls offen. Die V550-/V540-Projektionen stellen konservative Näherungen und keinen Pixel-Beweis der visuell korrekten Überlagerung dar.

## Windows-Befehle

```powershell
npm install
npm run test:smoke:v620
npm run verify:v620
npx tsc --noEmit
npm run build
```
